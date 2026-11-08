# Aýkitap Frontend

Public catalogue and account website for **Aýkitap**. Visitors can discover books and authors, open collections, and learn about the reading app. Signed-in readers can use their wishlist, library, balance, requests, and support pages. The site is a Next.js server application connected to a separate Aýkitap backend; the mobile app and admin panel are separate projects.

The interface has Turkmen, Turkish, and Russian routes (`/tm`, `/tr`, `/ru`). Book data, account actions, payments, and file access depend on the configured backend. A successful website build does not verify those live services.

## Tech stack

- **Framework:** Next.js 16.4 (App Router, React 19, TypeScript)
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

- Node 20.9+ and npm
- The Aýkitap backend running and reachable for live catalogue and account flows

### 1. Environment

Create `.env.local` with environment-specific values:

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1   # backend API, used by the browser
API_URL_INTERNAL=                                    # optional: server-side-only override (e.g. loopback/internal URL in prod, bypassing a public HTTPS proxy)
NEXT_PUBLIC_FILE_URL=http://localhost:9000           # MinIO, for cover/file URLs and next/image remote patterns
NEXT_PUBLIC_APP_SCHEME=                              # deep-link scheme back into the mobile app (e.g. aykitap://)
NEXT_PUBLIC_APP_STORE_URL=                           # iOS App Store link
NEXT_PUBLIC_PLAY_STORE_URL=                          # Google Play link
```

`API_URL_INTERNAL` is read only on the server (falls back to `NEXT_PUBLIC_API_URL` if unset) — see `src/lib/api/http.ts`. Values prefixed `NEXT_PUBLIC_` are embedded in the browser bundle at build time, so set the production URLs before building. Do not put secrets in those variables.

### 2. Install and run

```bash
npm ci
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

Before publishing changes, run:

```bash
npm ci
npm run lint -- --max-warnings=0
npm run build
npx tsc --noEmit
npm audit --omit=dev --audit-level=high
```

GitHub Actions runs the same checks on pull requests and `main`. The production build succeeds without an API connection, but that does not prove login, purchases, downloads, or backend availability. Test those flows against the intended environment before a live rollout.

## Releases and deployment

[GitHub Releases](https://github.com/Dadebay/AyKitap_website/releases) provide tagged source snapshots. This is a server-rendered website, so a Release is not an installable app or a live deployment. Configure the public API and file URLs, build on the target platform, then run `npm run start` behind a reverse proxy or deploy through the site's hosting platform. Deployment credentials and the live host are not stored in this repository. See the [release guide](docs/RELEASE.md) for verification and rollback steps.

## Notes

- `next.config.ts` trims `next/image`'s `deviceSizes`/`imageSizes` deliberately — the defaults produced a large `srcset` per card, which dominated page weight on catalog/home pages with hundreds of cards. Keep that in mind before reverting to Next's defaults.
- In development, `NEXT_PUBLIC_FILE_URL` pointing at `localhost:9000` needs `dangerouslyAllowLocalIP` (already set for `NODE_ENV=development` in `next.config.ts`) since Next 16's image optimizer blocks loopback hosts by default (SSRF protection) — don't rely on that flag in production.
