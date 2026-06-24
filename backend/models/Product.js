const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sku: { type: String },
  description: { type: String },
  quantity: { type: Number, default: 0 },
  reorder_level: { type: Number, default: 10 },
  supplier_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  price: { type: Number, default: 0 },
  imageUrl: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
