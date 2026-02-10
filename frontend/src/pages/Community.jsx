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

  // CREATE COMMUNITY STATES
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCommunity, setNewCommunity] = useState({
    name: "",
    description: "",
    mood: "Light",
    privacy: "public",
    category: "General"
  });

  const moods = ["All", "Dark", "Light", "Comedy", "Emotional", "Mysterious", "Inspiring", "Romantic", "Adventure"];
  const discoverOptions = ["Trending", "Top Rated", "New", "Most Active"];
  const privacyOptions = [
    { value: "public", label: "Public - Anyone can join" },
    { value: "private", label: "Private - Requires approval" },
    { value: "hidden", label: "Hidden - Invite only" }
  ];
  const categoryOptions = ["General", "Writing", "Reading", "Discussion", "Support", "Creative", "Book Club", "Fan Fiction"];

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const response = await api.get("community/");
      setCommunities(response.data);
      setError(null);
    } catch (err) {
      setError(`Failed to load communities: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // CREATE COMMUNITY FUNCTION
  const handleCreateCommunity = async () => {
    if (!newCommunity.name.trim() || !newCommunity.description.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const response = await api.post("community/", newCommunity);

      // Add newly created community to UI
      setCommunities(prev => [response.data, ...prev]);

      // Reset form
      setNewCommunity({
        name: "",
        description: "",
        mood: "Light",
        privacy: "public",
        category: "General"
      });

      setShowCreateModal(false);
      alert("Community created successfully!");
    } catch (err) {
      console.error("Error creating community:", err);
      alert("Failed to create community");
    }
  };

  const handleJoinCommunity = async (communityId, currentlyJoined) => {
    try {
      if (currentlyJoined) {
        await api.post(`community/${communityId}/leave/`);
      } else {
        await api.post(`community/${communityId}/join/`);
      }

      setCommunities(prev =>
        prev.map(community =>
          community.id === communityId
            ? { ...community, joined: !currentlyJoined }
            : community
        )
      );
    } catch (err) {
      console.error("Error updating community join status:", err);
    }
  };

  const filteredCommunities = communities.filter(community =>
    activeMood === "All" || community.mood === activeMood
  );

  const totalCommunities = communities.length;

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

  return (
    <div className="community-page">
      <Sidebar />

      <div className="main-content">
        <div className="content-header">
          <div className="header-top">
            <div className="header-title-section">
              <h1 className="community-title">Communities</h1>
              <p className="community-subtitle">
                Find your people. Share stories that match your emotion.
              </p>
            </div>
            
            <button
              className="create-community-btn"
              onClick={() => setShowCreateModal(true)}
            >
              <span className="btn-icon">+</span>
              Create Community
            </button>
          </div>

          {/* Stats Bar */}
          <div className="stats-bar">
            <div className="stat-card">
              <span className="stat-value">{totalCommunities}</span>
              <span className="stat-label">Total Communities</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">1.2k</span>
              <span className="stat-label">Active Members</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">48</span>
              <span className="stat-label">Online Now</span>
            </div>
          </div>

          {/* Filters Section */}
          <div className="filters-section">
            <div className="section-header">
              <h3>Filter by Mood</h3>
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
            </div>
            
            <div className="mood-filters-container">
              <div className="mood-filters">
                {moods.map((mood, index) => (
                  <button
                    key={index}
                    className={`mood-chip ${activeMood === mood ? "active" : ""}`}
                    onClick={() => setActiveMood(mood)}
                  >
                    {mood}
                    {mood === activeMood && <span className="chip-indicator"></span>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Communities Grid */}
        <div className="communities-section">
          <div className="section-header">
            <h2>
              {activeMood === "All" ? "All Communities" : `${activeMood} Communities`}
              <span className="count-badge">{filteredCommunities.length}</span>
            </h2>
            <div className="view-options">
              <button className="view-option active">Grid</button>
              <button className="view-option">List</button>
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="community-grid">
            {filteredCommunities.map((community) => (
              <div className="community-card" key={community.id}>
                <div className="card-header">
                  <div className="community-avatar">
                    {community.name.charAt(0)}
                  </div>
                  <div className="community-info">
                    <h3 className="community-name">{community.name}</h3>
                    <span className="community-category">{community.category || "General"}</span>
                  </div>
                </div>
                
                <p className="community-description">{community.description}</p>
                
                <div className="community-meta">
                  <div className="meta-item">
                    <span className="meta-icon">👥</span>
                    <span className="meta-value">{community.memberCount || "245"}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-icon">💬</span>
                    <span className="meta-value">{community.postCount || "1.2k"}</span>
                  </div>
                  <div className="meta-item">
                    <span className={`mood-tag mood-${community.mood.toLowerCase()}`}>
                      {community.mood}
                    </span>
                  </div>
                </div>
                
                <div className="card-actions">
                  <button
                    className={`join-btn ${community.joined ? "joined" : ""}`}
                    onClick={() => handleJoinCommunity(community.id, community.joined)}
                  >
                    {community.joined ? (
                      <>
                        <span className="joined-icon">✓</span>
                        Joined
                      </>
                    ) : (
                      "Join Community"
                    )}
                  </button>
                  <button className="view-btn">View</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CREATE COMMUNITY MODAL */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="create-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Community</h2>
              <button 
                className="close-modal"
                onClick={() => setShowCreateModal(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-content">
              <div className="form-group">
                <label htmlFor="communityName">
                  Community Name *
                  <span className="character-count">{newCommunity.name.length}/50</span>
                </label>
                <input
                  id="communityName"
                  type="text"
                  placeholder="Enter community name"
                  maxLength={50}
                  value={newCommunity.name}
                  onChange={(e) =>
                    setNewCommunity({ ...newCommunity, name: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label htmlFor="communityDescription">
                  Description *
                  <span className="character-count">{newCommunity.description.length}/200</span>
                </label>
                <textarea
                  id="communityDescription"
                  placeholder="Describe your community"
                  rows={4}
                  maxLength={200}
                  value={newCommunity.description}
                  onChange={(e) =>
                    setNewCommunity({ ...newCommunity, description: e.target.value })
                  }
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="communityMood">Mood</label>
                  <select
                    id="communityMood"
                    value={newCommunity.mood}
                    onChange={(e) =>
                      setNewCommunity({ ...newCommunity, mood: e.target.value })
                    }
                  >
                    {moods
                      .filter(m => m !== "All")
                      .map((mood, i) => (
                        <option key={i} value={mood}>
                          {mood}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="communityCategory">Category</label>
                  <select
                    id="communityCategory"
                    value={newCommunity.category}
                    onChange={(e) =>
                      setNewCommunity({ ...newCommunity, category: e.target.value })
                    }
                  >
                    {categoryOptions.map((category, i) => (
                      <option key={i} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Privacy Settings</label>
                <div className="privacy-options">
                  {privacyOptions.map((option) => (
                    <label key={option.value} className="privacy-option">
                      <input
                        type="radio"
                        name="privacy"
                        value={option.value}
                        checked={newCommunity.privacy === option.value}
                        onChange={(e) =>
                          setNewCommunity({ ...newCommunity, privacy: e.target.value })
                        }
                      />
                      <div className="option-content">
                        <span className="option-title">{option.value.charAt(0).toUpperCase() + option.value.slice(1)}</span>
                        <span className="option-description">{option.label}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input type="checkbox" defaultChecked />
                  Make me a moderator of this community
                </label>
              </div>
            </div>

            <div className="modal-actions">
              <button 
                className="cancel-btn"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </button>
              <button 
                className="create-btn"
                onClick={handleCreateCommunity}
                disabled={!newCommunity.name.trim() || !newCommunity.description.trim()}
              >
                Create Community
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Community;