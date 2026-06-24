const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, unique: true },
  avg_daily_sales: { type: Number, required: true },
  safetyStock: { type: Number, required: true },
  suggestedReorder: { type: Number, required: true },
  status: { type: String, required: true },
  calculated_at: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Prediction', predictionSchema);
