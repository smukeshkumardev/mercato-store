const router = require('express').Router();
const c = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/categories', c.getCategories);
router.post('/categories', protect, adminOnly, c.createCategory);

router.get('/', c.getProducts);
router.get('/:id', c.getProduct);
router.post('/', protect, adminOnly, c.createProduct);
router.put('/:id', protect, adminOnly, c.updateProduct);
router.delete('/:id', protect, adminOnly, c.deleteProduct);

module.exports = router;
