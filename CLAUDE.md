# CLAUDE.md

German A1 study app (React 19 + Vite 8 + Tailwind v4 + React Router 7). No backend; progress
lives in localStorage. UI copy is Indonesian, study content is German. Sibling project with
the same conventions: `../web-japanlanguage`.

## Commands

- `npm run dev` (port 3002) · `npm run build` (runs `data:validate` first) · `npm run lint`
- `npm run data:validate` must pass after any edit to `src/data/*.json`.

## Conventions

- Content lives only in `src/data/`. Schemas are documented in README.md › "Menambah materi";
  `scripts/validate-data.mjs` enforces them. Add new rules there when adding new fields.
- `src/lib/` is framework-free (no React imports). Put logic there, keep components thin.
- Colours: use the semantic tokens from `src/index.css` (`bg-surface`, `text-muted`,
  `text-der` …), never raw hex or `dark:` variants. Gender colours: der blue, die red,
  das green, via `GENDERS` in `lib/german.js`.
- Tailwind classes must be literal strings; never build them with templates like
  `hover:${x}`. Add a full class to a lookup map instead.
- Progress keys are namespaced through `KEY` in `lib/german.js` (`card:`, `artikel:`,
  `konj:`, `hoeren:`, `grammatik:`). Renaming an id in the data orphans existing progress.
- Typed answers go through `checkAnswer` in `lib/normalize.js`, which accepts ae/oe/ue/ss
  and reports a spelling note.
- Every study mode follows the same pattern: a setup page, then a `*Drill` component built
  on `useSession`, ending in `SessionSummary`. Restart works by remounting with a new key.
- German text in markup gets `lang="de"`.
- Global key listeners skip focused controls, and "Lanjut" buttons use `autoFocus` so Enter
  works natively. Don't add a second Enter handler, or the drill advances twice.
