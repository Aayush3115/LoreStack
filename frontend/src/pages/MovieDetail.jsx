import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import '../Styles/MovieDetail.css'; 

const API_KEY = "beb9a7b48107cfe7a10f397963727baa";

const MovieDetail = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=en-US`
        );
        const data = await response.json();
        setMovie(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching movie:", error);
        setLoading(false);
      }
    };

    fetchMovie();
  }, [id]);

  if (loading) return <h2>Loading...</h2>;
  if (!movie) return <h2>Movie not found</h2>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>{movie.title}</h1>
      <img
        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
        alt={movie.title}
      />
      <p><strong>Release Date:</strong> {movie.release_date}</p>
      <p><strong>Rating:</strong> ⭐ {movie.vote_average}</p>
      <p><strong>Overview:</strong> {movie.overview}</p>
    </div>
  );
};

export default MovieDetail;