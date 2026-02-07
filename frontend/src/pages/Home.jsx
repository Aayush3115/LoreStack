import React, { useEffect, useState, useRef } from 'react';
import Navbar from '../components/Navbar';
import '../Styles/Home.css';

const Home = () => {
const [trendingMovies, setTrendingMovies] = useState([]);
const [error, setError] = useState(null);


const scrollRef = useRef(null);
const isDragging = useRef(false);
const startX = useRef(0);
const scrollLeft = useRef(0);

useEffect(() => {
    const fetchTrending = async () => {
        try {
            const response = await fetch("http://localhost:8000/api/movies/trending/");
            const data = await response.json();
            if (data.status_code === 200 && data.data && data.data.results) {
                setTrendingMovies(data.data.results);
            } else {
                setError("Failed to load trending movies.");
                console.error("Invalid data format from backend:", data);
            }
        } catch (error) {
            setError("Could not connect to the server.");
            console.error("Failed to fetch trending movies:", error);
        }
    };

    fetchTrending();
}, []);

const startDrag = (e) => {
    isDragging.current = true;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;
    scrollRef.current.classList.add('dragging');
};

const stopDrag = () => {
    isDragging.current = false;
    scrollRef.current.classList.remove('dragging');
};

const onDrag = (e) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 2;
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
};

return (
    <div className="home-container">
        <Navbar />

        <main className="main-content">
            <header className="top-header">
                <h2 className="page-title">Home</h2>
                <div className="header-actions">
                    <div className="space-badge">Personal Space</div>
                    <div className="user-avatar"></div>
                </div>
            </header>

            <section className="dashboard-section">
                <h2 className="section-title">Trending Movies</h2>

                <div className="trending-wrapper-edge">
                    <button
                        className="scroll-btn left"
                        onClick={() => scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' })}
                    >
                        ‹
                    </button>

                    <div
                        className="horizontal-scroll"
                        ref={scrollRef}
                        onMouseDown={startDrag}
                        onMouseLeave={stopDrag}
                        onMouseUp={stopDrag}
                        onMouseMove={onDrag}
                    >
                        {error ? (
                            <p className="error-text">{error}</p>
                        ) : trendingMovies.length > 0 ? (
                            trendingMovies.map((movie) => (
                                <div className="movie-card" key={movie.id}>
                                    <img
                                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                        alt={movie.title}
                                        className="movie-poster"
                                    />
                                    <p className="movie-title">{movie.title}</p>
                                </div>
                            ))
                        ) : (
                            <p>Loading trending movies...</p>
                        )}
                    </div>

                    <button
                        className="scroll-btn right"
                        onClick={() => scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' })}
                    >
                        ›
                    </button>
                </div>
            </section>
        </main>
    </div>
);


};

export default Home;
