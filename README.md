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

Every page shows the app version below the storage notice in the footer.

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

### Save failure alert

`src/lib/save-alert.ts` evaluates the alert locally, with exported constants for its thresholds. It fires when at least 3 counted failures make up at least 10% of attempts in the 15 minutes ending at `now`. Both window boundaries are included; future signals are excluded. Counted failures are `quota_exceeded`, `storage_unavailable`, and `unknown`. Attempts are successes plus those failures; `invalid_input` and `corrupt_data` count as neither failures nor attempts. Empty traffic does not fire.

Export or paste console signals into a local JSONL file, then run `npm run alert:save -- <signals.jsonl> [--now <ISO>]`. `--now` accepts an ISO timestamp with a timezone; without it the command uses the current time. Blank lines are allowed, as is console text before the first `{` (for example, `warn {"event":...}`). Every non-blank line must contain a valid signal from that first `{` through the end of the line.

The command prints one JSON summary line to stdout with `firing`, `failures`, `attempts`, `window_minutes`, and `now`. Exit codes are **0** for healthy/not firing, **1** for firing, and **2** for bad input or usage (including an unreadable file, invalid `--now`, or malformed line). Errors go to stderr with no summary; malformed input never reports healthy. This evaluates captured signals only and sends no notifications or network requests.

This reproducible example uses a temporary file and returns exit code 0:

```sh
signals_file=$(mktemp)
cat > "$signals_file" <<'JSONL'
{"event":"pocket_notes.save","outcome":"success","reason":null,"operation_id":"00000000-0000-4000-8000-000000000001","time":"2026-11-17T00:15:00.000Z"}
JSONL
npm run alert:save -- "$signals_file" --now 2026-11-17T00:15:00.000Z
rm "$signals_file"
```

### Connect a real receiver after merge

A person runs [scripts/connect-save-alerts.sh](scripts/connect-save-alerts.sh) from the repository root after merge to connect a real receiver. Agents must not run this wizard. It keeps public choices only in shell variables, writes no `.env`, and adds no forwarding code. Off-device sending requires the owner's privacy decision and a follow-up code change. Receiver-specific guidance is marked `[unverified]`; consult the chosen service's official docs.

1. Preconditions: check the repo root, Node.js 26+, npm, and healthy/firing command samples.
2. Sending decision: confirm the owner's approval for sending signals off-device.
3. Choose the receiver: enter a public service name and documentation URL, then open it.
4. Forward signals `[unverified]`: complete a follow-up forwarding ticket and confirm a test signal is visible.
5. Transfer the rule `[unverified]`: confirm creation and check that the equivalent alert rule is enabled.
6. Contact channel `[unverified]`: choose a public channel name, attach it, and confirm it is enabled.
7. Drill: cause storage failures in a test profile, confirm delivery, and check exported signals return exit 1 locally.

If a step fails or the person aborts after step 5 starts, the wizard instructs them to manually disable/delete the rule and contact channel created in the service (`[unverified]`). The script is committed for human use; it has not been run end-to-end by agents.

## License

MIT. See [LICENSE](LICENSE).
