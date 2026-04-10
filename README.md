# Gold Admin Panel

Angular 17 admin panel for **Islamicly Gold**. Standalone components, lazy-loaded routes, JWT auth, Tailwind CSS, SCSS, and a scalable feature-module architecture ready for API integration.

## Tech stack

- Angular 17 (standalone components, signals, functional guards/interceptors)
- SCSS + Tailwind CSS (dark mode via class strategy)
- RxJS services for state
- Angular Router with lazy loading
- JWT auth with HTTP interceptor
- chart.js / ng2-charts (installed, ready to wire up)

## Setup

```bash
npm install
npm start
```

Then open `http://localhost:4200`. The app redirects to `/login`. On successful login the JWT is stored in `localStorage` and the guard lets you into the shell at `/dashboard`.

Configure the API base URL in `src/environments/environment.ts`.

## Project structure

```
src/app/
├── core/                 # singletons: auth service, guard, interceptor
│   ├── services/auth.service.ts
│   ├── guards/auth.guard.ts
│   └── interceptors/auth.interceptor.ts
├── shared/               # reusable components, pipes, directives
├── layout/               # shell: main-layout, sidebar, navbar
├── features/
│   ├── auth/login/
│   ├── dashboard/
│   ├── users/            (+ user.service.ts)
│   ├── transactions/     (+ transaction.service.ts)
│   ├── goals/            (+ goal.service.ts)
│   ├── vault/            (+ vault.service.ts)
│   ├── analytics/
│   └── settings/
├── app.component.ts
├── app.config.ts
└── app.routes.ts
```

## Routes

| Path            | Guard       | Description                      |
|-----------------|-------------|----------------------------------|
| `/login`        | public      | Email + password login           |
| `/dashboard`    | authGuard   | KPI cards, charts, activity feed |
| `/users`        | authGuard   | Users table (search/filter)      |
| `/transactions` | authGuard   | Transactions with filters        |
| `/goals`        | authGuard   | Goal progress cards              |
| `/vault`        | authGuard   | Vault holdings summary           |
| `/analytics`    | authGuard   | Revenue / user / metal trends    |
| `/settings`     | authGuard   | Profile + change password        |

All non-login routes are lazy-loaded and protected by `authGuard`. The `authInterceptor` attaches `Authorization: Bearer <token>` to every outgoing request and auto-logs-out on `401`.

## Theming

Dark mode is controlled by toggling the `dark` class on `<html>`. The navbar has a theme toggle that persists to `localStorage`.

## Next steps / bonus

- Wire `ng2-charts` into dashboard & analytics (mock bar chart is used now)
- Role-based access: extend `authGuard` with `data.roles`
- CSV export on Users / Transactions (button is in place)
- Replace in-memory mock data in feature components with service `.list()` calls

## Notes

This scaffold was hand-authored to match the structure `ng new gold-admin-panel --routing --style=scss` would produce, plus the feature layout you requested. Run `npm install` to pull Angular + Tailwind and you can `ng serve` immediately.
