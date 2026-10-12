import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import MovieCard from '../components/MovieCard';

export default function Dashboard() {
  const { user } = useAuth();
  const [coreMovies, setCoreMovies] = useState([]);
  const [contentMovies, setContentMovies] = useState([]);
  const [collaborativeMovies, setCollaborativeMovies] = useState([]);
  const [topMovies, setTopMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const nationality = user?.nationality || 'United States';

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const [coreRes, contentRes, collabRes, topRes] = await Promise.all([
          api.get('/recommendations/core', { params: { nationality, limit: 15 } }),
          api.get('/recommendations/content', { params: { nationality, limit: 15 } }),
          api.get('/recommendations/collaborative', { params: { nationality, limit: 15 } }),
          api.get('/recommendations/top', { params: { nationality, limit: 15 } })
        ]);

        setCoreMovies(coreRes.data.recommendations);
        setContentMovies(contentRes.data.recommendations);
        setCollaborativeMovies(collabRes.data.recommendations);
        setTopMovies(topRes.data.recommendations);
      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [nationality]);

  if (loading) {
    return <div className="loading">Loading your personalized dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <section className="dashboard-intro">
        <p className="eyebrow">Welcome back</p>
        <h1>Hi, {user?.name || 'Movie Lover'}.</h1>
        <p>Here are your personalized recommendations from {nationality}.</p>
      </section>

      {/* Section 1: Core Films */}
      <section className="dashboard-section">
        <div className="section-header">
          <div>
            <p className="eyebrow">Highly Rated</p>
            <h2>Core Film Recommendations</h2>
          </div>
          <Link to="/movies?filter=core">See all →</Link>
        </div>
        <div className="movie-row">
          {coreMovies.slice(0, 8).map((movie, index) => (
            <MovieCard key={movie.movieId} movie={movie} index={index} />
          ))}
        </div>
      </section>

      {/* Section 2: Content-Based */}
      <section className="dashboard-section">
        <div className="section-header">
          <div>
            <p className="eyebrow">Based on your taste</p>
            <h2>Content-Based Recommendations</h2>
          </div>
          <Link to="/movies?filter=content">See all →</Link>
        </div>
        <div className="movie-row">
          {contentMovies.slice(0, 8).map((movie, index) => (
            <MovieCard key={movie.movieId} movie={movie} index={index} />
          ))}
        </div>
      </section>

      {/* Section 3: Collaborative */}
      <section className="dashboard-section">
        <div className="section-header">
          <div>
            <p className="eyebrow">Similar viewers liked</p>
            <h2>Collaborative Recommendations</h2>
          </div>
          <Link to="/movies?filter=collaborative">See all →</Link>
        </div>
        <div className="movie-row">
          {collaborativeMovies.slice(0, 8).map((movie, index) => (
            <MovieCard key={movie.movieId} movie={movie} index={index} />
          ))}
        </div>
      </section>

      {/* Section 4: Top Movies */}
      <section className="dashboard-section">
        <div className="section-header">
          <div>
            <p className="eyebrow">Most popular</p>
            <h2>Top Movies</h2>
          </div>
          <Link to="/movies?filter=top">See all →</Link>
        </div>
        <div className="movie-row">
          {topMovies.slice(0, 8).map((movie, index) => (
            <MovieCard key={movie.movieId} movie={movie} index={index} />
          ))}
        </div>
      </section>
    </div>
  );
}