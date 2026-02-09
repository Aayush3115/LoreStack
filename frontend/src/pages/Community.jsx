import React, { useState, useEffect } from "react";
import "../styles/community.css";
import Sidebar from "../Components/Sidebar/Sidebar";
import api from "../api/api";

const Community = () => {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeMood, setActiveMood] = useState("All");
  const [activeDiscover, setActiveDiscover] = useState("Trending");

  const moods = ["All", "Dark", "Light", "Comedy", "Emotional", "Mysterious", "Inspiring"];
  const discoverOptions = ["Trending", "Top Rated", "New", "Most Active"];

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        setLoading(true);
        const response = await api.get('community/');
        setCommunities(response.data);
        setError(null);
      } catch (err) {
        setError(`Failed to load communities: ${err.message}`);
        console.error("Error fetching communities:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunities();
  }, []);

  const handleJoinCommunity = async (communityId, currentlyJoined) => {
    try {
      if (currentlyJoined) {
        await api.post(`community/${communityId}/leave/`);
      } else {
        await api.post(`community/${communityId}/join/`);
      }


      // Update local state
      setCommunities(prev => prev.map(community =>
        community.id === communityId
          ? { ...community, joined: !currentlyJoined }
          : community
      ));
    } catch (err) {
      console.error("Error updating community join status:", err);
    }
  };

  const filteredCommunities = communities.filter(community =>
    activeMood === "All" || community.mood === activeMood
  );

  // Calculate statistics
  const totalCommunities = communities.length;
  const totalMembers = communities.reduce((sum, community) => {
    const members = parseInt(community.members?.replace(/[^0-9]/g, '')) || 0;
    return sum + members;
  }, 0);
  const totalStoriesToday = communities.reduce((sum, community) => {
    const stories = parseInt(community.storiesCount?.replace(/[^0-9]/g, '')) || 0;
    return sum + stories;
  }, 0);
  const activeNow = communities.reduce((sum, community) => {
    const active = parseInt(community.activeMembers?.match(/\d+/)?.[0]) || 0;
    return sum + active;
  }, 0);

  if (loading) {
    return (
      <div className="community-page">
        <Sidebar />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading communities...</p>
        </div>
      </div>
    );
  }

  if (error && communities.length === 0) {
    return (
      <div className="community-page">
        <Sidebar />
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Error loading communities</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="community-page">
      <Sidebar />

      {/* Main content */}
      <div className="main-content">
        <div className="content-header">
          <div className="header-left">
            <h1 className="community-title">Communities</h1>
            <p className="community-subtitle">
              Find your people. Share stories that match your emotion.
            </p>

            <div className="horizontal-filters">
              <div className="mood-filters">
                {moods.map((mood, index) => (
                  <button
                    key={index}
                    className={`mood-chip ${activeMood === mood ? "active" : ""}`}
                    onClick={() => setActiveMood(mood)}
                  >
                    {mood}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="header-right">
            <div className="discover-options">
              {discoverOptions.map((option, index) => (
                <button
                  key={index}
                  className={`discover-chip ${activeDiscover === option ? "active" : ""}`}
                  onClick={() => setActiveDiscover(option)}
                >
                  {option}
                </button>
              ))}
            </div>
            <div className="search-bar">
              <span className="search-icon">🔍</span>
              <input type="text" placeholder="Search communities..." />
            </div>
          </div>
        </div>


        <div className="stats-bar">
          <div className="stat-card">
            <span className="stat-value">{totalCommunities}</span>
            <span className="stat-label">Total Communities</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{totalMembers.toLocaleString()}</span>
            <span className="stat-label">Total Members</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{totalStoriesToday.toLocaleString()}</span>
            <span className="stat-label">Total Stories</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{activeNow.toLocaleString()}</span>
            <span className="stat-label">Active Users</span>
          </div>
        </div>

        <div className="community-grid">
          {filteredCommunities.map((community) => (
            <div className="community-card" key={community.id}>
              <div className="card-header">
                <div className="community-icon">
                  {getMoodIcon(community.mood)}
                </div>
                <div className="community-info">
                  <div className="community-header">
                    <h2>{community.name}</h2>
                    <span className={`mood-tag ${community.mood?.toLowerCase() || 'default'}`}>
                      {community.mood}
                    </span>
                  </div>
                  <div className="community-meta">
                    <span className="active-members">
                      {community.activeMembers}
                    </span>
                  </div>
                </div>
              </div>

              <p className="community-desc">{community.description}</p>

              <div className="community-stats">
                <div className="stat">
                  <span className="stat-icon">👥</span>
                  <span>{community.members}</span>
                </div>
                <div className="stat">
                  <span className="stat-icon">📖</span>
                  <span>{community.storiesCount}</span>
                </div>
              </div>

              <div className="community-footer">
                <div className="members-preview">
                  <div className="avatar">👤</div>
                  <div className="avatar">👤</div>
                  <div className="avatar">👤</div>
                  <span className="more-members">+{community.memberPreview}</span>
                </div>
                <button
                  className={`join-btn ${community.joined ? 'joined' : ''}`}
                  onClick={() => handleJoinCommunity(community.id, community.joined)}
                >
                  {community.joined ? 'Joined' : 'Join'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredCommunities.length === 0 && (
          <div className="no-results">
            <div className="no-results-icon">😔</div>
            <h3>No communities found</h3>
            <p>Try changing your mood filter or create a new community</p>
          </div>
        )}
      </div>
    </div>
  );
};

const getMoodIcon = (mood) => {
  switch (mood?.toLowerCase()) {
    case 'dark': return '🌙';
    case 'emotional': return '💖';
    case 'comedy': return '😂';
    case 'mysterious': return '🔮';
    case 'inspiring': return '✨';
    case 'light': return '☀️';
    default: return '📚';
  }
};

export default Community;