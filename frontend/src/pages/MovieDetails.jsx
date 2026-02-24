import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../Components/Sidebar/Sidebar';
import '../Styles/MovieDetails.css';

const MovieDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [movie, setMovie] = useState(null);
    const [userData, setUserData] = useState(null);
    const [userRating, setUserRating] = useState(null);
    const [userReview, setUserReview] = useState("");
    const [allReviews, setAllReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isEditingReview, setIsEditingReview] = useState(true);

    const fetchAllReviews = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`http://localhost:8000/api/movies/${id}/rating/?all=true`, {
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

                const response = await fetch("http://localhost:8000/api/auth/profile/", {
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

        const fetchMovieDetails = async () => {
            try {
                const response = await fetch(`http://localhost:8000/api/movies/${id}/`);
                const data = await response.json();

                if (data.status_code === 200) {
                    setMovie(data.data);
                } else {
                    setError('Failed to fetch movie details');
                }
            } catch (err) {
                console.error('Error fetching movie details:', err);
                setError('Could not connect to the server');
            } finally {
                setLoading(false);
            }
        };

        const fetchUserRating = async () => {
            try {
                const token = localStorage.getItem('access_token');
                if (!token) return;

                const response = await fetch(`http://localhost:8000/api/movies/${id}/rating/`, {
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

        fetchUserData();
        fetchMovieDetails();
        fetchUserRating();
        fetchAllReviews();
    }, [id]);

    const handleRate = async (ratingValue) => {
        setIsSaving(true);
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                alert("Please login to rate movies!");
                setIsSaving(false);
                return;
            }

            const response = await fetch(`http://localhost:8000/api/movies/${id}/rating/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    rating: ratingValue || userRating,
                    review: userReview
                })
            });

            if (response.ok) {
                const data = await response.json();
                setUserRating(data.rating);
                setUserReview(data.review || "");
                setIsEditingReview(false);
                fetchAllReviews(); // Refresh all reviews
            } else {
                console.error("Failed to submit rating");
            }
        } catch (error) {
            console.error("Error submitting rating:", error);
        } finally {
            setIsSaving(false);
        }
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
                    <button className="back-btn-pill" onClick={() => navigate('/home')}>
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
                        <p>Fetching movie details...</p>
                    </div>
                ) : error || !movie ? (
                    <div className="error-message">
                        <h2>Oops! Item not found.</h2>
                        <p>{error || 'Something went wrong while fetching the details.'}</p>
                    </div>
                ) : (
                    <div className="details-scroll-container">
                        <div className="movie-hero">
                            <img
                                src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
                                alt={movie.title}
                                className="movie-backdrop"
                            />
                            <div className="hero-overlay">
                                <img
                                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                    alt={movie.title}
                                    className="movie-poster-large"
                                />
                                <div className="hero-text">
                                    <h1>{movie.title}</h1>
                                    <div className="movie-meta">
                                        <span>{new Date(movie.release_date).getFullYear()}</span>
                                        <span>•</span>
                                        <span>{movie.runtime} min</span>
                                        <span>•</span>
                                        <span className="rating-badge">★ {movie.vote_average.toFixed(1)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="movie-main-info">
                            <div className="info-left-column">
                                <section className="info-section">
                                    <h3>Overview</h3>
                                    <p className="overview-text">{movie.overview}</p>
                                </section>

                                {movie.credits?.cast?.length > 0 && (
                                    <section className="cast-section">
                                        <h3>Top Cast</h3>
                                        <div className="cast-grid">
                                            {movie.credits.cast.slice(0, 6).map(person => (
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
                                    </section>
                                )}

                                <section className="community-reviews-section">
                                    <div className="section-header-row">
                                        <h3>Community Reviews</h3>
                                        {userRating && !isEditingReview && (
                                            <button
                                                className="edit-review-btn-pill"
                                                onClick={() => setIsEditingReview(true)}
                                            >
                                                Edit Your Review
                                            </button>
                                        )}
                                    </div>

                                    {/* User's active writing area */}
                                    {isEditingReview && userRating && (
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
                                                onClick={() => handleRate(null)}
                                                disabled={isSaving}
                                            >
                                                {isSaving ? "Posting..." : "Post Review"}
                                            </button>
                                        </div>
                                    )}

                                    <div className="reviews-list">
                                        {allReviews.length > 0 ? (
                                            allReviews.map((rev) => (
                                                <div key={rev.id} className="review-card-lore">
                                                    <div className="review-user-info">
                                                        <div className="review-avatar">
                                                            <img src={rev.profile_picture} alt={rev.username} />
                                                        </div>
                                                        <div className="review-user-meta">
                                                            <span className="review-username">
                                                                {rev.username} {rev.username === userData?.username && "(You)"}
                                                            </span>
                                                            <span className="review-date">
                                                                {new Date(rev.updated_at).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        <div
                                                            className="review-rating-badge"
                                                            style={{ backgroundColor: getColorByRating(rev.rating) }}
                                                        >
                                                            {rev.rating}
                                                        </div>
                                                    </div>
                                                    {rev.review && (
                                                        <div className="review-content-lore">
                                                            <p>{rev.review}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <p className="no-reviews">No reviews yet. Be the first to start the lore!</p>
                                        )}
                                    </div>
                                </section>
                            </div>

                            <aside className="details-sidebar">
                                <div className="rating-section-lore">
                                    <span className="detail-label">Lore Rating</span>
                                    <div className="rating-options-container">
                                        {[
                                            { id: 'skip', label: 'Skip', color: '#ef4444' },
                                            { id: 'timepass', label: 'Timepass', color: '#f59e0b' },
                                            { id: 'goforit', label: 'Go For It', color: '#10b981' },
                                            { id: 'perfection', label: 'Perfection', color: '#6366f1' }
                                        ].map(opt => (
                                            <button
                                                key={opt.id}
                                                className={`lore-rating-btn ${userRating === opt.id ? 'active' : ''}`}
                                                onClick={() => handleRate(opt.id)}
                                                style={{ '--hover-color': opt.color }}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="detail-item">
                                    <span className="detail-label">Status</span>
                                    <span className="detail-value">{movie.status}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Budget</span>
                                    <span className="detail-value">
                                        {movie.budget > 0 ? `$${movie.budget.toLocaleString()}` : 'N/A'}
                                    </span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Revenue</span>
                                    <span className="detail-value">
                                        {movie.revenue > 0 ? `$${movie.revenue.toLocaleString()}` : 'N/A'}
                                    </span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Genres</span>
                                    <div className="genres-list">
                                        {movie.genres.map(genre => (
                                            <span key={genre.id} className="genre-tag">{genre.name}</span>
                                        ))}
                                    </div>
                                </div>
                            </aside>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default MovieDetails;



