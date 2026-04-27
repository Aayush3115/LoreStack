import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../Components/Sidebar/Sidebar';
import '../Styles/MovieDetails.css';
import '../styles/communityDetail.css';
import { MoreVertical, Edit2, Trash2, Loader2, Bookmark, Eye, Check, X } from 'lucide-react';
import { BACKEND_URL } from '../api/api';

const AnimeDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [anime, setAnime] = useState(null);
    const [userData, setUserData] = useState(null);
    const [userRating, setUserRating] = useState(null);
    const [userReview, setUserReview] = useState("");
    const [allReviews, setAllReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isEditingReview, setIsEditingReview] = useState(false);
    const [activePeopleTab, setActivePeopleTab] = useState('characters');
    const [isLogged, setIsLogged] = useState(false);
    const [isWatchlist, setIsWatchlist] = useState(false);
    const [showActionMenu, setShowActionMenu] = useState(null);
    const [showLogModal, setShowLogModal] = useState(false);
    const [hoveredRatingData, setHoveredRatingData] = useState(null);

    const fetchAllReviews = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${BACKEND_URL}/api/movies/anime/${id}/rating/?all=true`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setAllReviews(data);
            }
        } catch (error) {
            console.error("Failed to fetch all reviews:", error);
        }
    };

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('access_token');
                if (!token) return;

                const response = await fetch(`${BACKEND_URL}/api/auth/profile/`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await response.json();
                if (response.ok) {
                    setUserData(data);
                }
            } catch (error) {
                console.error("Failed to fetch user data:", error);
            }
        };

        const fetchAnimeDetails = async () => {
            try {
                const response = await fetch(`${BACKEND_URL}/api/movies/anime/${id}/`);
                const data = await response.json();

                if (data.status_code === 200) {
                    setAnime(data.data);
                } else {
                    setError('Failed to fetch anime details');
                }
            } catch (err) {
                console.error('Error fetching anime details:', err);
                setError('Could not connect to the server');
            } finally {
                setLoading(false);
            }
        };

        const fetchUserRating = async () => {
            try {
                const token = localStorage.getItem('access_token');
                if (!token) return;

                const response = await fetch(`${BACKEND_URL}/api/movies/anime/${id}/rating/`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await response.json();
                if (response.ok && data.rating) {
                    setUserRating(data.rating);
                    setUserReview(data.review || "");
                    if (data.review) setIsEditingReview(false);
                }
            } catch (error) {
                console.error("Failed to fetch user rating:", error);
            }
        };

        const fetchAnimeActivity = async () => {
            try {
                const token = localStorage.getItem('access_token');
                if (!token) return;
                const response = await fetch(`${BACKEND_URL}/api/movies/anime/${id}/activity/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                if (response.ok) {
                    setIsLogged(data.is_logged);
                    setIsWatchlist(data.is_watchlist);
                }
            } catch (error) {
                console.error("Failed to fetch activity:", error);
            }
        };

        fetchUserData();
        fetchAnimeDetails();
        fetchUserRating();
        fetchAllReviews();
        fetchAnimeActivity();
    }, [id]);

    const handleRatingSelect = (val) => {
        if (val === userRating && !isEditingReview) return;
        setUserRating(val);
        setIsEditingReview(true);
        const reviewSection = document.querySelector('.community-reviews-section');
        if (reviewSection) {
            reviewSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleRate = async () => {
        setIsSaving(true);
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                alert("Please login to rate anime!");
                setIsSaving(false);
                return;
            }

            const response = await fetch(`${BACKEND_URL}/api/movies/anime/${id}/rating/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    rating: userRating,
                    review: userReview
                })
            });

            if (response.ok) {
                const data = await response.json();
                setUserRating(data.rating);
                setUserReview(data.review || "");
                setIsEditingReview(false);
                setIsLogged(true);
                fetchAllReviews();
                setShowLogModal(false);
            } else {
                console.error("Failed to submit rating");
            }
        } catch (error) {
            console.error("Error submitting rating:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleActivityToggle = async (type) => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                alert("Please login to track anime!");
                return;
            }

            if (type === 'logged') {
                if (!isLogged) {
                    setShowLogModal(true);
                    return;
                }
            }

            const newValue = type === 'logged' ? !isLogged : !isWatchlist;
            const body = type === 'logged' ? { is_logged: newValue } : { is_watchlist: newValue };

            const response = await fetch(`${BACKEND_URL}/api/movies/anime/${id}/activity/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                if (type === 'logged') setIsLogged(newValue);
                else setIsWatchlist(newValue);
            }
        } catch (error) {
            console.error("Failed to update activity:", error);
        }
    };

    const handleDeleteReview = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${BACKEND_URL}/api/movies/anime/${id}/rating/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                setUserRating(null);
                setUserReview("");
                setIsEditingReview(true);
                fetchAllReviews();
                setShowActionMenu(null);
            }
        } catch (error) {
            console.error("Failed to delete review:", error);
        }
    };

    const getRatingDistribution = () => {
        const counts = { skip: 0, timepass: 0, goforit: 0, perfection: 0 };
        allReviews.forEach(rev => {
            if (counts.hasOwnProperty(rev.rating)) {
                counts[rev.rating]++;
            }
        });
        const total = allReviews.length || 1;
        return ['skip', 'timepass', 'goforit', 'perfection'].map(key => ({
            label: key,
            count: counts[key],
            percent: (counts[key] / total) * 100
        }));
    };

    const getMajorityRating = () => {
        if (allReviews.length === 0) return null;
        const dist = getRatingDistribution();
        return dist.reduce((prev, current) => (prev.count >= current.count) ? prev : current);
    };

    const formatRatingLabel = (label) => {
        if (!label) return "";
        if (label === 'goforit') return "Go For It";
        return label.charAt(0).toUpperCase() + label.slice(1);
    };

    const getLoreScore = () => {
        if (allReviews.length === 0) return null;
        const values = { perfection: 10, goforit: 8, timepass: 5, skip: 2 };
        const sum = allReviews.reduce((acc, rev) => acc + (values[rev.rating] || 0), 0);
        return (sum / allReviews.length).toFixed(1);
    };

    const getColorByRating = (rating) => {
        const colors = {
            'skip': '#ef4444',
            'timepass': '#f59e0b',
            'goforit': '#10b981',
            'perfection': '#6366f1'
        };
        return colors[rating] || 'var(--accent-color)';
    };

    // AniList description usually contains HTML
    const createMarkup = (html) => {
        return { __html: html };
    };

    return (
        <div className="movie-details-container">
            <Sidebar />
            <main className="movie-details-content">
                <header className="top-header">
                    <button className="back-btn-pill" onClick={() => navigate(-1)}>
                        ← Back
                    </button>
                    <div className="header-actions">
                        {userData && (
                            <>
                                <div className="space-badge">{userData.username}'s Space</div>
                                <div className="user-avatar-container">
                                    <img
                                        src={userData.profile_picture}
                                        alt="Avatar"
                                        className="user-avatar-img"
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </header>

                {loading ? (
                    <div className="content-loading">
                        <div className="loader"></div>
                        <p>Fetching anime details...</p>
                    </div>
                ) : error || !anime ? (
                    <div className="error-message-container">
                        <div className="error-card">
                            <span className="error-icon">🎌</span>
                            <h2>{error || 'Anime Not Found'}</h2>
                            <p>We couldn't find the lore for this anime. It might have been lost in the hidden leaf village.</p>
                            <button className="back-home-btn" onClick={() => navigate(-1)}>
                                Back to Previous Page
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="details-scroll-container">
                        <div className="movie-hero">
                            {anime.bannerImage ? (
                                <img
                                    src={anime.bannerImage}
                                    alt={anime.title.english || anime.title.romaji}
                                    className="movie-backdrop"
                                />
                            ) : (
                                <div className="movie-backdrop no-banner" />
                            )}
                            <div className="hero-overlay">
                                <img
                                    src={anime.coverImage.extraLarge}
                                    alt={anime.title.english || anime.title.romaji}
                                    className="movie-poster-large"
                                />
                                <div className="hero-text">
                                    <h1>{anime.title.english || anime.title.romaji}</h1>
                                    <div className="movie-meta">
                                        <span className="certification-badge">
                                            {anime.format || 'TV'}
                                        </span>
                                        <span>•</span>
                                        <span>{anime.seasonYear || 'N/A'}</span>
                                        <span>•</span>
                                        <span>{anime.episodes || '?'} ep</span>
                                        <span>•</span>
                                        <div className="hero-ratings-group">
                                            <span className="rating-badge star-rating">★ {((anime.averageScore || 0) / 10).toFixed(1)}</span>
                                            {userRating && (
                                                <span
                                                    className="rating-badge lore-rating user-verdict-badge"
                                                    style={{ backgroundColor: getColorByRating(userRating), color: 'white', border: 'none' }}
                                                >
                                                    {userRating === 'goforit' ? 'Go For It' : userRating.charAt(0).toUpperCase() + userRating.slice(1)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="movie-main-info">
                            <div className="info-left-column">
                                <section className="info-section">
                                    <h3>Storyline</h3>
                                    <div
                                        className="overview-text anime-description"
                                        dangerouslySetInnerHTML={createMarkup(anime.description)}
                                    />
                                </section>

                                {anime.characters?.edges?.length > 0 && (
                                    <section className="cast-section">
                                        <div className="section-tabs">
                                            <button
                                                className={`tab-btn active`}
                                            >
                                                Characters
                                            </button>
                                        </div>

                                        <div className="cast-grid">
                                            {anime.characters.edges.map(edge => (
                                                <div key={edge.node.id} className="cast-card">
                                                    <div className="cast-image-container">
                                                        {edge.node.image?.large ? (
                                                            <img
                                                                src={edge.node.image.large}
                                                                alt={edge.node.name.full}
                                                                className="cast-image"
                                                            />
                                                        ) : (
                                                            <div className="cast-placeholder">
                                                                {edge.node.name.full[0]}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="cast-info">
                                                        <p className="cast-name">{edge.node.name.full}</p>
                                                        <p className="cast-character">{edge.role}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                <section className="community-reviews-section">
                                    <div className="section-header-row">
                                        <h3>Community Reviews</h3>
                                    </div>

                                    {isEditingReview && userRating && !allReviews.some(r => r.username === userData?.username) && (
                                        <div className="user-review-input-box">
                                            <textarea
                                                className="lore-review-textarea"
                                                placeholder="What's your take on this? Write your review..."
                                                value={userReview}
                                                onChange={(e) => setUserReview(e.target.value)}
                                                rows={4}
                                            />
                                            <button
                                                className="save-review-btn-pill"
                                                onClick={handleRate}
                                                disabled={isSaving}
                                            >
                                                {isSaving ? "Posting..." : "Post Review"}
                                            </button>
                                        </div>
                                    )}

                                    <div className="reviews-list">
                                        {allReviews.filter(rev => (rev.review && rev.review.trim().length > 0) || (rev.username === userData?.username && isEditingReview)).length > 0 ? (
                                            allReviews
                                                .filter(rev => (rev.review && rev.review.trim().length > 0) || (rev.username === userData?.username && isEditingReview))
                                                .map((rev) => (
                                                    <div key={rev.id} className="post-card">
                                                        <div className="post-card-header">
                                                            <img
                                                                src={rev.profile_picture || `https://i.pravatar.cc/48?u=${rev.username}`}
                                                                alt={rev.username}
                                                                className="post-avatar"
                                                            />
                                                            <div className="post-user-details">
                                                                <h4 className="post-username">
                                                                    {rev.username} {rev.username === userData?.username && "(You)"}
                                                                </h4>
                                                                <span className="post-timestamp">
                                                                    {new Date(rev.updated_at).toLocaleDateString('en-US', {
                                                                        month: 'short', day: 'numeric', year: 'numeric'
                                                                    })}
                                                                </span>
                                                            </div>

                                                            <div className="post-meta-badges" style={{ marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                                <div
                                                                    className="badge rating"
                                                                    style={{ backgroundColor: getColorByRating(rev.rating), color: '#fff', border: 'none' }}
                                                                >
                                                                    {formatRatingLabel(rev.rating) || rev.rating}
                                                                </div>

                                                                {rev.username === userData?.username && (
                                                                    <div className="action-menu-container">
                                                                        <button
                                                                            className="action"
                                                                            style={{ background: 'transparent', border: 'none', padding: '4px' }}
                                                                            onClick={() => setShowActionMenu(showActionMenu === rev.id ? null : rev.id)}
                                                                        >
                                                                            <MoreVertical size={18} />
                                                                        </button>

                                                                        {showActionMenu === rev.id && (
                                                                            <div className="action-dropdown">
                                                                                <button onClick={() => {
                                                                                    setIsEditingReview(true);
                                                                                    setShowActionMenu(null);
                                                                                    document.querySelector('.community-reviews-section').scrollIntoView({ behavior: 'smooth' });
                                                                                }}>
                                                                                    <Edit2 size={14} /> Edit Lore
                                                                                </button>
                                                                                <button className="delete-opt" onClick={handleDeleteReview}>
                                                                                    <Trash2 size={14} /> Delete Lore
                                                                                </button>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {rev.username === userData?.username && isEditingReview ? (
                                                            <div className="inline-review-editor">
                                                                <textarea
                                                                    className="lore-review-textarea"
                                                                    value={userReview}
                                                                    onChange={(e) => setUserReview(e.target.value)}
                                                                    rows={4}
                                                                    autoFocus
                                                                />
                                                                <div className="inline-editor-actions">
                                                                    <button
                                                                        className="save-review-btn-pill"
                                                                        onClick={handleRate}
                                                                        disabled={isSaving}
                                                                    >
                                                                        {isSaving ? "Updating..." : "Update Lore"}
                                                                    </button>
                                                                    <button
                                                                        className="cancel-edit-btn"
                                                                        onClick={() => setIsEditingReview(false)}
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            rev.review && (
                                                                <p className="post-body">{rev.review}</p>
                                                            )
                                                        )}
                                                    </div>
                                                ))
                                        ) : (
                                            <p className="no-reviews">No text reviews yet. Start the anime lore!</p>
                                        )}
                                    </div>
                                </section>

                                {anime.recommendations?.nodes?.length > 0 && (
                                    <section className="recommendations-section">
                                        <div className="recs-header">
                                            <h3 className="section-title-recs">More Like This</h3>
                                        </div>

                                        <div className="recommendations-grid">
                                            {anime.recommendations.nodes.slice(0, 5).map(node => (
                                                <div
                                                    key={node.mediaRecommendation.id}
                                                    className="rec-card"
                                                    onClick={() => { window.location.href = `/anime/${node.mediaRecommendation.id}`; }}
                                                >
                                                    <div className="rec-poster-wrap">
                                                        {node.mediaRecommendation.coverImage?.large ? (
                                                            <img
                                                                src={node.mediaRecommendation.coverImage.large}
                                                                alt={node.mediaRecommendation.title.english || node.mediaRecommendation.title.romaji}
                                                                className="rec-poster"
                                                            />
                                                        ) : (
                                                            <div className="rec-poster-placeholder">
                                                                {node.mediaRecommendation.title.romaji[0]}
                                                            </div>
                                                        )}
                                                        <div className="rec-overlay">
                                                            <span className="rec-rating">★ {((node.mediaRecommendation.averageScore || 0) / 10).toFixed(1)}</span>
                                                        </div>
                                                    </div>
                                                    <div className="rec-info">
                                                        <p className="rec-title">{node.mediaRecommendation.title.english || node.mediaRecommendation.title.romaji}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}
                            </div>

                            <aside className="details-sidebar">
                                <section className="sidebar-section quick-actions">
                                    <button
                                        className={`action-btn-lore ${isLogged ? 'active-logged' : ''}`}
                                        onClick={() => handleActivityToggle('logged')}
                                    >
                                        {isLogged ? <Check size={20} /> : <Eye size={20} />}
                                        <span>{isLogged ? 'Logged' : 'Log Anime'}</span>
                                    </button>
                                    <button
                                        className={`action-btn-lore ${isWatchlist ? 'active-watchlist' : ''}`}
                                        onClick={() => handleActivityToggle('watchlist')}
                                    >
                                        <Bookmark size={20} fill={isWatchlist ? 'currentColor' : 'none'} />
                                        <span>Watchlist</span>
                                    </button>
                                </section>

                                <div className="rating-section-lore">
                                    <span className="detail-label">Community Rating</span>
                                    <div className="speedometer-container">
                                        <div className="speedometer">
                                            <svg viewBox="0 0 100 55" className="gauge-svg">
                                                <path d="M10 50 A40 40 0 0 1 90 50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" strokeLinecap="round" />
                                                {(() => {
                                                    let cumulativeLength = 0;
                                                    return getRatingDistribution().map((item) => {
                                                        const segmentLength = (item.percent / 100) * 125.6;
                                                        const currentOffset = -cumulativeLength;
                                                        cumulativeLength += segmentLength;

                                                        return (
                                                            <path
                                                                key={item.label}
                                                                d="M10 50 A40 40 0 0 1 90 50"
                                                                fill="none"
                                                                stroke={getColorByRating(item.label)}
                                                                strokeWidth="8"
                                                                strokeLinecap="round"
                                                                strokeDasharray={`${segmentLength} 125.6`}
                                                                strokeDashoffset={currentOffset}
                                                                className={`gauge-segment ${hoveredRatingData?.label === item.label ? 'hovered' : ''}`}
                                                                onMouseEnter={() => setHoveredRatingData(item)}
                                                                onMouseLeave={() => setHoveredRatingData(null)}
                                                            />
                                                        );
                                                    });
                                                })()}
                                            </svg>
                                            <div className="gauge-score-container">
                                                <span className="gauge-value verdict-text" style={{ color: getColorByRating(hoveredRatingData?.label || getMajorityRating()?.label) }}>
                                                    {formatRatingLabel(hoveredRatingData?.label || getMajorityRating()?.label) || (allReviews.length === 0 ? "No Ratings" : "")}
                                                </span>
                                            </div>
                                        </div>
                                        {/* <div className="gauge-labels">
                                            <span>Skip</span>
                                            <span>Mix</span>
                                            <span>Lore</span>
                                        </div> */}
                                    </div>

                                    {userRating && (
                                        <button
                                            className="edit-lore-btn-sidebar"
                                            onClick={() => {
                                                setShowLogModal(true);
                                            }}
                                        >
                                            Edit Your Lore
                                        </button>
                                    )}
                                </div>

                                <div className="detail-item">
                                    <span className="detail-label">Status</span>
                                    <span className="detail-value">{anime.status}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Season</span>
                                    <span className="detail-value">{anime.season} {anime.seasonYear}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Studio</span>
                                    <div className="languages-list">
                                        {anime.studios?.nodes?.map(studio => (
                                            <span key={studio.name} className="detail-value">{studio.name}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Genres</span>
                                    <div className="genres-list">
                                        {anime.genres?.map(genre => (
                                            <span key={genre} className="genre-tag">{genre}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">AniList Score</span>
                                    <span className="detail-value">{anime.averageScore}%</span>
                                </div>
                            </aside>
                        </div>
                    </div>
                )}
            </main>

            {showLogModal && (
                <div className="log-modal-overlay">
                    <div className="log-modal-content">
                        <div className="log-modal-header">
                            <div>
                                <h2>Log Anime</h2>
                                <p className="modal-subtitle">Add to your lore diary</p>
                            </div>
                            <button className="close-log-modal" onClick={() => setShowLogModal(false)}>
                                <X size={24} />
                            </button>
                        </div>

                        <div className="log-modal-body">
                            <div className="log-movie-info">
                                <img
                                    src={anime.coverImage.large}
                                    className="modal-movie-poster"
                                    alt={anime.title.english || anime.title.romaji}
                                />
                                <div className="modal-movie-details">
                                    <h3>{anime.title.english || anime.title.romaji}</h3>
                                    <p>{anime.seasonYear}</p>
                                </div>
                            </div>

                            <div className="modal-rating-section">
                                <h4>HOW WAS IT?</h4>
                                <div className="rating-options-container horizontal">
                                    {[
                                        { id: 'skip', label: 'Skip', color: '#ef4444' },
                                        { id: 'timepass', label: 'Timepass', color: '#f59e0b' },
                                        { id: 'goforit', label: 'Go For It', color: '#10b981' },
                                        { id: 'perfection', label: 'Perfection', color: '#6366f1' }
                                    ].map(opt => (
                                        <button
                                            key={opt.id}
                                            className={`lore-rating-btn ${userRating === opt.id ? 'active' : ''}`}
                                            onClick={() => setUserRating(opt.id)}
                                            style={{ '--hover-color': opt.color }}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="modal-review-section">
                                <h4>YOUR LORE</h4>
                                <textarea
                                    className="modal-review-textarea"
                                    placeholder="Add notes about this anime..."
                                    value={userReview}
                                    onChange={(e) => setUserReview(e.target.value)}
                                    rows={4}
                                />
                            </div>
                        </div>

                        <div className="log-modal-footer">
                            <button className="btn-secondary-lore" onClick={() => setShowLogModal(false)}>Cancel</button>
                            <button
                                className="btn-primary-lore"
                                onClick={async () => {
                                    if (!userRating) {
                                        alert("Please select a rating to log!");
                                        return;
                                    }
                                    await handleRate();
                                    setShowLogModal(false);
                                }}
                            >
                                Save Entry
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnimeDetails;
