# Resume Site

Next.js resume portfolio for Samuel Farmer (`icepikd3v`).

## Stack

- Next.js (App Router)
- React
- TypeScript

## Run

```bash
npm install
npm run dev
```

## Run Resume + Octo Manager Together

This starts:

- resume site on `http://localhost:3000`
- octo backend on `http://localhost:5000`
- octo frontend on `http://localhost:3105`

```bash
npm run dev:octo
```

The runner expects this sibling path:

- `../icepik-octo-manager/App/iom-backend`
- `../icepik-octo-manager/App/iom-frontend`

Set `MONGO_URI` in `.env.local` so the Octo backend can connect to MongoDB.

## Project Embeds Inside Resume Site

Project iframes can route through local paths like `/showcase/icepik-octo-manager`.

Configure in `.env.local`:

```env
SHOWCASE_PROXY_ENABLED=true
SHOWCASE_OCTO_MANAGER_URL=http://localhost:3105
SHOWCASE_OCTO_MANAGER_API_URL=http://localhost:5000
```

You can also set deployed URLs for public browsing:

```env
SHOWCASE_RICK_MORTY_URL=
SHOWCASE_READY_SET_TRAVEL_URL=
SHOWCASE_OCTO_MANAGER_URL=
SHOWCASE_OCTO_MANAGER_API_URL=
SHOWCASE_ICEPIKD3V_PROFILE_URL=
```

Important: public users cannot access your localhost servers. For visitors to actively use each app, each project must be deployed to a public URL, then mapped with those env vars.

## Dashboard

- Visit `/dashboard`
- Set `ADMIN_DASHBOARD_USERNAME` and `ADMIN_DASHBOARD_PASSWORD` in env
- Use dashboard form to update:
  - name
  - alias
  - headline
  - about text
  - contact emails
