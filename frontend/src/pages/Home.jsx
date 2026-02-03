import React, { useEffect, useState , useRef} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout, LogOut, Settings, User, Bell, Search, Sparkles, Popcorn, Clapperboard, HeartHandshake } from 'lucide-react';
import '../Styles/Home.css'
import logo from '../assets/logo.png';



const Home = () => {
    const navigate = useNavigate();
    const [trendingMovies, setTrendingMovies] = useState([]);
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

            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <img src={logo} alt="LoreStack Logo" className="logo-img" />
                    </div>
                </div>
                <nav className="sidebar-nav">
                    <button className="nav-item active">
                        <Popcorn size={20} />
                        <span>Home</span>
                    </button>
                    <Link to='/Community' style={{ textDecoration: 'none' }}><button to='/Community' className="nav-item">
                        <HeartHandshake size={20} />
                        <span>Communities</span>
                    </button></Link>
                    <Link to='/Notification' style={{ textDecoration: 'none' }}><button className="nav-item">
                        <Bell size={20} />
                        <span>Notifications</span>
                    </button></Link>
                    <Link to='/Profile' style={{ textDecoration: 'none' }}> <button className="nav-item">
                        <User size={20} />
                        <span>Profile</span>
                    </button></Link>
                    <Link to='/Settings' style={{ textDecoration: 'none' }}><button className="nav-item">
                        <Settings size={20} />
                        <span>Settings</span>
                    </button></Link>




                </nav>

                <div className="sidebar-footer">
                    <button className="logout-btn" onClick={handleLogout}>
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <header className="top-header">
                    <h2 className="page-title">Home</h2>
                    <div className="header-actions">
                        <div className="space-badge">Personal Space</div>
                        <div className="user-avatar"></div>
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
