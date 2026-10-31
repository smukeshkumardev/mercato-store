import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { api, money } from '../lib.js';

export default function OrderSuccess() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const intentId = params.get('payment_intent');
  const [order, setOrder] = useState(null);
  const [tries, setTries] = useState(0);

  // Ask the server to verify the payment with Stripe (no webhook needed), then show the order status
  useEffect(() => {
    let stop = false;
    const check = async (n) => {
      try {
        await api('/payments/confirm', {
          method: 'POST',
          body: { order_id: Number(id), payment_intent_id: intentId },
        }).catch(() => {});
        const o = await api(`/orders/${id}`);
        if (stop) return;
        setOrder(o);
        setTries(n);
        if (o.payment_status !== 'paid' && n < 6) setTimeout(() => check(n + 1), 2000);
      } catch { /* user can refresh */ }
    };
    check(0);
    return () => { stop = true; };
  }, [id, intentId]);

  const paid = order?.payment_status === 'paid';

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="font-display text-3xl font-extrabold">
        {paid ? 'Payment received' : tries >= 6 ? 'Payment not confirmed yet' : 'Confirming your payment...'}
      </h1>
      {order && <p className="mt-2 text-ink/70">Order #{order.id} for {money(order.total)}</p>}
      {!paid && tries >= 6 && (
        <p className="mt-2 text-sm text-ink/70">Check My orders in a minute. If it still says pending, the payment may have failed.</p>
      )}
      <div className="mt-6 flex justify-center gap-3">
        <Link to="/orders" className="btn btn-primary">View my orders</Link>
        <Link to="/" className="btn btn-ghost">Keep shopping</Link>
      </div>
    </div>
  );
}
