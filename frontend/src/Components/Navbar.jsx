import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Settings, User, Bell, Popcorn, HeartHandshake } from 'lucide-react';
import '../Styles/Navbar.css';
import logo from '../assets/logo.png';

const Navbar = () => {
const navigate = useNavigate();


const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
};

return (
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

            <Link to='/Community' style={{ textDecoration: 'none' }}>
                <button className="nav-item">
                    <HeartHandshake size={20} />
                    <span>Communities</span>
                </button>
            </Link>

            <Link to='/Notification' style={{ textDecoration: 'none' }}>
                <button className="nav-item">
                    <Bell size={20} />
                    <span>Notifications</span>
                </button>
            </Link>

            <Link to='/Profile' style={{ textDecoration: 'none' }}>
                <button className="nav-item">
                    <User size={20} />
                    <span>Profile</span>
                </button>
            </Link>

            <Link to='/Settings' style={{ textDecoration: 'none' }}>
                <button className="nav-item">
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

export default Navbar;
