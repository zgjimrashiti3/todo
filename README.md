# My Tasks

A mobile-first personal to-do app. React + Tailwind CSS, frontend only: no backend, no login.
Tasks live in the browser's `localStorage` (key `my-tasks:v1`) and survive reloads. Installable as a PWA and works offline.

## Develop

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # static output in ./dist
npm run preview   # serve the production build locally
npm run icons     # regenerate PNG icons in public/icons
```

## Deploy (todo.zgjimrashiti.online)

The build is a plain static site in `dist/`.

1. Run `npm run build`.
2. Upload the **contents** of `dist/` to the web root of `todo.zgjimrashiti.online` (any static host: Nginx, Apache, Netlify, Cloudflare Pages, GitHub Pages with a custom domain...).
3. Serve over **HTTPS**; this is required for the service worker and "Add to Home Screen" install.

The app is served from the site root (`base: '/'`) and needs no rewrite rules. After deploying a new version, `sw.js` should not be cached long-term (use `Cache-Control: no-cache` for it) so updates are picked up; bump `CACHE` in `public/sw.js` when you change cached files.

On iPhone: Safari > Share > Add to Home Screen. On Android: Chrome menu > Install app.

## Notes

- Data is per device and per browser; clearing site data removes the tasks.
- Overdue = not completed and past its date/time. Completed tasks from earlier days disappear from "Today" the day after completion.
