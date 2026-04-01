import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, LayoutDashboard, Brain } from 'lucide-react';
import { BACKEND_URL } from '../api/api';
import '../Styles/Landing.css';

import logo from '../assets/logo_no_bg.png';

const Landing = () => {
    const navigate = useNavigate();
    const [posters, setPosters] = useState([]);
    const itemRefs = useRef([]);

    useEffect(() => {
        const fetchPosters = async () => {
            try {
                const [movieRes, animeRes] = await Promise.all([
                    fetch(`${BACKEND_URL}/api/movies/trending-movies/`),
                    fetch(`${BACKEND_URL}/api/movies/trending-anime/`)
                ]);

                const movieData = await movieRes.json();
                const animeData = await animeRes.json();

                let allPosters = [];

                if (movieData.status_code === 200) {
                    allPosters = [...allPosters, ...movieData.data.results.map(m => `https://image.tmdb.org/t/p/w300${m.poster_path}`)];
                }

                if (animeData.status_code === 200) {
                    const animeList = animeData.data || [];
                    allPosters = [...allPosters, ...animeList.map(a => a.coverImage.large || a.coverImage.medium)];
                }

                setPosters(allPosters.sort(() => 0.5 - Math.random()).slice(0, 24));
            } catch (error) {
                console.error("Failed to fetch posters for background:", error);
            }
        };

        fetchPosters();
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.3 }); // Trigger later for a smoother scroll experience

        itemRefs.current.forEach(ref => {
            if (ref) observer.observe(ref);
        });

        return () => observer.disconnect();
    }, []);

    return (
        <div className="landing-page">
            <div className="poster-wall">
                {posters.map((url, i) => (
                    <div key={i} className="poster-item" style={{ animationDelay: `${i * 0.5}s` }}>
                        <img src={url} alt="" />
                    </div>
                ))}
            </div>
            <div className="hero-overlay"></div>

            <nav className="navbar">
                <div className="logo-container">
                    <img src={logo} alt="LoreStack Logo" className="logo-img" />
                </div>
                <button className="nav-btn" onClick={() => navigate('/login')}>Sign In</button>
            </nav>

            <main className="hero">
                {/* Hero Section */}
                <section className="hero-main-section">
                    <div className="hero-content">
                        <div className="badge">
                            <span>Beyond the Screen. Into the Lore.</span>
                        </div>
                        <h1 className="hero-title">
                            More Than Content <br />
                            <span className="gradient-text">It’s a Multiverse</span>
                        </h1>
                        <div className="hero-subtitle">
                            A sanctuary for the One-Piece seekers, the Interstellar dreamers, and the lore-hunters. Discover content that matches your soul.
                        </div>
                        <div className="hero-actions">
                            <button className="primary-btn" onClick={() => navigate('/login')}>
                                Step Into the Multiverse <ArrowRight size={22} />
                            </button>
                        </div>
                    </div>
                </section>

                {/* Narrative Features Section */}
                <div className="features-reveal-container">
                    <div
                        className="feature-reveal-item"
                        ref={el => itemRefs.current[0] = el}
                    >
                        <h3>The Emotion Index</h3>
                        <p>We don't care about 'stars'. We care if it made you cry, scream, or question reality.</p>
                    </div>

                    <div
                        className="feature-reveal-item"
                        ref={el => itemRefs.current[1] = el}
                    >
                        <h3>LoreRooms</h3>
                        <p>Discuss movies and shows in Rooms. Join dedicated communities to discuss and share your love for your favorite fandoms.</p>
                    </div>

                    <div
                        className="feature-reveal-item"
                        ref={el => itemRefs.current[2] = el}
                    >
                        <h3>Discover Content</h3>
                        <p>Explore a vast collection of movies, series, and anime. Find your next favorite story across any genre or era.</p>
                    </div>

                    <div
                        className="feature-reveal-item"
                        ref={el => itemRefs.current[3] = el}
                    >
                        <h3>The Oracle</h3>
                        <p>Tell us your mood, and we'll find your next obsession. No more infinite scrolling.</p>
                    </div>
                </div>
            </main>

            <footer className="footer">
                <div className="footer-content">
                    <p className="copyright">© 2026 LoreStack. Built for the community.</p>
                    <div className="footer-links">
                        <a href="https://x.com/Lore_Stack" target="_blank" rel="noreferrer">X (Twitter)</a>
                        <a href="https://instagram.com/Lore_Stack" target="_blank" rel="noreferrer">Instagram</a>
                        <a href="#">Privacy Policy</a>
                        <a href="#">Terms Of Service</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;