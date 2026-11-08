# Release guide

## Current scope

The `v0.1.0` GitHub Release is a tagged source snapshot of the Aýkitap website. It does not deploy the site or package a phone app. The current repository has no verified public website URL, hosting credentials, or deployment workflow. Keep the Release marked as a pre-release until the target hosting environment and live user flows are verified.

## Before a website rollout

1. Confirm the target backend, public file origin, and store links. Set `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_FILE_URL`, and any store URLs before the production build. Set `API_URL_INTERNAL` only if the server needs a separate backend route. Do not put credentials in `NEXT_PUBLIC_` values.
2. Run `npm ci`, lint with zero warnings, TypeScript, the production build, and the production dependency audit. Review remaining development-only advisories separately.
3. On a staging host, check each locale, catalogue/search/book pages, phone login, wishlist/library, balance and purchase return, requests/support, images, and mobile-app links. A backend-free build cannot validate those flows.
4. Merge reviewed changes after CI passes. Tag the exact merge commit. Publish release notes with the source commit, checks, and unverified live behavior. Promote the Release only after a real staging and production smoke test.

## Rollback

Keep the previous deployment artifact and configuration. If a rollout fails, restore the previous site build and confirm that the backend and file URLs still match. Revert or disable the affected deployment in the hosting platform, then check login, catalogue, and purchase status. The hosting platform and its rollback controls are not documented in this repository, so the owner must confirm the procedure before a live rollout.
