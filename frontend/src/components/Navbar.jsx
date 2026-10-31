import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { STORE_NAME } from '../lib.js';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const nav = useNavigate();
  const [q, setQ] = useState('');

  const search = (e) => {
    e.preventDefault();
    nav(q.trim() ? `/?search=${encodeURIComponent(q.trim())}` : '/');
  };

  return (
    <header className="sticky top-0 z-20 bg-ink text-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3">
        <Link to="/" className="font-display text-2xl font-extrabold tracking-tight">{STORE_NAME}</Link>

        <form onSubmit={search} className="relative order-3 w-full md:order-none md:w-auto md:flex-1 md:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/50" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products"
            aria-label="Search products"
            className="w-full rounded-lg bg-white py-2 pl-9 pr-3 text-ink"
          />
        </form>

        <nav className="ml-auto flex items-center gap-4 text-sm font-medium">
          {user?.role === 'admin' && <Link to="/admin" className="hover:underline">Admin</Link>}
          {user && <Link to="/orders" className="hover:underline">My orders</Link>}
          {user ? (
            <button onClick={logout} className="hover:underline">Log out</button>
          ) : (
            <Link to="/login" className="hover:underline">Log in</Link>
          )}
          <Link to="/cart" className="relative flex items-center gap-1 rounded-lg bg-white/10 px-3 py-2 hover:bg-white/20" aria-label={`Cart, ${count} items`}>
            <ShoppingCart className="h-5 w-5" />
            {count > 0 && <span className="rounded-full bg-tag px-1.5 text-xs font-bold text-ink">{count}</span>}
          </Link>
        </nav>
      </div>
    </header>
  );
}
