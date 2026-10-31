export const STORE_NAME = 'Mercato';

const CURRENCY = (import.meta.env.VITE_CURRENCY || 'INR').toUpperCase();

export const money = (n) =>
  new Intl.NumberFormat(CURRENCY === 'INR' ? 'en-IN' : 'en-US', {
    style: 'currency',
    currency: CURRENCY,
    minimumFractionDigits: CURRENCY === 'INR' ? 0 : 2,
  }).format(Number(n) || 0);

// Every category gets its own colour, used on its tile and everywhere it appears
export const CAT_COLORS = ['#E4572E', '#17A398', '#6C4DFF', '#2E933C', '#F28F3B', '#D81E5B'];
export const catColor = (id) => CAT_COLORS[(Number(id) || 0) % CAT_COLORS.length];

const BASE = import.meta.env.VITE_API_URL || '/api';

export async function api(path, { method = 'GET', body } = {}) {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  const token = localStorage.getItem('token');
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Something went wrong. Try again.');
  return data;
}
