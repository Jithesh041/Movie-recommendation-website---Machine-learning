import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import MovieCard from '../components/MovieCard';

export default function Movies() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [loading, setLoading] = useState(true);
  
  const [coreMovies, setCoreMovies] = useState([]);
  const [contentMovies, setContentMovies] = useState([]);
  const [collaborativeMovies, setCollaborativeMovies] = useState([]);
  const [topMovies, setTopMovies] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [allMovies, setAllMovies] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const nationality = user?.nationality || 'United States';

  // 1. Fetch all movies once on mount
  useEffect(() => {
    api.get('/movies').then(({ data }) => {
      setAllMovies(data.movies || []);
    }).catch(console.error);
  }, []);

  // 2. Handle search and sections
  useEffect(() => {
    const q = searchParams.get('q') || '';
    setQuery(q); // Sync input with URL

    if (q) {
      setIsSearching(true);
      // Wait for allMovies to load before filtering
      if (allMovies.length > 0) {
        const filtered = allMovies.filter(m => 
          m.title && m.title.toLowerCase().includes(q.toLowerCase())
        );
        setSearchResults(filtered);
        setLoading(false);
      } else {
        setLoading(true);
      }
    } else {
      setIsSearching(false);
      fetchAllSections();
    }
  }, [searchParams, allMovies, nationality]);

  const fetchAllSections = async () => {
    setLoading(true);
    try {
      const [coreRes, contentRes, collabRes, topRes] = await Promise.allSettled([
        api.get('/recommendations/core', { params: { nationality, limit: 15 } }),
        api.get('/recommendations/content', { params: { nationality, limit: 15 } }),
        api.get('/recommendations/collaborative', { params: { nationality, limit: 15 } }),
        api.get('/recommendations/top', { params: { nationality, limit: 15 } })
      ]);

      const coreData = coreRes.status === 'fulfilled' ? (coreRes.value.data.recommendations || []) : [];
      const contentData = contentRes.status === 'fulfilled' ? (contentRes.value.data.recommendations || []) : [];
      const collabData = collabRes.status === 'fulfilled' ? (collabRes.value.data.recommendations || []) : [];
      const topData = topRes.status === 'fulfilled' ? (topRes.value.data.recommendations || []) : [];

      if (coreData.length === 0 && contentData.length === 0 && collabData.length === 0 && topData.length === 0) {
        const sorted = [...allMovies].sort((a, b) => (b.rating || 0) - (a.rating || 0));
        const coreList = sorted.filter(m => m.rating >= 8.0);
        const finalCore = coreList.length >= 5 ? coreList : sorted.filter(m => m.rating >= 7.0);
        
        setCoreMovies(finalCore.slice(0, 12));
        setContentMovies(sorted.slice(2, 14));
        setCollaborativeMovies(sorted.slice(4, 16));
        setTopMovies(sorted.slice(0, 12));
      } else {
        const fallbackList = topData.length ? topData : (coreData.length ? coreData : []);
        setCoreMovies(coreData.length ? coreData : fallbackList);
        setContentMovies(contentData.length ? contentData : fallbackList);
        setCollaborativeMovies(collabData.length ? collabData : fallbackList);
        setTopMovies(topData.length ? topData : fallbackList);
      }
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
      const sorted = [...allMovies].sort((a, b) => (b.rating || 0) - (a.rating || 0));
      setCoreMovies(sorted.filter(m => m.rating >= 7.0).slice(0, 12));
      setContentMovies(sorted.slice(2, 14));
      setCollaborativeMovies(sorted.slice(4, 16));
      setTopMovies(sorted.slice(0, 12));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query.trim() });
    } else {
      setSearchParams({});
    }
  };

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

  if (loading && !isSearching) {
    return <div className="content empty">Loading your recommendations...</div>;
  }

  return (
    <>
      <section className="home-intro">
        <p className="eyebrow">{isSearching ? 'SEARCH RESULTS' : 'BROWSE THE CATALOGUE'}</p>
        <h1>{isSearching ? `Results for "${query}"` : 'Find your film.'}</h1>
        <p>{isSearching ? `${searchResults.length} movies found.` : 'Search our collection or explore our curated recommendations.'}</p>
      </section>

      <section className="search-row">
        <form onSubmit={handleSearch} style={{ display: 'flex', width: '100%', gap: '9px' }}>
          <input 
            value={query} 
            onChange={(event) => setQuery(event.target.value)} 
            placeholder="Search a movie title..." 
          />
          <button type="submit" className="button secondary">Search</button>
        </form>
      </section>

      {isSearching ? (
        <section className="content">
          {searchResults.length > 0 ? (
            <div className="movie-grid">
              {searchResults.map((movie, index) => (
                <MovieCard key={movie.movieId || movie.id || index} movie={movie} index={index} />
              ))}
            </div>
          ) : (
            <p className="empty">No movies found. Try a different search.</p>
          )}
        </section>
      ) : (
        <>
          <Section title="Core Film Recommendations" eyebrow="HIGHLY RATED" movies={coreMovies} />
          <Section title="Content-Based Recommendations" eyebrow="BASED ON YOUR TASTE" movies={contentMovies} />
          <Section title="Collaborative Recommendations" eyebrow="SIMILAR VIEWERS LIKED" movies={collaborativeMovies} />
          <Section title="Top Movies" eyebrow="MOST POPULAR" movies={topMovies} />
        </>
      )}
    </>
  );
}