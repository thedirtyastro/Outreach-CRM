# OutReach CRM — Monorepo

A full-stack CRM for freelancers and agencies to track outreach leads from LinkedIn, Twitter, GitHub, and Instagram. Includes a Next.js web app, a Chrome extension, and a structured service layer ready to be extracted into a standalone API.

---

## Structure

```
outreach-crm/
├── apps/
│   └── web/              Next.js 16 frontend + API routes (BFF)
│       ├── app/          App Router pages & API routes
│       ├── components/   React UI components
│       ├── hooks/        Custom React hooks
│       ├── lib/          Client utilities, API client, re-exports
│       ├── store/        Zustand state stores
│       └── .env.example  Web app env vars reference
│
├── packages/
│   ├── shared/           Types + Zod validations (no Node deps — usable anywhere)
│   ├── database/         Mongoose schemas + DB connection
│   └── server/           Service layer, auth (better-auth), Resend email
│
├── extension/            Chrome Extension (Manifest V3) for scraping social profiles
├── .env.example          Root env reference (copy to apps/web/.env.local)
└── package.json          Workspace root (npm workspaces)
```

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example apps/web/.env.local
# Edit apps/web/.env.local with your values
```

Required variables:

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `NEXT_PUBLIC_APP_URL` | Public URL of the app (e.g. `http://localhost:3000`) |
| `BETTER_AUTH_SECRET` | Random 32-char secret for session signing |
| `RESEND_API_KEY` | [Resend](https://resend.com) API key for transactional email |
| `RESEND_FROM_EMAIL` | Verified sender address in Resend |
| `RESEND_WEBHOOK_SECRET` | Webhook signing secret from Resend dashboard |

### 3. Run the development server

```bash
npm run dev
# → http://localhost:3000
```

---

## Workspace Commands

Run from the repo root:

```bash
npm run dev          # Start Next.js dev server
npm run build        # Production build of apps/web
npm run start        # Start production server
npm run lint         # Lint apps/web
```

Or target a specific workspace directly:

```bash
npm run dev --workspace=apps/web
```

---

## Package Overview

### `@outreach/shared` (`packages/shared`)
Pure TypeScript — no Node.js or browser dependencies.
- All entity types (`ILead`, `IEmail`, etc.)
- All Zod validation schemas (`createLeadSchema`, `sendEmailSchema`, etc.)
- Safe to import in the Chrome extension, server, or client code.

### `@outreach/database` (`packages/database`)
- Mongoose connection helper (`connectDB`)
- All Mongoose schema models (`Lead`, `Email`, `Activity`, etc.)
- Only import in server contexts.

### `@outreach/server` (`packages/server`)
- Service layer (`listLeads`, `createLead`, `sendEmail`, etc.)
- `better-auth` setup and `resolveUser` helper (session + API key auth)
- Resend email client
- Only import in server contexts (API routes, Server Components).
- **Future:** This package can be extracted into a standalone Express/Hono API without changing any API route signatures.

---

## Chrome Extension

See [`extension/README.md`](extension/README.md) for setup instructions. The extension pairs with the CRM via an API key generated in **Settings → API Key**.

---

## Deployment

Deploy `apps/web` to [Vercel](https://vercel.com) or any Node.js host. Set the environment variables from `apps/web/.env.example` in your hosting provider's dashboard.

The `packages/` source is compiled at build time via `transpilePackages` in `next.config.ts` — no separate build step needed.
