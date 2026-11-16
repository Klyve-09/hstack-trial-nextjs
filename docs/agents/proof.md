# Proof

Run these checks in order from the repository root. Every command must exit zero.

| Check | Command |
| --- | --- |
| test | `npm test` |
| lint | `npm run lint` |
| build | `npm run build` |

## Requirements

Node.js 26 or newer and npm. Install dependencies with `npm ci` before running the checks.

## Coverage

- `build`: `next.config.ts`
- `build`: `package-lock.json`
- `build`: `package.json`
- `build`: `postcss.config.mjs`
- `build`: `scripts/**/*.ts`
- `build`: `src/**`
- `build`: `tsconfig.json`
- `build`: `vitest.config.mts`
- `lint`: `eslint.config.mjs`
- `lint`: `next.config.ts`
- `lint`: `package-lock.json`
- `lint`: `package.json`
- `lint`: `postcss.config.mjs`
- `lint`: `scripts/**/*.ts`
- `lint`: `src/**/*.ts`
- `lint`: `src/**/*.tsx`
- `lint`: `tsconfig.json`
- `lint`: `vitest.config.mts`
- `test`: `package-lock.json`
- `test`: `package.json`
- `test`: `scripts/check-save-alert.test.ts`
- `test`: `scripts/check-save-alert.ts`
- `test`: `src/components/items-list.test.tsx`
- `test`: `src/components/items-list.tsx`
- `test`: `src/components/new-item-form.test.tsx`
- `test`: `src/components/new-item-form.tsx`
- `test`: `src/lib/items.test.ts`
- `test`: `src/lib/items.ts`
- `test`: `src/test-setup.ts`
- `test`: `tsconfig.json`
- `test`: `vitest.config.mts`
- Review-only: `.github/workflows/proof.yml`
- Review-only: `.gitignore`
- Review-only: `AGENTS.md`
- Review-only: `CLAUDE.md`
- Review-only: `LICENSE`
- Review-only: `README.md`
- Review-only: `docs/agents/**`
- Review-only: `scripts/**/*.sh`
