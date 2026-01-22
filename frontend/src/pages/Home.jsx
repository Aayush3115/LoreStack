import { useEffect, useState } from "react";
import API from "../api/api";

function Home() {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    API.get("posts/")
      .then(res => {
        console.log("API response:", res.data);
        setPosts(res.data);
      })
      .catch(err => {
        console.error("API error:", err);
        setError("Failed to load posts");
      });
  }, []);

  return (
    <div style={{ color: "white", padding: "20px" }}>
      <h1>Feed</h1>

      {error && <p>{error}</p>}

      {posts.length === 0 && !error && <p>No posts yet</p>}

      {posts.map(post => (
        <div key={post.id} style={{ marginBottom: "20px" }}>
          <h3>{post.title}</h3>
          <p>{post.content}</p>
        </div>
      ))}
    </div>
  );
}

export default Home;
