# Energy-i web app

This is the Next.js front-end for **Energy-i**. It has no direct database
access — all data and authentication are served by the platform API
(`../platform/apps/api`).

## Architecture

- **Next.js (this app)** — UI, server components, server actions.
- **Platform API (Hono)** — owns Prisma, the database and Better Auth. Exposed
  at `http://localhost:3001/v1`.

Requests from this app are proxied via a Next.js rewrite so the browser and
server always talk to same-origin `/api/*` and session cookies stay on the
Next.js host:

```
/api/:path*  ->  ${API_BASE_URL}/:path*   (default: http://localhost:3001/v1)
```

Configure the target with the `API_BASE_URL` environment variable if the API
is running elsewhere.

## Getting started

1. Start the platform API (see `apps/api/README.md`).
2. Install dependencies and run the dev server:

   ```
   npm install
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Name           | Description                                     | Default                    |
| -------------- | ----------------------------------------------- | -------------------------- |
| `API_BASE_URL` | Base URL of the platform API (including `/v1`). | `http://localhost:3001/v1` |

## Scripts

- `npm run dev` — start the dev server.
- `npm run build` — production build.
- `npm start` — start the production server.
- `npm run lint` — lint the codebase.
