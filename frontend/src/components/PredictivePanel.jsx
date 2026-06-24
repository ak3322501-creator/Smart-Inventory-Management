function PredictivePanel({ forecast }) {
  const maxReorder = Math.max(1, ...forecast.map((item) => item.suggestedReorder));
  const maxSales = Math.max(1, ...forecast.map((item) => item.avg_daily_sales));

  return (
    <div className="forecast-view">
      <div className="forecast-charts">
        <section className="forecast-chart">
          <h3>Suggested Reorder</h3>
          <div className="bar-chart">
            {forecast.map((item) => (
              <div className="bar-row" key={item.id}>
                <span>{item.name}</span>
                <div className="bar-track">
                  <div className="bar-fill reorder" style={{ width: `${(item.suggestedReorder / maxReorder) * 100}%` }} />
                </div>
                <strong>{item.suggestedReorder}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="forecast-chart">
          <h3>Average Daily Sales</h3>
          <div className="bar-chart">
            {forecast.map((item) => (
              <div className="bar-row" key={item.id}>
                <span>{item.name}</span>
                <div className="bar-track">
                  <div className="bar-fill sales" style={{ width: `${(item.avg_daily_sales / maxSales) * 100}%` }} />
                </div>
                <strong>{item.avg_daily_sales}</strong>
              </div>
            ))}
          </div>
        </section>
      </div>

      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Current Stock</th>
            <th>Avg Daily Sales</th>
            <th>Safety Stock</th>
            <th>Suggested Reorder</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {forecast.map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.quantity}</td>
              <td>{item.avg_daily_sales}</td>
              <td>{item.safetyStock}</td>
              <td>{item.suggestedReorder}</td>
              <td>{item.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PredictivePanel;
