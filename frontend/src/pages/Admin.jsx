import { useEffect, useState } from 'react';
import { api, money } from '../lib.js';
import { StatusBadge } from './Orders.jsx';

const empty = { name: '', description: '', price: '', stock: '', image_url: '', category_id: '' };

function ProductsTab() {
  const [products, setProducts] = useState([]);
  const [cats, setCats] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [newCat, setNewCat] = useState('');
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const load = () => {
    const qs = new URLSearchParams({ limit: 20, page });
    if (search.trim()) qs.set('search', search.trim());
    api('/products?' + qs.toString())
      .then((d) => { setProducts(d.products); setPages(d.pages); setTotal(d.total); })
      .catch((e) => setError(e.message));
  };
  useEffect(load, [page, search]);
  useEffect(() => { api('/products/categories').then(setCats).catch(() => {}); }, []);
  const reloadCats = () => api('/products/categories').then(setCats).catch(() => {});

  const save = async (e) => {
    e.preventDefault();
    setError('');
    const body = { ...form, price: Number(form.price), stock: Number(form.stock) || 0, category_id: form.category_id ? Number(form.category_id) : null };
    try {
      await api(editId ? `/products/${editId}` : '/products', { method: editId ? 'PUT' : 'POST', body });
      setForm(empty);
      setEditId(null);
      load();
    } catch (err) { setError(err.message); }
  };

  const edit = (p) => {
    setEditId(p.id);
    setForm({ name: p.name, description: p.description || '', price: p.price, stock: p.stock, image_url: p.image_url || '', category_id: p.category_id || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const del = async (p) => {
    if (!window.confirm(`Delete "${p.name}"? Products that were already ordered cannot be deleted.`)) return;
    try { await api(`/products/${p.id}`, { method: 'DELETE' }); load(); } catch (err) { setError(err.message); }
  };

  const addCat = async (e) => {
    e.preventDefault();
    if (!newCat.trim()) return;
    try { await api('/products/categories', { method: 'POST', body: { name: newCat.trim() } }); setNewCat(''); reloadCats(); } catch (err) { setError(err.message); }
  };

  const f = (k) => ({ value: form[k], onChange: (e) => setForm({ ...form, [k]: e.target.value }) });

  return (
    <div className="space-y-6">
      {error && <p className="rounded-lg bg-red-50 p-3 text-red-800">{error}</p>}

      <form onSubmit={addCat} className="flex gap-2">
        <input className="input" placeholder="New category name" value={newCat} onChange={(e) => setNewCat(e.target.value)} />
        <button className="btn btn-ghost shrink-0">Add category</button>
      </form>

      <form onSubmit={save} className="grid gap-3 rounded-xl bg-white p-4 ring-1 ring-ink/10 sm:grid-cols-2">
        <h2 className="font-display text-xl font-bold sm:col-span-2">{editId ? `Edit product #${editId}` : 'Add a product'}</h2>
        <label className="text-sm font-medium">Name<input required className="input mt-1" {...f('name')} /></label>
        <label className="text-sm font-medium">Category
          <select className="input mt-1" {...f('category_id')}>
            <option value="">No category</option>
            {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium">Price<input required type="number" step="0.01" min="0" className="input mt-1" {...f('price')} /></label>
        <label className="text-sm font-medium">Stock<input required type="number" min="0" className="input mt-1" {...f('stock')} /></label>
        <label className="text-sm font-medium sm:col-span-2">Image URL<input className="input mt-1" placeholder="https://..." {...f('image_url')} /></label>
        <label className="text-sm font-medium sm:col-span-2">Description<textarea rows="3" className="input mt-1" {...f('description')} /></label>
        <div className="flex gap-2 sm:col-span-2">
          <button className="btn btn-primary">{editId ? 'Save changes' : 'Add product'}</button>
          {editId && <button type="button" className="btn btn-ghost" onClick={() => { setEditId(null); setForm(empty); }}>Cancel edit</button>}
        </div>
      </form>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <input
          className="input !w-full sm:!w-72"
          placeholder="Search products"
          aria-label="Search products"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <p className="text-sm text-ink/70">{total} products</p>
      </div>

      <ul className="divide-y divide-ink/10 rounded-xl bg-white ring-1 ring-ink/10">
        {products.map((p) => (
          <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 p-3">
            <div>
              <p className="font-bold">{p.name}</p>
              <p className="text-sm text-ink/70">
                {money(p.price)} - <span className={p.stock <= 5 ? 'font-bold text-red-700' : ''}>{p.stock} in stock{p.stock <= 5 ? ' (low)' : ''}</span>
              </p>
            </div>
            <div className="flex gap-2">
              <button className="btn btn-ghost !py-1.5" onClick={() => edit(p)}>Edit</button>
              <button className="btn btn-danger !py-1.5" onClick={() => del(p)}>Delete</button>
            </div>
          </li>
        ))}
        {products.length === 0 && <li className="p-4 text-ink/70">No products found.</li>}
      </ul>

      {pages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button className="btn btn-ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
          <span className="text-sm">Page {page} of {pages}</span>
          <button className="btn btn-ghost" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      )}
    </div>
  );
}

function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const load = () => api('/orders' + (status ? `?status=${status}` : '')).then((d) => setOrders(d.orders)).catch((e) => setError(e.message));
  useEffect(() => { load(); }, [status]);

  const update = async (id, order_status) => {
    try { await api(`/orders/${id}/status`, { method: 'PUT', body: { order_status } }); load(); } catch (e) { setError(e.message); }
  };

  return (
    <div className="space-y-4">
      {error && <p className="rounded-lg bg-red-50 p-3 text-red-800">{error}</p>}
      <select aria-label="Filter by status" className="input !w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="">All orders</option>
        {['placed', 'shipped', 'delivered', 'cancelled'].map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      <ul className="space-y-3">
        {orders.map((o) => (
          <li key={o.id} className="rounded-xl bg-white p-4 ring-1 ring-ink/10">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold">#{o.id} {o.User?.name} <span className="font-normal text-ink/60">({o.User?.email})</span></span>
              <StatusBadge value={o.payment_status} />
            </div>
            <ul className="mt-2 text-sm">{o.OrderItems.map((it) => <li key={it.id}>{it.Product?.name} x {it.quantity}</li>)}</ul>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold">{money(o.total)}</span>
              <label className="text-sm">Status{' '}
                <select className="input !w-auto !py-1.5" value={o.order_status} onChange={(e) => update(o.id, e.target.value)}>
                  {['placed', 'shipped', 'delivered', 'cancelled'].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
            </div>
          </li>
        ))}
        {orders.length === 0 && <li className="text-ink/70">No orders found.</li>}
      </ul>
    </div>
  );
}

export default function Admin() {
  const [tab, setTab] = useState('products');
  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="font-display text-3xl font-extrabold">Admin dashboard</h1>
      <div className="mt-4 flex gap-2" role="tablist">
        {['products', 'orders'].map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
            className={`btn ${tab === t ? 'btn-primary' : 'btn-ghost'} capitalize`}>{t}</button>
        ))}
      </div>
      <div className="mt-5">{tab === 'products' ? <ProductsTab /> : <OrdersTab />}</div>
    </div>
  );
}
