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

`Open App` uses `/projects/[slug]/live` and attempts to load each app runtime in-page (iframe) with an external-tab fallback.

Configure in `.env.local`:

```env
SHOWCASE_PROXY_ENABLED=true
SHOWCASE_USE_INTERNAL_LABS=true

SHOWCASE_OCTO_MANAGER_URL=http://localhost:3105
SHOWCASE_OCTO_MANAGER_API_URL=http://localhost:5052
SHOWCASE_RICK_MORTY_URL=http://localhost:3103
SHOWCASE_RICK_MORTY_API_URL=http://localhost:5051
SHOWCASE_READY_SET_TRAVEL_URL=http://localhost:3104
SHOWCASE_UFC_MOBILE_URL=http://localhost:8081
SHOWCASE_UFC_API_URL=http://localhost:5053/api/v1
```

Set the same variables in Vercel for `Production`, `Preview`, and `Development`.
Current known public values:

```env
SHOWCASE_PROXY_ENABLED=true
SHOWCASE_USE_INTERNAL_LABS=true

SHOWCASE_RICK_MORTY_URL=https://rick-and-morty-react.netlify.app
SHOWCASE_READY_SET_TRAVEL_URL=https://cdn.jsdelivr.net/gh/Icepikd3v/ReadySetTravel@main/dev/readysettravel/index.html

# set these once deployed publicly
SHOWCASE_OCTO_MANAGER_URL=
SHOWCASE_OCTO_MANAGER_API_URL=
SHOWCASE_UFC_MOBILE_URL=
SHOWCASE_UFC_API_URL=
```

Important: if an app URL is empty or points to localhost in production, visitors cannot run that app. The live page will show fallback guidance until a public URL is provided.

## Dashboard

- Visit `/dashboard`
- Set `ADMIN_DASHBOARD_USERNAME` and `ADMIN_DASHBOARD_PASSWORD` in env
- Use dashboard form to update:
  - name
  - alias
  - headline
  - about text
  - contact emails

## AI Concierge + Contact Agent

A floating AI concierge widget is available on every page.

Features:

- site navigation help
- weather lookup (`weather in <city>`)
- timezone lookup (`time in <city>`)
- trivia questions
- contact form that forwards messages to `sam.d3v.35@gmail.com`

Configure SMTP in `.env.local` for Contact Agent email forwarding:

```env
CONTACT_AGENT_TO_EMAIL=sam.d3v.35@gmail.com
CONTACT_AGENT_SMTP_HOST=smtp.gmail.com
CONTACT_AGENT_SMTP_PORT=465
CONTACT_AGENT_SMTP_SECURE=true
CONTACT_AGENT_SMTP_USER=your-smtp-user@gmail.com
CONTACT_AGENT_SMTP_PASS=your-app-password
CONTACT_AGENT_FROM_EMAIL=your-smtp-user@gmail.com
CONTACT_AGENT_MIN_FILL_MS=3000
CONTACT_AGENT_RATE_LIMIT_PER_WINDOW=5
CONTACT_AGENT_RATE_LIMIT_WINDOW_MS=600000

ASSISTANT_RATE_LIMIT_PER_WINDOW=20
ASSISTANT_RATE_LIMIT_WINDOW_MS=60000

OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini
AI_CONCIERGE_NAME=Orbit
AI_CONCIERGE_STYLE=Calm tactical co-pilot
AI_DEFAULT_REGION_LABEL=West Virginia (East Coast, USA)
AI_DEFAULT_TIMEZONE=America/New_York
AI_DEFAULT_CITY=Charleston
AI_DEFAULT_STATE=WV
AI_DEFAULT_COUNTRY=USA
NEXT_PUBLIC_AI_CONCIERGE_NAME=Orbit
NEXT_PUBLIC_AI_CONCIERGE_STYLE=Calm tactical co-pilot
NEXT_PUBLIC_AI_CONCIERGE_THEME=mentor

RATE_LIMIT_STORE=upstash
UPSTASH_REDIS_REST_URL=your_upstash_redis_rest_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_rest_token
```

For Gmail, use an App Password (not your normal Gmail password).
If `OPENAI_API_KEY` is not set, the assistant automatically falls back to local rule-based replies.
If `RATE_LIMIT_STORE` is not `upstash`, rate limits fall back to in-memory storage.
Available `NEXT_PUBLIC_AI_CONCIERGE_THEME` presets: `executive`, `creative`, `mentor`.
Time in West Virginia uses `America/New_York` (EST in winter, EDT in daylight saving time).
