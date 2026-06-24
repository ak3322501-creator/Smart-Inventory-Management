const express = require('express');
const Product = require('../models/Product');
const Supplier = require('../models/Supplier');
const router = express.Router();

function formatImageUrl(req, imageUrl) {
  if (!imageUrl) {
    return 'https://via.placeholder.com/120x120.png?text=No+Image';
  }

  if (imageUrl.startsWith('http') || imageUrl.startsWith('data:')) {
    return imageUrl;
  }

  return `${req.protocol}://${req.get('host')}${imageUrl}`;
}

router.get('/', async (req, res) => {
  try {
    const products = await Product.find().populate('supplier_id');
    const formattedProducts = products.map((product) => {
      return {
        id: product._id.toString(),
        name: product.name,
        sku: product.sku,
        description: product.description,
        quantity: product.quantity,
        reorder_level: product.reorder_level,
        supplier_name: product.supplier_id ? product.supplier_id.name : null,
        supplier_id: product.supplier_id ? product.supplier_id._id.toString() : null,
        price: product.price,
        imageUrl: formatImageUrl(req, product.imageUrl)
      };
    });

    res.json(formattedProducts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, sku, description, quantity = 0, reorder_level = 10, supplier_id = null, price = 0, imageUrl = '' } = req.body;
    
    const product = new Product({
      name,
      sku,
      description,
      quantity: Number(quantity),
      reorder_level: Number(reorder_level),
      supplier_id: supplier_id || null,
      price: Number(price),
      imageUrl
    });
    
    await product.save();

    res.json({ id: product._id.toString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, sku, description, quantity, reorder_level, supplier_id, price, imageUrl } = req.body;
    
    const product = await Product.findByIdAndUpdate(id, {
      name,
      sku,
      description,
      quantity: Number(quantity),
      reorder_level: Number(reorder_level),
      supplier_id: supplier_id || null,
      price: Number(price),
      imageUrl
    }, { new: true });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    res.json({ modifiedCount: 1 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Product.findByIdAndDelete(id);

    res.json({ deletedCount: result ? 1 : 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
