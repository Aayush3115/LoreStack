import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../Components/Sidebar/Sidebar';
import { Loader2, Film, Bookmark, Settings, Award, Users, Tv, Play, X, Camera, History, Star, Search } from 'lucide-react';
import '../Styles/Explore.css';
import '../Styles/Profile.css';
import { BACKEND_URL } from '../api/api';

const Profile = () => {
    const navigate = useNavigate();
    const { username } = useParams();
    const [watchlistDetails, setWatchlistDetails] = useState([]);
    const [activityDetails, setActivityDetails] = useState([]);
    const [stats, setStats] = useState(null);
    const [joinedRooms, setJoinedRooms] = useState([]);
    const [reviewDetails, setReviewDetails] = useState([]);
    const [diaryDetails, setDiaryDetails] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [visibleReviewsCount, setVisibleReviewsCount] = useState(4);
    const [isLoading, setIsLoading] = useState(true);
    const [userData, setUserData] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [activeTab, setActiveTab] = useState('activity');

    // Edit Profile Modal States
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editUsername, setEditUsername] = useState("");
    const [editBio, setEditBio] = useState("");
    const [editProfilePic, setEditProfilePic] = useState(null);
    const [previewPic, setPreviewPic] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const isOwnProfile = !username || (currentUser && currentUser.username === username);

    const fetchCurrentUser = async () => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) return;
            const response = await fetch(`${BACKEND_URL}/api/auth/profile/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setCurrentUser(data);
            }
        } catch (error) {
            console.error("Failed to fetch current user:", error);
        }
    }

    const fetchUserData = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const url = username
                ? `${BACKEND_URL}/api/auth/profile/${username}/`
                : `${BACKEND_URL}/api/auth/profile/`;

            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
            const response = await fetch(url, { headers });

            if (response.ok) {
                const data = await response.json();
                setUserData(data);
                setIsFollowing(data.is_following);
                if (isOwnProfile) {
                    setEditUsername(data.username);
                    setEditBio(data.bio || "");
                    setPreviewPic(data.profile_picture);
                }
            } else if (response.status === 404) {
                navigate('/404');
            }
        } catch (error) {
            console.error("Failed to fetch user data:", error);
        }
    };

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const url = username
                ? `${BACKEND_URL}/api/movies/user-stats/${username}/`
                : `${BACKEND_URL}/api/movies/user-stats/`;

            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
            const response = await fetch(url, { headers });
            if (response.ok) {
                const data = await response.json();
                setStats(data.data.counts);
            }
        } catch (error) {
            console.error("Failed to fetch stats:", error);
        }
    };

    const fetchJoinedRooms = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const url = username
                ? `${BACKEND_URL}/api/loreroom/joined/?username=${username}`
                : `${BACKEND_URL}/api/loreroom/joined/`;

            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
            const response = await fetch(url, { headers });
            if (response.ok) {
                const data = await response.json();
                setJoinedRooms(data);
            }
        } catch (error) {
            console.error("Failed to fetch rooms:", error);
        }
    };

    const fetchWatchlist = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const url = username
                ? `${BACKEND_URL}/api/movies/user-watchlist/${username}/`
                : `${BACKEND_URL}/api/movies/user-watchlist/`;

            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
            const response = await fetch(url, { headers });
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
            const url = username
                ? `${BACKEND_URL}/api/movies/user-activity/${username}/`
                : `${BACKEND_URL}/api/movies/user-activity/`;

            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
            const response = await fetch(url, { headers });
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

    const fetchReviews = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const url = username
                ? `${BACKEND_URL}/api/movies/user-reviews/${username}/`
                : `${BACKEND_URL}/api/movies/user-reviews/`;

            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
            const response = await fetch(url, { headers });
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
                                user_review: item.review,
                                timestamp: item.timestamp
                            };
                        } catch (err) {
                            return null;
                        }
                    })
                );
                setReviewDetails(details.filter(d => d !== null));
            }
        } catch (error) {
            console.error("Failed to fetch reviews:", error);
        }
    };

    const fetchFavorites = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const url = username
                ? `${BACKEND_URL}/api/movies/user-favorites/${username}/`
                : `${BACKEND_URL}/api/movies/favorites/`;

            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
            const response = await fetch(url, { headers });
            
            if (response.ok) {
                const data = await response.json();
                let favs = [];
                if (data.status_code === 200 && data.data) {
                    favs = data.data;
                } else if (Array.isArray(data)) {
                    favs = data;
                } else if (data.results) {
                    favs = data.results;
                }
                setFavorites(favs);
            }
        } catch (error) {
            console.error("Failed to fetch favorites:", error);
        }
    };

    const fetchDiary = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const url = username
                ? `${BACKEND_URL}/api/movies/user-diary/${username}/`
                : `${BACKEND_URL}/api/movies/user-diary/`;

            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
            const response = await fetch(url, { headers });
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
                setDiaryDetails(details.filter(d => d !== null));
            }
        } catch (error) {
            console.error("Failed to fetch diary:", error);
        }
    };

    useEffect(() => {
        const loadAll = async () => {
            setIsLoading(true);
            // Fetch current user first to determine ownership
            if (username) {
                await fetchCurrentUser();
            }
            await Promise.all([
                fetchUserData(),
                fetchStats(),
                fetchJoinedRooms(),
                fetchWatchlist(),
                fetchActivity(),
                fetchReviews(),
                fetchDiary(),
                fetchFavorites()
            ]);
            setIsLoading(false);
        };
        loadAll();
    }, [username, navigate]);

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

    const handleFollowToggle = async () => {
        if (!currentUser) {
            navigate('/login');
            return;
        }

        setFollowLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${BACKEND_URL}/api/auth/profile/${username}/follow/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setIsFollowing(data.is_following);
                setUserData(prev => ({
                    ...prev,
                    followers_count: data.followers_count
                }));
            }
        } catch (error) {
            console.error("Error toggling follow:", error);
        } finally {
            setFollowLoading(false);
        }
    };

    const handleUserSearch = async (query) => {
        setSearchQuery(query);
        if (query.trim().length < 2) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${BACKEND_URL}/api/auth/profile/search/?query=${query}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setSearchResults(data);
            }
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setIsSearching(false);
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
        switch (rating) {
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
                        <h2 className="page-title">{isOwnProfile ? "My Profile" : `${userData?.username}'s Profile`}</h2>
                    </div>
                    <div className="header-right">
                        <div className="user-search-wrapper">
                            <div className="user-search-bar">
                                <Search size={18} className="search-icon-dim" />
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={searchQuery}
                                    onChange={(e) => handleUserSearch(e.target.value)}
                                />
                                {isSearching && <Loader2 size={16} className="animate-spin search-loader" />}
                            </div>

                            {searchQuery && searchResults.length > 0 && (
                                <div className="user-search-results">
                                    {searchResults.map(user => (
                                        <div
                                            key={user.id}
                                            className="search-result-item"
                                            onClick={() => {
                                                navigate(`/profile/${user.username}`);
                                                setSearchQuery("");
                                                setSearchResults([]);
                                            }}
                                        >
                                            <img src={user.profile_picture || `${BACKEND_URL}/media/profile_pics/default.jpg`} alt={user.username} />
                                            <div className="result-info">
                                                <span className="result-username">{user.username}</span>
                                                <span className="result-name">{user.first_name} {user.last_name}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {searchQuery && !isSearching && searchResults.length === 0 && searchQuery.length >= 2 && (
                                <div className="user-search-results">
                                    <div className="no-results-msg">No users found</div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <div className="profile-container">
                    {userData && (
                        <div className="profile-hero">
                            <div className="profile-avatar-wrapper">
                                <img src={userData.profile_picture || `${BACKEND_URL}/media/profile_pics/default.jpg`} alt="Avatar" className="profile-avatar-large" />
                            </div>
                            <div className="profile-info-main">
                                <div className="profile-name-row">
                                    <h1 className="profile-username-big">{userData.username}</h1>
                                    {!isOwnProfile && (
                                        <div className="profile-actions-public">
                                            <button
                                                className={`follow-btn ${isFollowing ? 'unfollow' : ''}`}
                                                onClick={handleFollowToggle}
                                                disabled={followLoading}
                                            >
                                                {followLoading ? <Loader2 size={16} className="animate-spin" /> : (
                                                    isFollowing ? 'Unfollow' : 'Follow'
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <p className="profile-bio">{userData.bio || (isOwnProfile ? "No bio yet. Tell the world about your cinematic taste!" : "No bio yet.")}</p>
                                <div className="profile-social-stats">
                                    <div className="social-stat">
                                        <span className="stat-num">{userData?.followers_count || 0}</span>
                                        <span className="stat-label-tiny">Followers</span>
                                    </div>
                                    <div className="social-stat">
                                        <span className="stat-num">{userData?.following_count || 0}</span>
                                        <span className="stat-label-tiny">Following</span>
                                    </div>
                                </div>
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
                                    <div className="compact-lab">Rooms</div>
                                </div>
                                <div className="compact-stat">
                                    <div className="compact-val">{stats?.reviews || 0}</div>
                                    <div className="compact-lab">Reviews</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {(favorites.length > 0 || (stats?.ratings_distribution && Object.values(stats.ratings_distribution).some(v => v > 0))) && (
                        <div className="profile-favorites-container-wrapper">
                            <div className="profile-favorites-left">
                                <h3 className="section-title">
                                    {isOwnProfile ? "My Favorites" : `${userData?.username}'s Favorites`}
                                </h3>
                                {favorites.length > 0 ? (
                                    <div className="profile-favorites-grid">
                                        {favorites.map((fav) => (
                                            <div
                                                key={fav.id}
                                                className="fav-movie-card"
                                                onClick={() => navigate(`/${fav.media_type === 'movie' ? 'movie' : fav.media_type}/${fav.media_id}`)}
                                            >
                                                <img
                                                    src={fav.poster_path ? (fav.poster_path.startsWith('http') ? fav.poster_path : `https://image.tmdb.org/t/p/w500${fav.poster_path}`) : 'https://via.placeholder.com/150x225'}
                                                    alt={fav.title}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="fav-placeholder-box">
                                        <p>{isOwnProfile ? "You haven't featured any favorites yet. Head to settings to add some!" : "No favorites featured yet."}</p>
                                    </div>
                                )}
                            </div>

                            <div className="profile-stats-right">
                                <h3 className="section-title">Ratings Distribution</h3>
                                <div className="ratings-distribution-chart">
                                    {(() => {
                                        const dist = stats?.ratings_distribution || { perfection: 0, goforit: 0, timepass: 0, skip: 0 };
                                        const totalRatings = Object.values(dist).reduce((a, b) => a + b, 0);
                                        const getPercent = (val) => totalRatings === 0 ? 0 : Math.round((val / totalRatings) * 100);
                                        const labelMap = {
                                            perfection: 'Perfection',
                                            goforit: 'Go For It',
                                            timepass: 'Timepass',
                                            skip: 'Skip'
                                        };

                                        return Object.entries(dist).map(([key, val]) => {
                                            const percent = getPercent(val);
                                            return (
                                                <div key={key} className="chart-row">
                                                    <div className="chart-label-group">
                                                        <span className="chart-row-label">{labelMap[key]}</span>
                                                        <span className="chart-row-value">{val} ({percent}%)</span>
                                                    </div>
                                                    <div className="chart-bar-bg">
                                                        <div 
                                                            className={`chart-bar-fill fill-${key}`} 
                                                            style={{ 
                                                                width: `${percent}%`,
                                                                backgroundColor: getRatingColor(key)
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        });
                                    })()}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="profile-tabs">
                        <div className={`profile-tab ${activeTab === 'activity' ? 'active' : ''}`} onClick={() => setActiveTab('activity')}>
                            Activity
                        </div>
                        <div className={`profile-tab ${activeTab === 'watchlist' ? 'active' : ''}`} onClick={() => setActiveTab('watchlist')}>
                            Watchlist
                        </div>
                        <div className={`profile-tab ${activeTab === 'rooms' ? 'active' : ''}`} onClick={() => setActiveTab('rooms')}>
                            LoreRooms
                        </div>
                        <div className={`profile-tab ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>
                            Reviews
                        </div>
                        <div className={`profile-tab ${activeTab === 'diary' ? 'active' : ''}`} onClick={() => setActiveTab('diary')}>
                            Diary
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

                            {activeTab === 'reviews' && (
                                reviewDetails.length > 0 ? (
                                    <>
                                        <div className="reviews-list-vertical">
                                            {reviewDetails.slice(0, visibleReviewsCount).map((item) => (
                                                <div
                                                    key={`rev-${item.media_type}-${item.id}`}
                                                    className="review-item-row"
                                                    onClick={() => navigate(`/${item.media_type === 'movie' ? 'movie' : item.media_type}/${item.id}`)}
                                                >
                                                    <img src={getPosterUrl(item)} alt={getTitle(item)} className="review-mini-poster" />
                                                    <div className="review-main-content">
                                                        <div className="review-header-info">
                                                            <h4>{getTitle(item)}</h4>
                                                            <span className="review-date-dim">{new Date(item.timestamp).toLocaleDateString()}</span>
                                                        </div>
                                                        <div className="review-rating-inline" style={{ color: getRatingColor(item.user_rating) }}>
                                                            {item.user_rating.toUpperCase()}
                                                        </div>
                                                        <p className="review-text-content">"{item.user_review}"</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        {reviewDetails.length > visibleReviewsCount && (
                                            <div className="see-more-container">
                                                <button className="see-more-btn" onClick={() => setVisibleReviewsCount(prev => prev + 4)}>
                                                    See More
                                                </button>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="empty-state">
                                        <Star size={48} color="rgba(255,255,255,0.1)" />
                                        <h3>No Reviews Yet</h3>
                                        <p>Share your thoughts on the movies and shows you've watched.</p>
                                        <button className="create-btn" onClick={() => navigate('/explore')}>Start Reviewing</button>
                                    </div>
                                )
                            )}

                            {activeTab === 'diary' && (
                                diaryDetails.length > 0 ? (
                                    <div className="diary-timeline-container">
                                        <div className="timeline-line"></div>
                                        {Object.entries(
                                            diaryDetails.reduce((acc, item) => {
                                                const year = new Date(item.timestamp).getFullYear();
                                                if (!acc[year]) acc[year] = [];
                                                acc[year].push(item);
                                                return acc;
                                            }, {})
                                        ).sort((a, b) => b[0] - a[0]).map(([year, items]) => (
                                            <div key={year} className="timeline-year-group">
                                                <div className="timeline-year-header">{year}</div>
                                                {items.map((item, index) => (
                                                    <div
                                                        key={`diary-${item.media_type}-${item.id}`}
                                                        className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'}`}
                                                        onClick={() => navigate(`/${item.media_type === 'movie' ? 'movie' : item.media_type}/${item.id}`)}
                                                    >
                                                        <div className="timeline-content-card">
                                                            <div className="timeline-date-label">
                                                                {new Date(item.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                            </div>
                                                            <div className="timeline-card-inner">
                                                                <img src={getPosterUrl(item)} alt={getTitle(item)} className="timeline-poster" />
                                                                <div className="timeline-info">
                                                                    <h4>{getTitle(item)}</h4>
                                                                    {item.user_rating && (
                                                                        <div className="timeline-rating" style={{ color: getRatingColor(item.user_rating) }}>
                                                                            {item.user_rating.toUpperCase()}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="timeline-connector"></div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="empty-state">
                                        <History size={48} color="rgba(255,255,255,0.1)" />
                                        <h3>Your Diary is Empty</h3>
                                        <p>Log movies and shows to start your cinematic journey.</p>
                                        <button className="create-btn" onClick={() => navigate('/explore')}>Explore Now</button>
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
