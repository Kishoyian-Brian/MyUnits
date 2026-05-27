#!/usr/bin/env bash
# Scaffold MyUnits client monorepo folder structure (empty / minimal files)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

touch_file() {
  local f="$1"
  mkdir -p "$(dirname "$f")"
  if [[ ! -f "$f" ]]; then
    : > "$f"
  fi
}

# --- Root ---
touch_file "pnpm-workspace.yaml"
touch_file "tsconfig.base.json"
touch_file ".env"
touch_file ".env.example"
touch_file "turbo.json"
touch_file "README.md"

# --- scripts ---
touch_file "scripts/generate-types.ts"
touch_file "scripts/setup-env.ts"
touch_file "scripts/clean.ts"

# --- docs ---
touch_file "docs/architecture.md"
touch_file "docs/api.md"
touch_file "docs/deployment.md"
touch_file "docs/permissions.md"
touch_file "docs/coding-standards.md"

# --- tests ---
touch_file "tests/e2e/.gitkeep"
touch_file "tests/integration/.gitkeep"
touch_file "tests/performance/.gitkeep"

# --- packages: api-client ---
touch_file "packages/api-client/package.json"
touch_file "packages/api-client/tsconfig.json"
touch_file "packages/api-client/src/client.ts"
touch_file "packages/api-client/src/index.ts"
touch_file "packages/api-client/src/interceptors/auth.interceptor.ts"
touch_file "packages/api-client/src/interceptors/refresh.interceptor.ts"
for m in auth users properties units tenants leases invoices payments maintenance notifications; do
  touch_file "packages/api-client/src/modules/${m}.api.ts"
done

# --- packages: auth ---
touch_file "packages/auth/package.json"
touch_file "packages/auth/tsconfig.json"
touch_file "packages/auth/src/index.ts"
touch_file "packages/auth/src/hooks/useAuth.ts"
touch_file "packages/auth/src/hooks/usePermissions.ts"
touch_file "packages/auth/src/guards/AuthGuard.tsx"
touch_file "packages/auth/src/guards/RoleGuard.tsx"
touch_file "packages/auth/src/guards/PermissionGuard.tsx"
touch_file "packages/auth/src/utils/token.ts"
touch_file "packages/auth/src/utils/session.ts"
touch_file "packages/auth/src/utils/redirectByRole.ts"
touch_file "packages/auth/src/constants/roles.ts"
touch_file "packages/auth/src/constants/permissions.ts"
touch_file "packages/auth/src/constants/appUrls.ts"

# --- packages: ui ---
touch_file "packages/ui/package.json"
touch_file "packages/ui/tsconfig.json"
touch_file "packages/ui/src/index.ts"
for c in button modal input table badge dropdown sidebar navbar loader; do
  touch_file "packages/ui/src/components/${c}/.gitkeep"
done
touch_file "packages/ui/src/layouts/.gitkeep"
touch_file "packages/ui/src/theme/.gitkeep"
touch_file "packages/ui/src/hooks/.gitkeep"

# --- packages: forms ---
touch_file "packages/forms/package.json"
touch_file "packages/forms/tsconfig.json"
touch_file "packages/forms/src/index.ts"
touch_file "packages/forms/src/components/FormInput.tsx"
touch_file "packages/forms/src/components/FormSelect.tsx"
touch_file "packages/forms/src/components/FormTextarea.tsx"
touch_file "packages/forms/src/components/FormDatePicker.tsx"
touch_file "packages/forms/src/hooks/useZodForm.ts"

# --- packages: types ---
touch_file "packages/types/package.json"
touch_file "packages/types/tsconfig.json"
touch_file "packages/types/src/index.ts"
for t in auth user property tenant lease invoice payment maintenance expense notification api; do
  touch_file "packages/types/src/${t}.types.ts"
done

# --- packages: utils ---
touch_file "packages/utils/package.json"
touch_file "packages/utils/tsconfig.json"
touch_file "packages/utils/src/index.ts"
touch_file "packages/utils/src/formatters/currency.ts"
touch_file "packages/utils/src/formatters/dates.ts"
touch_file "packages/utils/src/formatters/percentages.ts"
touch_file "packages/utils/src/validators/.gitkeep"
touch_file "packages/utils/src/constants/.gitkeep"
touch_file "packages/utils/src/helpers/.gitkeep"

# --- packages: config ---
touch_file "packages/config/eslint/.gitkeep"
touch_file "packages/config/prettier/.gitkeep"
touch_file "packages/config/tailwind/.gitkeep"
touch_file "packages/config/typescript/.gitkeep"
touch_file "packages/config/vite/.gitkeep"

# --- packages: notifications ---
touch_file "packages/notifications/package.json"
touch_file "packages/notifications/tsconfig.json"
touch_file "packages/notifications/src/index.ts"
touch_file "packages/notifications/src/socket/.gitkeep"
touch_file "packages/notifications/src/toast/.gitkeep"
touch_file "packages/notifications/src/email/.gitkeep"

