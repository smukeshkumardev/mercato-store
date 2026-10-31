# E-commerce Backend (Node + Express + MySQL)

1. Create DB:  CREATE DATABASE ecommerce;
2. cp .env.example .env  (fill in DB_PASS, JWT_SECRET)
3. npm install
4. npm run dev

## Endpoints
POST /api/auth/register | POST /api/auth/login | GET /api/auth/me
GET  /api/products?search=&category=&minPrice=&maxPrice=&minRating=&sort=&page=
GET  /api/products/:id
POST/PUT/DELETE /api/products  (admin token)
GET/POST /api/products/categories

## Make an admin
UPDATE Users SET role='admin' WHERE email='you@example.com';

## Orders & Payments
POST /api/orders              { items: [{ product_id, quantity }] }   (login)
GET  /api/orders/my
GET  /api/orders/:id
PUT  /api/orders/:id/cancel   (unpaid only, stock restored)
GET  /api/orders?status=      (admin)
PUT  /api/orders/:id/status   { order_status }  (admin)
POST /api/payments/create-intent { order_id }  -> { clientSecret }
POST /api/payments/webhook    (Stripe calls this)

## Stripe test mode
1. Dashboard -> Developers -> API keys -> copy sk_test_... into .env
2. Install Stripe CLI, then:  stripe listen --forward-to localhost:5000/api/payments/webhook
3. Copy the whsec_... it prints into STRIPE_WEBHOOK_SECRET, restart server
4. Test card: 4242 4242 4242 4242, any future date, any CVC
