import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Shield, Sparkles, ArrowRight, Star, LayoutDashboard, Brain, Heart, Compass } from 'lucide-react';
import '../Styles/Landing.css'

import logo from '../assets/logo_no_bg.png';

const Landing = () => {
    const navigate = useNavigate();
    return (
        <div className="landing-page">
            <nav className="navbar">
                <div className="logo-container">
                    <div className="logo-box">
                        <img src={logo} alt="LoreStack Logo" className="logo-img" />
                    </div>
                </div>
                <button className="nav-btn" onClick={() => navigate('/login')}>Get Started</button>
            </nav>

            <main className="hero">
                <div className="bg-blur blur-1"></div>
                <div className="bg-blur blur-2"></div>

                <div className="hero-content">
                    <div className="badge">
                        <span>Welcome to where stories meet emotion</span>
                    </div>
                    <h1 className="hero-title">
                        More Than Content <br />
                        <span className="gradient-text">It’s a Community</span>
                    </h1>
                    <div className="hero-subtitle">
                        Find content that matches how you feel today and express your perspective in a space built for discussion, not noise.
                        <p>Discover content. Share perspective.</p>
                    </div>
                    <div className="hero-actions">
                        <button className="primary-btn" onClick={() => navigate('/login')}>
                            Launch App <ArrowRight size={18} />
                        </button>

                    </div>
                </div>

                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon icon-yellow"><Sparkles size={24} /></div>
                        <h3>Unique Rating System</h3>
                        <p>A rating system that values how content makes you feel, not just how popular it is.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon icon-blue"><LayoutDashboard size={24} /></div>
                        <h3>Easy UI/UX</h3>
                        <p>Simple, intuitive design so you can focus on content, not clicks.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon icon-red"><Brain size={24} /></div>
                        <h3>Mood Based Recommendation</h3>
                        <p>Explore movies, series, and stories that match how you feel right now.</p>
                    </div>
                </div>
            </main>

            <footer className="footer">
                <div className="footer-content">
                    <div className="footer-brand">
                        <img src={logo} alt="LoreStack Logo" className="footer-logo-img" />
                    </div>
                    <p className="copyright">© 2026 LoreStack. All rights reserved.</p>
                    <div className="footer-links">
                        <a href="#">Privacy Policy</a>
                        <a href="#">Terms Of Service</a>
                        <a href="https://x.com/Lore_Stack" target="_blank">X (Twitter)</a>
                        <a href="https://instagram.com/Lore_Stack" target="_blank">Instagram</a>

                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;