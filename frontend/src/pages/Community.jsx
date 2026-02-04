import React, { useState } from "react";
import "../styles/community.css";

const communities = [
  {
    name: "Dark Lore",
    description: "Stories born from shadows, mystery, and the unknown.",
    members: "12.4k members",
    mood: "Dark",
    activeMembers: "342 online",
    storiesCount: "1.2k stories",
  },
  {
    name: "Heart & Soul",
    description: "Emotional tales that hit deep and stay with you.",
    members: "9.1k members",
    mood: "Emotional",
    activeMembers: "219 online",
    storiesCount: "845 stories",
  },
  {
    name: "Comic Relief",
    description: "Light, witty, and comedic stories to lift your mood.",
    members: "7.8k members",
    mood: "Comedy",
    activeMembers: "187 online",
    storiesCount: "623 stories",
  },
  {
    name: "Mystic Minds",
    description: "Mystery, fantasy, and unexplained narratives.",
    members: "10.2k members",
    mood: "Mysterious",
    activeMembers: "298 online",
    storiesCount: "987 stories",
  },
  {
    name: "Inspiring Tales",
    description: "Stories that motivate, uplift, and spark creativity.",
    members: "8.5k members",
    mood: "Inspiring",
    activeMembers: "156 online",
    storiesCount: "512 stories",
  },
  {
    name: "Light Hearts",
    description: "Wholesome, feel-good narratives and happy endings.",
    members: "6.3k members",
    mood: "Light",
    activeMembers: "134 online",
    storiesCount: "421 stories",
  },
];

const Community = () => {
  const [activeMood, setActiveMood] = useState("All");
  const [activeDiscover, setActiveDiscover] = useState("Trending");

  const moods = ["All", "Dark", "Light", "Comedy", "Emotional", "Mysterious", "Inspiring"];
  const discoverOptions = ["Trending", "Top Rated", "New", "Most Active"];

  const filteredCommunities = communities.filter(community => 
    activeMood === "All" || community.mood === activeMood
  );

  return (
    <div className="community-page">
      {/* Left sidebar - Mood Filter */}
      <div className="sidebar">
        <div className="logo-section">
          <div className="logo-icon">📚</div>
          <h1 className="logo-text">LoreStack</h1>
        </div>
        
        <div className="filter-section">
          <h2>FILTER BY MOOD</h2>
          <ul className="mood-list">
            {moods.map((mood, index) => (
              <li 
                key={index} 
                className={activeMood === mood ? "active" : ""}
                onClick={() => setActiveMood(mood)}
              >
                {mood}
                {activeMood === mood && <div className="active-indicator"></div>}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="discover-section">
          <h2>DISCOVER</h2>
          <ul className="discover-list">
            {discoverOptions.map((option, index) => (
              <li 
                key={index} 
                className={activeDiscover === option ? "active" : ""}
                onClick={() => setActiveDiscover(option)}
              >
                {option}
                {activeDiscover === option && <div className="active-indicator"></div>}
              </li>
            ))}
          </ul>
        </div>

        <div className="sidebar-footer">
          <div className="user-stats">
            <div className="stat-item">
              <span className="stat-number">124</span>
              <span className="stat-label">Following</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">42</span>
              <span className="stat-label">Stories</span>
            </div>
          </div>
          <button className="create-community-btn">
            + Create Community
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="main-content">
        <div className="content-header">
          <div className="header-left">
            <h1 className="community-title">Communities</h1>
            <p className="community-subtitle">
              Find your people. Share stories that match your emotion.
            </p>
          </div>
          <div className="header-right">
            <div className="search-bar">
              <span className="search-icon">🔍</span>
              <input type="text" placeholder="Search communities..." />
            </div>
            <button className="filter-btn">
              <span>Filter</span>
              <span>⚙️</span>
            </button>
          </div>
        </div>

        <div className="stats-bar">
          <div className="stat-card">
            <span className="stat-value"></span>
            <span className="stat-label">Total Communities</span>
          </div>
          <div className="stat-card">
            <span className="stat-value"></span>
            <span className="stat-label">Total Members</span>
          </div>
          <div className="stat-card">
            <span className="stat-value"></span>
            <span className="stat-label">Stories Today</span>
          </div>
          <div className="stat-card">
            <span className="stat-value"></span>
            <span className="stat-label">Active Now</span>
          </div>
        </div>

        <div className="community-grid">
          {filteredCommunities.map((community, index) => (
            <div className="community-card" key={index}>
              <div className="card-header">
                <div className="community-icon">
                  {community.mood === "Dark" && "🌙"}
                  {community.mood === "Emotional" && "💖"}
                  {community.mood === "Comedy" && "😂"}
                  {community.mood === "Mysterious" && "🔮"}
                  {community.mood === "Inspiring" && "✨"}
                  {community.mood === "Light" && "☀️"}
                </div>
                <div className="community-info">
                  <div className="community-header">
                    <h2>{community.name}</h2>
                    <span className={`mood-tag ${community.mood.toLowerCase()}`}>
                      {community.mood}
                    </span>
                  </div>
                  <div className="community-meta">
                    <span className="active-members">{community.activeMembers}</span>
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
                  <span className="more-members">+{Math.floor(Math.random() * 50) + 20}</span>
                </div>
                <button className="join-btn">
                  {Math.random() > 0.5 ? "Joined" : "Join"}
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

export default Community;