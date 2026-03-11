import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Styles/Home.css'
import Sidebar from '../Components/Sidebar/Sidebar';
import { Search, Loader2 } from 'lucide-react';


const Home = () => {
    const navigate = useNavigate();
    const [trendingMovies, setTrendingMovies] = useState([]);
    const [trendingTV, setTrendingTV] = useState([]);
    const [trendingAnime, setTrendingAnime] = useState([]);
    const [userData, setUserData] = useState(null);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const movieScrollRef = useRef(null);
    const tvScrollRef = useRef(null);
    const animeScrollRef = useRef(null);
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
            setIsLoading(true);
            try {
                const [movieRes, tvRes, animeRes] = await Promise.all([
                    fetch("http://localhost:8000/api/movies/trending-movies/"),
                    fetch("http://localhost:8000/api/movies/trending-tv/"),
                    fetch("http://localhost:8000/api/movies/trending-anime/")
                ]);

                const movieData = await movieRes.json();
                const tvData = await tvRes.json();
                const animeData = await animeRes.json();

                if (movieData.status_code === 200) {
                    setTrendingMovies(movieData.data.results);
                }

                if (tvData.status_code === 200) {
                    setTrendingTV(tvData.data.results);
                }

                if (animeData.status_code === 200) {
                    setTrendingAnime(animeData.data);
                }
            } catch (error) {
                setError("Could not connect to the server.");
                console.error("Failed to fetch trending content:", error);
            } finally {
                setIsLoading(false);
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

    const startDrag = (e, ref) => {
        isDragging.current = true;
        hasMoved.current = false;
        startX.current = e.pageX - ref.current.offsetLeft;
        scrollLeft.current = ref.current.scrollLeft;
        ref.current.classList.add('dragging');
    };

    const stopDrag = (ref) => {
        isDragging.current = false;
        if (ref.current) ref.current.classList.remove('dragging');
    };

    const onDrag = (e, ref) => {
        if (!isDragging.current) return;

        const x = e.pageX - ref.current.offsetLeft;
        const walk = (x - startX.current) * 2;

        if (Math.abs(x - startX.current) > 5) {
            hasMoved.current = true;
            e.preventDefault();
            ref.current.scrollLeft = scrollLeft.current - walk;
        }
    };

    const handleMovieClick = (movieId) => {
        if (!hasMoved.current) {
            navigate(`/movie/${movieId}`);
        }
    };

    const handleTVClick = (tvId) => {
        if (!hasMoved.current) {
            console.log("TV clicked:", tvId);
        }
    };

    return (
        <div className="home-container">
            <Sidebar />


            {/* Main Content */}
            <main className="main-content" style={{ marginTop: "0px", paddingTop: "0px"}}>
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
                                    searchResults.map(item => (
                                        <div
                                            key={`${item.media_type}-${item.id}`}
                                            className="search-result-item"
                                            onClick={() => {
                                                if (item.media_type === "movie") {
                                                    navigate(`/movie/${item.id}`);
                                                } else {
                                                    console.log(`${item.media_type} clicked:`, item.id);
                                                }
                                                setShowResults(false);
                                                setSearchQuery("");
                                            }}
                                        >
                                            <img
                                                src={item.poster_path
                                                    ? (item.poster_path.startsWith('http')
                                                        ? item.poster_path
                                                        : `https://image.tmdb.org/t/p/w92${item.poster_path}`)
                                                    : 'https://via.placeholder.com/45x68?text=No+Logo'}
                                                alt={item.title || item.name}
                                            />
                                            <div className="search-result-info">
                                                <div className="result-top-row">
                                                    <span className="result-title">{item.title || item.name}</span>
                                                    <span className="result-type-badge">{item.media_type}</span>
                                                </div>
                                                <span className="result-year">{(item.release_date || item.first_air_date)?.split('-')[0] || 'N/A'}</span>
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

                {/* Trending Movies Section */}
                <section className="dashboard-section">
                    {!isLoading && <h2 className="section-title">Trending Movies</h2>}

                    <div className="trending-wrapper-edge">
                        {!error && trendingMovies.length > 0 && (
                            <button
                                className="scroll-btn left"
                                onClick={() => movieScrollRef.current.scrollBy({ left: -300, behavior: 'smooth' })}
                            >
                                ‹
                            </button>
                        )}

                        <div
                            className="horizontal-scroll"
                            ref={movieScrollRef}
                            onMouseDown={(e) => startDrag(e, movieScrollRef)}
                            onMouseLeave={() => stopDrag(movieScrollRef)}
                            onMouseUp={() => stopDrag(movieScrollRef)}
                            onMouseMove={(e) => onDrag(e, movieScrollRef)}
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

                        {!error && trendingMovies.length > 0 && (
                            <button
                                className="scroll-btn right"
                                onClick={() => movieScrollRef.current.scrollBy({ left: 300, behavior: 'smooth' })}
                            >
                                ›
                            </button>
                        )}
                    </div>
                </section>

                {/* Trending Webseries Section */}
                <section className="dashboard-section">
                    {!isLoading && <h2 className="section-title">Trending Web-Series</h2>}

                    <div className="trending-wrapper-edge">
                        {!error && trendingTV.length > 0 && (
                            <button
                                className="scroll-btn left"
                                onClick={() => tvScrollRef.current.scrollBy({ left: -300, behavior: 'smooth' })}
                            >
                                ‹
                            </button>
                        )}

                        <div
                            className="horizontal-scroll"
                            ref={tvScrollRef}
                            onMouseDown={(e) => startDrag(e, tvScrollRef)}
                            onMouseLeave={() => stopDrag(tvScrollRef)}
                            onMouseUp={() => stopDrag(tvScrollRef)}
                            onMouseMove={(e) => onDrag(e, tvScrollRef)}
                        >
                            {error ? (
                                <p className="error-text">{error}</p>
                            ) : trendingTV.length > 0 ? (
                                trendingTV.map((show) => (
                                    <div
                                        className="movie-card"
                                        key={show.id}
                                        onClick={() => handleTVClick(show.id)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <img
                                            src={`https://image.tmdb.org/t/p/w500${show.poster_path}`}
                                            alt={show.name}
                                            className="movie-poster"
                                        />
                                        <p className="movie-title">{show.name}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="loading-container">
                                    <div className="loading-spinner"></div>
                                </div>
                            )}
                        </div>

                        {!error && trendingTV.length > 0 && (
                            <button
                                className="scroll-btn right"
                                onClick={() => tvScrollRef.current.scrollBy({ left: 300, behavior: 'smooth' })}
                            >
                                ›
                            </button>
                        )}
                    </div>
                </section>

                {/* Trending Anime Section */}
                <section className="dashboard-section">
                    {!isLoading && <h2 className="section-title">Trending Anime</h2>}

                    <div className="trending-wrapper-edge">
                        {!error && trendingAnime.length > 0 && (
                            <button
                                className="scroll-btn left"
                                onClick={() => animeScrollRef.current.scrollBy({ left: -300, behavior: 'smooth' })}
                            >
                                ‹
                            </button>
                        )}

                        <div
                            className="horizontal-scroll"
                            ref={animeScrollRef}
                            onMouseDown={(e) => startDrag(e, animeScrollRef)}
                            onMouseLeave={() => stopDrag(animeScrollRef)}
                            onMouseUp={() => stopDrag(animeScrollRef)}
                            onMouseMove={(e) => onDrag(e, animeScrollRef)}
                        >
                            {error ? (
                                <p className="error-text">{error}</p>
                            ) : trendingAnime.length > 0 ? (
                                trendingAnime.map((anime) => (
                                    <div
                                        className="movie-card"
                                        key={anime.id}
                                        onClick={() => console.log("Anime clicked:", anime.id)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <img
                                            src={anime.coverImage.extraLarge || anime.coverImage.large}
                                            alt={anime.title.english || anime.title.romaji}
                                            className="movie-poster"
                                        />
                                        <p className="movie-title">{anime.title.english || anime.title.romaji}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="loading-container">
                                    <div className="loading-spinner"></div>
                                </div>
                            )}
                        </div>

                        {!error && trendingAnime.length > 0 && (
                            <button
                                className="scroll-btn right"
                                onClick={() => animeScrollRef.current.scrollBy({ left: 300, behavior: 'smooth' })}
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