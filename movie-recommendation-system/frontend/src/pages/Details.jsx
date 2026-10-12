import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import MovieCard from '../components/MovieCard';

export default function Details() {
  const { id } = useParams();
  const { user } = useAuth();
  
  const [movie, setMovie] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState('');

  useEffect(() => {
    api.get(`/movies/${id}`)
      .then(({ data }) => setMovie(data.movie))
      .catch(console.error);
  }, [id]);

  const recommend = async () => {
    if (!user) return setMessage('Sign in to get recommendations.');
    try {
      const { data } = await api.get(`/recommendations/${id}`);
      setRecommendations(data.recommendations);
    } catch {
      setMessage('Recommendations are unavailable right now. Please make sure the ML service is running.');
    }
  };

  const watchlist = async () => {
    if (!user) return setMessage('Sign in to save movies.');
    try {
      await api.post('/watchlist', { movieId: Number(id) });
      setMessage('Added to My List.');
    } catch {
      setMessage('Failed to add to My List.');
    }
  };

  const saveRating = async () => {
    if (!user) return setMessage('Sign in to rate movies.');
    if (!rating) return setMessage('Choose a rating first.');
    try {
      await api.post('/ratings', { movieId: Number(id), rating: Number(rating) });
      setMessage('Your rating was saved.');
    } catch {
      setMessage('Failed to save rating.');
    }
  };

  if (!movie) return <div className="content empty">Loading movie...</div>;

  return (
    <section className="content">
      <div className="details">
        {/* Large Poster / Art Section */}
        <div className="large-art">
          <b>{movie.title.slice(0, 1)}</b>
        </div>

        {/* Movie Info Section */}
        <div>
          <p className="eyebrow">
            {movie.releaseDate?.slice(0, 4)} · ★ {movie.rating}
          </p>
          <h1>{movie.title}</h1>
          
          <div className="pills">
            {movie.genres?.map((genre) => (
              <span key={genre}>{genre}</span>
            ))}
          </div>

          <p className="overview">
            {movie.overview || 'No overview available.'}
          </p>

          <p className="credits">
            <b>Director</b> {movie.director || 'Not available'}<br />
            <b>Cast</b> {movie.cast?.join(', ') || 'Not available'}
          </p>

          <div className="button-row">
            <button className="button" onClick={recommend}>
               Get recommendations
            </button>
            <button className="button secondary" onClick={watchlist}>
              ＋ My List
            </button>
          </div>

          <div className="rate-row">
            <select value={rating} onChange={(event) => setRating(event.target.value)}>
              <option value="">Rate this movie</option>
              {[1, 2, 3, 4, 5].map((item) => (
                <option key={item} value={item}>
                  {item} star{item > 1 ? 's' : ''}
                </option>
              ))}
            </select>
            <button className="button secondary" onClick={saveRating}>
              Save rating
            </button>
          </div>

          {message && <p className="notice">{message}</p>}
        </div>
      </div>

      {/* Recommendations Section */}
      {recommendations.length > 0 && (
        <section style={{ marginTop: '60px' }}>
          <div className="section-title">
            <h2>Because you watched {movie.title}</h2>
          </div>
          <div className="movie-row">
            {recommendations.map((item, index) => (
              <MovieCard key={item.movieId} movie={item} index={index} />
            ))}
          </div>
        </section>
      )}
    </section>
  );
}