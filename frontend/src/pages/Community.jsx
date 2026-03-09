import React, { useState, useEffect } from "react";
import "../styles/community.css";
import Sidebar from "../Components/Sidebar/Sidebar";
import api from "../api/api";
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Compass, Loader2, Heart, Plus, ArrowBigUp, ArrowBigDown, User, MoreHorizontal } from "lucide-react";

const Community = () => {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isStaff, setIsStaff] = useState(false);
  const [requestReason, setRequestReason] = useState("");
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [showRequests, setShowRequests] = useState(false);

  // FEED STATES
  const [activeTab, setActiveTab] = useState("feed");
  const [joinedPosts, setJoinedPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [joinedCommunities, setJoinedCommunities] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState(null); // NULL = All Joined Posts

  // QUICK POST STATES
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedCommunityId, setSelectedCommunityId] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  // CREATE COMMUNITY STATES
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCommunity, setNewCommunity] = useState({
    name: "",
    description: ""
  });

  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllDiscover, setShowAllDiscover] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      const comms = await fetchCommunities();
      await checkUserRole();

      if (comms) {
        const joined = comms.filter(c => c.joined);
        setJoinedCommunities(joined);
        if (joined.length > 0) {
          setSelectedCommunityId(joined[0].id);
          setActiveTab("feed");
          fetchJoinedPosts();
        }
      }
    };
    initialize();
  }, []);

  useEffect(() => {
    if (activeTab === "feed") {
      fetchJoinedPosts();
    }
  }, [activeTab]);

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
      const response = await api.get("loreroom/");
      setCommunities(response.data);
      setError(null);
      setLoading(false);
      return response.data;
    } catch (err) {
      setError(`Failed to load communities: ${err.message}`);
      setLoading(false);
      return null;
    }
  };

  const fetchJoinedPosts = async () => {
    setLoadingPosts(true);
    try {
      const response = await api.get("posts/joined_posts/");
      setJoinedPosts(response.data);
    } catch (err) {
      console.error("Error fetching joined posts:", err);
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleQuickPost = async () => {
    if (!newPostContent.trim() || !selectedCommunityId || isPosting) return;

    setIsPosting(true);
    try {
      const response = await api.post(`loreroom/${selectedCommunityId}/posts/`, {
        content: newPostContent
      });
      setJoinedPosts([response.data, ...joinedPosts]);
      setNewPostContent("");
    } catch (err) {
      console.error("Error creating quick post:", err);
      alert("Failed to share post. Make sure you've selected a community.");
    } finally {
      setIsPosting(false);
    }
  };

  const handleCreateCommunity = async () => {
    if (!newCommunity.name.trim()) return;

    try {
      if (isStaff) {
        if (!newCommunity.description.trim()) return;
        const response = await api.post("loreroom/", newCommunity);
        setCommunities(prev => [response.data, ...prev]);
        setShowCreateModal(false);
      } else {
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
      setNewCommunity({ name: "", description: "", avatar_icon: "🌎" });
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

      // If we just joined our first community, we might want to refresh the feed
      if (!currentlyJoined) fetchJoinedPosts();
    } catch (err) {
      console.error("Error updating community join status:", err);
    }
  };

  const handleDeleteLoreRoom = async (e, communityId) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this LoreRoom?")) return;
    try {
      await api.delete(`loreroom/${communityId}/`);
      setCommunities(prev => prev.filter(c => c.id !== communityId));
    } catch (err) {
      console.error("Error deleting LoreRoom:", err);
    }
  };

  const handleDeleteRequest = async (e, requestId) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to dismiss this request?")) return;
    try {
      await api.delete(`community-requests/${requestId}/`);
      setPendingRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (err) {
      console.error("Error deleting request:", err);
    }
  };

  const filteredCommunities = communities.filter(community => {
    return community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      community.description.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <div className="community-page">
        <Sidebar />
        <div className="loading-container" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <div className="loading-spinner"></div>
          <p style={{ marginTop: '20px', color: '#888' }}>Discovering universes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="community-page">
      <Sidebar />

      <div className="main-content">
        <div className="reddit-container">
          {/* LEFT COLUMN: FEED & DISCOVER */}
          <div className="feed-column">
            {/* HEADER ABOVE FEED */}
            <div className="tab-switcher" style={{
              marginBottom: '16px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              padding: '4px',
              overflowX: 'auto',
              whiteSpace: 'nowrap',
              gap: '4px',
              scrollbarWidth: 'none'
            }}>
              <button
                className={`tab-item ${selectedRoomId === null ? 'active' : ''}`}
                onClick={() => setSelectedRoomId(null)}
                style={{ borderRadius: '4px', flexShrink: 0 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MessageSquare size={18} />
                  <span>My Feed</span>
                </div>
              </button>

              {joinedCommunities.map(room => (
                <button
                  key={room.id}
                  className={`tab-item ${selectedRoomId === room.id ? 'active' : ''}`}
                  onClick={() => setSelectedRoomId(room.id)}
                  style={{ borderRadius: '4px', flexShrink: 0 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', padding: '4px 8px' }}>
                    <span>{room.name}</span>
                  </div>
                </button>
              ))}
            </div>

            {activeTab === "feed" ? (
              <>
                {/* CREATE POST BAR */}
                {joinedCommunities.length > 0 && (
                  <div className="quick-post-card" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <div className="quick-post-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div className="avatar-placeholder" style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '50%',
                          background: 'var(--hover-bg)',
                          color: 'var(--secondary-text)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <User size={20} />
                        </div>
                      </div>
                      <select
                        className="community-selector"
                        style={{ flex: 1, border: '1px solid var(--border-color)', background: 'var(--hover-bg)' }}
                        value={selectedRoomId || selectedCommunityId}
                        onChange={(e) => setSelectedCommunityId(e.target.value)}
                        disabled={!!selectedRoomId}
                      >
                        {joinedCommunities.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <textarea
                      className="quick-post-textarea"
                      placeholder="Share some lore..."
                      style={{ minHeight: '60px', borderRadius: '4px', background: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                      <button
                        className="quick-post-btn"
                        style={{ padding: '6px 16px', borderRadius: '20px' }}
                        onClick={handleQuickPost}
                        disabled={!newPostContent.trim() || isPosting}
                      >
                        Post
                      </button>
                    </div>
                  </div>
                )}

                {loadingPosts ? (
                  <div className="loading-posts">
                    <Loader2 className="spinner" />
                    <p>Gathering latest lore...</p>
                  </div>
                ) : (joinedPosts.length > 0 || selectedRoomId) ? (
                  <div className="joined-posts-list">
                    {joinedPosts
                      .filter(post => !selectedRoomId || post.community === parseInt(selectedRoomId))
                      .map(post => (
                        <div
                          className="community-post-card"
                          key={post.id}
                        >
                          <div className="post-main-content">
                            <div className="post-header" style={{ marginBottom: '8px' }}>
                              <div className="post-author-info" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div className="author-avatar-small" style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '50%',
                                  overflow: 'hidden',
                                  background: 'var(--hover-bg)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  border: 'none'
                                }}>
                                  {post.user_avatar ? (
                                    <img src={post.user_avatar} alt={post.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  ) : (
                                    <User size={18} style={{ color: 'var(--secondary-text)' }} />
                                  )}
                                </div>
                                <span className="author-highlight" style={{ fontSize: '16px', fontWeight: '800' }}>
                                  {post.username}
                                </span>
                                <span className="post-time" style={{ fontSize: '13px', color: 'var(--secondary-text)', marginLeft: '0px' }}>
                                  in <strong style={{ color: 'var(--text-color)', fontWeight: '700' }}>{post.community_name}</strong> • {new Date(post.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <div className="post-content">
                              <p style={{ fontSize: '14px' }}>{post.content}</p>
                            </div>
                            <div className="post-footer">
                              <div className="vote-footer-container">
                                <button className="vote-btn-footer"><ArrowBigUp size={16} /></button>
                                <span className="vote-count-footer">{post.likes || 0}</span>
                                <button className="vote-btn-footer"><ArrowBigDown size={16} /></button>
                              </div>
                              <button className="post-action">
                                <MessageSquare size={16} />
                                <span>{post.comments_count || 0} Comments</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="empty-feed-state">
                    <h3>Your feed is quiet</h3>
                    <p>Join more LoreRooms to see posts from your favorite universes!</p>
                  </div>
                )}
              </>
            ) : (
              <div className="discover-list">
                <div className="section-header" style={{ marginBottom: '16px' }}>
                  <div className="premium-search" style={{ margin: 0, maxWidth: 'none', borderRadius: '4px' }}>
                    🔍 <input
                      type="text"
                      placeholder="Search for LoreRooms..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="community-grid">
                  {filteredCommunities.length > 0 ? (
                    filteredCommunities.map((community, index) => (
                      <div className="premium-card" key={community.id} style={{ borderRadius: '4px', padding: '16px', marginBottom: '8px' }}>
                        <div className="card-top" style={{ marginBottom: '12px', display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                          <button
                            className={`view-room-btn ${community.joined ? 'joined' : ''}`}
                            style={{
                              flex: 'none',
                              padding: '8px 24px',
                              borderRadius: '20px',
                              background: community.joined ? 'transparent' : 'var(--accent-color)',
                              color: community.joined ? 'var(--text-color)' : 'white',
                              border: community.joined ? '1px solid var(--border-color)' : 'none'
                            }}
                            onClick={() => handleJoinCommunity(community.id, community.joined)}
                          >
                            {community.joined ? 'Joined' : 'Join'}
                          </button>
                        </div>
                        <div className="card-body">
                          <h3 style={{ fontSize: '16px', margin: 0, cursor: 'pointer' }} onClick={() => navigate(`/community/${community.id}`)}>
                            {community.name}
                          </h3>
                          <p style={{ fontSize: '13px', margin: '4px 0 0 0', height: 'auto', lineClamp: 'none' }}>
                            {community.description}
                          </p>
                          <div className="member-count" style={{ fontSize: '12px', color: 'var(--secondary-text)', marginTop: '8px' }}>
                            {community.memberCount || 0} Members
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-feed-state" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
                      <p>No LoreRooms found matching your search.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: SIDEBAR */}
          <div className="sidebar-column">
            <div className="reddit-sidebar-card">
              <div className="sidebar-banner"></div>
              <div className="sidebar-card-header">
                <div className="sidebar-title">About Community</div>
              </div>
              <div className="sidebar-card-content">
                <p style={{ fontSize: '13px', color: 'var(--text-color)', lineHeight: '1.5' }}>
                  Welcome to LoreStack Communities! A place to share and discover deep lore about your favorite universes. Connect with other Lorekeepers and expand your horizons.
                </p>
                <button
                  className="premium-create-btn"
                  style={{ width: '100%', justifyContent: 'center', marginTop: '16px', borderRadius: '20px' }}
                  onClick={() => setShowCreateModal(true)}
                >
                  {isStaff ? "Create Community" : "Request Community"}
                </button>
              </div>
            </div>

            <div className="reddit-sidebar-card">
              <div className="sidebar-card-header">
                <div className="sidebar-title">Discover LoreRooms</div>
              </div>
              <div className="sidebar-card-content" style={{ padding: '0' }}>
                {communities.slice(0, showAllDiscover ? communities.length : 5).map((room) => (
                  <div
                    key={room.id}
                    className="trending-item"
                    onClick={() => navigate(`/community/${room.id}`)}
                  >
                    <div className="room-info-small">
                      <div className="room-name-small">{room.name}</div>
                      <div className="room-members-small">{room.memberCount || 0} keepers</div>
                    </div>
                    <button
                      className="join-btn-tiny"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleJoinCommunity(room.id, room.joined);
                      }}
                      style={{
                        marginLeft: 'auto',
                        background: room.joined ? 'var(--hover-bg)' : 'var(--accent-color)',
                        color: room.joined ? 'var(--text-color)' : 'white',
                        border: room.joined ? '1px solid var(--border-color)' : 'none',
                        borderRadius: '12px',
                        padding: '2px 8px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {room.joined ? 'Joined' : 'Join'}
                    </button>
                  </div>
                ))}
              </div>
              {!showAllDiscover && communities.length > 5 && (
                <button
                  className="discover-more-dots"
                  style={{
                    width: '100%',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'transparent',
                    border: 'none',
                    borderTop: '1px solid var(--border-color)',
                    color: 'var(--secondary-text)',
                    cursor: 'pointer'
                  }}
                  onClick={() => setShowAllDiscover(true)}
                >
                  <MoreHorizontal size={20} />
                </button>
              )}
            </div>

            <div className="sidebar-footer-text">
              © 2026 LoreStack. All rights reserved. <br />
              Built for Lorekeepers everywhere.
            </div>
          </div>
        </div>
      </div>

      {/* CREATE MODAL REMAINS THE SAME (Simplified for brevity but kept functional) */}
      {
        showCreateModal && (
          <div className="new-lore-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="subtle-builder-card" onClick={(e) => e.stopPropagation()}>
              <div className="builder-header">
                <h2>{isStaff ? "New LoreRoom" : "Request LoreRoom"}</h2>
                <button className="builder-close" onClick={() => setShowCreateModal(false)}>×</button>
              </div>
              <div className="builder-main">
                <div className="builder-form">
                  {requestSuccess ? (
                    <div className="success-message-modal"><h3>🎉 Sent!</h3></div>
                  ) : (
                    <>
                      <div className="input-field">
                        <label>Name</label>
                        <input value={newCommunity.name} onChange={(e) => setNewCommunity({ ...newCommunity, name: e.target.value })} />
                      </div>
                      <div className="input-field">
                        <label>{isStaff ? "Description" : "Reason"}</label>
                        <textarea rows={4} value={isStaff ? newCommunity.description : requestReason} onChange={(e) => isStaff ? setNewCommunity({ ...newCommunity, description: e.target.value }) : setRequestReason(e.target.value)} />
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="builder-footer">
                <button className="secondary-btn" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button className="primary-btn" onClick={handleCreateCommunity}>{isStaff ? "Create" : "Submit"}</button>
              </div>
            </div>
          </div>
        )
      }
    </div>
  );
};

export default Community;
