const { sequelize, Product, Order, OrderItem, User } = require('../models');

const httpError = (status, message) => Object.assign(new Error(message), { status });
const fail = (res, err) => res.status(err.status || 500).json({ message: err.message });

const orderInclude = [
  { model: OrderItem, include: [{ model: Product, attributes: ['id', 'name', 'image_url'] }] },
];

// POST /api/orders   body: { items: [{ product_id, quantity }] }
// Cart lives in the frontend; price and total are ALWAYS calculated here from the DB.
exports.createOrder = async (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Cart is empty' });
  }

  const t = await sequelize.transaction();
  try {
    const qtyMap = new Map();
    for (const i of items) {
      const pid = parseInt(i.product_id);
      const qty = parseInt(i.quantity);
      if (!pid || !qty || qty < 1) throw httpError(400, 'Invalid cart item');
      qtyMap.set(pid, (qtyMap.get(pid) || 0) + qty);
    }

    let cents = 0;
    const lines = [];
    // sorted ids -> consistent lock order, avoids deadlocks
    for (const pid of [...qtyMap.keys()].sort((a, b) => a - b)) {
      const qty = qtyMap.get(pid);
      const product = await Product.findByPk(pid, { transaction: t, lock: t.LOCK.UPDATE });
      if (!product) throw httpError(404, `Product ${pid} not found`);
      if (product.stock < qty) {
        throw httpError(400, `Only ${product.stock} left for "${product.name}"`);
      }
      product.stock -= qty;
      await product.save({ transaction: t });
      cents += Math.round(Number(product.price) * 100) * qty;
      lines.push({ product_id: pid, quantity: qty, price: product.price });
    }

    const order = await Order.create({ user_id: req.user.id, total: cents / 100 }, { transaction: t });
    await OrderItem.bulkCreate(lines.map((l) => ({ ...l, order_id: order.id })), { transaction: t });
    await t.commit();

    res.status(201).json(await Order.findByPk(order.id, { include: orderInclude }));
  } catch (err) {
    await t.rollback();
    fail(res, err);
  }
};

// GET /api/orders/my
exports.myOrders = async (req, res) => {
  const orders = await Order.findAll({
    where: { user_id: req.user.id },
    include: orderInclude,
    order: [['createdAt', 'DESC']],
  });
  res.json(orders);
};

// GET /api/orders/:id  (owner or admin)
exports.getOrder = async (req, res) => {
  const order = await Order.findByPk(req.params.id, {
    include: [...orderInclude, { model: User, attributes: ['id', 'name', 'email'] }],
  });
  if (!order || (order.user_id !== req.user.id && req.user.role !== 'admin')) {
    return res.status(404).json({ message: 'Order not found' });
  }
  res.json(order);
};

// PUT /api/orders/:id/cancel  (owner, only if unpaid) -> stock goes back
exports.cancelOrder = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [OrderItem],
      transaction: t,
      lock: t.LOCK.UPDATE,
      skipLocked: false,
    });
    if (!order || order.user_id !== req.user.id) throw httpError(404, 'Order not found');
    if (order.payment_status === 'paid') throw httpError(400, 'Paid orders cannot be cancelled here');
    if (order.order_status === 'cancelled') throw httpError(400, 'Already cancelled');

    for (const item of order.OrderItems) {
      await Product.increment('stock', { by: item.quantity, where: { id: item.product_id }, transaction: t });
    }
    await order.update({ order_status: 'cancelled' }, { transaction: t });
    await t.commit();
    res.json({ message: 'Order cancelled' });
  } catch (err) {
    await t.rollback();
    fail(res, err);
  }
};

// ---------- Admin ----------

// GET /api/orders?status=placed&page=1
exports.allOrders = async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = 20;
  const where = {};
  if (req.query.status) where.order_status = req.query.status;

  const { rows, count } = await Order.findAndCountAll({
    where,
    include: [...orderInclude, { model: User, attributes: ['id', 'name', 'email'] }],
    order: [['createdAt', 'DESC']],
    limit,
    offset: (page - 1) * limit,
    distinct: true,
  });
  res.json({ orders: rows, total: count, page, pages: Math.ceil(count / limit) });
};

// PUT /api/orders/:id/status   body: { order_status }
exports.updateStatus = async (req, res) => {
  const allowed = ['placed', 'shipped', 'delivered', 'cancelled'];
  if (!allowed.includes(req.body.order_status)) {
    return res.status(400).json({ message: `Status must be one of: ${allowed.join(', ')}` });
  }
  const order = await Order.findByPk(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  await order.update({ order_status: req.body.order_status });
  res.json(order);
};
