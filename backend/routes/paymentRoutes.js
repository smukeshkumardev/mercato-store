const router = require('express').Router();
const { createIntent, confirmPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.post('/create-intent', protect, createIntent);
router.post('/confirm', protect, confirmPayment);

module.exports = router;
