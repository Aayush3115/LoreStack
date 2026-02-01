import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, LogOut, Settings, User, Bell, Search, Sparkles,Popcorn, Clapperboard, HeartHandshake } from 'lucide-react';
import '../styles/home.css'

const Home = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/login');
    };


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
            </main>

           
        </div>
    );
};

export default Home;