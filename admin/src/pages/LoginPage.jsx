import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, resetPassword, isAdmin, loading, user } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [resetting, setResetting] = useState(false);

  if (loading) {
    return <div className="login-page">Loading...</div>;
  }

  if (isAdmin) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleForgotPassword = async () => {
    setError('');
    setMessage('');
    const trimmed = email.trim();
    if (!trimmed) {
      setError('Enter your email address first, then tap Forgot password.');
      return;
    }

    setResetting(true);
    try {
      await resetPassword(trimmed);
      setMessage(`If an account exists for ${trimmed}, a password reset link has been sent.`);
    } catch (err) {
      setError(err.message || 'Could not send reset email.');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="login-page">
      <form className="card login-card" onSubmit={handleSubmit}>
        <h2>Admin Login</h2>
        <p>
          Use an account with role set to <strong>admin</strong> in Firestore.
        </p>
        <label htmlFor="admin-email">Email</label>
        <input
          id="admin-email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
          autoComplete="email"
        />
        <label htmlFor="admin-password">Password</label>
        <div className="password-field">
          <input
            id="admin-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type={showPassword ? 'text' : 'password'}
            required
            autoComplete="current-password"
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
        <button
          type="button"
          className="link-button forgot-password"
          onClick={handleForgotPassword}
          disabled={resetting}
        >
          {resetting ? 'Sending…' : 'Forgot password?'}
        </button>
        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}
        {user && !isAdmin && (
          <p className="error">
            Signed in but not an admin. Set <code>role: &quot;admin&quot;</code> on your user in
            Firestore.
          </p>
        )}
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export function ProtectedRoute({ children }) {
  const { user, isAdmin, loading } = useAdminAuth();

  if (loading) return <div className="login-page">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) {
    return (
      <div className="login-page">
        <div className="card login-card">
          <h2>Access denied</h2>
          <p>
            Your account is not an admin. Set <code>role: &quot;admin&quot;</code> on your user
            document.
          </p>
        </div>
      </div>
    );
  }

  return children;
}