# --- apps: landing (marketing + central auth hub) ---
touch_file "apps/landing/src/routes/index.tsx"
touch_file "apps/landing/src/routes/public.tsx"
touch_file "apps/landing/src/layouts/LandingLayout.tsx"
touch_file "apps/landing/src/layouts/AuthLayout.tsx"
touch_file "apps/landing/src/pages/Home.tsx"
touch_file "apps/landing/src/pages/Pricing.tsx"
touch_file "apps/landing/src/pages/Features.tsx"
touch_file "apps/landing/src/pages/Contact.tsx"
touch_file "apps/landing/src/pages/NotFound.tsx"

# landing: auth (login, register, forgot/reset, verify — all users start here)
touch_file "apps/landing/src/features/auth/api/auth.api.ts"
touch_file "apps/landing/src/features/auth/hooks/useLogin.ts"
touch_file "apps/landing/src/features/auth/hooks/useRegister.ts"
touch_file "apps/landing/src/features/auth/hooks/useForgotPassword.ts"
touch_file "apps/landing/src/features/auth/hooks/useResetPassword.ts"
touch_file "apps/landing/src/features/auth/hooks/useVerifyEmail.ts"
touch_file "apps/landing/src/features/auth/hooks/useLogout.ts"
touch_file "apps/landing/src/features/auth/forms/LoginForm.tsx"
touch_file "apps/landing/src/features/auth/forms/RegisterForm.tsx"
touch_file "apps/landing/src/features/auth/forms/ForgotPasswordForm.tsx"
touch_file "apps/landing/src/features/auth/forms/ResetPasswordForm.tsx"
touch_file "apps/landing/src/features/auth/schema/login.schema.ts"
touch_file "apps/landing/src/features/auth/schema/register.schema.ts"
touch_file "apps/landing/src/features/auth/schema/forgot-password.schema.ts"
touch_file "apps/landing/src/features/auth/schema/reset-password.schema.ts"
touch_file "apps/landing/src/features/auth/schema/verify-email.schema.ts"
touch_file "apps/landing/src/features/auth/pages/Login.tsx"
touch_file "apps/landing/src/features/auth/pages/Register.tsx"
touch_file "apps/landing/src/features/auth/pages/ForgotPassword.tsx"
touch_file "apps/landing/src/features/auth/pages/ResetPassword.tsx"
touch_file "apps/landing/src/features/auth/pages/VerifyEmail.tsx"
touch_file "apps/landing/src/features/auth/components/AuthCard.tsx"
touch_file "apps/landing/src/features/auth/utils/postAuthRedirect.ts"

touch_file "apps/landing/src/features/home/components/Hero.tsx"
touch_file "apps/landing/src/features/home/components/Testimonials.tsx"
touch_file "apps/landing/src/features/home/components/CTA.tsx"
touch_file "apps/landing/src/features/home/components/FeaturesGrid.tsx"
touch_file "apps/landing/src/features/home/hooks/.gitkeep"
touch_file "apps/landing/src/features/contact/components/.gitkeep"
touch_file "apps/landing/src/features/contact/forms/.gitkeep"
touch_file "apps/landing/src/features/contact/schema/.gitkeep"
touch_file "apps/landing/src/components/Navbar.tsx"
touch_file "apps/landing/src/components/Footer.tsx"
touch_file "apps/landing/src/providers/QueryProvider.tsx"
touch_file "apps/landing/src/providers/AuthProvider.tsx"
touch_file "apps/landing/src/lib/axios.ts"
touch_file "apps/landing/src/lib/query-client.ts"
touch_file "apps/landing/src/lib/env.ts"
touch_file "apps/landing/src/styles/globals.css"

# --- apps: admin (no auth pages — session from landing) ---
touch_file "apps/admin/src/routes/index.tsx"
touch_file "apps/admin/src/routes/protected.tsx"
touch_file "apps/admin/src/layouts/AdminLayout.tsx"
touch_file "apps/admin/src/providers/QueryProvider.tsx"
touch_file "apps/admin/src/providers/SessionProvider.tsx"
touch_file "apps/admin/src/providers/ThemeProvider.tsx"
touch_file "apps/admin/src/store/auth.store.ts"
touch_file "apps/admin/src/store/ui.store.ts"
touch_file "apps/admin/src/store/notification.store.ts"
touch_file "apps/admin/src/lib/axios.ts"
touch_file "apps/admin/src/lib/query-client.ts"
touch_file "apps/admin/src/lib/env.ts"
touch_file "apps/admin/src/lib/socket.ts"
touch_file "apps/admin/src/hooks/useDebounce.ts"
touch_file "apps/admin/src/hooks/usePagination.ts"
touch_file "apps/admin/src/hooks/useModal.ts"
touch_file "apps/admin/src/guards/AuthGuard.tsx"
touch_file "apps/admin/src/guards/RoleGuard.tsx"
touch_file "apps/admin/src/guards/PermissionGuard.tsx"
touch_file "apps/admin/src/constants/routes.ts"
touch_file "apps/admin/src/constants/roles.ts"
touch_file "apps/admin/src/constants/permissions.ts"
touch_file "apps/admin/src/constants/landingUrls.ts"
touch_file "apps/admin/src/types/global.d.ts"
touch_file "apps/admin/src/styles/globals.css"
touch_file "apps/admin/src/components/tables/.gitkeep"
touch_file "apps/admin/src/components/charts/.gitkeep"
touch_file "apps/admin/src/components/modals/.gitkeep"
touch_file "apps/admin/src/components/loaders/.gitkeep"

