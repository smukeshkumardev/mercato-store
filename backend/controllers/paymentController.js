const Stripe = require('stripe');
const { Order } = require('../models');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// POST /api/payments/create-intent   body: { order_id }
// Frontend uses the returned clientSecret with Stripe.js to confirm the payment.
exports.createIntent = async (req, res) => {
  try {
    const order = await Order.findByPk(req.body.order_id);
    if (!order || order.user_id !== req.user.id) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (order.payment_status === 'paid') return res.status(400).json({ message: 'Already paid' });
    if (order.order_status === 'cancelled') return res.status(400).json({ message: 'Order cancelled' });

    const intent = await stripe.paymentIntents.create({
      amount: Math.round(Number(order.total) * 100), // smallest currency unit
      currency: process.env.CURRENCY || 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: { order_id: String(order.id) },
    });
    await order.update({ payment_intent_id: intent.id });
    res.json({ clientSecret: intent.client_secret });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/payments/webhook  (raw body, signature verified)
// Payment status is trusted ONLY from here, never from the frontend.
exports.webhook = async (req, res) => {
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers['stripe-signature'],
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  const intent = event.data.object;
  const orderId = intent.metadata && intent.metadata.order_id;

  if (orderId && event.type === 'payment_intent.succeeded') {
    await Order.update({ payment_status: 'paid' }, { where: { id: orderId } });
  } else if (orderId && event.type === 'payment_intent.payment_failed') {
    await Order.update({ payment_status: 'failed' }, { where: { id: orderId } });
  }
  res.json({ received: true });
};

// POST /api/payments/confirm   body: { order_id, payment_intent_id }
// Works without the Stripe CLI/webhook: the server asks Stripe directly if the payment really succeeded.
exports.confirmPayment = async (req, res) => {
  try {
    const order = await Order.findByPk(req.body.order_id);
    if (!order || (order.user_id !== req.user.id && req.user.role !== 'admin')) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (order.payment_status === 'paid') return res.json({ payment_status: 'paid' });

    const intentId = req.body.payment_intent_id || order.payment_intent_id;
    if (!intentId) return res.json({ payment_status: order.payment_status });

    const intent = await stripe.paymentIntents.retrieve(intentId);
    const sameOrder = intent.metadata && intent.metadata.order_id === String(order.id);
    const sameAmount = intent.amount === Math.round(Number(order.total) * 100);

    if (intent.status === 'succeeded' && sameOrder && sameAmount) {
      await order.update({ payment_status: 'paid' });
    }
    res.json({ payment_status: order.payment_status });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
