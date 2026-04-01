# Setup Guide — Nike Commerce Hub

## Stack
- **Frontend** — React + Vite + Tailwind (this folder)
- **Server**   — Express.js (`server/` folder)
- **Auth**     — Clerk
- **Database** — Supabase (PostgreSQL)
- **Payments** — Stripe

---

## 1. Clerk

1. Go to [dashboard.clerk.com](https://dashboard.clerk.com) → **Create application**
2. Choose sign-in methods (Email + Password recommended)
3. Go to **API Keys** → copy:
   - **Publishable key** → `VITE_CLERK_PUBLISHABLE_KEY` (frontend `.env`)
   - **Secret key**      → `CLERK_SECRET_KEY` (server `.env`)
4. In Clerk Dashboard → **Paths**, set:
   - Sign-in URL  → `/login`
   - Sign-up URL  → `/signup`
   - After sign-in → `/account`
   - After sign-up → `/account`

---

## 2. Supabase

1. Go to [app.supabase.com](https://app.supabase.com) → **New project**
2. Go to **Settings → API** → copy:
   - **Project URL**             → `SUPABASE_URL` (server `.env`) and `VITE_SUPABASE_URL` (if needed)
   - **anon/public key**         → frontend only (not used currently)
   - **service_role key**        → `SUPABASE_SERVICE_ROLE_KEY` (server `.env`) ⚠️ keep secret
3. Go to **SQL Editor** → paste contents of `server/supabase-schema.sql` → **Run**
4. To use your real product images: upload `src/assets/shoe-*.jpg` to **Storage → products bucket** → update `image_url` in the seed data

---

## 3. Stripe

1. Go to [dashboard.stripe.com](https://dashboard.stripe.com) → **Developers → API Keys**
2. Copy:
   - **Publishable key** → `VITE_STRIPE_PUBLISHABLE_KEY` (frontend `.env`)
   - **Secret key**      → `STRIPE_SECRET_KEY` (server `.env`)
3. For webhooks (to mark orders as paid):
   - Go to **Developers → Webhooks → Add endpoint**
   - URL: `https://yourdomain.com/api/stripe/webhook`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Copy **Signing secret** → `STRIPE_WEBHOOK_SECRET` (server `.env`)
   - For local testing: `stripe listen --forward-to localhost:4000/api/stripe/webhook`

---

## 4. Environment files

**Frontend** — copy `.env.example` to `.env`:
```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_API_URL=http://localhost:4000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

**Server** — copy `server/.env.example` to `server/.env`:
```
PORT=4000
CLERK_SECRET_KEY=sk_test_...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
CLIENT_URL=http://localhost:5173
```

---

## 5. Run

**Terminal 1 — Server:**
```bash
cd server
npm install
npm run dev
# → http://localhost:4000
```

**Terminal 2 — Frontend:**
```bash
npm install
npm run dev
# → http://localhost:5173
```

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET    | `/api/health`                      | Public  | Server health check |
| GET    | `/api/auth/me`                     | Clerk   | Get current user + role |
| POST   | `/api/auth/set-role`               | Clerk   | Set buyer/seller role |
| GET    | `/api/products`                    | Public  | List all products |
| GET    | `/api/products/:id`                | Public  | Single product |
| POST   | `/api/products`                    | Seller  | Create product listing |
| DELETE | `/api/products/:id`                | Seller  | Remove own product |
| GET    | `/api/orders`                      | Clerk   | Get user's orders |
| POST   | `/api/orders`                      | Clerk   | Create order after payment |
| POST   | `/api/stripe/create-payment-intent`| Clerk   | Create Stripe PaymentIntent |
| POST   | `/api/stripe/webhook`              | Stripe  | Handle payment events |

---

## Role System

- **buyer** (default) — can browse, add to cart, checkout
- **seller** — can list/delete products via Seller Dashboard

Role is stored in **Clerk public metadata** (`publicMetadata.role`) and synced to Supabase `users.role` on every login via `/api/auth/me`.

To manually promote a user to seller:
1. Clerk Dashboard → Users → click user → **Public metadata** → set `{"role": "seller"}`
2. Or: user selects "Seller" on the signup page (calls `POST /api/auth/set-role`)
