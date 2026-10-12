import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import MovieCard from '../components/MovieCard';

export default function Home() {
  const { user } = useAuth();
  const [coreMovies, setCoreMovies] = useState([]);
  const [contentMovies, setContentMovies] = useState([]);
  const [collaborativeMovies, setCollaborativeMovies] = useState([]);
  const [topMovies, setTopMovies] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const nationality = user?.nationality || 'United States';

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      setError('');
      
      try {
        // Try to fetch from ML recommendation endpoints
        const [coreRes, contentRes, collabRes, topRes] = await Promise.allSettled([
          api.get('/recommendations/core', { params: { nationality, limit: 15 } }),
          api.get('/recommendations/content', { params: { nationality, limit: 15 } }),
          api.get('/recommendations/collaborative', { params: { nationality, limit: 15 } }),
          api.get('/recommendations/top', { params: { nationality, limit: 15 } })
        ]);

        // Extract successful responses
        const coreData = coreRes.status === 'fulfilled' ? (coreRes.value.data.recommendations || []) : [];
        const contentData = contentRes.status === 'fulfilled' ? (contentRes.value.data.recommendations || []) : [];
        const collabData = collabRes.status === 'fulfilled' ? (collabRes.value.data.recommendations || []) : [];
        const topData = topRes.status === 'fulfilled' ? (topRes.value.data.recommendations || []) : [];

        console.log('API Results:', { coreData, contentData, collabData, topData });

        // If ALL endpoints failed or returned empty, use fallback
        if (coreData.length === 0 && contentData.length === 0 && collabData.length === 0 && topData.length === 0) {
          console.log('All ML endpoints failed/empty, fetching from /movies');
          await fetchFallbackMovies();
        } else {
          // Use what we got, fallback empty ones
          const fallbackList = topData.length ? topData : (coreData.length ? coreData : []);
          
          setCoreMovies(coreData.length ? coreData : fallbackList);
          setContentMovies(contentData.length ? contentData : fallbackList);
          setCollaborativeMovies(collabData.length ? collabData : fallbackList);
          setTopMovies(topData.length ? topData : fallbackList);
        }
      } catch (err) {
        console.error('Failed to fetch recommendations:', err);
        await fetchFallbackMovies();
      } finally {
        setLoading(false);
      }
    };

    const fetchFallbackMovies = async () => {
      try {
        console.log('Fetching fallback movies from /movies endpoint');
        const { data } = await api.get('/movies');
        const allMovies = data.movies || [];
        
        if (allMovies.length === 0) {
          setError('No movies available in the database');
          return;
        }

        // Sort by rating
        const sorted = [...allMovies].sort((a, b) => (b.rating || 0) - (a.rating || 0));
        
        // Create 4 distinct sections
        const coreList = sorted.filter(m => m.rating >= 8.0);
        const finalCore = coreList.length >= 5 ? coreList : sorted.filter(m => m.rating >= 7.0);
        
        setCoreMovies(finalCore.slice(0, 12));
        setContentMovies(sorted.slice(2, 14));
        setCollaborativeMovies(sorted.slice(4, 16));
        setTopMovies(sorted.slice(0, 12));
        
        console.log('Fallback movies loaded:', { 
          core: finalCore.length, 
          content: sorted.slice(2, 14).length,
          collab: sorted.slice(4, 16).length,
          top: sorted.slice(0, 12).length
        });
      } catch (err) {
        console.error('Fallback also failed:', err);
        setError('Failed to load movies. Please try again later.');
      }
    };

    fetchRecommendations();
  }, [nationality]);

  const Section = ({ title, eyebrow, movies }) => {
    if (!movies || movies.length === 0) return null;
    
    return (
      <section className="content">
        <div className="section-title">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h2>{title}</h2>
          </div>
          <Link to="/movies">See all →</Link>
        </div>
        <div className="movie-row">
          {movies.slice(0, 8).map((movie, index) => (
            <MovieCard key={movie.movieId || movie.id || index} movie={movie} index={index} />
          ))}
        </div>
      </section>
    );
  };

  if (loading) {
    return (
      <div className="page" style={{ padding: '80px max(7vw, 30px)', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p className="empty">Loading your recommendations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page" style={{ padding: '80px max(7vw, 30px)', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p className="empty" style={{ color: '#ef5360' }}>{error}</p>
      </div>
    );
  }

  return (
    <>
      <section className="home-intro">
        <p className="eyebrow">Welcome back</p>
        <h1>Hi, {user?.name || 'Movie Lover'}.<br /><i>Ready to watch?</i></h1>
        <p>Here are your personalized recommendations from {nationality}.</p>
      </section>

      <section className="search-row">
        <input 
          value={query} 
          onChange={(event) => setQuery(event.target.value)} 
          placeholder="Search a movie title..." 
        />
        <Link className="button secondary" to={`/movies?q=${encodeURIComponent(query)}`}>Search</Link>
      </section>

      <Section 
        title="Core Film Recommendations" 
        eyebrow="HIGHLY RATED"
        movies={coreMovies} 
      />
      
      <Section 
        title="Content-Based Recommendations" 
        eyebrow="BASED ON YOUR TASTE"
        movies={contentMovies} 
      />
      
      <Section 
        title="Collaborative Recommendations" 
        eyebrow="SIMILAR VIEWERS LIKED"
        movies={collaborativeMovies} 
      />
      
      <Section 
        title="Top Movies" 
        eyebrow="MOST POPULAR"
        movies={topMovies} 
      />

      {coreMovies.length === 0 && contentMovies.length === 0 && collaborativeMovies.length === 0 && topMovies.length === 0 && (
        <div className="content">
          <p className="empty">No movies available. Please check your connection or try again later.</p>
        </div>
      )}
    </>
  );
}