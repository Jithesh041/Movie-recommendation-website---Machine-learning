import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Random() {
  const [pool, setPool] = useState([]);
  const [movie, setMovie] = useState(null);

  const pickOne = (source = pool) => {
    if (source.length > 0) {
      const randomIndex = Math.floor(Math.random() * source.length);
      setMovie(source[randomIndex]);
    }
  };

  useEffect(() => {
    api.get('/movies').then(({ data }) => {
      const movies = data.movies || [];
      setPool(movies);
      if (movies.length > 0) {
        pickOne(movies);
      }
    }).catch(console.error);
  }, []);

  const getInitial = (title) => title ? title.charAt(0).toUpperCase() : '?';
  
  // Cycle through the gradient classes for visual variety
  const colorClasses = ['card-a', 'card-b', 'card-c', 'card-d', 'card-e'];
  const colorClass = movie ? colorClasses[movie.movieId % colorClasses.length] : 'card-a';

  return (
    <section className="content page">
      <p className="eyebrow">No scrolling required</p>
      <h1>Random pick.</h1>
      <p className="random-copy">Tap for a fresh film with ratings and descriptions.</p>
      
      <button className="button" onClick={() => pickOne()} disabled={pool.length === 0}>
        ✦ Surprise me
      </button>

      {movie && (
        <div className="details" style={{ marginTop: '40px' }}>
          {/* Large Poster / Art Section */}
          <div className={`${colorClass} large-art`}>
            {movie.posterPath ? (
              <img 
                src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`} 
                alt={movie.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
              />
            ) : (
              <b>{getInitial(movie.title)}</b>
            )}
          </div>

          {/* Movie Info Section */}
          <div>
            <h1 style={{ fontSize: 'clamp(32px, 4vw, 48px)', marginBottom: '10px', letterSpacing: '-2px' }}>
              {movie.title}
            </h1>
            
            <div className="pills">
              {movie.rating && (
                <span style={{ color: '#ffbf41', border: 'none', padding: 0, fontWeight: 'bold' }}>
                  ★ {movie.rating.toFixed(1)}
                </span>
              )}
              {movie.releaseDate && (
                <span>{new Date(movie.releaseDate).getFullYear()}</span>
              )}
              {movie.genres && movie.genres.slice(0, 3).map((genre, i) => (
                <span key={i}>{genre}</span>
              ))}
            </div>

            <p className="overview">
              {movie.overview || 'A film waiting to be discovered.'}
            </p>

            {movie.director && (
              <p className="credits">
                <b>Director:</b> {movie.director}
              </p>
            )}

            {movie.cast && movie.cast.length > 0 && (
              <p className="credits">
                <b>Cast:</b> {movie.cast.join(', ')}
              </p>
            )}

            <div className="button-row">
              <Link to={`/movies/${movie.movieId}`} className="button">
                View Full Details
              </Link>
              {/* <button className="button secondary" onClick={() => pickOne()}>
                Another One
              </button> */}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}