# Mercato Frontend (React + Vite + Tailwind)

1. npm install
2. cp .env.example .env  -> add your Stripe publishable key (pk_test_...)
3. Start the backend on port 5000, then: npm run dev

Dev requests to /api are proxied to http://localhost:5000 (see vite.config.js).

## Deploy (Vercel)
Set VITE_API_URL to your deployed backend URL + /api  (e.g. https://your-api.onrender.com/api)
and VITE_STRIPE_PUBLISHABLE_KEY. Add a vercel.json rewrite so React Router paths work:
{ "rewrites": [{ "source": "/(.*)", "destination": "/" }] }
Also set CORS on the backend to allow your Vercel domain.
