import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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
        <NavLink to="/home" style={{ textDecoration: 'none' }} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Popcorn size={20} />
          <span>Home</span>
        </NavLink>

        <NavLink to="/community" style={{ textDecoration: 'none' }} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <HeartHandshake size={20} />
          <span>Communities</span>
        </NavLink>

        <NavLink to="/notification" style={{ textDecoration: 'none' }} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Bell size={20} />
          <span>Notifications</span>
        </NavLink>

        <NavLink to="/profile" style={{ textDecoration: 'none' }} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <User size={20} />
          <span>Profile</span>
        </NavLink>

        <NavLink to="/settings" style={{ textDecoration: 'none' }} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>
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
