import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../Components/Sidebar/Sidebar";
import api from "../api/api";
import "../styles/communityDetail.css";

const CommunityDetail = () => {
  const { id } = useParams();

  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [selectedMood, setSelectedMood] = useState("");
  const [selectedRating, setSelectedRating] = useState("");
  const [customTag, setCustomTag] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);

  const moods = ["Happy", "Sad", "Excited", "Thoughtful", "Angry", "Loved"];
  const ratings = ["5/5", "4/5", "3/5", "2/5", "1/5"];

  useEffect(() => {
    fetchCommunity();
    fetchPosts();
  }, [id]);

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
      const res = await api.get(`/loreroom/${id}/posts/`);
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
      // Extract hashtags from content
      const hashtags = newPost.match(/#[a-zA-Z0-9_]+/g) || [];
      
      const postData = {
        content: newPost,
        mood: selectedMood,
        rating: selectedRating,
        tags: [...hashtags, ...(customTag ? customTag.split(',').map(t => t.trim()) : [])].filter(t => t)
      };

      const res = await api.post(`/loreroom/${id}/posts/`, postData);

      setPosts([res.data, ...posts]);
      setNewPost("");
      setSelectedMood("");
      setSelectedRating("");
      setCustomTag("");
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (postId) => {
    if (!isJoined) return;
    
    try {
      await api.post(`/posts/${postId}/like/`);
      setPosts(posts.map(post =>
        post.id === postId
          ? { ...post, likes: (post.likes || 0) + 1, user_liked: true }
          : post
      ));
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleComment = async (postId) => {
    if (!isJoined) return;
    // Navigate to comments page or open comment modal
    // You can implement this based on your requirements
  };

  if (!community) return null;

  return (
    <div className="community-detail-page">
      <Sidebar />

      <div className="community-detail-content">
        {/* Header Section */}
        <div className="community-header">
          <div className="community-header-left">
            <h1 className="community-name">{community.name}</h1>
            <p className="community-description">{community.description || "Film lovers sharing reviews & moods."}</p>
            <div className="community-meta">
              <span className="member-count">👥 {community.memberCount || 1245} members</span>
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

        {/* Create Post Section - Only visible to joined members */}
        {isJoined && (
          <div className="create-post-container">
            <div className="create-post-header">
              <h2>Create a post</h2>
              <p>Share your thoughts with the community</p>
            </div>

            <div className="create-post-form">
              <textarea
                placeholder="What's on your mind? Use #tags for topics..."
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                className="post-input"
                disabled={posting}
              />

              <div className="post-options">
                <div className="option-row">
                  <div className="option-item">
                    <label>Mood</label>
                    <select 
                      value={selectedMood} 
                      onChange={(e) => setSelectedMood(e.target.value)}
                      className="option-select"
                      disabled={posting}
                    >
                      <option value="">Select mood</option>
                      {moods.map(mood => (
                        <option key={mood} value={mood}>😊 {mood}</option>
                      ))}
                    </select>
                  </div>

                  <div className="option-item">
                    <label>Rating</label>
                    <select 
                      value={selectedRating} 
                      onChange={(e) => setSelectedRating(e.target.value)}
                      className="option-select"
                      disabled={posting}
                    >
                      <option value="">Add rating</option>
                      {ratings.map(rating => (
                        <option key={rating} value={rating}>⭐ {rating}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="option-item full-width">
                  <label>Custom tags</label>
                  <input
                    type="text"
                    placeholder="e.g., thriller, romance, action (comma separated)"
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    className="tags-input"
                    disabled={posting}
                  />
                </div>
              </div>

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
          <h2 className="feed-title">Community Feed</h2>
          
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
                  {(post.mood || post.rating) && (
                    <div className="post-meta-badges">
                      {post.mood && (
                        <span className="badge mood">
                          😊 {post.mood}
                        </span>
                      )}
                      {post.rating && (
                        <span className="badge rating">
                          ⭐ {post.rating}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <p className="post-body">{post.content}</p>

                {post.tags && post.tags.length > 0 && (
                  <div className="post-tags">
                    {post.tags.map((tag, index) => (
                      <span key={index} className="tag">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="post-footer">
                  <button 
                    className={`action like-action ${post.user_liked ? 'liked' : ''}`}
                    onClick={() => handleLike(post.id)}
                    disabled={!isJoined}
                  >
                    <span className="action-icon">❤️</span>
                    <span>{post.likes || 0}</span>
                  </button>
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