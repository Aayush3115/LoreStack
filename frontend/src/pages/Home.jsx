import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, LogOut, Settings, User, Bell, Search, Sparkles } from 'lucide-react';

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
<Layout size={18} color="white" />
</div>
<span className="sidebar-brand">LoreStack</span>
</div>

<nav className="sidebar-nav">
<button className="nav-item active">
<Layout size={20} />
<span>Dashboard</span>
</button>
<button className="nav-item">
<Search size={20} />
<span>Explore</span>
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
<h2 className="page-title">Dashboard</h2>
<div className="header-actions">
<div className="space-badge">Personal Space</div>
<div className="user-avatar"></div>
</div>
</header>

<section className="dashboard-section">
<div className="stats-grid">
<div className="stat-card">
<p className="stat-label">Total Stories</p>
<div className="stat-value-row">
<h3 className="stat-value">12</h3>
<span className="stat-trend">+2</span>
</div>
</div>
<div className="stat-card">
<p className="stat-label">Words Written</p>
<div className="stat-value-row">
<h3 className="stat-value">45.2k</h3>
<span className="stat-trend">+1.2k</span>
</div>
</div>
<div className="stat-card">
<p className="stat-label">Productivity</p>
<div className="stat-value-row">
<h3 className="stat-value">94%</h3>
<span className="stat-trend">+5%</span>
</div>
</div>
</div>

<div className="welcome-card">
<div className="welcome-icon">
<Sparkles size={32} color="#818cf8" />
</div>
<h3 className="welcome-title">Welcome to LoreStack</h3>
<p className="welcome-text">
This is where your journey begins. Start by creating your first story or explore what's trending.
</p>
<button className="create-btn">Create New Story</button>
</div>
</section>
</main>

<style>{`
.home-container {
min-height: 100vh;
background-color: #0a0a0a;
color: white;
display: flex;
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

.sidebar {
width: 260px;
border-right: 1px solid rgba(255, 255, 255, 0.05);
background: rgba(0, 0, 0, 0.3);
backdrop-filter: blur(24px);
display: flex;
flex-direction: column;
}

.sidebar-header {
padding: 24px;
display: flex;
align-items: center;
gap: 12px;
}

.sidebar-logo {
width: 32px;
height: 32px;
background: linear-gradient(135deg, #6366f1, #a855f7);
border-radius: 8px;
display: flex;
align-items: center;
justify-content: center;
}

.sidebar-brand {
font-weight: 700;
font-size: 18px;
}

.sidebar-nav {
flex: 1;
padding: 16px;
display: flex;
flex-direction: column;
gap: 8px;
}

.nav-item {
display: flex;
align-items: center;
gap: 12px;
padding: 12px 16px;
border-radius: 12px;
border: none;
background: transparent;
color: #64748b;
font-weight: 500;
font-size: 15px;
cursor: pointer;
transition: all 0.2s;
text-align: left;
}

.nav-item:hover {
color: white;
background: rgba(255, 255, 255, 0.05);
}

.nav-item.active {
color: white;
background: rgba(255, 255, 255, 0.1);
}

.sidebar-footer {
padding: 16px;
border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.logout-btn {
width: 100%;
display: flex;
align-items: center;
gap: 12px;
padding: 12px 16px;
border-radius: 12px;
border: none;
background: transparent;
color: #f87171;
font-weight: 500;
cursor: pointer;
transition: all 0.2s;
}

.logout-btn:hover {
background: rgba(248, 113, 113, 0.1);
}

.main-content {
flex: 1;
display: flex;
flex-direction: column;
}

.top-header {
height: 80px;
border-bottom: 1px solid rgba(255, 255, 255, 0.05);
display: flex;
align-items: center;
justify-content: space-between;
padding: 0 32px;
background: rgba(0, 0, 0, 0.2);
backdrop-filter: blur(12px);
}

.page-title {
font-size: 20px;
font-weight: 700;
}

.header-actions {
display: flex;
align-items: center;
gap: 16px;
}

.space-badge {
padding: 6px 16px;
background: rgba(255, 255, 255, 0.05);
border: 1px solid rgba(255, 255, 255, 0.1);
border-radius: 99px;
font-size: 13px;
font-weight: 500;
color: #94a3b8;
}

.user-avatar {
width: 40px;
height: 40px;
border-radius: 50%;
background: linear-gradient(to right, #6366f1, #a855f7);
border: 1px solid rgba(255, 255, 255, 0.2);
}

.dashboard-section {
padding: 32px;
}

.stats-grid {
display: grid;
grid-template-columns: repeat(3, 1fr);
gap: 24px;
margin-bottom: 32px;
}

.stat-card {
background: rgba(255, 255, 255, 0.03);
border: 1px solid rgba(255, 255, 255, 0.05);
padding: 24px;
border-radius: 24px;
}

.stat-label {
color: #64748b;
font-size: 14px;
font-weight: 500;
margin-bottom: 8px;
}

.stat-value-row {
display: flex;
align-items: flex-end;
justify-content: space-between;
}

.stat-value {
font-size: 28px;
font-weight: 700;
}

.stat-trend {
font-size: 13px;
font-weight: 600;
color: #4ade80;
background: rgba(74, 222, 128, 0.1);
padding: 2px 8px;
border-radius: 6px;
}

.welcome-card {
background: rgba(255, 255, 255, 0.02);
border: 1px solid rgba(255, 255, 255, 0.05);
padding: 64px;
border-radius: 32px;
display: flex;
flex-direction: column;
align-items: center;
text-align: center;
}

.welcome-icon {
width: 64px;
height: 64px;
background: rgba(129, 140, 248, 0.1);
border-radius: 20px;
display: flex;
align-items: center;
justify-content: center;
margin-bottom: 24px;
}

.welcome-title {
font-size: 24px;
font-weight: 700;
margin-bottom: 8px;
}

.welcome-text {
color: #64748b;
max-width: 400px;
line-height: 1.6;
margin-bottom: 32px;
}

.create-btn {
background: #6366f1;
color: white;
padding: 12px 28px;
border-radius: 12px;
font-weight: 700;
border: none;
cursor: pointer;
transition: all 0.2s;
}

.create-btn:hover {
background: #4f46e5;
transform: translateY(-2px);
}

@media (max-width: 1024px) {
.stats-grid { grid-template-columns: 1fr; }
.sidebar { width: 80px; }
.sidebar-brand, .nav-item span, .logout-btn span { display: none; }
.sidebar-header, .nav-item, .logout-btn { justify-content: center; padding: 16px; }
}
`}</style>
</div>
);
};