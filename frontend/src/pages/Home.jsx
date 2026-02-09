import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Styles/Home.css'
import Sidebar from '../Components/Sidebar/Sidebar';


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
            };

            fetchTrending();
        }, []);

    const startDrag = (e) => {
        isDragging.current = true;
        startX.current = e.pageX - scrollRef.current.offsetLeft;
        scrollLeft.current = scrollRef.current.scrollLeft;
        scrollRef.current.classList.add('dragging');
    };

    fetchTrending();
}, []);

const onDrag = (e) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 2;
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
};

return (
    <div className="home-container">
        <Sidebar />



};

        export default Home;
