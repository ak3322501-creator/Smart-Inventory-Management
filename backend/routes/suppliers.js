const express = require('express');
const Supplier = require('../models/Supplier');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    res.json(suppliers.map(s => ({
      id: s._id.toString(),
      name: s.name,
      contact: s.contact,
      email: s.email,
      address: s.address
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, contact, email, address } = req.body;
    const supplier = new Supplier({ name, contact, email, address });
    await supplier.save();
    res.json({ id: supplier._id.toString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, contact, email, address } = req.body;
    const supplier = await Supplier.findByIdAndUpdate(id, { name, contact, email, address }, { new: true });
    
    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found.' });
    }

    res.json({ modifiedCount: 1 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Supplier.findByIdAndDelete(id);
    
    res.json({ deletedCount: result ? 1 : 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
