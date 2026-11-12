// Generates the PNG app icons (no dependencies). Run: npm run icons
import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})
const crc32 = (buf) => {
  let c = 0xffffffff
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
const chunk = (type, data) => {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const td = Buffer.concat([Buffer.from(type), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(td))
  return Buffer.concat([len, td, crc])
}
const png = (size, rgba) => {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8
  ihdr[9] = 6
  const stride = size * 4 + 1
  const raw = Buffer.alloc(stride * size)
  for (let y = 0; y < size; y++) {
    raw[y * stride] = 0
    rgba.copy(raw, y * stride + 1, y * size * 4, (y + 1) * size * 4)
  }
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

const distSeg = (px, py, ax, ay, bx, by) => {
  const dx = bx - ax
  const dy = by - ay
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)))
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy))
}
const inRoundRect = (x, y, r) => {
  const cx = Math.min(Math.max(x, r), 100 - r)
  const cy = Math.min(Math.max(y, r), 100 - r)
  return Math.hypot(x - cx, y - cy) <= r
}

// radius: corner radius in 0-100 space (0 = full-bleed square); scale: size of the check mark.
const render = (size, { radius, scale }) => {
  const buf = Buffer.alloc(size * size * 4)
  const SS = 3
  const pts = [[28, 52], [44, 68], [73, 34]].map(([x, y]) => [50 + (x - 50) * scale, 50 + (y - 50) * scale])
  const half = (11 * scale) / 2
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let bg = 0
      let fg = 0
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const ux = ((x + (sx + 0.5) / SS) / size) * 100
          const uy = ((y + (sy + 0.5) / SS) / size) * 100
          if (radius === 0 || inRoundRect(ux, uy, radius)) {
            bg++
            if (
              distSeg(ux, uy, ...pts[0], ...pts[1]) <= half ||
              distSeg(ux, uy, ...pts[1], ...pts[2]) <= half
            )
              fg++
          }
        }
      }
      const i = (y * size + x) * 4
      const a = bg / (SS * SS)
      const f = bg ? fg / bg : 0
      buf[i] = Math.round(0x3b * (1 - f) + 255 * f)
      buf[i + 1] = Math.round(0x1f * (1 - f) + 255 * f)
      buf[i + 2] = Math.round(0xa3 * (1 - f) + 255 * f)
      buf[i + 3] = Math.round(a * 255)
    }
  }
  return png(size, buf)
}

mkdirSync('public/icons', { recursive: true })
writeFileSync('public/icons/icon-192.png', render(192, { radius: 22, scale: 1 }))
writeFileSync('public/icons/icon-512.png', render(512, { radius: 22, scale: 1 }))
writeFileSync('public/icons/icon-maskable-512.png', render(512, { radius: 0, scale: 0.8 }))
// iOS applies its own rounding, so use a full-bleed square.
writeFileSync('public/icons/apple-touch-icon.png', render(180, { radius: 0, scale: 0.9 }))
console.log('Icons written to public/icons')
