import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { api, money } from '../lib.js';

const pubKey = (import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '').trim();
const stripePromise = pubKey ? loadStripe(pubKey) : null;

function PayForm({ orderId, total }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setBusy(true);
    setError('');
    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: `${window.location.origin}/order-success/${orderId}` },
      });
      if (error) setError(error.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {!ready && !error && <p className="text-sm text-ink/60">Loading payment form...</p>}
      <PaymentElement
        onReady={() => setReady(true)}
        onLoadError={(e) => setError(e?.error?.message || 'Payment form failed to load')}
      />
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      <button className="btn btn-primary w-full" disabled={!stripe || !ready || busy}>
        {busy ? 'Processing...' : `Pay ${money(total)}`}
      </button>
      <p className="text-xs text-ink/60">Test card: 4242 4242 4242 4242, any future date, any CVC.</p>
    </form>
  );
}

export default function Pay() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const o = await api(`/orders/${id}`);
        if (o.payment_status === 'paid') throw new Error('This order is already paid.');
        if (o.order_status === 'cancelled') throw new Error('This order was cancelled.');
        setOrder(o);
        const res = await api('/payments/create-intent', { method: 'POST', body: { order_id: Number(id) } });
        setClientSecret(res.clientSecret);
      } catch (e) {
        setError(e.message);
      }
    })();
  }, [id]);

  // Show a clear message if the Stripe script is blocked or the key is wrong
  useEffect(() => {
    if (!stripePromise) return;
    stripePromise
      .then((s) => {
        if (!s) setError('Stripe could not load. Check VITE_STRIPE_PUBLISHABLE_KEY in the frontend .env.');
      })
      .catch(() => setError('Stripe script is blocked. Try Incognito, turn off ad-blocker, or use another network.'));
  }, []);

  if (!stripePromise) {
    return (
      <p className="p-6 text-red-800">
        Stripe key missing. Add VITE_STRIPE_PUBLISHABLE_KEY=pk_test_... to the frontend .env file, then stop and restart npm run dev.
      </p>
    );
  }

  if (!pubKey.startsWith('pk_')) {
    return (
      <p className="p-6 text-red-800">
        The key in the frontend .env must start with pk_test_ (publishable key), not sk_test_. Fix it and restart npm run dev.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="font-display text-3xl font-extrabold">Pay for order #{id}</h1>
      {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-red-800">{error}</p>}
      {order && (
        <ul className="mt-4 divide-y divide-ink/10 rounded-xl bg-white px-4 ring-1 ring-ink/10">
          {order.OrderItems.map((it) => (
            <li key={it.id} className="flex justify-between py-2 text-sm">
              <span>{it.Product?.name} x {it.quantity}</span>
              <span>{money(it.price * it.quantity)}</span>
            </li>
          ))}
          <li className="flex justify-between py-3 font-bold"><span>Total</span><span>{money(order.total)}</span></li>
        </ul>
      )}
      {clientSecret && order && (
        <div className="mt-6 rounded-xl bg-white p-4 ring-1 ring-ink/10">
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <PayForm orderId={id} total={order.total} />
          </Elements>
        </div>
      )}
    </div>
  );
}
