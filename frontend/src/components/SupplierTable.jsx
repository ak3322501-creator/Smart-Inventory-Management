import { useState } from 'react';
import { apiPost } from '../api';

function SupplierTable({ suppliers, onRefresh }) {
  const [form, setForm] = useState({ name: '', contact: '', email: '', address: '' });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const createSupplier = async () => {
    await apiPost('/suppliers', form);
    setForm({ name: '', contact: '', email: '', address: '' });
    onRefresh();
  };

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Contact</th>
            <th>Email</th>
            <th>Address</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map((supplier) => (
            <tr key={supplier.id}>
              <td>{supplier.name}</td>
              <td>{supplier.contact}</td>
              <td>{supplier.email}</td>
              <td>{supplier.address}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="form-row">
        <input name="name" placeholder="Supplier name" value={form.name} onChange={handleChange} />
        <input name="contact" placeholder="Contact" value={form.contact} onChange={handleChange} />
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
        <input name="address" placeholder="Address" value={form.address} onChange={handleChange} />
      </div>
      <button onClick={createSupplier}>Add Supplier</button>
    </div>
  );
}

export default SupplierTable;
