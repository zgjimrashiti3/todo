# My Tasks

A mobile-first personal to-do app. React + Tailwind CSS, frontend only: no backend, no login.
Tasks live in the browser's `localStorage` (key `my-tasks:v1`) and survive reloads. Installable as a PWA and works offline. Everything stays on the device.

## Features

- **Tabs**: Today, Upcoming, No date and Done (with a confirmed **Clear completed** button).
- **Dark mode**: gear icon in the header opens Settings, where the theme can be System (default), Light or Dark. The choice is remembered, applied before first paint (no flash) and the `theme-color` meta tag follows it.
- **Recurring tasks**: Repeat None / Daily / Weekly (pick weekdays) / Monthly. Completing a recurring task keeps it in history and creates the next occurrence (always after today, so finishing a late task never recreates a past date). Recurring rows show a repeat icon.
- **Undo**: a toast with *Undo* appears for 5 seconds after completing or deleting a task. Undoing a completion also removes the occurrence it created.
- **Priority and tags**: None / Low / Medium / High shown as a colored dot; free-text tags (reusable from the task sheet) shown as chips, with a horizontal tag filter bar under the tabs.
- **Search**: the search icon expands a field that filters all tabs by name and tag (`#tag` works too).
- **Subtasks**: checklist items inside the task sheet, with `2/5` progress on the row.
- **Polish**: light haptic feedback (`navigator.vibrate`, where supported) on check and delete, visible focus states, labelled controls and 44px minimum touch targets.

## Data and migration

Stored as `{ version: 2, tasks }` under `my-tasks:v1` (the key is unchanged so existing data is found). Older data (version 1 or a bare array) is migrated on load by `src/lib/migrate.js`: tasks get default repeat, priority, tags and subtasks. A copy of the original data is kept once under `my-tasks:v1-backup`. The theme preference is stored under `my-tasks:theme`.

Add future schema changes as a new entry in the `migrations` list and bump `STORAGE_VERSION`.

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

The app is served from the site root (`base: '/'`) and needs no rewrite rules. After deploying a new version, `sw.js` should not be cached long-term (use `Cache-Control: no-cache` for it) so updates are picked up; bump `CACHE` in `public/sw.js` when you change cached files (currently `my-tasks-v2`).

On iPhone: Safari > Share > Add to Home Screen. On Android: Chrome menu > Install app.

## Notes

- Data is per device and per browser; clearing site data removes the tasks.
- Overdue = not completed and past its date/time. Completed tasks from earlier days disappear from "Today" the day after completion but stay in "Done" until cleared.
