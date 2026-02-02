import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Zap, Shield, Sparkles, ArrowRight } from 'lucide-react';
import '../styles/Landing.css'

const Landing = () => {
    const navigate = useNavigate();
    return (
        <div className="landing-page">
            <nav className="navbar">
                <div className="logo-container">
                    <div className="logo-box">
                        <Layout size={24} color="white" />
                    </div>
                    <span className="logo-text">LoreStack</span>
                </div>
                <button className="nav-btn" onClick={() => navigate('/login')}>Get Started</button>
            </nav>

            <main className="hero">
                <div className="bg-blur blur-1"></div>
                <div className="bg-blur blur-2"></div>

                <div className="hero-content">
                    <div className="badge">
                        <Sparkles size={14} />
                        <span>Welcome to the future of Lore</span>
                    </div>
                    <h1 className="hero-title">
                        Build Your <br />
                        <span className="gradient-text">Digital Legacy</span>
                    </h1>
                    <div className="hero-subtitle">
                        The ultimate social platform for cinema nerds for logging, reviewing and interacting with other nerds.
                        <p>Join thousands of nerds today.</p>
                    </div>
                    <div className="hero-actions">
                        <button className="primary-btn" onClick={() => navigate('/login')}>
                            Launch App <ArrowRight size={18} />
                        </button>

                    </div>
                </div>

                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon icon-yellow"><Zap size={24} /></div>
                        <h3>Unique Rating System</h3>
                        <p>Lorem ipsum dolor sit amet.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon icon-blue"><Shield size={24} /></div>
                        <h3>Easy UI/UX</h3>
                        <p>Lorem ipsum dolor sit amet consectetur.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon icon-red"><Layout size={24} /></div>
                        <h3>Mood Based Recommendation</h3>
                        <p>Lorem ipsum dolor sit amet consectetur.</p>
                    </div>
                </div>
            </main>

            <footer className="footer">
                <div className="footer-content">
                    <div className="footer-brand">
                        <Layout size={20} />
                        <span>LoreStack</span>
                    </div>
                    <p className="copyright">© 2026 LoreStack. All rights reserved.</p>
                    <div className="footer-links">
                        <a href="#">Privacy</a>
                        <a href="#">Terms</a>
                        <a href="https://x.com/Lore_Stack" target="_blank">Twitter</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;