# UI/UX rules (always on)

- `dir="rtl"` and `lang="ar"` on `<html>`; use Tailwind logical properties (`ms-`, `me-`, `ps-`, `pe-`), never `ml-`/`mr-` for layout.
- Font: an Arabic-friendly font (e.g. IBM Plex Sans Arabic or Cairo), self-hosted for offline.
- Dark mode default, light mode optional; respect `prefers-reduced-motion`.
- Every screen designs 5 states: loading (skeleton), empty, error (with retry), offline, permission-denied.
- Mobile-first at 390px; tap targets ≥ 44px; bottom navigation; floating mic button reachable by thumb.
- Numbers and amounts: show Arabic-Indic or Western digits per a setting; currency always visible.
- Copy is short, friendly Egyptian Arabic; technical terms may stay in English.
- Verify visually in the browser and attach screenshots in the walkthrough artifact.
