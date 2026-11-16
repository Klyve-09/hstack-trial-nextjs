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

Uses Next.js 16.4.6 with React 19.3.0.

Built from the official Create Next App TypeScript, App Router, ESLint, and Tailwind template. Uses system fonts and requires no remote font assets.

## Save signals

Each `createItem` attempt writes one JSON line to the browser console: `console.info` on success and `console.warn` on failure. Signals stay on-device; they are not sent anywhere.

```json
{"event":"pocket_notes.save","outcome":"success","reason":null,"operation_id":"<uuid>","time":"<ISO 8601 UTC>"}
{"event":"pocket_notes.save","outcome":"failure","reason":"quota_exceeded","operation_id":"<uuid>","time":"<ISO 8601 UTC>"}
```

Each attempt has a fresh UUID and a UTC timestamp. Failure reasons are `quota_exceeded` (storage quota reached), `storage_unavailable` (storage missing or access/read/write failed), `corrupt_data` (stored items cannot be parsed), `invalid_input` (title/body validation), and `unknown` (other failures). Success has a `null` reason. Signals never contain note IDs, titles, bodies, stored text, or error messages. Failures still throw and the form keeps its existing error message.

The signal type, fixed reasons, event name, and `parseSaveSignal` validator live in `src/lib/save-signal.ts`. The validator accepts a parsed object or JSON line, returning a signal or `null` for invalid input.

## License

MIT. See [LICENSE](LICENSE).
