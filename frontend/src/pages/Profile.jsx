import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Components/Sidebar/Sidebar';
import { Loader2, Film, Bookmark, Settings, Award, Users, Tv, Play, X, Camera, History, Star } from 'lucide-react';
import '../Styles/Home.css';
import '../Styles/Profile.css';

const Profile = () => {
    const navigate = useNavigate();
    const [watchlistDetails, setWatchlistDetails] = useState([]);
    const [activityDetails, setActivityDetails] = useState([]);
    const [stats, setStats] = useState(null);
    const [joinedRooms, setJoinedRooms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userData, setUserData] = useState(null);
    const [activeTab, setActiveTab] = useState('activity');

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

            const response = await fetch("http://localhost:8000/api/auth/profile/", {
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
            const response = await fetch("http://localhost:8000/api/movies/user-stats/", {
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
            const response = await fetch("http://localhost:8000/api/loreroom/joined/", {
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
      setIsLoading(true);
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch("http://localhost:8000/api/movies/user-watchlist/", {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (data.status_code === 200) {
          const details = await Promise.all(
            data.data.map(async (item) => {
              try {
                let url = '';
                if (item.media_type === 'movie') url = `http://localhost:8000/api/movies/${item.id}/`;
                else if (item.media_type === 'tv') url = `http://localhost:8000/api/movies/tv/${item.id}/`;
                else if (item.media_type === 'anime') url = `http://localhost:8000/api/movies/anime/${item.id}/`;

                const res = await fetch(url);
                const detailData = await res.json();
                return { ...detailData.data, media_type: item.media_type };
              } catch (err) {
                console.error(`Failed to fetch details for ${item.media_type} ${item.id}`, err);
                return null;
              }
            })
          );
          setWatchlistDetails(details.filter(d => d !== null));
        }
    };

    fetchUserData();
    fetchWatchlist();
  }, [navigate]);

  const getPosterUrl = (item) => {
    if (item.media_type === 'anime') return item.coverImage.large;
    return `https://image.tmdb.org/t/p/w500${item.poster_path}`;
  };

  const getTitle = (item) => {
    return item.title?.english || item.title?.romaji || item.title || item.name;
  };

  return (
    <div className="home-container">
      <Sidebar />
      <main className="main-content" style={{ marginTop: "0px", paddingTop: "0px"}}>
        <header className="top-header">
          <div className="header-left">
            <h2 className="page-title">Profile</h2>
          </div>
          <div className="header-actions">
            {userData && (
              <>
                <div className="space-badge">{userData.username}'s Space</div>
                <div className="user-avatar-container">
                  <img src={userData.profile_picture} alt="Avatar" className="user-avatar-img" />
                </div>
              </>
            )}
          </div>
        </header>

        <div className="dashboard-section">
          <div className="section-header" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <Bookmark size={24} className="gradient-text" style={{ color: '#6366f1' }} />
            <h2 className="section-title" style={{ margin: 0 }}>My Watchlist</h2>
          </div>

          {isLoading ? (
            <div className="loading-container">
              <Loader2 className="searching-spinner" size={40} />
            </div>
          ) : watchlistDetails.length > 0 ? (
            <div className="communities-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
              {watchlistDetails.map((item) => (
                <div
                  key={`${item.media_type}-${item.id}`}
                  className="movie-card"
                  onClick={() => navigate(`/${item.media_type === 'movie' ? 'movie' : item.media_type}/${item.id}`)}
                  style={{ flex: 'unset', width: '100%' }}
                >
                  <img
                    src={getPosterUrl(item)}
                    alt={getTitle(item)}
                    className="movie-poster"
                    style={{ height: '270px', objectFit: 'cover' }}
                  />
                  <p className="movie-title">{getTitle(item)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="welcome-card" style={{ marginTop: '40px' }}>
              <div className="welcome-icon">
                <Film size={32} color="#6366f1" />
              </div>
              <h3 className="welcome-title">Your watchlist is empty</h3>
              <p className="welcome-text">
                You haven't added any movies, shows, or anime to your watchlist yet. Start exploring and build your collection!
              </p>
              <button className="create-btn" onClick={() => navigate('/home')}>
                Discover Content
              </button>
            </div>
          )}
        </div>
    );
};

export default Profile;
