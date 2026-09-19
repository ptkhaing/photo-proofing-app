# Proofly — Client Photo Proofing

A client-facing gallery and proofing tool for photographers: upload a shoot,
send the client a link, and they mark their selects without needing an
account. Built as a portfolio project focused on strict TypeScript and clean
component design — no backend by design (see **Scope**).

## Try it

```bash
npm install
npm run dev
```

A demo gallery is seeded automatically (`/gallery/nguyen-wedding-demo`) so the
client experience works immediately without uploading anything first.

- `/` — photographer dashboard: create a gallery, see all galleries
- `/gallery/:slug` — the shareable client link
- `/results/:slug` — photographer's view of a client's selections

## Configuration

Copy `.env.example` to `.env` and set your own dashboard passcode:

```bash
cp .env.example .env
```

```
VITE_DASHBOARD_PASSCODE=your-passcode-here
```

For the live Netlify deploy, set the same variable in **Site settings →
Environment variables** instead of committing a `.env` file. If unset,
it falls back to `proofly2026` for local dev convenience — don't rely on
that fallback anywhere public.

## Scope

This is intentionally a **frontend-only, v1 core loop**: upload → gallery →
client select/approve, with a shareable link instead of authentication.
There's no server — a `localStorage`-backed store stands in for a real API
(see `src/data/galleryStore.tsx`), which keeps the project focused on
component and type design rather than backend plumbing.

**Known limitations from that choice**, stated up front rather than hidden:
- Photos uploaded via the file input use `URL.createObjectURL`, which is
  scoped to the browser session — they won't survive a page refresh. The
  seeded demo gallery uses stable remote URLs instead, so the *shareable
  link* experience always works even though real uploads are session-only.
- No real image storage/CDN, no auth, no email notifications to the client.
- **Zip downloads require CORS-enabled image URLs.** The seed gallery uses
  picsum.photos, which allows cross-origin fetches, so the demo download
  works out of the box. Real uploaded files use local blob URLs, which also
  fetch fine same-origin. If you later point this at a real image host,
  confirm it sends permissive CORS headers or the zip fetch will fail.
- **The dashboard passcode (`VITE_DASHBOARD_PASSCODE`) is a deterrent, not
  security.** It's baked into the built JS bundle, so anyone who opens dev
  tools on the live site can read it — it only stops a client from
  stumbling into your other galleries by guessing the base URL. It's kept
  out of the committed source (see `.env.example`) so it's at least not
  sitting in plain text in this public repo; set the real value in
  Netlify's Site settings → Environment variables, not in a committed file.
  Real access control needs a backend to check credentials before ever
  sending gallery data to the browser.
- A production version would swap `galleryStore.tsx` for real API calls
  behind the same interface — the rest of the app wouldn't need to change.

## Notable TypeScript/architecture choices

- **Discriminated union for gallery state** (`GalleryReviewState` in
  `src/types/photo.ts`) instead of a boolean/string flag — each state
  carries only the data valid for it (`submittedAt` only exists once
  submitted). The zip-download flow (`DownloadState` in
  `PhotographerResults.tsx`) uses the same pattern for its idle/zipping/error
  states.
- **Generic `Lightbox<T>`** (`src/components/Lightbox.tsx`) — it has no
  knowledge of photos specifically; it's a reusable "open/close/navigate a
  list of items" component, with rendering supplied by the caller.
- **Client-side zip generation** (`src/data/downloadZip.ts`, via `jszip`) —
  fetches each selected photo as a blob and packages them into a single
  `.zip` download, entirely in the browser, since there's no backend to do
  it server-side. Reports progress via a callback so the UI can show
  "Zipping 3/12…" rather than freezing silently on larger galleries.
- Object URLs for uploaded-file previews are owned per-thumbnail
  (`FilePreviewThumbnail` in `FileDropzone.tsx`) rather than tracked in one
  shared map — each thumbnail creates its URL on mount and revokes it on
  unmount, so cleanup falls out of React's own lifecycle instead of being
  hand-tracked.
- **`strict`, `noUncheckedIndexedAccess`, and `exactOptionalPropertyTypes`**
  all enabled in `tsconfig.app.json` — stricter than the Vite template
  default, deliberately, since demonstrating type rigor was the point of
  this project.
- Data flows through a small `Context` + `useReducer` store rather than a
  state library, since the state shape is simple enough not to need one —
  the interface is written so swapping in Zustand/real API calls later is a
  contained change.

## Stack

Vite, React 19, TypeScript (strict), React Router. No UI framework or CSS
library — styling is hand-written in `src/styles/global.css`.
