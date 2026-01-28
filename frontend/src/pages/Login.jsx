import React, { useState } from 'react';
import { Film, Mail, Lock, Eye, EyeOff, User } from 'lucide-react';

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
            window.location.href = '/';
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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Source+Sans+Pro:wght@400;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        .login-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #0a0a0a 0%, #171717 50%, #1c1917 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          position: relative;
          overflow: hidden;
          font-family: 'Source Sans Pro', sans-serif;
        }
        
        .bg-orb-1 {
          position: absolute;
          top: 25%;
          left: 25%;
          width: 400px;
          height: 400px;
          background: #d97706;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.2;
          animation: pulse1 8s ease-in-out infinite;
        }
        
        .bg-orb-2 {
          position: absolute;
          bottom: 25%;
          right: 25%;
          width: 400px;
          height: 400px;
          background: #e11d48;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.2;
          animation: pulse2 12s ease-in-out infinite;
          animation-delay: 2s;
        }
        
        .grain-overlay {
          position: absolute;
          inset: 0;
          opacity: 0.3;
          mix-blend-mode: soft-light;
          pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2.5' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        }
        
        .content-wrapper {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 480px;
        }
        
        .header {
          text-align: center;
          margin-bottom: 40px;
          animation: fadeIn 0.8s ease-out;
        }
        
        .logo-wrapper {
          display: inline-flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
        }
        
        .logo-icon-container {
          position: relative;
        }
        
        .logo-icon {
          position: relative;
          z-index: 2;
        }
        
        .logo-glow {
          position: absolute;
          inset: 0;
          background: #f59e0b;
          filter: blur(24px);
          opacity: 0.4;
        }
        
        .logo-text {
          font-family: 'Playfair Display', serif;
          font-size: 48px;
          font-weight: 700;
          background: linear-gradient(to right, #fbbf24, #fdba74, #f59e0b);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.02em;
        }
        
        .tagline {
          color: #a1a1aa;
          font-size: 18px;
          line-height: 1.5;
        }
        
        .card {
          background: rgba(24, 24, 27, 0.6);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(39, 39, 42, 0.5);
          border-radius: 16px;
          padding: 40px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          animation: slideUp 0.8s ease-out 0.2s both;
        }
        
        .tab-switcher {
          display: flex;
          gap: 16px;
          margin-bottom: 32px;
        }
        
        .tab-button {
          flex: 1;
          padding: 14px 0;
          text-align: center;
          border-radius: 8px;
          font-weight: 600;
          font-size: 15px;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: 'Source Sans Pro', sans-serif;
        }
        
        .tab-button.active {
          background: linear-gradient(to right, #d97706, #ea580c);
          color: white;
          box-shadow: 0 10px 25px -5px rgba(217, 119, 6, 0.3);
        }
        
        .tab-button.inactive {
          background: transparent;
          color: #a1a1aa;
        }
        
        .tab-button.inactive:hover {
          color: #e4e4e7;
          background: rgba(39, 39, 42, 0.5);
        }
        
        .form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .input-label {
          color: #d4d4d8;
          font-size: 14px;
          font-weight: 600;
        }
        
        .input-wrapper {
          position: relative;
        }
        
        .input-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #71717a;
          transition: color 0.3s ease;
          pointer-events: none;
        }
        
        .input-wrapper:focus-within .input-icon {
          color: #f59e0b;
        }
        
        .input-field {
          width: 100%;
          padding: 14px 16px 14px 48px;
          background: rgba(9, 9, 11, 0.5);
          border: 1px solid rgba(39, 39, 42, 0.5);
          border-radius: 8px;
          color: white;
          font-size: 15px;
          font-family: 'Source Sans Pro', sans-serif;
          transition: all 0.3s ease;
        }
        
        .input-field::placeholder {
          color: #52525b;
        }
        
        .input-field:focus {
          outline: none;
          border-color: rgba(217, 119, 6, 0.5);
          box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.2);
        }
        
        .password-toggle {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #71717a;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          transition: color 0.3s ease;
        }
        
        .password-toggle:hover {
          color: #f59e0b;
        }
        
        .remember-forgot {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 14px;
        }
        
        .remember-label {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #a1a1aa;
          cursor: pointer;
          transition: color 0.3s ease;
        }
        
        .forgot-button {
          background: none;
          border: none;
          color: #f59e0b;
          cursor: pointer;
          font-size: 14px;
          font-family: 'Source Sans Pro', sans-serif;
          transition: color 0.3s ease;
        }
        
        .submit-button {
          width: 100%;
          padding: 16px;
          background: linear-gradient(to right, #d97706, #ea580c);
          color: white;
          font-weight: 700;
          font-size: 15px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          box-shadow: 0 10px 25px -5px rgba(217, 119, 6, 0.3);
          transition: all 0.3s ease;
          font-family: 'Source Sans Pro', sans-serif;
          margin-top: 10px;
        }
        
        .submit-button:hover {
          background: linear-gradient(to right, #f59e0b, #f97316);
          transform: translateY(-2px);
        }
        
        .submit-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
        
        .message-box {
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 14px;
          line-height: 1.5;
          margin-bottom: 20px;
        }
        
        .error-box {
          background: rgba(220, 38, 38, 0.1);
          border: 1px solid rgba(220, 38, 38, 0.3);
          color: #fca5a5;
        }
        
        .success-box {
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.3);
          color: #86efac;
        }

        .name-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes pulse1 {
          0%, 100% { transform: scale(1); opacity: 0.2; }
          50% { transform: scale(1.1); opacity: 0.3; }
        }
        
        @keyframes pulse2 {
          0%, 100% { transform: scale(1); opacity: 0.2; }
          50% { transform: scale(1.05); opacity: 0.25; }
        }
        
        @media (max-width: 640px) {
          .card { padding: 28px; }
          .logo-text { font-size: 40px; }
          .name-row { grid-template-columns: 1fr; }
        }
      `}</style>

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
                        placeholder="John"
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
                        placeholder="Doe"
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