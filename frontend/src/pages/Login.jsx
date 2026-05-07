import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, Camera } from 'lucide-react';
import '../Styles/Login.css';
import logo from '../assets/logo_no_bg.png';
import { BACKEND_URL } from '../api/api';
import { GoogleLogin } from '@react-oauth/google';

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
  const [profilePic, setProfilePic] = useState(null);
  const [otpRequested, setOtpRequested] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);

  const API_BASE = `${BACKEND_URL}/api/auth`;

  useEffect(() => {
    const fetchPosters = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/movies/trending-movies/`);
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
        const formData = new FormData();
        formData.append('username', username);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('password2', password2);
        formData.append('first_name', firstName);
        formData.append('last_name', lastName);
        if (profilePic) {
          formData.append('profile_picture', profilePic);
        }

        const response = await fetch(`${API_BASE}/register/`, {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem('access_token', data.access);
          localStorage.setItem('refresh_token', data.refresh);
          setSuccess('Identity created. Please enter the verification code sent to your email.');
          setOtpRequested(true);
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

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const otpCode = otp.join('');
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/verify-otp/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ otp: otpCode }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Identity Verified. Welcome to the Lore.');
        setTimeout(() => {
          window.location.href = '/home';
        }, 1500);
      } else {
        setError(data.error || 'Invalid or expired code.');
      }
    } catch (err) {
      setError('Verification link disrupted.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/google-login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: credentialResponse.credential,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        setSuccess('Access Granted via Google. Welcome to the Lore.');

        setTimeout(() => {
          window.location.href = '/home';
        }, 1500);
      } else {
        setError(data.error || 'Google identification failed.');
      }
    } catch (err) {
      setError('System Error. Google authentication link disrupted.');
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
              onClick={() => { setIsLogin(true); setOtpRequested(false); }}
            >
              Sign In
            </button>
            <button
              className={`login-tab ${!isLogin ? 'active' : ''}`}
              onClick={() => { setIsLogin(false); setOtpRequested(false); }}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={otpRequested ? handleVerifyOtp : handleSubmit}>
            {error && <div className="error-msg">{error}</div>}
            {success && <div className="success-msg">{success}</div>}

            {otpRequested ? (
              <div className="otp-section" style={{ textAlign: 'center', padding: '20px 0' }}>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>Enter the 6-digit code sent to your email.</p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '30px' }}>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength={1}
                      style={{
                        width: '45px',
                        height: '55px',
                        textAlign: 'center',
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        borderRadius: '10px',
                        border: '2px solid var(--border-color)',
                        background: 'rgba(255,255,255,0.05)',
                        color: 'var(--text-color)'
                      }}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                    />
                  ))}
                </div>
                <button type="submit" className="submit-btn" disabled={loading || otp.join('').length < 6}>
                  {loading ? 'Verifying...' : 'Authenticate Identity'}
                </button>
                <p style={{ marginTop: '20px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Didn't receive it? <button type="button" onClick={() => handleSubmit({ preventDefault: () => {} })} style={{ background: 'none', border: 'none', color: 'var(--accent-color)', cursor: 'pointer', fontWeight: 'bold' }}>Resend</button>
                </p>
              </div>
            ) : (
              <>
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
                  <>
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
                    <div className="input-group">
                      <label className="input-label">Profile Picture</label>
                      <div className="input-box">
                        <Camera className="input-icon" size={20} />
                        <input
                          type="file"
                          className="login-input"
                          style={{ paddingTop: '10px' }}
                          accept="image/*"
                          onChange={(e) => setProfilePic(e.target.files[0])}
                        />
                      </div>
                    </div>
                  </>
                )}

                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? 'Processing...' : (isLogin ? 'Enter the Multiverse' : 'Begin Journey')}
                  <ArrowRight size={20} style={{ marginLeft: '10px', verticalAlign: 'middle' }} />
                </button>
              </>
            )}

            <div className="login-divider">
              <span>OR</span>
            </div>

            <div className="google-login-container">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google Login Failed')}
                useOneTap
                theme="filled_black"
                shape="pill"
                width="100%"
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}