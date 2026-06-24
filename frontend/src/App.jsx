import { useEffect, useState } from 'react';
import ProductTable from './components/ProductTable';
import SupplierTable from './components/SupplierTable';
import SalesPanel from './components/SalesPanel';
import LowStockAlerts from './components/LowStockAlerts';
import PredictivePanel from './components/PredictivePanel';
import AuthPanel from './components/AuthPanel';
import { apiGet, apiGetStrict } from './api';

const tabs = [
  { key: 'overview', label: 'Overview' },
  { key: 'products', label: 'Products' },
  { key: 'suppliers', label: 'Suppliers' },
  { key: 'sales', label: 'Sales' },
  { key: 'forecast', label: 'Forecast' },
  { key: 'account', label: 'Account' }
];

function App() {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [sales, setSales] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [forecast, setForecast] = useState([]);
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('inventoryUser');
    return stored ? JSON.parse(stored) : null;
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [checkingSession, setCheckingSession] = useState(!!user);

  const loadData = async () => {
    setProducts(await apiGet('/products'));
    setSuppliers(await apiGet('/suppliers'));
    setSales(await apiGet('/sales'));
    setAlerts(await apiGet('/alerts/low-stock'));
    setForecast(await apiGet('/prediction'));
  };

  useEffect(() => {
    const verifySession = async () => {
      if (!user?.token) {
        localStorage.removeItem('inventoryUser');
        setUser(null);
        setCheckingSession(false);
        return;
      }

      try {
        const sessionUser = await apiGetStrict('/auth/me');
        localStorage.setItem('inventoryUser', JSON.stringify(sessionUser));
        setUser(sessionUser);
        await loadData();
      } catch {
        localStorage.removeItem('inventoryUser');
        setUser(null);
      } finally {
        setCheckingSession(false);
      }
    };

    verifySession();
  }, []);

  const totalStockValue = products.reduce((sum, product) => sum + product.quantity * product.price, 0);
  const totalSalesCount = sales.reduce((sum, sale) => sum + sale.quantity, 0);
  const forecastedReorder = forecast.reduce((sum, item) => sum + item.suggestedReorder, 0);

  const handleLogin = (userData) => {
    localStorage.setItem('inventoryUser', JSON.stringify(userData));
    setUser(userData);
    setActiveTab('overview');
    loadData();
  };

  const handleLogout = () => {
    localStorage.removeItem('inventoryUser');
    setUser(null);
    setActiveTab('account');
  };

  if (checkingSession) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1>Inventory Hub</h1>
          <p>Checking your session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="auth-page">
        <AuthPanel user={user} onLogin={handleLogin} onLogout={handleLogout} />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="app-layout">
        <aside className="sidebar">
          <div className="sidebar-brand">
            <h2>Inventory Hub</h2>
            <p>Smart inventory control</p>
            {user && <p className="user-status">Logged in as <strong>{user.name}</strong></p>}
          </div>

          <div className="sidebar-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                className={`tab-button ${activeTab === tab.key ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </aside>

        <div className="content">
          <header>
            <h1>Smart Inventory Management</h1>
            <p>Track products, update stock, manage suppliers, and forecast reorder needs.</p>
          </header>

          {activeTab === 'overview' && (
            <main className="overview-main">
              {/* Dashboard KPI Grid */}
              <section className="dashboard-stats-grid">
                <div className="summary-card">
                  <span>Total Products</span>
                  <strong>{products.length}</strong>
                </div>
                <div className="summary-card">
                  <span>Total Suppliers</span>
                  <strong>{suppliers.length}</strong>
                </div>
                <div className="summary-card">
                  <span>Low Stock Items</span>
                  <strong>{alerts.length}</strong>
                </div>
                <div className="summary-card">
                  <span>Stock Value</span>
                  <strong>Rs {totalStockValue.toFixed(0)}</strong>
                </div>
                <div className="summary-card highlight-card">
                  <span>Forecasted Reorder</span>
                  <strong>{forecastedReorder} Units</strong>
                </div>
              </section>

              <section className="panel panel-grid">
                <div className="detail-tile">
                  <h3>Stock Summary</h3>
                  <p>There are currently <strong>{products.length}</strong> products in inventory, supplied by <strong>{suppliers.length}</strong> vendors.</p>
                </div>
                <div className="detail-tile">
                  <h3>Sales Insight</h3>
                  <p>Total units sold: <strong>{totalSalesCount}</strong>. Recent sales update stock levels automatically.</p>
                </div>
                <div className="detail-tile">
                  <h3>Forecasting</h3>
                  <p>Predicted reorder need across products: <strong>{forecastedReorder}</strong> units. This helps prevent stockouts.</p>
                </div>
              </section>

              <section className="panel">
                <h2>Low Stock Alerts</h2>
                <LowStockAlerts alerts={alerts} />
              </section>
            </main>
          )}

          {activeTab === 'products' && (
            <main>
              <section className="panel">
                <h2>Products</h2>
                <ProductTable products={products} onRefresh={loadData} suppliers={suppliers} />
              </section>
            </main>
          )}

          {activeTab === 'suppliers' && (
            <main>
              <section className="panel">
                <h2>Suppliers</h2>
                <SupplierTable suppliers={suppliers} onRefresh={loadData} />
              </section>
            </main>
          )}

          {activeTab === 'sales' && (
            <main>
              <section className="panel">
                <h2>Sales Records</h2>
                <SalesPanel products={products} sales={sales} onRefresh={loadData} />
              </section>
            </main>
          )}

          {activeTab === 'forecast' && (
            <main>
              <section className="panel">
                <h2>Predictive Inventory</h2>
                <PredictivePanel forecast={forecast} />
              </section>
            </main>
          )}

          {activeTab === 'account' && (
            <main>
              <section className="panel">
                <h2>Account</h2>
                <AuthPanel user={user} onLogin={handleLogin} onLogout={handleLogout} />
              </section>
            </main>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
