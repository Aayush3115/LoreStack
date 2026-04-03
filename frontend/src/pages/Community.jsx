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
  const [sortBy, setSortBy] = useState("latest");

  // QUICK POST STATES
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedCommunityId, setSelectedCommunityId] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // EDIT POST STATES
  const [editingPostId, setEditingPostId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [activePostMenuId, setActivePostMenuId] = useState(null);

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
    const handleClickOutside = () => setActivePostMenuId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

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
  }, [activeTab, sortBy]);

  const checkUserRole = async () => {
    try {
      const response = await api.get("profile/");
      setIsStaff(response.data.is_staff);
      setCurrentUser(response.data);
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
      const response = await api.get("posts/joined_posts/", {
        params: { sort: sortBy }
      });
      setJoinedPosts(response.data);
    } catch (err) {
      console.error("Error fetching joined posts:", err);
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleQuickPost = async () => {
    const targetCommunityId = selectedRoomId || selectedCommunityId;
    if (!newPostContent.trim() || !targetCommunityId || isPosting) return;

    setIsPosting(true);
    try {
      const response = await api.post(`loreroom/${targetCommunityId}/posts/`, {
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

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await api.delete(`posts/${postId}/`);
      setJoinedPosts(prev => prev.filter(p => p.id !== postId));
    } catch (err) {
      console.error("Error deleting post:", err);
    }
  };

  const startEditing = (post) => {
    setEditingPostId(post.id);
    setEditContent(post.content);
  };

  const handleEditPost = async (postId) => {
    if (!editContent.trim()) return;
    try {
      const response = await api.patch(`posts/${postId}/`, {
        content: editContent
      });
      setJoinedPosts(prev => prev.map(p => p.id === postId ? response.data : p));
      setEditingPostId(null);
      setEditContent("");
    } catch (err) {
      console.error("Error editing post:", err);
    }
  };

  const handleVote = async (postId, voteType) => {
    if (!currentUser) return;

    try {
      await api.post(`/votes/`, {
        post: postId,
        vote_type: voteType
      });
      
      setJoinedPosts(prevPosts => prevPosts.map(post => {
        if (post.id === postId) {
          const currentVote = post.user_vote || 0;
          let newScore = post.vote_score || 0;
          
          if (currentVote === voteType) {
            newScore -= voteType;
            return { ...post, vote_score: newScore, user_vote: 0 };
          } else {
            newScore = newScore - currentVote + voteType;
            return { ...post, vote_score: newScore, user_vote: voteType };
          }
        }
        return post;
      }));
    } catch (error) {
      console.error("Error voting on post:", error);
    }
  };

  const [profilePicFile, setProfilePicFile] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateCommunity = async () => {
    if (!newCommunity.name.trim()) return;

    try {
      if (isStaff) {
        if (!newCommunity.description.trim()) return;
        
        const formData = new FormData();
        formData.append('name', newCommunity.name);
        formData.append('description', newCommunity.description);
        formData.append('category', newCommunity.category || 'General');
        if (profilePicFile) {
          formData.append('profile_picture', profilePicFile);
        }

        const response = await api.post("loreroom/", formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
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
      setNewCommunity({ name: "", description: "", category: "General" });
      setProfilePicFile(null);
      setProfilePicPreview(null);
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

  const groupedJoinedCommunities = joinedCommunities.reduce((acc, comm) => {
    const category = comm.category || "General";
    if (!acc[category]) acc[category] = [];
    acc[category].push(comm);
    return acc;
  }, {});

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
                        <div className="quick-post-avatar-wrap" style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '50%',
                          overflow: 'hidden',
                          background: 'var(--hover-bg)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid var(--border-color)'
                        }}>
                          {currentUser?.profile_picture ? (
                            <img 
                              src={currentUser.profile_picture} 
                              alt={currentUser.username} 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            />
                          ) : (
                            <User size={20} color="var(--secondary-text)" />
                          )}
                        </div>
                      </div>
                      <select
                        className="community-selector"
                        style={{ 
                          flex: 1, 
                          border: '1px solid var(--border-color)', 
                          background: 'var(--hover-bg)',
                          padding: '10px 16px',
                          borderRadius: '8px',
                          color: 'var(--text-color)',
                          fontSize: '14px',
                          fontWeight: '600'
                        }}
                        value={selectedRoomId || selectedCommunityId}
                        onChange={(e) => setSelectedCommunityId(e.target.value)}
                        disabled={!!selectedRoomId}
                      >
                        {Object.entries(groupedJoinedCommunities).map(([category, comms]) => (
                          <optgroup key={category} label={category}>
                            {comms.map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </optgroup>
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

                {/* SORTING UI */}
                <div className="feed-sort-container" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '16px',
                  background: 'transparent',
                  padding: '0',
                  borderRadius: '0',
                  border: 'none'
                }}>
                  <select
                    className="feed-sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    style={{
                      background: 'var(--hover-bg)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-color)',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      width: 'auto',
                      minWidth: '100px'
                    }}
                  >
                    <option value="latest">Latest</option>
                    <option value="popular">Popular</option>
                  </select>
                </div>

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
                              {currentUser && currentUser.id === post.user_id && (
                                <div className="post-options-container" style={{ position: 'relative' }}>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActivePostMenuId(activePostMenuId === post.id ? null : post.id);
                                    }}
                                    style={{ background: 'transparent', border: 'none', color: 'var(--secondary-text)', cursor: 'pointer', padding: '4px' }}
                                  >
                                    <MoreHorizontal size={20} />
                                  </button>
                                  {activePostMenuId === post.id && (
                                    <div className="post-options-dropdown" style={{
                                      position: 'absolute',
                                      top: '100%',
                                      right: 0,
                                      background: 'var(--card-bg)',
                                      border: '1px solid var(--border-color)',
                                      borderRadius: '8px',
                                      padding: '4px',
                                      zIndex: 10,
                                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                                      minWidth: '100px'
                                    }}>
                                      <button 
                                        onClick={() => {
                                          setActivePostMenuId(null);
                                          startEditing(post);
                                        }}
                                        style={{ 
                                          width: '100%', 
                                          textAlign: 'left', 
                                          padding: '8px 12px', 
                                          background: 'transparent', 
                                          border: 'none', 
                                          color: 'var(--text-color)', 
                                          fontSize: '13px', 
                                          cursor: 'pointer',
                                          borderRadius: '4px'
                                        }}
                                        className="dropdown-item"
                                      >
                                        Edit
                                      </button>
                                      <button 
                                        onClick={() => {
                                          setActivePostMenuId(null);
                                          handleDeletePost(post.id);
                                        }}
                                        style={{ 
                                          width: '100%', 
                                          textAlign: 'left', 
                                          padding: '8px 12px', 
                                          background: 'transparent', 
                                          border: 'none', 
                                          color: '#ef4444', 
                                          fontSize: '13px', 
                                          cursor: 'pointer',
                                          borderRadius: '4px'
                                        }}
                                        className="dropdown-item"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="post-content">
                              {editingPostId === post.id ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                  <textarea
                                    className="quick-post-textarea"
                                    style={{ minHeight: '60px', borderRadius: '4px', background: 'var(--hover-bg)', border: '1px solid var(--accent-color)', width: '100%' }}
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                  />
                                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                    <button 
                                      onClick={() => setEditingPostId(null)}
                                      style={{ padding: '4px 12px', borderRadius: '4px', background: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-color)', cursor: 'pointer' }}
                                    >
                                      Cancel
                                    </button>
                                    <button 
                                      onClick={() => handleEditPost(post.id)}
                                      style={{ padding: '4px 12px', borderRadius: '4px', background: 'var(--accent-color)', border: 'none', color: 'white', cursor: 'pointer' }}
                                    >
                                      Save
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <p style={{ fontSize: '14px' }}>{post.content}</p>
                              )}
                            </div>
                            <div className="post-footer">
                              <div className="vote-footer-container">
                                <button 
                                  className={`vote-btn-footer ${post.user_vote === 1 ? 'active-up' : ''}`}
                                  onClick={() => handleVote(post.id, 1)}
                                >
                                  <ArrowBigUp size={16} fill={post.user_vote === 1 ? "currentColor" : "none"} />
                                </button>
                                <span className={`vote-count-footer ${post.user_vote === 1 ? 'up' : post.user_vote === -1 ? 'down' : ''}`}>
                                  {post.vote_score || 0}
                                </span>
                                <button 
                                  className={`vote-btn-footer ${post.user_vote === -1 ? 'active-down' : ''}`}
                                  onClick={() => handleVote(post.id, -1)}
                                >
                                  <ArrowBigDown size={16} fill={post.user_vote === -1 ? "currentColor" : "none"} />
                                </button>
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
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            {community.profile_picture ? (
                              <img src={community.profile_picture} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--hover-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span>🏠</span>
                              </div>
                            )}
                            <h3 style={{ fontSize: '16px', margin: 0, cursor: 'pointer' }} onClick={() => navigate(`/community/${community.id}`)}>
                              {community.name}
                            </h3>
                          </div>
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
                        <label>LoreRoom Name</label>
                        <input placeholder="e.g. Marvel Universe" value={newCommunity.name} onChange={(e) => setNewCommunity({ ...newCommunity, name: e.target.value })} />
                      </div>
                      <div className="input-field">
                        <label>{isStaff ? "Description" : "Reason for request"}</label>
                        <textarea placeholder={isStaff ? "What is this LoreRoom about?" : "Why should we create this room?"} rows={4} value={isStaff ? newCommunity.description : requestReason} onChange={(e) => isStaff ? setNewCommunity({ ...newCommunity, description: e.target.value }) : setRequestReason(e.target.value)} />
                      </div>
                      {isStaff && (
                        <div className="input-field">
                          <label>Profile Picture (Optional)</label>
                          <div className="profile-pic-upload-container">
                            <input type="file" accept="image/*" onChange={handleFileChange} id="profile-pic-input" style={{ display: 'none' }} />
                            <label htmlFor="profile-pic-input" className="file-upload-trigger">
                              {profilePicPreview ? (
                                <img src={profilePicPreview} alt="Preview" className="preview-image-circle" />
                              ) : (
                                <div className="upload-placeholder-circle">
                                  <span>+</span>
                                </div>
                              )}
                            </label>
                            <p className="upload-hint">Upload a 1:1 ratio image for best results</p>
                          </div>
                        </div>
                      )}
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
