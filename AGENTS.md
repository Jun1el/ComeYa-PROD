# AGENTS.md

## Project

ComeYa — food-rescue marketplace. Monorepo with Next.js frontend and .NET 8 backend.

- **Frontend**: Next.js 14 App Router, plain JavaScript (JSX), Tailwind CSS, Framer Motion
- **Backend**: .NET 8 Web API, Clean Architecture + CQRS (MediatR)
- **Database**: Supabase (PostgreSQL with RLS)
- **Auth**: Supabase Auth (JWT)
- **Realtime**: Supabase Realtime (chat, notifications, order status)

UI and code comments are in **Spanish**.

## Structure

```
ComeYa/
├── frontend/          # Next.js 14 → deploy to Vercel
│   ├── app/           # Pages (App Router) - MIGRATED to API
│   ├── components/    # Shared UI components
│   └── lib/
│       ├── api/       # API client (client.js, products.js, orders.js, etc.)
│       ├── supabase/  # Supabase client, auth context, realtime hooks
│       ├── hooks/     # React Query hooks (useProducts, useOrders, useProfile)
│       ├── store.js   # Legacy local storage (cart only, being phased out)
│       └── auth.js    # Legacy auth (deprecated, use auth-context.js)
│
├── backend/           # .NET 8 API → deploy to Render
│   ├── src/
│   │   ├── ComeYa.Domain/         # Entities, enums, common
│   │   ├── ComeYa.Application/    # CQRS handlers, interfaces, DTOs
│   │   ├── ComeYa.Infrastructure/ # EF Core, repositories, Supabase
│   │   └── ComeYa.API/            # Controllers, Program.cs
│   └── Dockerfile
│
├── database/          # SQL migrations and seed
│   ├── migrations/    # Run in order: 001, 002, 003
│   └── seed/          # Districts, coupons
│
└── docs/              # API.md, SUPABASE_SETUP.md
```

## Commands

### Frontend
```bash
cd frontend
npm run dev       # dev server on :3000
npm run build     # production build (verification check)
npm run lint      # next lint
```

### Backend
```bash
cd backend
dotnet build      # build solution
dotnet run --project src/ComeYa.API   # run API on :5000
dotnet test       # run tests
```

**Verification order**: `dotnet build` (backend) → `npm run lint` → `npm run build` (frontend)

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Backend (appsettings.Development.json)
```json
{
  "Supabase": { "Url": "...", "AnonKey": "..." },
  "ConnectionStrings": { "Supabase": "Host=db.xxx.supabase.co;Port=5432;Database=postgres;Username=postgres;Password=..." },
  "Frontend": { "Url": "http://localhost:3000" }
}
```

## Key Patterns

### Frontend
- Every page/component using store or auth must be `'use client'`
- Path alias: `@/*` → project root
- Tailwind custom colors: `brand.*` (e.g., `bg-brand-primary`)
- Cold start handling: Render free tier has ~30-60s cold start, use `ApiLoading` component
- API calls via `lib/api/client.js` with automatic JWT injection
- React Query for data fetching (`lib/hooks/`)
- Auth context via `lib/supabase/auth-context.js` (useAuth hook)
- Realtime via `lib/supabase/realtime.js` (useRealtimeMessages, useRealtimeNotifications)

### Backend
- Clean Architecture: Domain → Application → Infrastructure → API
- CQRS with MediatR for commands/queries
- FluentValidation for request validation
- EF Core with snake_case column mapping
- JWT validation from Supabase Auth tokens
- Controllers: Products, Orders, Profile, Businesses

### Database
- All tables have RLS enabled
- `profiles` extends `auth.users` via trigger
- Orders split by business (one order per restaurant)
- Products have `expires_at` for urgency system
- Realtime enabled for messages and notifications

## Migration Status

✅ **MIGRATED** - All pages now use API instead of localStorage:
- Login/Register → Supabase Auth
- Shop → useProducts hook
- Cart → useCreateOrder hook
- Orders → useOrders hook
- Profile → useProfile hook
- Admin → useProducts hook

⚠️ **Legacy** - Still using localStorage (to be removed):
- `lib/store.js` - Cart state (temporary, will migrate to API)
- `lib/auth.js` - Old auth helpers (deprecated)

## Conventions

- Frontend: `.jsx` / `.js` (no TypeScript)
- Backend: C# 12, nullable enabled
- Database: snake_case tables and columns
- No env vars committed

## Deployment

- Frontend: Vercel (auto-deploy on push)
- Backend: Render (Docker, free tier with cold starts)
- Database: Supabase free tier (500MB)

## Setup Guide

See [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md) for complete setup instructions.
