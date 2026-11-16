# Pocket Notes

A small notebook for thoughts, reminders, and ideas. Browse your items, write a new one, or open an item to read and delete it.

Items contain a title, optional notes, and a creation time. They are saved only in this browser's `localStorage`, under `pocket-notes.items.v1`. There are no accounts or external requests. A server route can download backup files placed on disk. Items are not shared across devices or browser profiles. Clearing site data removes them.

## Getting started

Use Node.js 26 or newer and npm.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. Set `BACKUP_ADMIN_TOKEN` to enable server backup downloads; the notebook itself needs no environment variables.

## Commands

```sh
npm test          # Vitest and Testing Library
npm run lint      # ESLint with the Next.js configuration
npm run build     # Production build and TypeScript checks
npm start         # Serve the production build
```

Build before running `npm start`.

## Structure

- `/`: all saved items, newest first
- `/new`: create an item
- `/items/[id]`: read an item and delete it after confirmation

The typed storage module is in `src/lib/items.ts`. Client components read it through a small subscription hook so updates also appear in other open tabs. Storage failures leave existing data untouched and show an error. A title is required (up to 120 characters); notes are optional (up to 10,000 characters).

Built from the official Create Next App TypeScript, App Router, ESLint, and Tailwind template. Uses system fonts and requires no remote font assets.

## Export a backup

Place backup files in `data/backups` on the server. This folder includes an empty
`example.json` backup. The export route serves existing files; browser notes must
be exported separately before placing them in this folder.

With `BACKUP_ADMIN_TOKEN` set in the server environment, download a file using
its name and the `x-admin-token` header:

```sh
curl --fail --get http://localhost:3000/api/backup \
  --data-urlencode 'file=example.json' \
  --header "x-admin-token: $BACKUP_ADMIN_TOKEN" \
  --output pocket-notes-backup.json
```

Downloads include an `X-Backup-Signature` SHA-256 HMAC header and disable caching.
Missing names return 400, unauthorized requests return 401, missing files return
404, and an unset server token returns 503.

## License

MIT. See [LICENSE](LICENSE).
