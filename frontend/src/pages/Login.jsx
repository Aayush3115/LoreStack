import React, { useState } from 'react';
import { Film, Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import '../styles/Login.css'

export default function LorestackLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [password2, setPassword2] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const API_BASE = 'http://localhost:8000/api/auth';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isLogin) {
        const response = await fetch(`${API_BASE}/login/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: username || email,
            password,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem('access_token', data.access);
          localStorage.setItem('refresh_token', data.refresh);
          setSuccess('Login successful!');

          setTimeout(() => {
            window.location.href = '/Home';
          }, 1500);
        } else {
          setError(data.detail || data.error || 'Login failed. Please check your credentials.');
        }
      } else {
        const response = await fetch(`${API_BASE}/register/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username,
            email,
            password,
            password2,
            first_name: firstName,
            last_name: lastName,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem('access_token', data.access);
          localStorage.setItem('refresh_token', data.refresh);
          setSuccess('Account created successfully!');

          setTimeout(() => {
            setIsLogin(true);
            setSuccess('Please sign in with your new account.');
          }, 2000);
        } else {
          const backendErrors = Object.entries(data)
            .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(' ') : msgs}`)
            .join(' | ');

          setError(backendErrors || 'Registration failed.');
        }
      }
    } catch (err) {
      setError('Network error. Please check if the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    setError(`${provider} authentication coming soon!`);
  };

  const handleForgotPassword = async () => {
    if (!username && !email) {
      setError('Please enter your username or email address first.');
      return;
    }
    setError('Password reset functionality coming soon!');
  };

  return (
    <>

      <div className="login-container">
        <div className="bg-orb-1"></div>
        <div className="bg-orb-2"></div>
        <div className="grain-overlay"></div>

        <div className="content-wrapper">
          <div className="header">
            <div className="logo-wrapper">
              <div className="logo-icon-container">
                <Film className="logo-icon" size={48} color="#f59e0b" strokeWidth={1.5} />
                <div className="logo-glow"></div>
              </div>
              <h1 className="logo-text">Lorestack</h1>
            </div>
            <p className="tagline">
              {isLogin ? 'Welcome back to your cinematic universe' : 'Begin your journey through cinema'}
            </p>
          </div>

          <div className="card">
            <div className="tab-switcher">
              <button
                onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}
                className={`tab-button ${isLogin ? 'active' : 'inactive'}`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}
                className={`tab-button ${!isLogin ? 'active' : 'inactive'}`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="form">
              {error && <div className="message-box error-box">{error}</div>}
              {success && <div className="message-box success-box">{success}</div>}

              <div className="input-group">
                <label className="input-label">Username</label>
                <div className="input-wrapper">
                  <User className="input-icon" size={20} />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="cinemafan_24"
                    className="input-field"
                    required
                  />
                </div>
              </div>

              {!isLogin && (
                <>
                  <div className="name-row">
                    <div className="input-group">
                      <label className="input-label">First Name</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Admin"
                        className="input-field"
                        style={{ paddingLeft: '16px' }}
                        required
                      />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Last Name</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Admin"
                        className="input-field"
                        style={{ paddingLeft: '16px' }}
                        required
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <label className="input-label">Email</label>
                    <div className="input-wrapper">
                      <Mail className="input-icon" size={20} />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="input-field"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="input-group">
                <label className="input-label">Password</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-field"
                    required
                    style={{ paddingRight: '48px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div className="input-group">
                  <label className="input-label">Confirm Password</label>
                  <div className="input-wrapper">
                    <Lock className="input-icon" size={20} />
                    <input
                      type="password"
                      value={password2}
                      onChange={(e) => setPassword2(e.target.value)}
                      placeholder="••••••••"
                      className="input-field"
                      required
                    />
                  </div>
                </div>
              )}

              {isLogin && (
                <div className="remember-forgot">
                  <label className="remember-label">
                    <input type="checkbox" style={{ marginRight: '8px' }} />
                    <span>Remember me</span>
                  </label>
                  <button type="button" className="forgot-button" onClick={handleForgotPassword}>
                    Forgot password?
                  </button>
                </div>
              )}

              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}