import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Components/Sidebar/Sidebar';
import { Loader2, Film, Bookmark } from 'lucide-react';
import '../Styles/Home.css';

const Profile = () => {
  const navigate = useNavigate();
  const [watchlistDetails, setWatchlistDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch("http://localhost:8000/api/auth/profile/", {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (response.ok) {
          setUserData(data);
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
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
          // Fetch details for each movie in the watchlist
          const details = await Promise.all(
            data.data.map(async (item) => {
              try {
                const movieRes = await fetch(`http://localhost:8000/api/movies/${item.movie_id}/`);
                const movieData = await movieRes.json();
                return movieData.data;
              } catch (err) {
                console.error(`Failed to fetch details for movie ${item.movie_id}`, err);
                return null;
              }
            })
          );
          setWatchlistDetails(details.filter(d => d !== null));
        }
      } catch (error) {
        console.error("Failed to fetch watchlist:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
    fetchWatchlist();
  }, [navigate]);

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
              {watchlistDetails.map((movie) => (
                <div
                  key={movie.id}
                  className="movie-card"
                  onClick={() => navigate(`/movie/${movie.id}`)}
                  style={{ flex: 'unset', width: '100%' }}
                >
                  <img
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={movie.title}
                    className="movie-poster"
                    style={{ height: '270px' }}
                  />
                  <p className="movie-title">{movie.title}</p>
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
                You haven't added any movies to your watchlist yet. Start exploring and build your collection!
              </p>
              <button className="create-btn" onClick={() => navigate('/')}>
                Discover Movies
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Profile;