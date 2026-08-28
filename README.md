# Aýkitap Frontend

Public marketing/reading website for **Aýkitap** — browse the catalogue, read about the app, and manage your account in the browser. Built with Next.js (App Router), talking to the [Aýkitap Backend](../aykitap-backend) API. Sibling repos: the [mobile app](../aykitap) and the [admin panel](../aykitap-admin).

## Tech stack

- **Framework:** Next.js 16 (App Router, React 19, TypeScript)
- **i18n:** `next-intl` — Turkmen (`tm`, default), Turkish (`tr`), Russian (`ru`), always-prefixed locale routes (`/tm/...`, `/tr/...`, `/ru/...`)
- **UI:** Tailwind CSS v4, Radix UI primitives (via `radix-ui` / shadcn conventions), `lucide-react` icons, Embla carousel, Sonner toasts
- **State:** Zustand (`src/lib/stores` — auth, library, wishlist)
- **Theming:** `next-themes`

## Project structure

```
src/
  app/
    [locale]/
      (auth)/          # login, signup
      (main)/
        (account)/     # profile, profile/balance, profile/books, profile/requests, profile/support, wishlist
        authors/
        books/[id]/
        collections/[id]/
        about/ privacy/ terms/
        [...rest]/      # catch-all (404 etc.)
  components/
    account/ auth/ book/ catalog/ home/ layout/ legal/ ui/
  lib/
    api/               # Server-side fetchers against the backend (client.ts, http.ts, home.ts, catalog.ts, contacts.ts)
    data/              # Static/fixture data
    stores/            # Zustand stores (auth, library, wishlist) + hydration hook
    i18n-lang.ts, types.ts, ...
  i18n/                # next-intl routing/request config
  fonts/
messages/              # next-intl translation JSON: tm.json, tr.json, ru.json
```

## Getting started

### Prerequisites

- Node 20+
- The [Aýkitap Backend](../aykitap-backend) running and reachable

### 1. Environment

There's no `.env.example` checked in yet — create `.env.local` with:

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1   # backend API, used by the browser
API_URL_INTERNAL=                                    # optional: server-side-only override (e.g. loopback/internal URL in prod, bypassing a public HTTPS proxy)
NEXT_PUBLIC_FILE_URL=http://localhost:9000           # MinIO, for cover/file URLs and next/image remote patterns
NEXT_PUBLIC_APP_SCHEME=                              # deep-link scheme back into the mobile app (e.g. aykitap://)
NEXT_PUBLIC_APP_STORE_URL=                           # iOS App Store link
NEXT_PUBLIC_PLAY_STORE_URL=                          # Google Play link
```

`API_URL_INTERNAL` is read only on the server (falls back to `NEXT_PUBLIC_API_URL` if unset) — see `src/lib/api/http.ts`.

### 2. Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — it redirects to the default locale (`/tm`).

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |

## Notes

- This README replaces the default `create-next-app` template README.
- `next.config.ts` trims `next/image`'s `deviceSizes`/`imageSizes` deliberately — the defaults produced a large `srcset` per card, which dominated page weight on catalog/home pages with hundreds of cards. Keep that in mind before reverting to Next's defaults.
- In development, `NEXT_PUBLIC_FILE_URL` pointing at `localhost:9000` needs `dangerouslyAllowLocalIP` (already set for `NODE_ENV=development` in `next.config.ts`) since Next 16's image optimizer blocks loopback hosts by default (SSRF protection) — don't rely on that flag in production.
