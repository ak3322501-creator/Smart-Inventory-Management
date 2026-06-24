import { useState } from 'react';
import { apiPost } from '../api';

function SalesPanel({ products, sales, onRefresh }) {
  const [form, setForm] = useState({ product_id: '', quantity: 1, sale_price: 0 });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const recordSale = async () => {
    await apiPost('/sales', {
      product_id: form.product_id,
      quantity: Number(form.quantity),
      sale_price: Number(form.sale_price)
    });
    setForm({ product_id: '', quantity: 1, sale_price: 0 });
    onRefresh();
  };

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Quantity</th>
            <th>Sale Price</th>
            <th>Sold At</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((sale) => (
            <tr key={sale.id}>
              <td>{sale.product_name}</td>
              <td>{sale.quantity}</td>
              <td>{sale.sale_price.toFixed(2)}</td>
              <td>{new Date(sale.sold_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="form-row">
        <select name="product_id" value={form.product_id} onChange={handleChange}>
          <option value="">Select product</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>{product.name}</option>
          ))}
        </select>
        <input name="quantity" type="number" min="1" placeholder="Quantity" value={form.quantity} onChange={handleChange} />
        <input name="sale_price" type="number" step="0.01" placeholder="Sale price" value={form.sale_price} onChange={handleChange} />
      </div>
      <button onClick={recordSale} disabled={!form.product_id}>Record Sale</button>
    </div>
  );
}

export default SalesPanel;
