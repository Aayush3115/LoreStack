import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../Components/Sidebar/Sidebar";
import api from "../api/api";
import "../styles/communityDetail.css";
import { MoreHorizontal, ArrowBigUp, ArrowBigDown } from "lucide-react";

const CommunityDetail = () => {
  const { id } = useParams();

  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [sortBy, setSortBy] = useState("latest");

  // EDIT POST STATES
  const [editingPostId, setEditingPostId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [activePostMenuId, setActivePostMenuId] = useState(null);

  useEffect(() => {
    fetchCommunity();
    fetchCurrentUser();

    const handleClickOutside = () => setActivePostMenuId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [id]);

  useEffect(() => {
    fetchPosts();
  }, [id, sortBy]);

  const fetchCurrentUser = async () => {
    try {
      const res = await api.get("/auth/profile/");
      setCurrentUser(res.data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchCommunity = async () => {
    try {
      const res = await api.get(`/loreroom/${id}/`);
      setCommunity(res.data);
      setIsJoined(res.data.joined || false);
    } catch (error) {
      console.error("Error fetching community:", error);
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await api.get(`/loreroom/${id}/posts/`, {
        params: { sort: sortBy }
      });
      setPosts(res.data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const handleJoinCommunity = async () => {
    setLoading(true);
    try {
      if (isJoined) {
        await api.post(`/loreroom/${id}/leave/`);
        setIsJoined(false);
      } else {
        await api.post(`/loreroom/${id}/join/`);
        setIsJoined(true);
      }
      setCommunity({ ...community, joined: !isJoined });
    } catch (error) {
      console.error("Error joining/leaving community:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.trim() || !isJoined || posting) return;

    setPosting(true);
    try {
      const postData = {
        content: newPost,
      };

      const res = await api.post(`/loreroom/${id}/posts/`, postData);

      setPosts([res.data, ...posts]);
      setNewPost("");
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setPosting(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await api.delete(`posts/${postId}/`);
      setPosts(prev => prev.filter(p => p.id !== postId));
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
      setPosts(prev => prev.map(p => p.id === postId ? response.data : p));
      setEditingPostId(null);
      setEditContent("");
    } catch (err) {
      console.error("Error editing post:", err);
    }
  };

  const handleVote = async (postId, voteType) => {
    if (!isJoined) return;

    try {
      await api.post(`/votes/`, {
        post: postId,
        vote_type: voteType
      });
      
      // We need to refetch or manually update the score
      // For performance, let's manually update based on previous state
      setPosts(prevPosts => prevPosts.map(post => {
        if (post.id === postId) {
          const currentVote = post.user_vote || 0;
          let newScore = post.vote_score || 0;
          
          if (currentVote === voteType) {
            // Undo vote
            newScore -= voteType;
            return { ...post, vote_score: newScore, user_vote: 0 };
          } else {
            // New vote or change vote
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

  const handleComment = async (postId) => {
    if (!isJoined) return;
    // Navigate to comments page or open comment modal
  };

  if (!community) return null;

  return (
    <div className="community-detail-page">
      <Sidebar />

      <div className="community-detail-content">
        {/* Header Section */}
        <div className="community-header">
          <div className="community-header-banner" style={{
            background: community.profile_picture ? `url(${community.profile_picture}) center/cover no-repeat` : 'var(--card-bg)'
          }}>
            {!community.profile_picture && (
              <span className="default-community-emoji">🏠</span>
            )}
          </div>
          <div className="community-header-info">
            <div className="community-header-left">
              <h1 className="community-name">{community.name}</h1>
              <p className="community-description">{community.description || "Film lovers sharing reviews & moods."}</p>
              <div className="community-meta">
                <span className="member-count">👥 {community.memberCount || 0} members</span>
              </div>
            </div>
            <button
              className={`join-button ${isJoined ? 'joined' : ''} ${loading ? 'loading' : ''}`}
              onClick={handleJoinCommunity}
              disabled={loading}
            >
              {loading ? 'Processing...' : isJoined ? 'Joined' : 'Join Community'}
            </button>
          </div>
        </div>

        {/* Create Post Section - Only visible to joined members */}
        {isJoined && (
          <div className="create-post-container">
            <div className="create-post-header">
              <h2>Create a post</h2>
              <p>Share your thoughts with the community</p>
            </div>

            <div className="create-post-form">
              <textarea
                placeholder="What's on your mind?"
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                className="post-input"
                disabled={posting}
              />

              <div className="post-actions">
                <button
                  onClick={handleCreatePost}
                  className={`post-button ${posting ? 'posting' : ''}`}
                  disabled={!newPost.trim() || posting}
                >
                  {posting ? 'Posting...' : 'Post to Community'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Join Prompt - Only visible to non-members */}
        {!isJoined && (
          <div className="join-prompt">
            <div className="join-prompt-content">
              <span className="join-icon">👋</span>
              <h3>Join the conversation</h3>
              <p>Become a member to share your thoughts, react to posts, and connect with fellow film lovers.</p>
              <button
                className="join-now-button"
                onClick={handleJoinCommunity}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Join Community to Post'}
              </button>
            </div>
          </div>
        )}

        {/* Posts Feed */}
        <div className="posts-feed">
          <div className="feed-header">
            <h2 className="feed-title">Community Feed</h2>
            <div className="sort-options">
              <button 
                className={`sort-button ${sortBy === 'latest' ? 'active' : ''}`}
                onClick={() => setSortBy('latest')}
              >
                Latest
              </button>
              <button 
                className={`sort-button ${sortBy === 'popular' ? 'active' : ''}`}
                onClick={() => setSortBy('popular')}
              >
                Popular
              </button>
            </div>
          </div>

          {posts.length === 0 ? (
            <div className="empty-feed">
              <div className="empty-icon">📝</div>
              <h3>No posts yet</h3>
              <p>Be the first to share something with the community!</p>
              {!isJoined && (
                <button
                  className="empty-feed-button"
                  onClick={handleJoinCommunity}
                  disabled={loading}
                >
                  Join to Create First Post
                </button>
              )}
            </div>
          ) : (
            posts.map(post => (
              <div className="post-card" key={post.id}>
                <div className="post-card-header">
                  <img
                    src={post.user_avatar || `https://i.pravatar.cc/48?u=${post.user_id}`}
                    alt={post.username}
                    className="post-avatar"
                  />
                  <div className="post-user-details">
                    <h4 className="post-username">{post.username}</h4>
                    <span className="post-timestamp">
                      {new Date(post.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  {currentUser && currentUser.id === post.user_id && (
                    <div className="post-options-container" style={{ position: 'relative', marginLeft: 'auto' }}>
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

                <div className="post-body-container" style={{ padding: '0px 0 12px 0' }}>
                  {editingPostId === post.id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <textarea
                        className="post-input"
                        style={{ minHeight: '60px', borderRadius: '4px', background: 'var(--hover-bg)', border: '1px solid var(--accent-color)', width: '100%', padding: '12px' }}
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                      />
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button 
                          onClick={() => setEditingPostId(null)}
                          style={{ padding: '6px 16px', borderRadius: '4px', background: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-color)', cursor: 'pointer', fontSize: '12px' }}
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={() => handleEditPost(post.id)}
                          style={{ padding: '6px 16px', borderRadius: '4px', background: 'var(--accent-color)', border: 'none', color: 'white', cursor: 'pointer', fontSize: '12px' }}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="post-body">{post.content}</p>
                  )}
                </div>

                <div className="post-footer">
                  <div className="vote-container">
                    <button
                      className={`vote-button upvote ${post.user_vote === 1 ? 'active' : ''}`}
                      onClick={() => handleVote(post.id, 1)}
                      disabled={!isJoined}
                    >
                      <ArrowBigUp size={20} fill={post.user_vote === 1 ? "currentColor" : "none"} />
                    </button>
                    <span className={`vote-count ${post.user_vote === 1 ? 'upvoted' : post.user_vote === -1 ? 'downvoted' : ''}`}>
                      {post.vote_score || 0}
                    </span>
                    <button
                      className={`vote-button downvote ${post.user_vote === -1 ? 'active' : ''}`}
                      onClick={() => handleVote(post.id, -1)}
                      disabled={!isJoined}
                    >
                      <ArrowBigDown size={20} fill={post.user_vote === -1 ? "currentColor" : "none"} />
                    </button>
                  </div>
                  <button
                    className="action comment-action"
                    onClick={() => handleComment(post.id)}
                    disabled={!isJoined}
                  >
                    <span className="action-icon">💬</span>
                    <span>{post.comments_count || 0}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityDetail;
