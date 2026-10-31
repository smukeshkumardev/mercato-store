const router = require('express').Router();
const c = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);

router.post('/', c.createOrder);
router.get('/my', c.myOrders);
router.get('/', adminOnly, c.allOrders);
router.get('/:id', c.getOrder);
router.put('/:id/cancel', c.cancelOrder);
router.put('/:id/status', adminOnly, c.updateStatus);

module.exports = router;
