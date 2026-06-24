function LowStockAlerts({ alerts }) {
  return (
    <div>
      {alerts.length === 0 ? (
        <p>All products have sufficient stock.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th>Reorder Level</th>
              <th>Supplier</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((product) => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{product.quantity}</td>
                <td>{product.reorder_level}</td>
                <td>{product.supplier_name || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default LowStockAlerts;
