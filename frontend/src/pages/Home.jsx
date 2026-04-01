import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Sidebar from '../Components/Sidebar/Sidebar';
import API, { BACKEND_URL } from '../api/api';
import '../Styles/Home.css';
import '../Styles/Explore.css';
import {
    Sparkles, Film, Tv, Loader2, Search, Bell,
    MessageSquare, Heart, Share2, Compass,
    Play, Plus, MoreHorizontal, User,
    Gamepad2, BookOpen, Music
} from 'lucide-react';
import vibeBanner from '../assets/vibe-banner.png';

const Home = () => {
    const navigate = useNavigate();
    const [moods, setMoods] = useState([]);
    const [selectedVibe, setSelectedVibe] = useState(null);
    const [mediaType, setMediaType] = useState('movie');
    const [recommendations, setRecommendations] = useState([]);
    const [discussions, setDiscussions] = useState([]);
    const [myLoreRooms, setMyLoreRooms] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isRoomsLoading, setIsRoomsLoading] = useState(true);
    const [userData, setUserData] = useState(null);
    const [activeTab, setActiveTab] = useState('home');

    const railRef = useRef(null);

    // Fetch initial data
    useEffect(() => {
        const fetchInitialData = async () => {
            setIsRoomsLoading(true);
            try {
                const [moodsRes, profileRes, postsRes, createdCommsRes] = await Promise.all([
                    API.get('moods/list/'),
                    API.get('auth/profile/'),
                    API.get('posts/posts/').catch(() => ({ data: [] })),
                    API.get('loreroom/created/').catch(() => ({ data: [] }))
                ]);

                setMoods(moodsRes.data);
                setUserData(profileRes.data);
                setDiscussions(postsRes.data.slice(0, 3));
                setMyLoreRooms(createdCommsRes.data);

                // Set default vibe if none selected
                if (moodsRes.data.length > 0) {
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
    }, []);

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

    // Mock data for discussions if empty
    const displayDiscussions = discussions.length > 0 ? discussions : [
        {
            id: 1,
            user: { username: 'SciFiFan89', profile_picture: null },
            vibe: 'Mind-Bending',
            content: 'Interstellar blew my mind! The visuals and concepts were incredible! Need similar reco..',
            likes: 128,
            comments: 23
        },
        {
            id: 2,
            user: { username: 'MovieLover22', profile_picture: null },
            vibe: 'Emotional',
            content: 'Just finished The Green Mile. I\'m in tears. What a powerful film. Anyone else seen it lately?',
            likes: 94,
            comments: 18
        }
    ];

    // Mock data for LoreRooms if empty
    const displayLoreRooms = myLoreRooms.length > 0 ? myLoreRooms : [
        { id: 1, name: 'Sci-Fi Universe', avatar_icon: '🚀', category: 'Movies' },
        { id: 2, name: 'Anime Sanctuary', avatar_icon: '🎎', category: 'Anime' },
        { id: 3, name: 'Drama Deep Dive', avatar_icon: '🎭', category: 'TV Series' }
    ];

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
                        <div className="user-avatar-container">
                            {userData?.profile_picture ? (
                                <img src={userData.profile_picture} alt="Avatar" className="user-avatar-img" />
                            ) : (
                                <div className="user-avatar-placeholder">
                                    {userData?.username?.[0].toUpperCase() || 'U'}
                                </div>
                            )}
                        </div>
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

                {/* --- MOOD SELECTION BAR --- */}
                <div className="vibe-selection-bar">
                    <div className="mood-pill-container">
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

                {/* --- RECOMMENDED SECTION --- */}
                <section className="content-section">
                    <div className="section-header">
                        <div className="section-title-wrap">
                            <h2 className="section-title-main">Recommended For You</h2>
                        </div>
                        <div className="pagination-dots">
                            <div className="dot active"></div>
                            <div className="dot"></div>
                            <div className="dot"></div>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="loading-container">
                            <Loader2 className="searching-spinner" size={40} />
                        </div>
                    ) : (
                        <div className="horizontal-rail" ref={railRef}>
                            {recommendations.length > 0 ? (
                                recommendations.slice(0, 7).map((item) => (
                                    <div key={item.id} className="media-card" onClick={() => handleMediaClick(item)}>
                                        <img
                                            src={item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : 'https://via.placeholder.com/300x450'}
                                            alt={item.title}
                                            className="card-poster"
                                        />
                                        <div className="card-info">
                                            <h4 className="card-title">{item.title || item.name}</h4>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                [1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="media-card" style={{ opacity: 0.2 }}>
                                        <div style={{ height: '280px', background: 'var(--card-bg)' }}></div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </section>

                {/* --- TRENDING DISCUSSIONS --- */}
                <section className="content-section">
                    <div className="section-header">
                        <h2 className="section-title-main">Trending Discussions</h2>
                        <div className="pagination-dots">
                            <div className="dot active"></div>
                            <div className="dot"></div>
                        </div>
                    </div>

                    <div className="discussions-list">
                        {displayDiscussions.map((post) => (
                            <div key={post.id} className="discussion-card">
                                <div className="user-avatar-small" style={{ background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <User size={24} color="#94a3b8" />
                                </div>
                                <div className="discussion-content">
                                    <div className="discussion-header">
                                        <span className="user-name">{post.user?.username || 'User'}</span>
                                        <span className="mood-tag" style={{ background: `${getMoodColor(post.vibe || 'Happy')}22`, color: getMoodColor(post.vibe || 'Happy') }}>
                                            <Sparkles size={12} />
                                            {post.vibe || 'Mind-Bending'}
                                        </span>
                                    </div>
                                    <p className="comment-text">
                                        {post.content || post.text}
                                    </p>
                                    <div className="discussion-footer">
                                        <div className="footer-item"><Heart size={16} /> {post.likes || 0}</div>
                                        <div className="footer-item"><MessageSquare size={16} /> {post.comments || 0}</div>
                                        <div className="footer-item"><MoreHorizontal size={16} /></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* --- YOUR LOREROOMS --- */}
                <section className="content-section">
                    <div className="section-header">
                        <h2 className="section-title-main">Popular LoreRooms</h2>
                        <div className="pagination-dots">
                            <div className="dot active"></div>
                            <div className="dot"></div>
                        </div>
                    </div>

                    <div className="horizontal-rail">
                        {!isRoomsLoading && displayLoreRooms.length > 0 ? (
                            displayLoreRooms.map((room) => (
                                <div key={room.id} className="community-rail-card" onClick={() => navigate(`/community/${room.id}`)}>
                                    <div className="room-visual-bg" style={{
                                        background: `linear-gradient(135deg, ${getMoodColor(room.category || 'Happy')}22 0%, ${getMoodColor(room.category || 'Happy')}44 100%)`,
                                        height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <span style={{ fontSize: '3rem', filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.2))' }}>{room.avatar_icon || '🏠'}</span>
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
