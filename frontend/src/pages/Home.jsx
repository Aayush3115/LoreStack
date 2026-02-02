import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, LogOut, Settings, User, Bell, Search, Sparkles,Popcorn, Clapperboard, HeartHandshake } from 'lucide-react';
import '../styles/home.css'

const Home = () => {
    const navigate = useNavigate();
    const [trendingMovies, setTrendingMovies] = useState([]);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/login');
    };

    // 🚀 FETCH TRENDING MOVIES HERE
    useEffect(() => {
        const fetchTrending = async () => {
            try {
                // 👉 Replace this with YOUR Django URL
                const response = await fetch("YOUR_DJANGO_BACKEND_URL/api/trending/");
                const data = await response.json();
                setTrendingMovies(data); 
            } catch (error) {
                console.error("Failed to fetch trending movies:", error);
            }
        };

        fetchTrending();
    }, []);

    return (
        <div className="home-container">

            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <Clapperboard size={18} color="white" />
                    </div>
                    <span className="sidebar-brand">LoreStack</span>
                </div>

                <nav className="sidebar-nav">
                    <button className="nav-item active">
                        <Popcorn size={20} />
                        <span>Dashboard</span>
                    </button>
                    <button className="nav-item">
                        <Search size={20} />
                        <span>Explore</span>
                    </button>
                    <button className="nav-item">
                        <HeartHandshake size={20} />
                        <span>Communities</span>
                    </button>
                    <button className="nav-item">
                        <Bell size={20} />
                        <span>Notifications</span>
                    </button>
                    <button className="nav-item">
                        <User size={20} />
                        <span>Profile</span>
                    </button>
                    <button className="nav-item">
                        <Settings size={20} />
                        <span>Settings</span>
                    </button>
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

                {/* ⭐ TRENDING MOVIES SECTION */}
                <section className="dashboard-section">
                    <h2 className="section-title">Trending Movies</h2>

                    <div className="horizontal-scroll">
                        {trendingMovies.length > 0 ? (
                            trendingMovies.map((movie) => (
                                <div className="movie-card" key={movie.id}>
                                    <img
                                        src={movie.poster_url}
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
                </section>

            </main>
        </div>
    );
};

export default Home;
