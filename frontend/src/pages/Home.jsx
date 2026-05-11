import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Sidebar from '../Components/Sidebar/Sidebar';
import API, { BACKEND_URL } from '../api/api';
import '../Styles/Home.css';
import '../Styles/Explore.css';
import {
    Sparkles, Film, Tv, Loader2, Search, Bell,
    MessageSquare, Heart, Share2, Compass,
    Play, Plus, MoreHorizontal, User, Users, Bookmark,
    ArrowBigDown, ArrowBigUp,
    Gamepad2, BookOpen, Music
} from 'lucide-react';
import vibeBanner from '../assets/vibe-banner.png';

const Home = () => {
    const navigate = useNavigate();
    const [moods, setMoods] = useState([]);
    const [selectedVibe, setSelectedVibe] = useState(null);
    const [mediaType, setMediaType] = useState('movie');
    const [recommendations, setRecommendations] = useState([]);
    const [myLoreRooms, setMyLoreRooms] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isRoomsLoading, setIsRoomsLoading] = useState(true);
    const [userData, setUserData] = useState(null);
    const [activeTab, setActiveTab] = useState('home');
    const [collaborativeRecs, setCollaborativeRecs] = useState([]);
    const [isCollabLoading, setIsCollabLoading] = useState(false);
    const [isSpotlightWatchlist, setIsSpotlightWatchlist] = useState(false);

    const railRef = useRef(null);

    // Fetch watchlist status for a specific movie
    const fetchWatchlistStatus = async (movieId) => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) return;
            const response = await fetch(`${BACKEND_URL}/api/movies/${movieId}/activity/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setIsSpotlightWatchlist(data.is_watchlist);
            }
        } catch (error) {
            console.error("Failed to fetch watchlist status:", error);
        }
    };

    const handleToggleWatchlist = async (movieId) => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                alert("Please login to add movies to your watchlist!");
                return;
            }

            const newValue = !isSpotlightWatchlist;
            const response = await fetch(`${BACKEND_URL}/api/movies/${movieId}/activity/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ is_watchlist: newValue })
            });

            if (response.ok) {
                setIsSpotlightWatchlist(newValue);
            }
        } catch (error) {
            console.error("Failed to update watchlist:", error);
        }
    };

    // Fetch initial data
    useEffect(() => {
        const fetchInitialData = async () => {
            setIsRoomsLoading(true);
            try {
                const [moodsRes, profileRes, createdCommsRes] = await Promise.all([
                    API.get('moods/list/'),
                    API.get('auth/profile/'),
                    API.get('loreroom/').catch(() => ({ data: [] }))
                ]);

                setMoods(moodsRes.data);
                setUserData(profileRes.data);
                
                if (!profileRes.data.email_verified) {
                    window.location.href = '/login?verify=true';
                    return;
                }

                setMyLoreRooms(createdCommsRes.data);

                // Restore default vibe selection
                if (moodsRes.data.length > 0 && !selectedVibe) {
                    setSelectedVibe(moodsRes.data[0]);
                }
            } catch (err) {
                console.error("Failed to fetch initial data:", err);
                // Simple fallback to keep page from being empty
                setMoods([{ id: 'fb1', name: 'Happy' }, { id: 'fb2', name: 'Dark' }]);
            } finally {
                setIsRoomsLoading(false);
            }
        };
        fetchInitialData();
        fetchCollaborativeRecs();
    }, []);

    const fetchCollaborativeRecs = async () => {
        setIsCollabLoading(true);
        try {
            const response = await API.get('movies/recommendations/collaborative/');
            console.log("Taste Circle API Response:", response.data);
            if (response.data.status_code === 200) {
                setCollaborativeRecs(response.data.data);
            }
        } catch (err) {
            console.error("Failed to fetch collaborative recs:", err);
        } finally {
            setIsCollabLoading(false);
        }
    };

    // Fetch Recommendations
    useEffect(() => {
        if (!selectedVibe) return;

        const fetchRecommendations = async () => {
            setIsLoading(true);
            try {
                const response = await API.get('moods/recommendations/', {
                    params: {
                        vibe: selectedVibe.name,
                        type: mediaType
                    }
                });
                if (response.data.status_code === 200) {
                    setRecommendations(response.data.data);
                }
            } catch (err) {
                console.error("Failed to fetch recommendations:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRecommendations();
    }, [selectedVibe, mediaType]);

    // Fetch watchlist status for spotlight movie
    useEffect(() => {
        if (recommendations.length > 0) {
            fetchWatchlistStatus(recommendations[0].id);
        }
    }, [recommendations]);

    const handleMediaClick = (item) => {
        const path = mediaType === 'movie' ? 'movie' : (mediaType === 'tv' ? 'tv' : 'anime');
        navigate(`/${path}/${item.id}`);
    };

    const getMoodColor = (name) => {
        const lower = name.toLowerCase();
        if (lower.includes('happy')) return '#fbbf24';
        if (lower.includes('dark')) return '#6366f1';
        if (lower.includes('thrill')) return '#ef4444';
        if (lower.includes('chill')) return '#2dd4bf';
        return '#8b5cf6';
    };

    const displayLoreRooms = myLoreRooms;

    return (
        <div className="home-container sidebar-layout">
            <Sidebar />

            <main className="main-content home-main-content" style={{ marginTop: "0px", paddingTop: "0px" }}>
                <header className="top-header">
                    <div className="header-left">
                        <h2 className="page-title">Home</h2>
                    </div>

                    <div className="header-actions">
                        <div className="space-badge">{userData ? `${userData.username}'s Space` : 'Personal Space'}</div>
                        <Link to="/profile" className="user-avatar-container">
                            {userData?.profile_picture ? (
                                <img src={userData.profile_picture} alt="Avatar" className="user-avatar-img" />
                            ) : (
                                <div className="user-avatar-placeholder">
                                    {userData?.username?.[0].toUpperCase() || 'U'}
                                </div>
                            )}
                        </Link>
                    </div>
                </header>

                {/* --- HERO SECTION --- */}
                <section className="home-hero-container">
                    <div className="home-hero" style={{ backgroundImage: `url(${vibeBanner || 'https://images.unsplash.com/photo-1485090916964-672ce3a005bc?q=80&w=2000'})` }}>
                        <div className="hero-overlay"></div>
                        <div className="hero-content">
                            <h1 className="hero-title-main">Find Your Next<br />Cinematic Adventure</h1>
                            <p className="hero-description">
                                Discover new worlds and unforgettable stories.
                            </p>
                        </div>
                    </div>
                </section>



                {/* --- MOOD-BASED RECOMMENDED SECTION (requires mood selection) --- */}
                {isRoomsLoading ? (
                    <div className="loading-container">
                        <Loader2 className="searching-spinner" size={40} />
                    </div>
                ) : !selectedVibe ? (
                    <section className="mood-prompt-section">
                        <div className="mood-prompt-content">
                            <Sparkles className="mood-prompt-icon" size={48} />
                            <h2 className="mood-prompt-title">How are you feeling today?</h2>
                            <p className="mood-prompt-subtitle">Select a mood below to unlock personalized recommendations tailored to your vibe.</p>

                            <div className="vibe-selection-bar" style={{ margin: '20px 0', justifyContent: 'center' }}>
                                <div className="mood-pill-container" style={{ justifyContent: 'center' }}>
                                    {moods.map((mood) => (
                                        <div
                                            key={mood.id}
                                            className={`mood-pill ${selectedVibe?.id === mood.id ? 'active' : ''}`}
                                            onClick={() => setSelectedVibe(mood)}
                                        >
                                            <span>{getMoodEmoji(mood.name)}</span>
                                            {mood.name}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mood-hint-arrow">
                                <ArrowBigDown size={32} />
                            </div>
                        </div>
                    </section>
                ) : (
                    <section className="content-section">
                        <div className="section-header">
                            <h2 className="section-title-main">Recommended For You</h2>
                        </div>

                        <div className="mood-spotlight-container">
                            {/* LEFT SIDE: MOOD SELECTOR GRID */}
                            <div className="mood-selector-side">
                                <h3 className="mood-side-title">Select your mood</h3>
                                <div className="mood-grid">
                                    {moods.map((mood) => (
                                        <div
                                            key={mood.id}
                                            className={`mood-pill-grid ${selectedVibe?.id === mood.id ? 'active' : ''}`}
                                            onClick={() => setSelectedVibe(mood)}
                                        >
                                            {mood.name}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* RIGHT SIDE: MOOD PREVIEW LIST */}
                            <div className="mood-preview-side">
                                {isLoading ? (
                                    <div className="loading-container" style={{ height: '300px' }}>
                                        <Loader2 className="searching-spinner" size={40} />
                                    </div>
                                ) : recommendations.length > 0 ? (
                                    <div className="mood-preview-list">
                                        {recommendations.slice(0, 2).map((movie, index) => (
                                            <div key={movie.id} className="mood-preview-card compact">
                                                <div className="preview-poster-container small" onClick={() => handleMediaClick(movie)}>
                                                    <img
                                                        src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://via.placeholder.com/300x450'}
                                                        alt={movie.title}
                                                        className="preview-poster"
                                                    />
                                                </div>
                                                <div className="preview-details compact">
                                                    <h2 className="preview-title compact">{movie.title || movie.name}</h2>
                                                    <p className="preview-overview compact">
                                                        {movie.overview?.length > 150 
                                                            ? movie.overview.substring(0, 150) + '...' 
                                                            : movie.overview || "Experience an unforgettable journey through this cinematic masterpiece."}
                                                    </p>
                                                    <div className="preview-actions compact">
                                                        <button className="spotlight-btn-primary small" onClick={() => handleMediaClick(movie)}>
                                                            <Play size={14} fill="currentColor" /> Details
                                                        </button>
                                                        <button 
                                                            className="hero-btn-secondary small"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleToggleWatchlist(movie.id);
                                                            }}
                                                        >
                                                            <Bookmark size={14} /> Watchlist
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="empty-mood-state" style={{ padding: '60px', textAlign: 'center', opacity: 0.5 }}>
                                        <Sparkles size={48} style={{ marginBottom: '15px' }} />
                                        <p>No recommendations found for this vibe.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </section>
                )}

                {/* --- COLLABORATIVE CIRCLE SECTION --- */}
                {isCollabLoading ? (
                    <div className="loading-container">
                        <Loader2 className="searching-spinner" size={40} />
                    </div>
                ) : collaborativeRecs.length > 0 ? (
                    <section className="content-section">
                        <div className="section-header">
                            <div className="section-title-wrap">
                                <h2 className="section-title-main">People With Your Taste Are Into...</h2>
                                <span className="section-subtitle">Based on users who share your cinematic DNA</span>
                            </div>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--accent-color)', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: '700' }}>
                                <Users size={12} /> TASTE CIRCLE
                            </span>
                        </div>

                        <div className="horizontal-rail">
                            {collaborativeRecs.map((item) => (
                                <div key={item.id} className="media-card" onClick={() => handleMediaClick(item)}>
                                    <div className="match-tag" style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 2, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', color: '#4ade80', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold', border: '1px solid rgba(74, 222, 128, 0.3)' }}>
                                        {Math.round(item.match_score * 20)}% Match
                                    </div>
                                    <img
                                        src={item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : 'https://via.placeholder.com/300x450'}
                                        alt={item.title}
                                        className="card-poster"
                                    />
                                    <div className="card-info">
                                        <h4 className="card-title">{item.title}</h4>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                ) : (
                    /* FALLBACK SECTION WHEN NO COLLAB DATA */
                    <section className="content-section" style={{ opacity: 0.8 }}>
                        <div className="section-header">
                            <div className="section-title-wrap">
                                <h2 className="section-title-main">Unlock Your Taste Circle</h2>
                                <span className="section-subtitle">Personalized picks from people who share your vibe</span>
                            </div>
                        </div>
                        <div style={{ background: 'var(--card-bg)', padding: '30px', borderRadius: '16px', textAlign: 'center', border: '1px dashed var(--border-color)' }}>
                            <Users size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
                            <p style={{ fontSize: '0.9rem', marginBottom: '15px' }}>Rate more movies to find your "Taste Twins" and unlock personalized recommendations.</p>
                            <button
                                onClick={() => navigate('/explore')}
                                style={{ background: 'var(--accent-color)', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer' }}
                            >
                                Start Rating
                            </button>
                        </div>
                    </section>
                )}




                {/* --- YOUR LOREROOMS --- */}
                <section className="content-section">
                    <div className="section-header">
                        <h2 className="section-title-main">Popular LoreRooms</h2>
                    </div>

                    <div className="horizontal-rail">
                        {!isRoomsLoading && displayLoreRooms.length > 0 ? (
                            displayLoreRooms.map((room) => (
                                <div key={room.id} className="community-rail-card" onClick={() => navigate(`/community/${room.id}`)}>
                                    <div className="room-visual-bg" style={{
                                        background: room.profile_picture ? `url(${room.profile_picture}) center/cover no-repeat` : `linear-gradient(135deg, ${getMoodColor(room.category || 'Happy')}22 0%, ${getMoodColor(room.category || 'Happy')}44 100%)`,
                                        height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        {!room.profile_picture && (
                                            <div className="default-community-emoji">🏠</div>
                                        )}
                                    </div>
                                    <div className="community-overlay">
                                        <span className="mood-tag" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', marginBottom: '8px', padding: '2px 8px' }}>{room.category}</span>
                                        <h3 className="community-title-rail">{room.name}</h3>
                                    </div>
                                </div>
                            ))
                        ) : isRoomsLoading ? (
                            [1, 2, 3].map(i => (
                                <div key={i} className="community-rail-card" style={{ opacity: 0.1, background: 'var(--card-bg)' }}></div>
                            ))
                        ) : (
                            <p style={{ padding: '2rem', opacity: 0.5 }}>No LoreRooms created by you or the admin were found.</p>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
};

const getMoodEmoji = (name) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('happy')) return '😊';
    if (lowerName.includes('dark')) return '🌑';
    if (lowerName.includes('action')) return '💥';
    if (lowerName.includes('sad')) return '😢';
    if (lowerName.includes('romantic')) return '❤️';
    if (lowerName.includes('scary')) return '😱';
    if (lowerName.includes('thrill')) return '🕵️';
    if (lowerName.includes('chill')) return '🌊';
    if (lowerName.includes('hype')) return '🚀';
    return '✨';
};

export default Home;
