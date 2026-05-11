import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Components/Sidebar/Sidebar';
import API, { BACKEND_URL } from '../api/api';
import {
    User,
    Shield,
    Bell,
    Palette,
    Camera,
    Loader2,
    Check,
    ChevronRight,
    Lock,
    Mail,
    Globe,
    Moon,
    Edit3,
    X,
    Search,
    Plus,
    Sun
} from 'lucide-react';
import '../Styles/Explore.css';
import '../Styles/Settings.css';
import { useTheme } from '../Context/ThemeContext';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('general');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(null); // stores field name being saved
    const [editField, setEditField] = useState(null); // stores field name being edited
    const { theme, toggleTheme } = useTheme();

    const [userData, setUserData] = useState({
        username: '',
        first_name: '',
        last_name: '',
        email: '',
        bio: '',
        profile_picture: '',
    });

    // Favorites States
    const [favorites, setFavorites] = useState([]);
    const [favSearchQuery, setFavSearchQuery] = useState("");
    const [favSearchResults, setFavSearchResults] = useState([]);
    const [isSearchingFav, setIsSearchingFav] = useState(false);
    const [showFavResults, setShowFavResults] = useState(false);
    const [showFavModal, setShowFavModal] = useState(false);

    const [tempData, setTempData] = useState({});

    const navigate = useNavigate();

    useEffect(() => {
        fetchUserProfile();
        fetchFavorites();
    }, []);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (favSearchQuery.trim()) {
                setIsSearchingFav(true);
                setShowFavResults(true);
                try {
                    const response = await fetch(`${BACKEND_URL}/api/movies/search/?query=${encodeURIComponent(favSearchQuery)}`);
                    const data = await response.json();
                    if (data.status_code === 200) {
                        setFavSearchResults(data.data.results || []);
                    }
                } catch (error) {
                    console.error("Favorite search failed:", error);
                } finally {
                    setIsSearchingFav(false);
                }
            } else {
                setFavSearchResults([]);
                setShowFavResults(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [favSearchQuery]);

    const fetchFavorites = async () => {
        try {
            const response = await API.get('movies/favorites/');
            setFavorites(response.data);
        } catch (error) {
            console.error("Error fetching favorites:", error);
        }
    };

    const fetchUserProfile = async () => {
        try {
            const response = await API.get('auth/profile/');
            const data = response.data;
            setUserData({
                username: data.username || '',
                first_name: data.first_name || '',
                last_name: data.last_name || '',
                email: data.email || '',
                bio: data.bio || '',
                profile_picture: data.profile_picture || ''
            });
            setTempData({
                username: data.username || '',
                first_name: data.first_name || '',
                last_name: data.last_name || '',
                email: data.email || '',
                bio: data.bio || '',
            });
        } catch (error) {
            console.error("Error fetching profile:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (field) => {
        setEditField(field);
    };

    const handleCancel = () => {
        setEditField(null);
        setTempData({
            username: userData.username,
            first_name: userData.first_name,
            last_name: userData.last_name,
            email: userData.email,
            bio: userData.bio,
        });
    };

    const handleSave = async (field) => {
        setIsSaving(field);
        const data = new FormData();

        if (field === 'name') {
            data.append('first_name', tempData.first_name);
            data.append('last_name', tempData.last_name);
        } else {
            data.append(field, tempData[field]);
        }

        try {
            const response = await API.patch('auth/profile/', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setUserData(prev => ({ ...prev, ...response.data }));
            setEditField(null);
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Failed to update. Please check your inputs.");
        } finally {
            setIsSaving(null);
        }
    };

    const handleAddFavorite = async (item) => {
        if (favorites.length >= 4) {
            alert("You can only have up to 4 favorites.");
            return;
        }

        try {
            const payload = {
                media_id: item.id,
                media_type: item.media_type,
                title: item.title || item.name,
                poster_path: item.poster_path || ''
            };
            const response = await API.post('movies/favorites/', payload);
            setFavorites([...favorites, response.data]);
            setFavSearchQuery("");
            setShowFavResults(false);
            setShowFavModal(false);
        } catch (error) {
            console.error("Error adding favorite:", error);
            const errorMsg = error.response?.data?.non_field_errors?.[0] ||
                error.response?.data?.detail ||
                "Failed to add favorite. It might be already in your list or you reached the limit.";
            alert(errorMsg);
        }
    };

    const handleRemoveFavorite = async (id) => {
        try {
            await API.delete(`movies/favorites/${id}/`);
            setFavorites(favorites.filter(f => f.id !== id));
        } catch (error) {
            console.error("Error removing favorite:", error);
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsSaving('photo');
        const data = new FormData();
        data.append('profile_picture', file);

        try {
            const response = await API.patch('auth/profile/', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setUserData(prev => ({ ...prev, profile_picture: response.data.profile_picture }));
        } catch (error) {
            console.error("Error updating photo:", error);
        } finally {
            setIsSaving(null);
        }
    };

    const renderSettingRow = (label, value, field, isMulti = false) => {
        const isEditing = editField === field;
        const isCurrentlySaving = isSaving === field;

        return (
            <div className="settings-row">
                <div className="row-label">{label}</div>
                {isEditing ? (
                    <div className="row-edit-form">
                        {field === 'name' ? (
                            <>
                                <input
                                    className="row-input"
                                    value={tempData.first_name}
                                    onChange={(e) => setTempData({ ...tempData, first_name: e.target.value })}
                                    placeholder="First Name"
                                />
                                <input
                                    className="row-input"
                                    value={tempData.last_name}
                                    onChange={(e) => setTempData({ ...tempData, last_name: e.target.value })}
                                    placeholder="Last Name"
                                />
                            </>
                        ) : field === 'bio' ? (
                            <textarea
                                className="row-input"
                                value={tempData.bio}
                                onChange={(e) => setTempData({ ...tempData, bio: e.target.value })}
                                style={{ minHeight: '80px' }}
                            />
                        ) : (
                            <input
                                className="row-input"
                                value={tempData[field]}
                                onChange={(e) => setTempData({ ...tempData, [field]: e.target.value })}
                            />
                        )}
                        <div className="action-btns">
                            <button className="btn-cancel-small" onClick={handleCancel}>Cancel</button>
                            <button className="btn-save-small" onClick={() => handleSave(field)}>
                                {isCurrentlySaving ? '...' : 'Save'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="row-value">{value || <span style={{ opacity: 0.3 }}>Not set</span>}</div>
                        <div className="row-action">
                            <button className="edit-btn" onClick={() => handleEdit(field)}>Edit</button>
                        </div>
                    </>
                )}
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="home-container">
                <Sidebar />
                <main className="main-content">
                    <header className="top-header">
                        <div className="header-left">
                            <h2 className="page-title">Settings</h2>
                        </div>
                    </header>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                        <Loader2 className="animate-spin" size={40} color="var(--accent-color)" />
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="home-container">
            <Sidebar />
            <main className="main-content" style={{ marginTop: "0px", paddingTop: "0px" }}>
                <header className="top-header">
                    <div className="header-left">
                        <h2 className="page-title">Settings</h2>
                    </div>
                </header>

                <div className="settings-main">
                    <nav className="settings-tabs-nav">
                        <div className={`tab-item ${activeTab === 'general' ? 'active' : ''}`} onClick={() => setActiveTab('general')}>General</div>
                        <div className={`tab-item ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>Security</div>
                        <div className={`tab-item ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')}>Notifications</div>
                    </nav>

                    {activeTab === 'general' ? (
                        <>
                            <h3 className="settings-section-title">Basics</h3>

                            <div className="settings-row">
                                <div className="row-label">Photo</div>
                                <div className="row-value">
                                    <img src={userData.profile_picture} alt="Profile" className="row-avatar" />
                                </div>
                                <div className="row-action">
                                    <input type="file" id="photo-upload" hidden onChange={handleFileChange} />
                                    <label htmlFor="photo-upload" className="edit-btn">
                                        {isSaving === 'photo' ? '...' : 'Edit'}
                                    </label>
                                </div>
                            </div>

                            {renderSettingRow('Name', `${userData.first_name} ${userData.last_name}`, 'name')}
                            {renderSettingRow('Username', userData.username, 'username')}
                            {renderSettingRow('Email address', userData.email, 'email')}
                            {renderSettingRow('Bio', userData.bio, 'bio')}

                            <h3 className="settings-section-title">Select Your Favorites</h3>

                            <div className="favorites-management">
                                <div className="favorites-grid-preview">
                                    {favorites.map((fav) => (
                                        <div key={fav.id} className="fav-item-card">
                                            <img
                                                src={fav.poster_path ? (fav.poster_path.startsWith('http') ? fav.poster_path : `https://image.tmdb.org/t/p/w200${fav.poster_path}`) : 'https://via.placeholder.com/100x150'}
                                                alt={fav.title}
                                            />
                                            <div className="fav-item-overlay">
                                                <button onClick={() => handleRemoveFavorite(fav.id)}><X size={16} /></button>
                                            </div>
                                        </div>
                                    ))}
                                    {[...Array(Math.max(0, 4 - favorites.length))].map((_, i) => (
                                        <div
                                            key={`placeholder-${i}`}
                                            className="fav-item-placeholder clickable"
                                            onClick={() => setShowFavModal(true)}
                                        >
                                            <Plus size={24} strokeWidth={1.5} style={{ opacity: 0.4 }} />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <h3 className="settings-section-title">Preferences</h3>

                            <div className="settings-row">
                                <div className="row-label">Theme</div>
                                <div className="row-value theme-switcher">
                                    <button 
                                        className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
                                        onClick={() => theme !== 'dark' && toggleTheme()}
                                    >
                                        <Moon size={14} /> Dark
                                    </button>
                                    <button 
                                        className={`theme-option ${theme === 'light' ? 'active' : ''}`}
                                        onClick={() => theme !== 'light' && toggleTheme()}
                                    >
                                        <Sun size={14} /> Light
                                    </button>
                                </div>
                            </div>

                            <div className="settings-row">
                                <div className="row-label">Language</div>
                                <div className="row-value">English (US)</div>
                                <div className="row-action">
                                    <button className="edit-btn">Edit(Coming Soon!!)</button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div style={{ padding: '40px 0', textAlign: 'center', opacity: 0.5 }}>
                            <Lock size={48} strokeWidth={1} style={{ marginBottom: '16px' }} />
                            <p>This section is coming soon.</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Favorite Search Modal */}
            {showFavModal && (
                <div className="modal-overlay" onClick={() => setShowFavModal(false)}>
                    <div className="modal-content fav-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Add to Favorites</h3>
                            <button className="close-modal" onClick={() => setShowFavModal(false)}><X size={20} /></button>
                        </div>

                        <div className="fav-search-modal-body">
                            <div className="search-input-wrapper">
                                <Search className="search-icon" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search for a movie, series or anime..."
                                    value={favSearchQuery}
                                    onChange={(e) => setFavSearchQuery(e.target.value)}
                                    autoFocus
                                    className="universal-search-input"
                                />
                                {isSearchingFav && <Loader2 className="animate-spin" size={18} />}
                            </div>

                            <div className="fav-search-results">
                                {favSearchQuery.trim() ? (
                                    favSearchResults.length > 0 ? (
                                        favSearchResults.map(item => (
                                            <div key={`${item.media_type}-${item.id}`} className="fav-search-item">
                                                <img
                                                    src={item.poster_path ? (item.poster_path.startsWith('http') ? item.poster_path : `https://image.tmdb.org/t/p/w92${item.poster_path}`) : 'https://via.placeholder.com/45x68'}
                                                    alt=""
                                                />
                                                <div className="fav-search-info">
                                                    <div className="fav-search-title">{item.title || item.name}</div>
                                                    <div className="fav-search-meta">{item.media_type} • {(item.release_date || item.first_air_date)?.split('-')[0] || 'N/A'}</div>
                                                </div>
                                                <button className="btn-save-small" onClick={() => handleAddFavorite(item)}>Add</button>
                                            </div>
                                        ))
                                    ) : !isSearchingFav && (
                                        <div className="no-results">Not Found</div>
                                    )
                                ) : (
                                    <div className="search-prompt">Search for your favorites to feature them on your profile.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;