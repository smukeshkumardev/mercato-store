const { Op } = require('sequelize');
const { Product, Category } = require('../models');

// GET /api/products?search=&category=&minPrice=&maxPrice=&minRating=&sort=&page=&limit=
exports.getProducts = async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, minRating, sort } = req.query;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 12, 50);

    const where = {};
    if (search) where.name = { [Op.like]: `%${search}%` };
    if (category) where.category_id = category;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = minPrice;
      if (maxPrice) where.price[Op.lte] = maxPrice;
    }
    if (minRating) where.rating = { [Op.gte]: minRating };

    const sortMap = {
      price_asc: ['price', 'ASC'],
      price_desc: ['price', 'DESC'],
      rating: ['rating', 'DESC'],
      newest: ['createdAt', 'DESC'],
    };

    const { rows, count } = await Product.findAndCountAll({
      where,
      include: [{ model: Category, attributes: ['id', 'name'] }],
      order: [sortMap[sort] || ['createdAt', 'DESC']],
      limit,
      offset: (page - 1) * limit,
    });

    res.json({ products: rows, total: count, page, pages: Math.ceil(count / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProduct = async (req, res) => {
  const product = await Product.findByPk(req.params.id, { include: [Category] });
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
};

exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, image_url, category_id } = req.body;
    if (!name || price == null) return res.status(400).json({ message: 'Name and price required' });
    const product = await Product.create({ name, description, price, stock, image_url, category_id });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  const { name, description, price, stock, image_url, category_id, rating } = req.body;
  await product.update({ name, description, price, stock, image_url, category_id, rating });
  res.json(product);
};

exports.deleteProduct = async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  await product.destroy();
  res.json({ message: 'Product deleted' });
};

exports.getCategories = async (req, res) => res.json(await Category.findAll());

exports.createCategory = async (req, res) => {
  if (!req.body.name) return res.status(400).json({ message: 'Name required' });
  res.status(201).json(await Category.create({ name: req.body.name }));
};
