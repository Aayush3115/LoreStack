import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../Components/Sidebar/Sidebar';
import '../Styles/MovieDetails.css';
import '../Styles/communityDetail.css';
import { MoreVertical, Edit2, Trash2, Loader2, Bookmark, Eye, Check, X } from 'lucide-react';
import { BACKEND_URL } from '../api/api';

const WebSeriesDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [series, setSeries] = useState(null);
    const [userData, setUserData] = useState(null);
    const [userRating, setUserRating] = useState(null);
    const [userReview, setUserReview] = useState("");
    const [allReviews, setAllReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isEditingReview, setIsEditingReview] = useState(false);
    const [activePeopleTab, setActivePeopleTab] = useState('cast');
    const [isLogged, setIsLogged] = useState(false);
    const [isWatchlist, setIsWatchlist] = useState(false);
    const [showActionMenu, setShowActionMenu] = useState(null);
    const [showLogModal, setShowLogModal] = useState(false);
    const [hoveredRatingData, setHoveredRatingData] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [activeRecTab, setActiveRecTab] = useState('theme');

    const fetchAllReviews = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${BACKEND_URL}/api/movies/tv/${id}/rating/?all=true`, {
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

        const fetchTVDetails = async () => {
            try {
                const response = await fetch(`${BACKEND_URL}/api/movies/tv/${id}/`);
                const data = await response.json();

                if (data.status_code === 200) {
                    setSeries(data.data);
                } else {
                    setError('Failed to fetch webseries details');
                }
            } catch (err) {
                console.error('Error fetching webseries details:', err);
                setError('Could not connect to the server');
            } finally {
                setLoading(false);
            }
        };

        const fetchUserRating = async () => {
            try {
                const token = localStorage.getItem('access_token');
                if (!token) return;

                const response = await fetch(`${BACKEND_URL}/api/movies/tv/${id}/rating/`, {
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

        const fetchTVActivity = async () => {
            try {
                const token = localStorage.getItem('access_token');
                if (!token) return;
                const response = await fetch(`${BACKEND_URL}/api/movies/tv/${id}/activity/`, {
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

        const fetchRecommendations = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const response = await fetch(`${BACKEND_URL}/api/movies/tv/${id}/recommendations/`, {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                });
                const data = await response.json();
                if (data.status_code === 200) {
                    setRecommendations(data.data);
                }
            } catch (err) {
                console.error('Error fetching recommendations:', err);
            }
        };

        fetchUserData();
        fetchTVDetails();
        fetchUserRating();
        fetchAllReviews();
        fetchTVActivity();
        fetchRecommendations();
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
                alert("Please login to rate webseries!");
                setIsSaving(false);
                return;
            }

            const response = await fetch(`${BACKEND_URL}/api/movies/tv/${id}/rating/`, {
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
                alert("Please login to track webseries!");
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

            const response = await fetch(`${BACKEND_URL}/api/movies/tv/${id}/activity/`, {
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
            const response = await fetch(`${BACKEND_URL}/api/movies/tv/${id}/rating/`, {
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
                                        src={userData.profile_picture || `${BACKEND_URL}/media/profile_pics/default.jpg`}
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
                        <p>Fetching webseries details...</p>
                    </div>
                ) : error || !series ? (
                    <div className="error-message-container">
                        <div className="error-card">
                            <span className="error-icon">📺</span>
                            <h2>{error || 'WebSeries Not Found'}</h2>
                            <p>We couldn't find the lore for this item. It might have been lost in the multiverse.</p>
                            <button className="back-home-btn" onClick={() => navigate(-1)}>
                                Back to Previous Page
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="details-scroll-container">
                        <div className="movie-hero">
                            <img
                                src={`https://image.tmdb.org/t/p/original${series.backdrop_path}`}
                                alt={series.name}
                                className="movie-backdrop"
                            />
                            <div className="hero-overlay">
                                <img
                                    src={`https://image.tmdb.org/t/p/w500${series.poster_path}`}
                                    alt={series.name}
                                    className="movie-poster-large"
                                />
                                <div className="hero-text">
                                    <h1>{series.name}</h1>
                                    <div className="movie-meta">
                                        <span className="certification-badge">
                                            {series.content_ratings?.results?.find(r => r.iso_3166_1 === 'US')?.rating || 'NR'}
                                        </span>
                                        <span>•</span>
                                        <span>{series.first_air_date ? new Date(series.first_air_date).getFullYear() : 'N/A'}</span>
                                        <span>•</span>
                                        <span>{series.episode_run_time?.[0] || 'N/A'}m episodes</span>
                                        <span>•</span>
                                        <div className="hero-ratings-group">
                                            <span className="rating-badge star-rating">★ {series.vote_average.toFixed(1)}</span>
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
                                    <h3>Overview</h3>
                                    <p className="overview-text">{series.overview}</p>
                                </section>

                                {series.credits?.cast?.length > 0 && (
                                    <section className="cast-section">
                                        <div className="section-tabs">
                                            <button
                                                className={`tab-btn ${activePeopleTab === 'cast' ? 'active' : ''}`}
                                                onClick={() => setActivePeopleTab('cast')}
                                            >
                                                Top Cast
                                            </button>
                                            <button
                                                className={`tab-btn ${activePeopleTab === 'crew' ? 'active' : ''}`}
                                                onClick={() => setActivePeopleTab('crew')}
                                            >
                                                Top Crew
                                            </button>
                                        </div>

                                        {activePeopleTab === 'cast' ? (
                                            <div className="cast-grid">
                                                {series.credits.cast.slice(0, 15).map(person => (
                                                    <div key={person.id} className="cast-card">
                                                        <div className="cast-image-container">
                                                            {person.profile_path ? (
                                                                <img
                                                                    src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                                                                    alt={person.name}
                                                                    className="cast-image"
                                                                />
                                                            ) : (
                                                                <div className="cast-placeholder">
                                                                    {person.name[0]}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="cast-info">
                                                            <p className="cast-name">{person.name}</p>
                                                            <p className="cast-character">{person.character}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="cast-grid">
                                                {series.credits?.crew
                                                    ?.filter(person => ['Director', 'Writer', 'Screenplay', 'Story', 'Executive Producer', 'Director of Photography', 'Editor', 'Original Music Composer', 'Creator'].includes(person.job))
                                                    ?.reduce((acc, current) => {
                                                        const x = acc.find(item => item.id === current.id);
                                                        if (!x) return acc.concat([current]);
                                                        else return acc;
                                                    }, [])
                                                    ?.slice(0, 12)
                                                    ?.map((person, idx) => (
                                                        <div key={`${person.id}-${idx}`} className="cast-card">
                                                            <div className="cast-image-container">
                                                                {person.profile_path ? (
                                                                    <img
                                                                        src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                                                                        alt={person.name}
                                                                        className="cast-image"
                                                                    />
                                                                ) : (
                                                                    <div className="cast-placeholder">
                                                                        {person.name[0]}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="cast-info">
                                                                <p className="cast-name">{person.name}</p>
                                                                <p className="cast-character">{person.job}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                        )}
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
                                                placeholder="What's the lore on this one? Write your review..."
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
                                                                src={rev.profile_picture || `${BACKEND_URL}/media/profile_pics/default.jpg`}
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
                                            <p className="no-reviews">No text reviews yet. Be the first to start the lore!</p>
                                        )}
                                    </div>
                                </section>

                                {recommendations.length > 0 && (() => {
                                    const displayRecs = recommendations;
                                    return (
                                        <section className="recommendations-section">
                                            <div className="recs-header">
                                                <h3 className="section-title-recs">More Like This</h3>
                                            </div>

                                            {displayRecs.length > 0 ? (
                                                <div className="recommendations-grid">
                                                    {displayRecs.slice(0, 5).map(rec => (
                                                        <div
                                                            key={rec.id}
                                                            className="rec-card"
                                                            onClick={() => { window.location.href = `/tv/${rec.id}`; }}
                                                        >
                                                            <div className="rec-poster-wrap">
                                                                {rec.poster_path ? (
                                                                    <img
                                                                        src={`https://image.tmdb.org/t/p/w300${rec.poster_path}`}
                                                                        alt={rec.name}
                                                                        className="rec-poster"
                                                                    />
                                                                ) : (
                                                                    <div className="rec-poster-placeholder">
                                                                        {rec.name?.[0]}
                                                                    </div>
                                                                )}
                                                                <div className="rec-overlay">
                                                                    <span className="rec-rating">★ {rec.vote_average?.toFixed(1)}</span>
                                                                </div>
                                                            </div>
                                                            <div className="rec-info">
                                                                <p className="rec-title">{rec.name || rec.title}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="no-reviews" style={{ opacity: 0.5 }}>No matches found.</p>
                                            )}
                                        </section>
                                    );
                                })()}
                            </div>

                            <aside className="details-sidebar">
                                <section className="sidebar-section quick-actions">
                                    <button
                                        className={`action-btn-lore ${isLogged ? 'active-logged' : ''}`}
                                        onClick={() => handleActivityToggle('logged')}
                                    >
                                        {isLogged ? <Check size={20} /> : <Eye size={20} />}
                                        <span>{isLogged ? 'Logged' : 'Log Series'}</span>
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
                                    <span className="detail-value">{series.status}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Seasons</span>
                                    <span className="detail-value">{series.number_of_seasons}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Episodes</span>
                                    <span className="detail-value">{series.number_of_episodes}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Networks</span>
                                    <div className="languages-list">
                                        {series.networks?.map(net => (
                                            <span key={net.id} className="detail-value">{net.name}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Languages</span>
                                    <div className="languages-list">
                                        {series.spoken_languages?.map(lang => (
                                            <span key={lang.iso_639_1} className="detail-value">{lang.english_name}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Genres</span>
                                    <div className="genres-list">
                                        {series.genres?.map(genre => (
                                            <span key={genre.id} className="genre-tag">{genre.name}</span>
                                        ))}
                                    </div>
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
                                <h2>Log Webseries</h2>
                                <p className="modal-subtitle">Add to your series diary</p>
                            </div>
                            <button className="close-log-modal" onClick={() => setShowLogModal(false)}>
                                <X size={24} />
                            </button>
                        </div>

                        <div className="log-modal-body">
                            <div className="log-movie-info">
                                <img
                                    src={`https://image.tmdb.org/t/p/w200${series.poster_path}`}
                                    className="modal-movie-poster"
                                    alt={series.name}
                                />
                                <div className="modal-movie-details">
                                    <h3>{series.name}</h3>
                                    <p>{series.first_air_date ? new Date(series.first_air_date).getFullYear() : 'N/A'}</p>
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
                                <h4>ANY THOUGHTS? (OPTIONAL)</h4>
                                <textarea
                                    className="modal-review-textarea"
                                    placeholder="Tell the world about the lore..."
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

export default WebSeriesDetails;
