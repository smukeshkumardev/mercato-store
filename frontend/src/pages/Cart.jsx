import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api, money } from '../lib.js';
import { ProductImage } from '../components/ProductCard.jsx';

export default function Cart() {
  const { items, setQty, remove, clear, total } = useCart();
  const { user } = useAuth();
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const placeOrder = async () => {
    if (!user) return nav('/login', { state: { from: '/cart' } });
    setBusy(true);
    setError('');
    try {
      const order = await api('/orders', {
        method: 'POST',
        body: { items: items.map((i) => ({ product_id: i.id, quantity: i.quantity })) },
      });
      clear();
      nav(`/pay/${order.id}`);
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="font-display text-3xl font-extrabold">Your cart is empty</h1>
        <p className="mt-2 text-ink/70">Add something and it will show up here.</p>
        <Link to="/" className="btn btn-primary mt-6">Browse products</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[1fr_320px]">
      <div>
        <h1 className="font-display text-3xl font-extrabold">Your cart</h1>
        <ul className="mt-4 space-y-3">
          {items.map((i) => (
            <li key={i.id} className="flex gap-3 rounded-xl bg-white p-3 ring-1 ring-ink/10">
              <ProductImage product={i} className="h-20 w-20 shrink-0 rounded-lg" />
              <div className="flex flex-1 flex-col gap-2">
                <div className="flex justify-between gap-2">
                  <Link to={`/product/${i.id}`} className="font-bold hover:underline">{i.name}</Link>
                  <span className="font-bold">{money(i.price * i.quantity)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center rounded-lg ring-1 ring-ink/20">
                    <button className="px-3 py-1 text-lg" aria-label="Decrease quantity" onClick={() => setQty(i.id, i.quantity - 1)}>-</button>
                    <span className="w-7 text-center font-bold">{i.quantity}</span>
                    <button className="px-3 py-1 text-lg" aria-label="Increase quantity" onClick={() => setQty(i.id, i.quantity + 1)}>+</button>
                  </div>
                  <button className="text-sm font-medium text-red-700 hover:underline" onClick={() => remove(i.id)}>Remove</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <aside className="h-fit rounded-xl bg-white p-5 ring-1 ring-ink/10 lg:sticky lg:top-24">
        <h2 className="font-display text-xl font-bold">Order summary</h2>
        <div className="mt-3 flex justify-between text-lg"><span>Total</span><span className="font-bold">{money(total)}</span></div>
        {error && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        <button className="btn btn-primary mt-4 w-full" disabled={busy} onClick={placeOrder}>
          {busy ? 'Placing order...' : user ? 'Place order and pay' : 'Log in to check out'}
        </button>
        <p className="mt-2 text-xs text-ink/60">Final prices are confirmed by the store when you place the order.</p>
      </aside>
    </div>
  );
}
