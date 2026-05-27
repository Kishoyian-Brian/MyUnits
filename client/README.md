# MyUnits Web (Monorepo)

pnpm workspaces + Turborepo.

## Apps

| App | Path | Dev command | Role |
|-----|------|-------------|------|
| Landing | `apps/landing` | `pnpm --filter @myunits/landing dev` | Marketing + **central auth** (login, register, forgot password) |
| Admin | `apps/admin` | `pnpm --filter @myunits/admin dev` | Admin module (after login redirect) |
| Landlord | `apps/landlord` | `pnpm --filter @myunits/landlord dev` | Landlord module |
| Tenant | `apps/tenant` | `pnpm --filter @myunits/tenant dev` | Tenant portal |

**Auth flow:** Users sign in on the landing app only. After login, `postAuthRedirect` sends them to the correct app by role. Module apps do not host login/register pages — see [docs/architecture.md](./docs/architecture.md).

## Packages

- `@myunits/api-client` — HTTP client + API modules
- `@myunits/auth` — auth hooks, guards, session utils
- `@myunits/ui` — shared UI components
- `@myunits/forms` — form components + Zod helpers
- `@myunits/types` — shared TypeScript types
- `@myunits/utils` — formatters, validators, helpers
- `@myunits/notifications` — socket, toast, email helpers

## Setup

```bash
cp .env.example .env
pnpm install
```

## Scaffold script

Re-run folder scaffold (creates missing files only):

```bash
./scripts/scaffold-structure.sh
```
