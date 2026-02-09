import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Settings, User, Bell, HeartHandshake, Popcorn } from 'lucide-react';
import './Sidebar.css';
import logo from '../../assets/logo.png';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/login');
    };

    const isActive = (path) => {
        return location.pathname.toLowerCase() === path.toLowerCase();
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <img src={logo} alt="LoreStack Logo" className="logo-img" />
                </div>
            </div>
            <nav className="sidebar-nav">
                <Link to='/home' style={{ textDecoration: 'none' }}>
                    <button className={`nav-item ${isActive('/home') ? 'active' : ''}`}>
                        <Popcorn size={20} />
                        <span>Home</span>
                    </button>
                </Link>
                <Link to='/Community' style={{ textDecoration: 'none' }}>
                    <button className={`nav-item ${isActive('/Community') ? 'active' : ''}`}>
                        <HeartHandshake size={20} />
                        <span>Communities</span>
                    </button>
                </Link>
                <Link to='/Notification' style={{ textDecoration: 'none' }}>
                    <button className={`nav-item ${isActive('/Notification') ? 'active' : ''}`}>
                        <Bell size={20} />
                        <span>Notifications</span>
                    </button>
                </Link>
                <Link to='/Profile' style={{ textDecoration: 'none' }}>
                    <button className={`nav-item ${isActive('/Profile') ? 'active' : ''}`}>
                        <User size={20} />
                        <span>Profile</span>
                    </button>
                </Link>
                <Link to='/Settings' style={{ textDecoration: 'none' }}>
                    <button className={`nav-item ${isActive('/Settings') ? 'active' : ''}`}>
                        <Settings size={20} />
                        <span>Settings</span>
                    </button>
                </Link>
            </nav>

            <div className="sidebar-footer">
                <button className="logout-btn" onClick={handleLogout}>
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
