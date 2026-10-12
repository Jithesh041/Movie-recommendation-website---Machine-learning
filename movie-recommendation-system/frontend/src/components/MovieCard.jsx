import { Link } from 'react-router-dom';

export default function MovieCard({ movie, index }) {
  const initial = movie.title ? movie.title.charAt(0).toUpperCase() : '?';
  const year = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : '';
  const rating = movie.rating ? `★ ${movie.rating.toFixed(1)}` : '';

  // Cycle through the gradient classes defined in your CSS for variety
  const colorClasses = ['card-a', 'card-b', 'card-c', 'card-d', 'card-e'];
  const colorClass = colorClasses[index % colorClasses.length];

  return (
    <Link to={`/movies/${movie.movieId}`} className={`movie-card ${colorClass}`}>
      <div className="card-art">
        {/* If you have poster images, use this img tag. Otherwise, it shows the initial letter 'b' */}
        {movie.posterPath ? (
          <img 
            src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`} 
            alt={movie.title} 
            style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0, zIndex: 0 }} 
          />
        ) : (
          <b>{initial}</b>
        )}
        {rating && <span>{rating}</span>}
      </div>
      <div className="card-info">
        <h3>{movie.title}</h3>
        <p>{year} {movie.genres?.[0] ? `· ${movie.genres[0]}` : ''}</p>
      </div>
    </Link>
  );
}