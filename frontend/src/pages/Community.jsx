import React, { useState, useEffect } from "react";
import "../styles/community.css";
import Sidebar from "../Components/Sidebar/Sidebar";
import api from "../api/api";
import { useNavigate } from 'react-router-dom';

const Community = () => {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeDiscover, setActiveDiscover] = useState("Trending");
  const [isStaff, setIsStaff] = useState(false);
  const [requestReason, setRequestReason] = useState("");
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [showRequests, setShowRequests] = useState(false);

  // CREATE COMMUNITY STATES
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCommunity, setNewCommunity] = useState({
    name: "",
    description: "",
    avatar_icon: "🌎"
  });

  const avatarOptions = ["🌎", "🌌", "📚", "🎨", "🎭", "🍕", "🎮", "🚀", "⚔️", "💎", "🐉", "🌵"];

  const discoverOptions = ["Trending", "Top Rated", "New", "Most Active"];

  useEffect(() => {
    fetchCommunities();
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    try {
      const response = await api.get("profile/");
      setIsStaff(response.data.is_staff);
      if (response.data.is_staff) {
        fetchPendingRequests();
      }
    } catch (err) {
      console.error("Error fetching user role:", err);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const response = await api.get("community-requests/");
      setPendingRequests(response.data);
    } catch (err) {
      console.error("Error fetching requests:", err);
    }
  };

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const response = await api.get("loreroom/");
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
    if (!newCommunity.name.trim()) {
      return;
    }

    try {
      if (isStaff) {
        // ADMIN FLOW: Direct creation
        if (!newCommunity.description.trim()) return;
        const response = await api.post("loreroom/", newCommunity);
        setCommunities(prev => [response.data, ...prev]);
        setShowCreateModal(false);
      } else {
        // REGULAR FLOW: Submit request
        if (!requestReason.trim()) {
          setError("Please provide a reason for your request.");
          return;
        }
        await api.post("community-requests/", {
          community_name: newCommunity.name,
          reason: requestReason
        });
        setRequestSuccess(true);
        setTimeout(() => {
          setShowCreateModal(false);
          setRequestSuccess(false);
        }, 3000);
      }

      // Reset form
      setNewCommunity({
        name: "",
        description: "",
        avatar_icon: "🌎"
      });
      setRequestReason("");

    } catch (err) {
      console.error("Error processing community action:", err);
      setError(err.response?.data?.detail || "An error occurred. Please try again.");
    }
  };

  const handleJoinCommunity = async (communityId, currentlyJoined) => {
    try {
      if (currentlyJoined) {
        await api.post(`loreroom/${communityId}/leave/`);
      } else {
        await api.post(`loreroom/${communityId}/join/`);
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

  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const filteredCommunities = communities.filter(community => {
    const matchesSearch = community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      community.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });


  if (loading) {
    return (
      <div className="community-page">
        <Sidebar />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Discovering universes...</p>
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
              <h1 className="community-title">LoreRooms</h1>
              <p className="community-subtitle">
                Step into LoreRooms. Share, discuss, and discover theories.
              </p>
            </div>

            <div className="header-actions">
              <div className="search-bar">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Explore LoreRooms..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button
                className="create-community-btn"
                onClick={() => setShowCreateModal(true)}
              >
                <span className="btn-icon">{isStaff ? "+" : "✉️"}</span>
                {isStaff ? "Create" : "Request Room"}
              </button>
              {isStaff && (
                <button
                  className={`request-toggle-btn ${showRequests ? 'active' : ''}`}
                  onClick={() => setShowRequests(!showRequests)}
                >
                  <span className="btn-icon">📋</span>
                  {showRequests ? "Show Rooms" : `Requests (${pendingRequests.length})`}
                </button>
              )}
            </div>
          </div>
        </div>


        {/* Communities Grid */}
        <div className="communities-section">
          {showRequests && isStaff ? (
            <div className="requests-container">
              <h2 className="section-title">Pending Community Requests</h2>
              <div className="requests-list">
                {pendingRequests.length > 0 ? (
                  pendingRequests.map((req) => (
                    <div className="request-card" key={req.id}>
                      <div className="request-header">
                        <h3>{req.community_name}</h3>
                        <span className="request-date">
                          {new Date(req.requested_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="request-reason">{req.reason}</p>
                      <div className="request-user">
                        Requested by: <strong>{req.requested_by_username}</strong>
                      </div>
                      <div className="request-actions">
                        <button
                          className="approve-btn"
                          onClick={() => {
                            setNewCommunity({ ...newCommunity, name: req.community_name });
                            setShowCreateModal(true);
                          }}
                        >
                          Create from Request
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-results">
                    <span className="no-results-icon">✨</span>
                    <h3>No pending requests</h3>
                    <p>You're all caught up!</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              <div className="community-grid">
                {filteredCommunities.length > 0 ? (
                  filteredCommunities.map((community) => (
                    <div className="community-card" key={community.id}>
                      <div className="card-header">
                        <div className="community-icon">
                          {community.avatar_icon || '🌎'}
                        </div>
                        <div className="community-info">
                          <div className="community-header">
                            <h3>{community.name}</h3>
                          </div>
                        </div>
                      </div>

                      <p className="community-desc">{community.description}</p>

                      <div className="community-stats">
                        <div className="stat">
                          <span className="stat-icon">👥</span>
                          {community.memberCount || 0} Members
                        </div>
                      </div>

                      <div className="community-footer">
                        <button
                          className="join-btn"
                          onClick={() => navigate(`/community/${community.id}`)}
                        >
                          View
                        </button>

                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-results">
                    <span className="no-results-icon">🛸</span>
                    <h3>No LoreRooms found</h3>
                    <p>Try adjusting your search to find what you're looking for.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* SUBTLE & NAVIGABLE REALM BUILDER */}
      {showCreateModal && (
        <div className="new-realm-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="subtle-builder-card" onClick={(e) => e.stopPropagation()}>
            <div className="builder-header">
              <div className="header-info">
                <h2>{isStaff ? "Create LoreRoom" : "Request LoreRoom"}</h2>
                <p>{isStaff ? "Set up your room" : "Suggest a new community"}</p>
              </div>
              <button className="builder-close" onClick={() => setShowCreateModal(false)}>×</button>
            </div>

            <div className={`builder-main ${!isStaff ? 'request-layout' : ''}`}>
              {/* LEFT: SYMBOL PICKER (Only for staff) */}
              {isStaff && (
                <div className="builder-sidebar">
                  <label>Symbol</label>
                  <div className="symbol-scroller">
                    {avatarOptions.map((icon) => (
                      <button
                        key={icon}
                        className={`symbol-tile ${newCommunity.avatar_icon === icon ? 'active' : ''}`}
                        onClick={() => setNewCommunity({ ...newCommunity, avatar_icon: icon })}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* RIGHT: CORE INFO */}
              <div className="builder-form">
                {requestSuccess ? (
                  <div className="success-message-modal">
                    <h3 style={{ color: '#4ade80', marginBottom: '10px' }}>🎉 Request Sent!</h3>
                    <p>The project creator will review your suggestion for "{newCommunity.name}".</p>
                  </div>
                ) : (
                  <>
                    <div className="input-field">
                      <label>LoreRoom Name</label>
                      <input
                        placeholder="E.g. Marvel"
                        maxLength={50}
                        value={newCommunity.name}
                        onChange={(e) => setNewCommunity({ ...newCommunity, name: e.target.value })}
                      />
                    </div>

                    {isStaff ? (
                      <div className="input-field">
                        <label>Description</label>
                        <textarea
                          placeholder="What happens in this realm?"
                          maxLength={200}
                          rows={4}
                          value={newCommunity.description}
                          onChange={(e) => setNewCommunity({ ...newCommunity, description: e.target.value })}
                        />
                      </div>
                    ) : (
                      <div className="input-field">
                        <label>Why are you requesting this?</label>
                        <textarea
                          placeholder="Tell the creator why this room would be awesome!"
                          maxLength={300}
                          rows={4}
                          value={requestReason}
                          onChange={(e) => setRequestReason(e.target.value)}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="builder-footer">
              {/* <span className="privacy-hint">🌎 Always Public</span> */}
              <div className="footer-btns">
                <button className="secondary-btn" onClick={() => setShowCreateModal(false)}>Cancel</button>
                {!requestSuccess && (
                  <button
                    className="primary-btn"
                    onClick={handleCreateCommunity}
                    disabled={!newCommunity.name.trim() || (isStaff ? !newCommunity.description.trim() : !requestReason.trim())}
                  >
                    {isStaff ? "Create" : "Submit Request"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Community;
