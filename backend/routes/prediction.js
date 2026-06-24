const express = require('express');
const Product = require('../models/Product');
const Sale = require('../models/Sale');
const Prediction = require('../models/Prediction');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 30);

    const products = await Product.find();
    
    const forecastPromises = products.map(async (product) => {
      const recentSales = await Sale.find({
        product_id: product._id,
        sold_at: { $gte: since }
      });
      
      const totalSold = recentSales.reduce((sum, sale) => sum + sale.quantity, 0);

      const avg_daily_sales = Number((totalSold / 30).toFixed(2));
      const safetyStock = Math.max(5, Math.ceil(avg_daily_sales * 3));
      const suggestedReorder = Math.max(0, product.reorder_level + safetyStock - product.quantity);
      const status = product.quantity <= product.reorder_level ? 'Reorder needed' : 'Stock healthy';

      // Upsert into Prediction collection
      const predictionRec = await Prediction.findOneAndUpdate(
        { product_id: product._id },
        {
          avg_daily_sales,
          safetyStock,
          suggestedReorder,
          status,
          calculated_at: new Date()
        },
        { new: true, upsert: true }
      );

      return {
        id: product._id.toString(),
        name: product.name,
        quantity: product.quantity,
        reorder_level: product.reorder_level,
        avg_daily_sales: predictionRec.avg_daily_sales,
        safetyStock: predictionRec.safetyStock,
        suggestedReorder: predictionRec.suggestedReorder,
        status: predictionRec.status
      };
    });

    const forecast = await Promise.all(forecastPromises);
    res.json(forecast);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
