const express = require('express');
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const sales = await Sale.find().populate('product_id').sort({ sold_at: -1 });
    
    const formattedSales = sales.map((sale) => {
      return {
        id: sale._id.toString(),
        product_id: sale.product_id ? sale.product_id._id.toString() : null,
        product_name: sale.product_id ? sale.product_id.name : 'Unknown Product',
        quantity: sale.quantity,
        sale_price: sale.sale_price,
        sold_at: sale.sold_at
      };
    });

    res.json(formattedSales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { product_id, quantity, sale_price } = req.body;
    
    const product = await Product.findById(product_id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const quantityNum = Number(quantity);
    const salePriceNum = Number(sale_price);
    if (Number.isNaN(quantityNum) || quantityNum <= 0) {
      return res.status(400).json({ error: 'Quantity must be a positive number.' });
    }

    if (product.quantity < quantityNum) {
      return res.status(400).json({ error: 'Insufficient stock available' });
    }

    product.quantity -= quantityNum;
    await product.save();

    const sale = new Sale({
      product_id,
      quantity: quantityNum,
      sale_price: salePriceNum
    });

    await sale.save();

    res.json({ success: true, product_id, quantity: quantityNum });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
