import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Settings, User, Bell, HeartHandshake, Popcorn, ChevronLeft, ChevronRight, Sun, Moon, Home } from 'lucide-react';
import './Sidebar.css';
import { useSidebar } from '../../Context/SidebarContext';
import { useTheme } from '../../Context/ThemeContext';
import logo from '../../assets/logo_no_bg.png';
import logoNoName from '../../assets/logo_no_bg.png';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isSidebarOpen, toggleSidebar } = useSidebar();
    const { theme, toggleTheme } = useTheme();

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/login');
    };

    const isActive = (path) => {
        return location.pathname.toLowerCase() === path.toLowerCase();
    };

    return (
        <aside className={`sidebar ${!isSidebarOpen ? 'collapsed' : ''}`}>
            <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
                {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <img src={isSidebarOpen ? logo : logoNoName} alt="LoreStack Logo" className="logo-img" />
                </div>
            </div>
            {isSidebarOpen && (
                <div className="sidebar-brand-name">
                    LoreStack
                </div>
            )}
            <nav className="sidebar-nav">
                <Link to='/home' style={{ textDecoration: 'none' }}>
                    <button className={`nav-item ${isActive('/home') ? 'active' : ''}`}>
                        <Home size={20} />
                        <span>Home</span>
                    </button>
                </Link>
                <Link to='/explore' style={{ textDecoration: 'none' }}>
                    <button className={`nav-item ${isActive('/explore') ? 'active' : ''}`}>
                        <Popcorn size={20} />
                        <span>Explore</span>
                    </button>
                </Link>
                <Link to='/loreroom' style={{ textDecoration: 'none' }}>
                    <button className={`nav-item ${isActive('/loreroom') ? 'active' : ''}`}>
                        <HeartHandshake size={20} />
                        <span>LoreRooms</span>
                    </button>
                </Link>
                {/* <Link to='/Notification' style={{ textDecoration: 'none' }}>
                    <button className={`nav-item ${isActive('/Notification') ? 'active' : ''}`}>
                        <Bell size={20} />
                        <span>Notifications</span>
                    </button>
                </Link> */}
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
                {/* <button className="theme-toggle-btn" onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </button> */}
                <button className="logout-btn" onClick={handleLogout}>
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
