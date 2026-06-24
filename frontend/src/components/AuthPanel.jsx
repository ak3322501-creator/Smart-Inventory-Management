import { useState } from 'react';
import { apiPost } from '../api';

function AuthPanel({ user, onLogin, onLogout }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    password: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const validateSignup = () => {
    if (!form.name.trim()) return 'Name is required.';
    if (!form.company.trim()) return 'Company name is required.';
    if (!form.email.includes('@')) return 'Enter a valid email address.';
    if (form.password.length < 8) return 'Password must be at least 8 characters.';
    if (form.password !== form.confirmPassword) return 'Passwords do not match.';
    return '';
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setMessage('');
      if (mode === 'login') {
        const result = await apiPost('/auth/login', { email: form.email, password: form.password });
        if (result.error) throw new Error(result.error);
        onLogin(result);
      } else {
        const validationError = validateSignup();
        if (validationError) throw new Error(validationError);

        const result = await apiPost('/auth/register', { name: form.name, company: form.company, email: form.email, password: form.password });
        if (result.error) throw new Error(result.error);
        onLogin(result);
      }
      setForm({ name: '', email: '', company: '', password: '', confirmPassword: '' });
    } catch (err) {
      setMessage(err.message || 'Unable to complete request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      {user ? (
        <div className="auth-welcome">
          <h2>Account</h2>
          <p>Welcome back, <strong>{user.name}</strong>.</p>
          <button onClick={onLogout}>Logout</button>
        </div>
      ) : (
        <>
          <div className="auth-brand">
            <h1>Inventory Hub</h1>
            <p>{mode === 'login' ? 'Login to continue to your dashboard.' : 'Create your account to start managing inventory.'}</p>
          </div>

          <div className="auth-toggle">
            <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')} type="button">Login</button>
            <button className={mode === 'signup' ? 'active' : ''} onClick={() => setMode('signup')} type="button">Sign Up</button>
          </div>

          <div className="auth-fields">
            {mode === 'signup' && (
              <>
                <input name="name" placeholder="Name" value={form.name} onChange={handleChange} autoComplete="name" />
                <input name="company" placeholder="Company / Store Name" value={form.company} onChange={handleChange} autoComplete="organization" />
              </>
            )}
            <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} autoComplete="email" />
            <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
            {mode === 'signup' && (
              <>
                <input name="confirmPassword" type="password" placeholder="Confirm Password" value={form.confirmPassword} onChange={handleChange} autoComplete="new-password" />
                <span className="auth-hint">Use at least 8 characters.</span>
              </>
            )}
          </div>

          <button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create Account'}
          </button>
          {message && <p className="auth-message">{message}</p>}
        </>
      )}
    </div>
  );
}

export default AuthPanel;
