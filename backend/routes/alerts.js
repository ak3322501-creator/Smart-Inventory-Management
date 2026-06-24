const express = require('express');
const Product = require('../models/Product');
const router = express.Router();

router.get('/low-stock', async (req, res) => {
  try {
    // Find products where quantity <= reorder_level
    const lowStockProducts = await Product.find({
      $expr: { $lte: ['$quantity', '$reorder_level'] }
    }).populate('supplier_id').sort({ quantity: 1 });

    const alerts = lowStockProducts.map((product) => {
      return {
        id: product._id.toString(),
        name: product.name,
        quantity: product.quantity,
        reorder_level: product.reorder_level,
        supplier_name: product.supplier_id ? product.supplier_id.name : null
      };
    });

    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
