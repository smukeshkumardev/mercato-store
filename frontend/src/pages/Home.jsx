import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, catColor } from '../lib.js';
import ProductCard from '../components/ProductCard.jsx';

export default function Home() {
  const [params, setParams] = useSearchParams();
  const [cats, setCats] = useState([]);
  const [data, setData] = useState({ products: [], total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [price, setPrice] = useState({ min: params.get('minPrice') || '', max: params.get('maxPrice') || '' });

  const category = params.get('category') || '';
  const page = Number(params.get('page')) || 1;

  useEffect(() => { api('/products/categories').then(setCats).catch(() => {}); }, []);

  useEffect(() => {
    setLoading(true);
    setError('');
    api('/products?' + params.toString())
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [params]);

  const set = (key, value) => {
    const p = new URLSearchParams(params);
    value ? p.set(key, value) : p.delete(key);
    if (key !== 'page') p.delete('page');
    setParams(p);
  };

  const applyPrice = () => {
    const p = new URLSearchParams(params);
    price.min ? p.set('minPrice', price.min) : p.delete('minPrice');
    price.max ? p.set('maxPrice', price.max) : p.delete('maxPrice');
    p.delete('page');
    setParams(p);
  };

  const search = params.get('search');

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="font-display text-3xl font-extrabold leading-tight sm:text-5xl">
        Everything you need, in one basket.
      </h1>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <button
          onClick={() => set('category', '')}
          className={`min-h-[84px] rounded-xl bg-ink p-4 text-left font-display text-lg font-bold text-white ${!category ? 'ring-4 ring-tag' : ''}`}
        >
          Everything
        </button>
        {cats.map((c) => (
          <button
            key={c.id}
            onClick={() => set('category', String(c.id))}
            style={{ background: catColor(c.id) }}
            className={`min-h-[84px] rounded-xl p-4 text-left font-display text-lg font-bold text-white ${String(c.id) === category ? 'ring-4 ring-tag' : ''}`}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink/70">
          {search ? `Results for "${search}": ` : ''}{data.total} {data.total === 1 ? 'product' : 'products'}
        </p>
        <div className="flex gap-2">
          <button className="btn btn-ghost sm:hidden" onClick={() => setShowFilters(!showFilters)}>
            {showFilters ? 'Hide filters' : 'Filters'}
          </button>
          <select aria-label="Sort" className="input !w-auto" value={params.get('sort') || ''} onChange={(e) => set('sort', e.target.value)}>
            <option value="">Newest</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
            <option value="rating">Top rated</option>
          </select>
        </div>
      </div>

      <div className={`${showFilters ? 'grid' : 'hidden'} mt-3 grid-cols-2 gap-3 rounded-xl bg-white p-4 ring-1 ring-ink/10 sm:grid sm:grid-cols-4`}>
        <label className="text-sm font-medium">Min price
          <input type="number" min="0" className="input mt-1" value={price.min} onChange={(e) => setPrice({ ...price, min: e.target.value })} />
        </label>
        <label className="text-sm font-medium">Max price
          <input type="number" min="0" className="input mt-1" value={price.max} onChange={(e) => setPrice({ ...price, max: e.target.value })} />
        </label>
        <label className="text-sm font-medium">Rating
          <select className="input mt-1" value={params.get('minRating') || ''} onChange={(e) => set('minRating', e.target.value)}>
            <option value="">Any</option>
            <option value="4">4 and up</option>
            <option value="3">3 and up</option>
            <option value="2">2 and up</option>
          </select>
        </label>
        <button className="btn btn-primary self-end" onClick={applyPrice}>Apply price</button>
      </div>

      {error && <p className="mt-6 rounded-lg bg-red-50 p-4 text-red-800">{error}. Check that the backend is running on port 5000.</p>}

      {loading ? (
        <p className="mt-10 text-center text-ink/60">Loading products...</p>
      ) : data.products.length === 0 && !error ? (
        <p className="mt-10 text-center text-ink/70">No products match these filters. Clear a filter or try another search.</p>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {data.products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}

      {data.pages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <button className="btn btn-ghost" disabled={page <= 1} onClick={() => set('page', String(page - 1))}>Previous</button>
          <span className="text-sm">Page {page} of {data.pages}</span>
          <button className="btn btn-ghost" disabled={page >= data.pages} onClick={() => set('page', String(page + 1))}>Next</button>
        </div>
      )}
    </div>
  );
}
