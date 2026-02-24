import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Styles/Home.css'
import Sidebar from '../Components/Sidebar/Sidebar';
import { Search, Loader2 } from 'lucide-react';


const Home = () => {
    const navigate = useNavigate();
    const [trendingMovies, setTrendingMovies] = useState([]);
    const [userData, setUserData] = useState(null);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);

    const scrollRef = useRef(null);
    const isDragging = useRef(false);
    const startX = useRef(0);
    const scrollLeft = useRef(0);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/login');
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

        const fetchTrending = async () => {
            try {
                const response = await fetch("http://localhost:8000/api/movies/trending/");
                const data = await response.json();
                if (data.status_code === 200 && data.data && data.data.results) {
                    setTrendingMovies(data.data.results);
                } else {
                    setError("Failed to load trending movies.");
                    console.error("Invalid data format from backend:", data);
                }
            } catch (error) {
                setError("Could not connect to the server.");
                console.error("Failed to fetch trending movies:", error);
            }
        };

        fetchUserData();
        fetchTrending();
    }, []);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.trim()) {
                setIsSearching(true);
                setShowResults(true);
                try {
                    const response = await fetch(`http://localhost:8000/api/movies/search/?query=${encodeURIComponent(searchQuery)}`);
                    const data = await response.json();
                    if (data.status_code === 200) {
                        setSearchResults(data.data.results || []);
                    }
                } catch (error) {
                    console.error("Search failed:", error);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
                setShowResults(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const hasMoved = useRef(false);

    const startDrag = (e) => {
        isDragging.current = true;
        hasMoved.current = false;
        startX.current = e.pageX - scrollRef.current.offsetLeft;
        scrollLeft.current = scrollRef.current.scrollLeft;
        scrollRef.current.classList.add('dragging');
    };

    const stopDrag = () => {
        isDragging.current = false;
        scrollRef.current.classList.remove('dragging');
    };

    const onDrag = (e) => {
        if (!isDragging.current) return;

        const x = e.pageX - scrollRef.current.offsetLeft;
        const walk = (x - startX.current) * 2;

        if (Math.abs(x - startX.current) > 5) {
            hasMoved.current = true;
            e.preventDefault();
            scrollRef.current.scrollLeft = scrollLeft.current - walk;
        }
    };

    const handleMovieClick = (movieId) => {
        if (!hasMoved.current) {
            navigate(`/movie/${movieId}`);
        }
    };

    return (
        <div className="home-container">
            <Sidebar />


            {/* Main Content */}
            <main className="main-content">
                <header className="top-header">
                    <div className="header-left">
                        <h2 className="page-title">Home</h2>
                    </div>

                    <div className="search-bar-container">
                        <div className="search-input-wrapper">
                            <Search className="search-icon" size={18} />
                            <input
                                type="text"
                                placeholder="Search for movies and series"
                                className="universal-search-input"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setShowResults(true)}
                            />
                            {isSearching && <Loader2 className="searching-spinner" size={16} />}
                        </div>

                        {showResults && searchQuery.trim() && (
                            <div className="search-results-dropdown">
                                {searchResults.length > 0 ? (
                                    searchResults.map(movie => (
                                        <div
                                            key={movie.id}
                                            className="search-result-item"
                                            onClick={() => {
                                                navigate(`/movie/${movie.id}`);
                                                setShowResults(false);
                                                setSearchQuery("");
                                            }}
                                        >
                                            <img
                                                src={movie.poster_path ? `https://image.tmdb.org/t/p/w92${movie.poster_path}` : 'https://via.placeholder.com/45x68?text=No+Logo'}
                                                alt={movie.title}
                                            />
                                            <div className="search-result-info">
                                                <span className="result-title">{movie.title}</span>
                                                <span className="result-year">{movie.release_date?.split('-')[0]}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : !isSearching && (
                                    <div className="no-results">No "lore" found for this query.</div>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="header-actions">
                        <div className="space-badge">{userData ? `${userData.username}'s Space` : 'Personal Space'}</div>
                        <div className="user-avatar-container">
                            {userData && (
                                <img src={userData.profile_picture} alt="Avatar" className="user-avatar-img" />
                            )}
                        </div>
                    </div>
                </header>

                {/* Trending Movies Section with Scroll Buttons */}
                <section className="dashboard-section">
                    <h2 className="section-title">Trending Movies</h2>

                    <div className="trending-wrapper-edge">
                        {/* Left Scroll Button */}
                        {!error && trendingMovies.length > 0 && (
                            <button
                                className="scroll-btn left"
                                onClick={() => scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' })}
                            >
                                ‹
                            </button>
                        )}

                        {/* Horizontal Scroll Container */}
                        <div
                            className="horizontal-scroll"
                            ref={scrollRef}
                            onMouseDown={startDrag}
                            onMouseLeave={stopDrag}
                            onMouseUp={stopDrag}
                            onMouseMove={onDrag}
                        >
                            {error ? (
                                <p className="error-text">{error}</p>
                            ) : trendingMovies.length > 0 ? (
                                trendingMovies.map((movie) => (
                                    <div
                                        className="movie-card"
                                        key={movie.id}
                                        onClick={() => handleMovieClick(movie.id)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <img
                                            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                            alt={movie.title}
                                            className="movie-poster"
                                        />
                                        <p className="movie-title">{movie.title}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="loading-container">
                                    <div className="loading-spinner"></div>
                                </div>
                            )}
                        </div>

                        {/* RIGHT BUTTON */}
                        {!error && trendingMovies.length > 0 && (
                            <button
                                className="scroll-btn right"
                                onClick={() => scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' })}
                            >
                                ›
                            </button>
                        )}
                    </div>
                </section>

            </main>
        </div>
    );
};
export default Home;