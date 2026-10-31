import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, catColor, money } from '../lib.js';
import { useCart } from '../context/CartContext.jsx';
import { ProductImage } from '../components/ProductCard.jsx';

export default function ProductDetail() {
  const { id } = useParams();
  const { add } = useCart();
  const nav = useNavigate();
  const [p, setP] = useState(null);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    api(`/products/${id}`).then(setP).catch((e) => setError(e.message));
  }, [id]);

  if (error) return <p className="mx-auto max-w-6xl p-6 text-red-800">{error}</p>;
  if (!p) return <p className="p-10 text-center text-ink/60">Loading...</p>;

  const soldOut = p.stock < 1;

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 md:grid-cols-2">
      <ProductImage product={p} className="aspect-square w-full rounded-xl" />
      <div className="flex flex-col gap-3">
        {p.Category && (
          <span className="flex items-center gap-2 text-sm font-medium">
            <span className="h-3 w-3 rounded-full" style={{ background: catColor(p.category_id) }} />
            {p.Category.name}
          </span>
        )}
        <h1 className="font-display text-3xl font-extrabold">{p.name}</h1>
        <p className="text-lg font-bold"><span className="rounded-md bg-tag px-2.5 py-1 font-display text-2xl">{money(p.price)}</span></p>
        <p className="text-ink/80">{p.description || 'No description yet.'}</p>
        <p className="text-sm text-ink/70">
          {Number(p.rating) > 0 ? `${Number(p.rating).toFixed(1)} out of 5` : 'No ratings yet'}.{' '}
          {soldOut ? 'Sold out.' : p.stock <= 5 ? `Only ${p.stock} left.` : 'In stock.'}
        </p>

        {!soldOut && (
          <div className="mt-2 flex items-center gap-3">
            <div className="flex items-center rounded-lg bg-white ring-1 ring-ink/20">
              <button className="px-4 py-2 text-xl" aria-label="Decrease quantity" onClick={() => setQty(Math.max(1, qty - 1))}>-</button>
              <span className="w-8 text-center font-bold">{qty}</span>
              <button className="px-4 py-2 text-xl" aria-label="Increase quantity" onClick={() => setQty(Math.min(p.stock, qty + 1))}>+</button>
            </div>
            <button className="btn btn-primary flex-1" onClick={() => { add(p, qty); nav('/cart'); }}>Add to cart</button>
          </div>
        )}
      </div>
    </div>
  );
}
