# Frontend architecture

## Central auth on the landing app

**All authentication lives in `apps/landing`.**  
Login, register, forgot password, reset password, and email verification are **not** duplicated in admin, landlord, or tenant apps.

```
User visits myunits.com (landing)
        │
        ▼
   /login | /register | /forgot-password | /reset-password | /verify-email
        │
        ▼
   API: POST /api/v1/auth/*
        │
        ▼
   postAuthRedirect (by role)
        │
        ├── ADMIN    → admin app URL
        ├── LANDLORD → landlord app URL
        └── USER     → tenant portal URL
```

### Why

- One place for auth UX and branding
- Single source of truth for tokens (shared via `@myunits/auth` + storage)
- Module apps only check session and role; unauthenticated users are sent back to landing login

### Landing app (`apps/landing`)

| Area | Responsibility |
|------|----------------|
| `features/auth/` | Login, register, forgot/reset, verify email |
| `features/auth/utils/postAuthRedirect.ts` | Redirect to correct app after success |
| `providers/AuthProvider.tsx` | Session state while on landing |
| Marketing | `features/home/`, pages (Home, Features, Contact) |

### Module apps (`admin`, `landlord`, `tenant`)

| Area | Responsibility |
|------|----------------|
| `guards/AuthGuard.tsx` | No token → redirect to landing `/login` |
| `guards/RoleGuard.tsx` | Wrong role → redirect or forbidden |
| `providers/SessionProvider.tsx` | Read tokens from storage (set on landing) |
| `constants/landingUrls.ts` | Landing base URL for auth redirects |
| **No** `features/auth/pages` | Do not add login/register here |

### Shared packages

- `@myunits/auth` — token/session helpers, guards (reusable), `redirectByRole`, `appUrls`
- `@myunits/api-client` — `auth.api.ts` used by landing (and optionally apps for refresh)

### Environment (example)

```env
# landing .env
VITE_API_URL=http://localhost:3001/api/v1
VITE_ADMIN_APP_URL=http://localhost:5174
VITE_LANDLORD_APP_URL=http://localhost:5175
VITE_TENANT_APP_URL=http://localhost:5176
```

Module apps use the same API URL and `VITE_LANDING_URL` for logout / login redirects.
