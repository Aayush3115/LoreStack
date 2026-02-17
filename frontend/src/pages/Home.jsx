import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Styles/Home.css'
import Sidebar from '../Components/Sidebar/Sidebar';


const Home = () => {
    const navigate = useNavigate();
    const [trendingMovies, setTrendingMovies] = useState([]);
    const [userData, setUserData] = useState(null);
    const [error, setError] = useState(null);

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

    const startDrag = (e) => {
        isDragging.current = true;
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
        e.preventDefault();
        const x = e.pageX - scrollRef.current.offsetLeft;
        const walk = (x - startX.current) * 2;
        scrollRef.current.scrollLeft = scrollLeft.current - walk;
    };

    return (
        <div className="home-container">
            <Sidebar />


            {/* Main Content */}
            <main className="main-content">
                <header className="top-header">
                    <h2 className="page-title">Home</h2>
                    <div className="header-actions">
                        <div className="space-badge">{userData ? `${userData.username}'s Space` : 'Personal Space'}</div>
                        <div className="user-avatar-container">
                            {userData?.profile_picture ? (
                                <img src={userData.profile_picture} alt="Avatar" className="user-avatar-img" />
                            ) : (
                                <div className="user-avatar-placeholder">
                                    {userData?.username?.[0]?.toUpperCase() || 'U'}
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Trending Movies Section with Scroll Buttons */}
                <section className="dashboard-section">
                    <h2 className="section-title">Trending Movies</h2>

                    <div className="trending-wrapper-edge">
                        {/* Left Scroll Button */}
                        <button
                            className="scroll-btn left"
                            onClick={() => scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' })}
                        >
                            ‹
                        </button>

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
                                    <div className="movie-card" key={movie.id}>
                                        <img
                                            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                            alt={movie.title}
                                            className="movie-poster"
                                        />
                                        <p className="movie-title">{movie.title}</p>
                                    </div>
                                ))
                            ) : (
                                <p>Loading trending movies...</p>
                            )}
                        </div>

                        {/* RIGHT BUTTON */}
                        <button
                            className="scroll-btn right"
                            onClick={() => scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' })}
                        >
                            ›
                        </button>
                    </div>
                </section>

            </main>
        </div>
    );
};
export default Home;