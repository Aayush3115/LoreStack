import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, User, ArrowRight } from 'lucide-react';
import '../Styles/Login.css';
import logo from '../assets/logo_no_bg.png';

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
  const [posters, setPosters] = useState([]);

  const API_BASE = 'http://localhost:8000/api/auth';

  useEffect(() => {
    const fetchPosters = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/movies/trending-movies/");
        const data = await response.json();
        if (data.status_code === 200) {
          setPosters(data.data.results.slice(0, 12).map(m => `https://image.tmdb.org/t/p/w500${m.poster_path}`));
        }
      } catch (err) {
        console.error("Poster fetch failed", err);
      }
    };
    fetchPosters();
  }, []);

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
          setSuccess('Access Granted. Welcome to the Matrix.');

          setTimeout(() => {
            window.location.href = '/home';
          }, 1500);
        } else {
          setError(data.detail || data.error || 'Identity verification failed.');
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
          setSuccess('Account Created. Welcome to the Lore.');

          setTimeout(() => {
            window.location.href = '/home';
          }, 1500);
        } else {
          const backendErrors = Object.entries(data)
            .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(' ') : msgs}`)
            .join(' | ');

          setError(backendErrors || 'Registration failed.');
        }
      }
    } catch (err) {
      setError('System Error. Is the core server online?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      {/* Left Side: Cinematic Visuals */}
      <div className="login-visual-side">
        <div className="login-poster-grid">
          {posters.map((url, i) => (
            <div key={i} className="login-poster-item">
              <img src={url} alt="" />
            </div>
          ))}
        </div>
        <div className="visual-overlay"></div>
        <div className="visual-content">
          <h2>Behind the Screen.</h2>
          <p>Join the sanctuary for lore-hunters and storytellers.</p>
        </div>
      </div>

      {/* Right Side: Identity Form */}
      <div className="login-form-side">
        <div className="login-card">
          <div className="login-header">
            <img src={logo} alt="LoreStack" className="login-logo" />
            <h1>{isLogin ? 'Initiate Protocol' : 'Create Identity'}</h1>
          </div>

          <div className="login-tabs">
            <button 
              className={`login-tab ${isLogin ? 'active' : ''}`}
              onClick={() => setIsLogin(true)}
            >
              Sign In
            </button>
            <button 
              className={`login-tab ${!isLogin ? 'active' : ''}`}
              onClick={() => setIsLogin(false)}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {error && <div className="error-msg">{error}</div>}
            {success && <div className="success-msg">{success}</div>}

            <div className="input-group">
              <label className="input-label">Username</label>
              <div className="input-box">
                <User className="input-icon" size={20} />
                <input
                  type="text"
                  className="login-input"
                  placeholder="e.g. lore_hunter_24"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            {!isLogin && (
              <>
                <div className="input-group">
                  <label className="input-label">Email Address</label>
                  <div className="input-box">
                    <Mail className="input-icon" size={20} />
                    <input
                      type="email"
                      className="login-input"
                      placeholder="you@lore.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <div className="input-group">
                    <label className="input-label">First Name</label>
                    <input
                      type="text"
                      className="login-input"
                      style={{ paddingLeft: '20px' }}
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Last Name</label>
                    <input
                      type="text"
                      className="login-input"
                      style={{ paddingLeft: '20px' }}
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <div className="input-group">
              <label className="input-label">Password</label>
              <div className="input-box">
                <Lock className="input-icon" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="login-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="input-group">
                <label className="input-label">Confirm Password</label>
                <div className="input-box">
                  <Lock className="input-icon" size={20} />
                  <input
                    type="password"
                    className="login-input"
                    placeholder="••••••••"
                    value={password2}
                    onChange={(e) => setPassword2(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Processing...' : (isLogin ? 'Enter the Multiverse' : 'Begin Journey')}
              <ArrowRight size={20} style={{ marginLeft: '10px', verticalAlign: 'middle' }} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}