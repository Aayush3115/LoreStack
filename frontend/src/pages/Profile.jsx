import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Components/Sidebar/Sidebar';
import { Loader2, Film, Bookmark, Settings, Award, Users, Tv, Play, X, Camera, History, Star } from 'lucide-react';
import '../Styles/Explore.css';
import '../Styles/Profile.css';
import { BACKEND_URL } from '../api/api';

const Profile = () => {
    const navigate = useNavigate();
    const [watchlistDetails, setWatchlistDetails] = useState([]);
    const [activityDetails, setActivityDetails] = useState([]);
    const [stats, setStats] = useState(null);
    const [joinedRooms, setJoinedRooms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userData, setUserData] = useState(null);
    const [activeTab, setActiveTab] = useState('activity');

    // Edit Profile Modal States
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editUsername, setEditUsername] = useState("");
    const [editBio, setEditBio] = useState("");
    const [editProfilePic, setEditProfilePic] = useState(null);
    const [previewPic, setPreviewPic] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);

    const fetchUserData = async () => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await fetch(`${BACKEND_URL}/api/auth/profile/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setUserData(data);
                setEditUsername(data.username);
                setEditBio(data.bio || "");
                setPreviewPic(data.profile_picture);
            }
        } catch (error) {
            console.error("Failed to fetch user data:", error);
        }
    };

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${BACKEND_URL}/api/movies/user-stats/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setStats(data.data.counts);
            }
        } catch (error) {
            console.error("Failed to fetch stats:", error);
        }
    };

    const fetchJoinedRooms = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${BACKEND_URL}/api/loreroom/joined/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setJoinedRooms(data);
            }
        } catch (error) {
            console.error("Failed to fetch rooms:", error);
        }
    };

    const fetchWatchlist = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${BACKEND_URL}/api/movies/user-watchlist/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.status_code === 200) {
                const details = await Promise.all(
                    data.data.map(async (item) => {
                        try {
                            let url = '';
                            if (item.media_type === 'movie') url = `${BACKEND_URL}/api/movies/${item.id}/`;
                            else if (item.media_type === 'tv') url = `${BACKEND_URL}/api/movies/tv/${item.id}/`;
                            else if (item.media_type === 'anime') url = `${BACKEND_URL}/api/movies/anime/${item.id}/`;

                            const res = await fetch(url);
                            const detailData = await res.json();
                            return { ...detailData.data, media_type: item.media_type };
                        } catch (err) {
                            return null;
                        }
                    })
                );
                setWatchlistDetails(details.filter(d => d !== null));
            }
        } catch (error) {
            console.error("Failed to fetch watchlist:", error);
        }
    };

    const fetchActivity = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${BACKEND_URL}/api/movies/user-activity/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.status_code === 200) {
                const details = await Promise.all(
                    data.data.map(async (item) => {
                        try {
                            let url = '';
                            if (item.media_type === 'movie') url = `${BACKEND_URL}/api/movies/${item.id}/`;
                            else if (item.media_type === 'tv') url = `${BACKEND_URL}/api/movies/tv/${item.id}/`;
                            else if (item.media_type === 'anime') url = `${BACKEND_URL}/api/movies/anime/${item.id}/`;

                            const res = await fetch(url);
                            const detailData = await res.json();
                            return { 
                                ...detailData.data, 
                                media_type: item.media_type, 
                                user_rating: item.rating,
                                timestamp: item.timestamp
                            };
                        } catch (err) {
                            return null;
                        }
                    })
                );
                setActivityDetails(details.filter(d => d !== null));
            }
        } catch (error) {
            console.error("Failed to fetch activity:", error);
        }
    };

    useEffect(() => {
        const loadAll = async () => {
            setIsLoading(true);
            await Promise.all([
                fetchUserData(),
                fetchStats(),
                fetchJoinedRooms(),
                fetchWatchlist(),
                fetchActivity()
            ]);
            setIsLoading(false);
        };
        loadAll();
    }, [navigate]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setEditProfilePic(file);
            setPreviewPic(URL.createObjectURL(file));
        }
    };

    const handleUpdateProfile = async () => {
        setIsUpdating(true);
        try {
            const token = localStorage.getItem('access_token');
            const formData = new FormData();
            formData.append('username', editUsername);
            formData.append('bio', editBio);
            if (editProfilePic) {
                formData.append('profile_picture', editProfilePic);
            }

            const response = await fetch(`${BACKEND_URL}/api/auth/profile/`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (response.ok) {
                const updatedData = await response.json();
                setUserData(updatedData);
                setIsEditModalOpen(false);
            }
        } catch (error) {
            console.error("Error updating profile:", error);
        } finally {
            setIsUpdating(false);
        }
    };

    const getPosterUrl = (item) => {
        if (item.media_type === 'anime') return item.coverImage.large;
        return `https://image.tmdb.org/t/p/w500${item.poster_path}`;
    };

    const getTitle = (item) => {
        return item.title?.english || item.title?.romaji || item.title || item.name;
    };

    const getRatingColor = (rating) => {
        switch(rating) {
            case 'perfection': return '#a855f7';
            case 'goforit': return '#10b981';
            case 'timepass': return '#f59e0b';
            case 'skip': return '#ef4444';
            default: return 'rgba(255,255,255,0.4)';
        }
    };

    return (
        <div className="home-container">
            <Sidebar />
            <main className="main-content" style={{ marginTop: "0px", paddingTop: "0px" }}>
                <header className="top-header">
                    <div className="header-left">
                        <h2 className="page-title">Profile</h2>
                    </div>
                </header>

                <div className="profile-container">
                    {userData && (
                        <div className="profile-hero">
                            <div className="profile-avatar-wrapper">
                                <img src={userData.profile_picture} alt="Avatar" className="profile-avatar-large" />
                            </div>
                            <div className="profile-info-main">
                                <div className="profile-name-row">
                                    <h1 className="profile-username-big">{userData.username}</h1>
                                    <button className="edit-profile-btn" onClick={() => setIsEditModalOpen(true)}>
                                        <Settings size={18} /> Edit Profile
                                    </button>
                                </div>
                                <p className="profile-bio">{userData.bio || "No bio yet. Tell the world about your cinematic taste!"}</p>
                            </div>

                            <div className="hero-stats-compact">
                                <div className="compact-stat">
                                    <div className="compact-val">{stats?.movies || 0}</div>
                                    <div className="compact-lab">Movies</div>
                                </div>
                                <div className="compact-stat">
                                    <div className="compact-val">{stats?.tv || 0}</div>
                                    <div className="compact-lab">Series</div>
                                </div>
                                <div className="compact-stat">
                                    <div className="compact-val">{stats?.anime || 0}</div>
                                    <div className="compact-lab">Anime</div>
                                </div>
                                <div className="compact-stat">
                                    <div className="compact-val">{joinedRooms.length || 0}</div>
                                    <div className="compact-lab">LoreRooms</div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="profile-tabs">
                        <div className={`profile-tab ${activeTab === 'activity' ? 'active' : ''}`} onClick={() => setActiveTab('activity')}>
                            Activity ({activityDetails.length})
                        </div>
                        <div className={`profile-tab ${activeTab === 'watchlist' ? 'active' : ''}`} onClick={() => setActiveTab('watchlist')}>
                            Watchlist ({watchlistDetails.length})
                        </div>
                        <div className={`profile-tab ${activeTab === 'rooms' ? 'active' : ''}`} onClick={() => setActiveTab('rooms')}>
                            LoreRooms ({joinedRooms.length})
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="loading-container">
                            <Loader2 className="searching-spinner" size={40} />
                        </div>
                    ) : (
                        <div className="tab-content">
                            {activeTab === 'activity' && (
                                activityDetails.length > 0 ? (
                                    <div className="horizontal-scroll">
                                        {activityDetails.map((item) => (
                                            <div
                                                key={`act-${item.media_type}-${item.id}`}
                                                className="activity-item-card"
                                                onClick={() => navigate(`/${item.media_type === 'movie' ? 'movie' : item.media_type}/${item.id}`)}
                                            >
                                                <div className="activity-poster-wrapper">
                                                    <img src={getPosterUrl(item)} alt={getTitle(item)} />
                                                    {item.user_rating && (
                                                        <div className="activity-rating-badge" style={{ backgroundColor: getRatingColor(item.user_rating) }}>
                                                            {item.user_rating === 'perfection' && <Star size={10} fill="currentColor" />}
                                                            {item.user_rating}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="activity-item-info">
                                                    <h4>{getTitle(item)}</h4>
                                                    <span className="activity-date">{new Date(item.timestamp).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="empty-state">
                                        <History size={48} color="rgba(255,255,255,0.1)" />
                                        <h3>No Activity Yet</h3>
                                        <p>Log your first movie, series or anime to see them here.</p>
                                        <button className="create-btn" onClick={() => navigate('/explore')}>Start Logging</button>
                                    </div>
                                )
                            )}

                            {activeTab === 'watchlist' && (
                                watchlistDetails.length > 0 ? (
                                    <div className="horizontal-scroll">
                                        {watchlistDetails.map((item) => (
                                            <div
                                                key={`${item.media_type}-${item.id}`}
                                                className="movie-card"
                                                onClick={() => navigate(`/${item.media_type === 'movie' ? 'movie' : item.media_type}/${item.id}`)}
                                            >
                                                <img
                                                    src={getPosterUrl(item)}
                                                    alt={getTitle(item)}
                                                    className="movie-poster"
                                                />
                                                <p className="movie-title">{getTitle(item)}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="empty-state">
                                        <Bookmark size={48} color="rgba(255,255,255,0.1)" />
                                        <h3>Empty Watchlist</h3>
                                        <p>Start adding movies and shows to keep track of what you want to watch next.</p>
                                        <button className="create-btn" onClick={() => navigate('/explore')}>Explore Content</button>
                                    </div>
                                )
                            )}

                            {activeTab === 'rooms' && (
                                joinedRooms.length > 0 ? (
                                    <div className="rooms-list-grid">
                                        {joinedRooms.map(room => (
                                            <div key={room.id} className="joined-room-card" onClick={() => navigate(`/community/${room.id}`)}>
                                                {room.profile_picture ? (
                                                    <img src={room.profile_picture} alt={room.name} className="room-icon-circle" style={{ objectFit: 'cover' }} />
                                                ) : (
                                                    <div className="room-icon-circle">🏠</div>
                                                )}
                                                <div className="room-card-info">
                                                    <h4>{room.name}</h4>
                                                    <p>{room.memberCount || 0} members</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="empty-state">
                                        <Users size={48} color="rgba(255,255,255,0.1)" />
                                        <h3>No Joined Rooms</h3>
                                        <p>Join a LoreRoom to discuss your favorite content with others.</p>
                                        <button className="create-btn" onClick={() => navigate('/loreroom')}>Discover Rooms</button>
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </div>
            </main>

            {isEditModalOpen && (
                <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
                    <div className="edit-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Edit Profile</h2>
                            <button className="close-modal-btn" onClick={() => setIsEditModalOpen(false)}>
                                <X size={24} />
                            </button>
                        </div>

                        <div className="profile-pic-edit-wrapper">
                            <img src={previewPic} alt="Preview" className="profile-pic-preview" />
                            <label htmlFor="profile-pic-upload" className="file-input-label">
                                <Camera size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                                Change Photo
                            </label>
                            <input type="file" id="profile-pic-upload" className="hidden-file-input" onChange={handleFileChange} accept="image/*" />
                        </div>

                        <div className="edit-form-group">
                            <label>Username</label>
                            <input type="text" className="edit-username-input" value={editUsername} onChange={e => setEditUsername(e.target.value)} placeholder="Enter username" />
                        </div>

                        <div className="edit-form-group">
                            <label>Bio</label>
                            <textarea className="edit-bio-textarea" value={editBio} onChange={e => setEditBio(e.target.value)} placeholder="Tell us about yourself..." />
                        </div>

                        <button className="save-profile-btn" onClick={handleUpdateProfile} disabled={isUpdating || !editUsername.trim()}>
                            {isUpdating ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
