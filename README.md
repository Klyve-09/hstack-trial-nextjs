# Pocket Notes

A small notebook for thoughts, reminders, and ideas. Browse your items, write a new one, or open an item to read and delete it.

Items contain a title, optional notes, and a creation time. They are saved only in this browser's `localStorage`, under `pocket-notes.items.v1`. There are no accounts, backend services, or external requests. Items are not shared across devices or browser profiles. Clearing site data removes them.

## Getting started

Use Node.js 26 or newer and npm.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. No environment variables are needed.

## Commands

```sh
npm test          # Vitest and Testing Library
npm run lint      # ESLint with the Next.js configuration
npm run build     # Production build and TypeScript checks
npm start         # Serve the production build
```

Build before running `npm start`.

## Structure

- `/`: all saved items, newest first, with search by title or notes
- `/new`: create an item
- `/items/[id]`: read an item and delete it after confirmation

The typed storage module is in `src/lib/items.ts`. Client components read it through a small subscription hook so updates also appear in other open tabs. Storage failures leave existing data untouched and show an error. A title is required (up to 120 characters); notes are optional (up to 10,000 characters).

Built from the official Create Next App TypeScript, App Router, ESLint, and Tailwind template. Uses system fonts and requires no remote font assets.

## License

MIT. See [LICENSE](LICENSE).