touch_file "apps/admin/src/features/dashboard/api/.gitkeep"
touch_file "apps/admin/src/features/dashboard/hooks/.gitkeep"
touch_file "apps/admin/src/features/dashboard/components/RevenueChart.tsx"
touch_file "apps/admin/src/features/dashboard/components/OccupancyCard.tsx"
touch_file "apps/admin/src/features/dashboard/components/RecentPayments.tsx"
touch_file "apps/admin/src/features/dashboard/pages/Dashboard.tsx"

touch_file "apps/admin/src/features/users/api/users.api.ts"
touch_file "apps/admin/src/features/users/hooks/useUsers.ts"
touch_file "apps/admin/src/features/users/hooks/useCreateUser.ts"
touch_file "apps/admin/src/features/users/components/UsersTable.tsx"
touch_file "apps/admin/src/features/users/components/UserCard.tsx"
touch_file "apps/admin/src/features/users/components/UserFilters.tsx"
touch_file "apps/admin/src/features/users/forms/CreateLandlordForm.tsx"
touch_file "apps/admin/src/features/users/schema/user.schema.ts"
touch_file "apps/admin/src/features/users/pages/UsersList.tsx"
touch_file "apps/admin/src/features/users/pages/CreateLandlord.tsx"
touch_file "apps/admin/src/features/users/types/user.types.ts"

for feat in properties units tenants leases invoices payments maintenance expenses notifications settings; do
  mkdir -p "apps/admin/src/features/${feat}"
  touch_file "apps/admin/src/features/${feat}/.gitkeep"
done

# --- apps: landlord (no auth pages) ---
touch_file "apps/landlord/src/routes/index.tsx"
touch_file "apps/landlord/src/routes/protected.tsx"
touch_file "apps/landlord/src/layouts/LandlordLayout.tsx"
touch_file "apps/landlord/src/providers/QueryProvider.tsx"
touch_file "apps/landlord/src/providers/SessionProvider.tsx"
touch_file "apps/landlord/src/store/auth.store.ts"
touch_file "apps/landlord/src/store/ui.store.ts"
touch_file "apps/landlord/src/guards/AuthGuard.tsx"
touch_file "apps/landlord/src/guards/RoleGuard.tsx"
touch_file "apps/landlord/src/hooks/.gitkeep"
touch_file "apps/landlord/src/lib/axios.ts"
touch_file "apps/landlord/src/lib/query-client.ts"
touch_file "apps/landlord/src/lib/env.ts"
touch_file "apps/landlord/src/constants/routes.ts"
touch_file "apps/landlord/src/constants/landingUrls.ts"
touch_file "apps/landlord/src/styles/globals.css"
touch_file "apps/landlord/src/components/.gitkeep"
for feat in dashboard properties units tenants leases invoices payments maintenance expenses rent-adjustments notifications settings; do
  mkdir -p "apps/landlord/src/features/${feat}"
  touch_file "apps/landlord/src/features/${feat}/.gitkeep"
done

# --- apps: tenant (no auth pages) ---
touch_file "apps/tenant/src/routes/index.tsx"
touch_file "apps/tenant/src/routes/protected.tsx"
touch_file "apps/tenant/src/layouts/TenantLayout.tsx"
touch_file "apps/tenant/src/providers/QueryProvider.tsx"
touch_file "apps/tenant/src/providers/SessionProvider.tsx"
touch_file "apps/tenant/src/store/auth.store.ts"
touch_file "apps/tenant/src/guards/AuthGuard.tsx"
touch_file "apps/tenant/src/guards/RoleGuard.tsx"
touch_file "apps/tenant/src/hooks/.gitkeep"
touch_file "apps/tenant/src/lib/axios.ts"
touch_file "apps/tenant/src/lib/query-client.ts"
touch_file "apps/tenant/src/lib/env.ts"
touch_file "apps/tenant/src/constants/routes.ts"
touch_file "apps/tenant/src/constants/landingUrls.ts"
touch_file "apps/tenant/src/styles/globals.css"
touch_file "apps/tenant/src/components/.gitkeep"
for feat in dashboard invoices payments maintenance notifications settings; do
  mkdir -p "apps/tenant/src/features/${feat}"
  touch_file "apps/tenant/src/features/${feat}/.gitkeep"
done

echo "Scaffold complete under $ROOT"
