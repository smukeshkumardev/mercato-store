import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, money } from '../lib.js';

export const StatusBadge = ({ value }) => {
  const colors = {
    paid: 'bg-green-100 text-green-800', delivered: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-900', placed: 'bg-blue-100 text-blue-800',
    shipped: 'bg-indigo-100 text-indigo-800', failed: 'bg-red-100 text-red-800', cancelled: 'bg-red-100 text-red-800',
  };
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${colors[value] || 'bg-ink/10'}`}>{value}</span>;
};

export default function Orders() {
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');

  const load = () => api('/orders/my').then(setOrders).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const cancel = async (id) => {
    try { await api(`/orders/${id}/cancel`, { method: 'PUT' }); load(); } catch (e) { setError(e.message); }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="font-display text-3xl font-extrabold">My orders</h1>
      {error && <p className="mt-3 rounded-lg bg-red-50 p-3 text-red-800">{error}</p>}
      {orders && orders.length === 0 && <p className="mt-6 text-ink/70">No orders yet. <Link className="font-bold text-brand underline" to="/">Start shopping</Link></p>}
      <ul className="mt-4 space-y-4">
        {orders?.map((o) => (
          <li key={o.id} className="rounded-xl bg-white p-4 ring-1 ring-ink/10">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold">Order #{o.id}</span>
              <span className="flex gap-2"><StatusBadge value={o.payment_status} /><StatusBadge value={o.order_status} /></span>
            </div>
            <p className="text-sm text-ink/60">{new Date(o.createdAt).toLocaleDateString()}</p>
            <ul className="mt-2 text-sm">
              {o.OrderItems.map((it) => <li key={it.id}>{it.Product?.name} x {it.quantity}</li>)}
            </ul>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold">{money(o.total)}</span>
              {o.payment_status !== 'paid' && o.order_status !== 'cancelled' && (
                <span className="flex gap-2">
                  <Link to={`/pay/${o.id}`} className="btn btn-primary !py-1.5">Pay now</Link>
                  <button className="btn btn-danger !py-1.5" onClick={() => cancel(o.id)}>Cancel order</button>
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
