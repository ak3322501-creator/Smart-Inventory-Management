require('dotenv').config();
const mongoose = require('mongoose');
const { connect } = require('./db');
const Product = require('./models/Product');
const Supplier = require('./models/Supplier');
const Sale = require('./models/Sale');
const User = require('./models/User');
const { hashPassword } = require('./auth-utils');

const imageMap = {
  scanner: '/images/barcode-scanner.svg',
  printer: '/images/label-printer.svg',
  tablet: '/images/control-tablet.svg',
  tag: '/images/rfid-tag.svg',
  camera: '/images/monitor-camera.svg'
};

async function seed() {
  await connect();

  const seedSuppliers = [
    { name: 'Global Supply Co.', contact: '0300-1234567', email: 'support@globalsupply.com', address: 'Korangi, Karachi' },
    { name: 'Prime Wholesale', contact: '0312-7654321', email: 'info@primewholesale.pk', address: 'Gulshan-e-Iqbal, Karachi' },
    { name: 'Inventory Express', contact: '0321-1122334', email: 'contact@inventoryexpress.com', address: 'DHA, Karachi' }
  ];

  for (const supplier of seedSuppliers) {
    await Supplier.findOneAndUpdate(
      { email: supplier.email },
      { $setOnInsert: supplier },
      { upsert: true, returnDocument: 'after' }
    );
  }

  const suppliers = await Supplier.find({ email: { $in: seedSuppliers.map((supplier) => supplier.email) } }).sort({ email: 1 });

  const seedProducts = [
    { name: 'Wireless Barcode Scanner', sku: 'WBS-100', description: 'Handheld Bluetooth barcode scanner', quantity: 45, reorder_level: 10, supplier_id: suppliers[0]._id, price: 42500, imageUrl: imageMap.scanner },
    { name: 'Shelf Label Printer', sku: 'SLP-200', description: 'Thermal label printer for inventory tags', quantity: 20, reorder_level: 8, supplier_id: suppliers[1]._id, price: 85000, imageUrl: imageMap.printer },
    { name: 'Stock Control Tablet', sku: 'SCT-300', description: 'Android tablet for stock verification', quantity: 12, reorder_level: 5, supplier_id: suppliers[0]._id, price: 240000, imageUrl: imageMap.tablet },
    { name: 'Inventory RFID Tag', sku: 'RFT-450', description: 'Reusable RFID tags for smart inventory tracking', quantity: 120, reorder_level: 30, supplier_id: suppliers[1]._id, price: 1750, imageUrl: imageMap.tag },
    { name: 'Warehouse Monitor Camera', sku: 'WMC-90', description: 'Camera system for warehouse security and monitoring', quantity: 8, reorder_level: 3, supplier_id: suppliers[2]._id, price: 120000, imageUrl: imageMap.camera }
  ];

  for (const product of seedProducts) {
    await Product.findOneAndUpdate(
      { sku: product.sku },
      { $setOnInsert: product },
      { upsert: true, returnDocument: 'after' }
    );
  }

  const products = await Product.find({ sku: { $in: seedProducts.map((product) => product.sku) } }).sort({ sku: 1 });

  const saleCount = await Sale.countDocuments();
  if (saleCount === 0 && products.length > 0) {
    const now = Date.now();
    const daysAgo = (days) => new Date(now - days * 24 * 60 * 60 * 1000);
    await Sale.insertMany([
      { product_id: products[0]._id, quantity: 5, sale_price: 47000, sold_at: daysAgo(18) },
      { product_id: products[1]._id, quantity: 3, sale_price: 90000, sold_at: daysAgo(15) },
      { product_id: products[0]._id, quantity: 7, sale_price: 47000, sold_at: daysAgo(10) },
      { product_id: products[3]._id, quantity: 24, sale_price: 2200, sold_at: daysAgo(8) },
      { product_id: products[2]._id, quantity: 2, sale_price: 255000, sold_at: daysAgo(5) },
      { product_id: products[4]._id, quantity: 4, sale_price: 135000, sold_at: daysAgo(3) },
      { product_id: products[3]._id, quantity: 18, sale_price: 2200, sold_at: daysAgo(1) }
    ]);
  }

  const adminExists = await User.exists({ email: 'admin@example.com' });
  if (!adminExists) {
    const { salt, hash } = hashPassword('admin1234');
    await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      passwordSalt: salt,
      passwordHash: hash
    });
  }

  const totals = {
    suppliers: await Supplier.countDocuments(),
    products: await Product.countDocuments(),
    sales: await Sale.countDocuments(),
    users: await User.countDocuments()
  };

  console.log(`Mongo seed complete for database "${mongoose.connection.name}".`);
  console.log(JSON.stringify(totals, null, 2));
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Failed to seed Mongo database:', err);
  process.exit(1);
});
