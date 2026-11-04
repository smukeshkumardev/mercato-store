# Mercato: Full-Stack E-Commerce App

A complete online store with customer accounts, product search and filters, cart, Stripe card payments and an admin dashboard. Built with React, Node.js, Express and MySQL.

**Live demo:** https://mercato-pied.vercel.app

> The demo runs on free hosting. If nothing loads at first, wait about a minute and refresh. The server wakes up after being idle.

**Test payment:** use card `4242 4242 4242 4242`, any future expiry date and any CVC. Stripe is in test mode, so no real money is charged.

## Features

**Customers**
- Sign up and log in (JWT authentication, passwords hashed with bcrypt)
- Browse 660 products across 6 categories
- Search, filter by category, price range and rating, sort, and page through results
- Cart that is saved in the browser, with quantity changes and a live total
- Checkout with Stripe, then a payment confirmation page
- My orders page, with a cancel option for unpaid orders (stock is returned)

**Admin**
- Add, edit and delete products, with search and paging for large catalogs
- Low-stock highlight so empty shelves are easy to spot
- Create categories
- View all orders and update their status (placed, shipped, delivered, cancelled)

## What makes it solid

- **Prices are calculated on the server.** The browser only sends product IDs and quantities, so totals cannot be tampered with.
- **Stock is handled in database transactions with row locks,** so two people cannot buy the last item at the same time.
- **Payments are verified with Stripe.** An order is marked as paid only after the server confirms the PaymentIntent succeeded with Stripe (a webhook handler is included too).
- **Role-based access.** Admin routes are protected, and users can only see their own orders.

## Tech stack

| Part | Technology |
|---|---|
| Frontend | React, Vite, Tailwind CSS, React Router |
| Backend | Node.js, Express |
| Database | MySQL with Sequelize |
| Auth | JWT, bcrypt |
| Payments | Stripe (PaymentIntents, test mode) |
| Hosting | Vercel (frontend), Render (API), Aiven (MySQL) |

## How it fits together

```
React app (Vercel)  ->  Express API (Render)  ->  MySQL (Aiven)
                              |
                           Stripe
```

## Project structure

```
mercato-store
├─ backend
│  ├─ config        database connection
│  ├─ controllers   auth, products, orders, payments
│  ├─ middleware    login and admin checks
│  ├─ models        Users, Categories, Products, Orders, OrderItems
│  ├─ routes
│  ├─ seed.js       adds 6 categories and 660 sample products
│  ├─ make-admin.js turns a registered user into an admin
│  └─ server.js
└─ frontend
   └─ src           pages, components, cart and auth context
```

## API overview

| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/auth/register`, `/api/auth/login` | Public |
| GET | `/api/auth/me` | Logged in |
| GET | `/api/products`, `/api/products/:id`, `/api/products/categories` | Public |
| POST, PUT, DELETE | `/api/products`, `/api/products/:id` | Admin |
| POST | `/api/orders` | Logged in |
| GET | `/api/orders/my`, `/api/orders/:id` | Logged in |
| PUT | `/api/orders/:id/cancel` | Logged in |
| GET | `/api/orders` | Admin |
| PUT | `/api/orders/:id/status` | Admin |
| POST | `/api/payments/create-intent`, `/api/payments/confirm` | Logged in |
| POST | `/api/payments/webhook` | Stripe |

Product list filters: `search`, `category`, `minPrice`, `maxPrice`, `minRating`, `sort`, `page`, `limit`.

## Run it on your computer

You need Node.js 18 or newer and MySQL.

**Windows, the easy way:** double-click `START.bat`. It creates the settings files, installs packages and starts both servers.

**Manual setup**

```bash
# Backend
cd backend
cp .env.example .env        # fill in your MySQL password and Stripe test key
npm install
npm run dev                 # runs on http://localhost:5000

# Frontend (new terminal)
cd frontend
cp .env.example .env        # add your Stripe publishable key
npm install
npm run dev                 # runs on http://localhost:5173
```

The database is created automatically on the first run.

Add sample data and an admin:

```bash
cd backend
node seed.js --fresh                  # 660 products in 6 categories
node make-admin.js you@example.com    # register on the site first
```

## Environment variables

Backend: `PORT`, `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS`, `DB_SSL`, `JWT_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `CURRENCY`, `CLIENT_URL`

Frontend: `VITE_API_URL`, `VITE_STRIPE_PUBLISHABLE_KEY`, `VITE_CURRENCY`

Real keys and passwords are never committed to this repository.

## Deployment

- **Frontend:** Vercel, root directory `frontend`
- **Backend:** Render web service, root directory `backend`
- **Database:** Aiven for MySQL (free plan, SSL on)

## Screenshots

Add your screenshots here: home page, product filters, cart, payment success, admin dashboard.

## Author

Built by [@smukeshkumardev](https://github.com/smukeshkumardev)
