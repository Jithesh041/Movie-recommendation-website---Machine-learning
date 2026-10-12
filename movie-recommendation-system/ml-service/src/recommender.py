from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class CoreFilmsRecommender:
    def __init__(self, movies):
        self.movies = movies.reset_index(drop=True)
    
    def recommend(self, nationality, limit=15):
        country_movies = self.movies[self.movies["production_countries_list"].apply(lambda x: nationality in x)]
        high_rated = country_movies[country_movies["vote_average"] >= 8.0]
        
        if len(high_rated) < 15:
            high_rated = country_movies[country_movies["vote_average"] >= 7.0]
            
        # FALLBACK: If still empty, ignore country and just get highly rated movies
        if len(high_rated) == 0:
            high_rated = self.movies[self.movies["vote_average"] >= 7.0]
            
        high_rated = high_rated.sort_values("vote_average", ascending=False)
        return self._format(high_rated.head(limit))

    def _format(self, df):
        return [{"movieId": int(m["id"]), "title": m["title"], "overview": m["overview"], 
                 "genres": m["genres_text"].split(), "releaseDate": str(m["release_date"]) if m["release_date"] else "", 
                 "rating": float(m["vote_average"])} for _, m in df.iterrows()]


class ContentBasedRecommender:
    def __init__(self, movies):
        self.movies = movies.reset_index(drop=True)
        self.vectorizer = TfidfVectorizer(stop_words="english", max_features=10000)
        self.tfidf_matrix = self.vectorizer.fit_transform(self.movies["tags"])
        self.title_to_index = {title.lower(): i for i, title in enumerate(self.movies["title"]) if isinstance(title, str)}
    
    def recommend(self, nationality, seed_movie=None, limit=15):
        country_mask = self.movies["production_countries_list"].apply(lambda x: nationality in x)
        country_movies = self.movies[country_mask]
        
        # FALLBACK: If no movies match country, use all movies
        if len(country_movies) == 0:
            country_movies = self.movies
            
        if seed_movie:
            seed_index = self.title_to_index.get(seed_movie.lower())
            if seed_index is None:
                return self._format(country_movies.sort_values("vote_average", ascending=False).head(limit))
            
            scores = cosine_similarity(self.tfidf_matrix[seed_index], self.tfidf_matrix).flatten()
            recs = []
            for idx in country_movies.index.tolist():
                if idx == seed_index: continue
                m = self.movies.iloc[idx]
                recs.append({"movieId": int(m["id"]), "title": m["title"], "similarity": round(float(scores[idx]), 4),
                             "overview": m["overview"], "genres": m["genres_text"].split(), 
                             "releaseDate": str(m["release_date"]) if m["release_date"] else "", "rating": float(m["vote_average"])})
            recs.sort(key=lambda x: x["similarity"], reverse=True)
            return recs[:limit]
        else:
            return self._format(country_movies.sort_values("vote_average", ascending=False).head(limit))


class CollaborativeRecommender:
    def __init__(self, movies):
        self.movies = movies.reset_index(drop=True)
    
    def recommend(self, nationality, user_id=None, limit=15):
        country_mask = self.movies["production_countries_list"].apply(lambda x: nationality in x)
        country_movies = self.movies[country_mask]
        
        # FALLBACK
        if len(country_movies) == 0:
            country_movies = self.movies
            
        # Sort by popularity (vote_count * vote_average) to simulate collaborative "trends"
        country_movies = country_movies.assign(popularity=country_movies["vote_count"] * country_movies["vote_average"])
        return self._format(country_movies.sort_values("popularity", ascending=False).head(limit))

    def _format(self, df):
        return [{"movieId": int(m["id"]), "title": m["title"], "overview": m["overview"], 
                 "genres": m["genres_text"].split(), "releaseDate": str(m["release_date"]) if m["release_date"] else "", 
                 "rating": float(m["vote_average"])} for _, m in df.iterrows()]


class TopMoviesRecommender:
    def __init__(self, movies):
        self.movies = movies.reset_index(drop=True)
    
    def recommend(self, nationality, limit=15):
        country_mask = self.movies["production_countries_list"].apply(lambda x: nationality in x)
        country_movies = self.movies[country_mask]
        
        # FALLBACK
        if len(country_movies) == 0:
            country_movies = self.movies
            
        return self._format(country_movies.sort_values("vote_average", ascending=False).head(limit))

    def _format(self, df):
        return [{"movieId": int(m["id"]), "title": m["title"], "overview": m["overview"], 
                 "genres": m["genres_text"].split(), "releaseDate": str(m["release_date"]) if m["release_date"] else "", 
                 "rating": float(m["vote_average"])} for _, m in df.iterrows()]


class MovieRecommender:
    def __init__(self, movies):
        self.core = CoreFilmsRecommender(movies)
        self.content = ContentBasedRecommender(movies)
        self.collaborative = CollaborativeRecommender(movies)
        self.top = TopMoviesRecommender(movies)
        self.movies = movies.reset_index(drop=True)
        self.vectorizer = self.content.vectorizer
        self.tfidf_matrix = self.content.tfidf_matrix
        self.title_to_index = self.content.title_to_index
    
    def recommend(self, movie_title, limit=10):
        index = self.title_to_index.get(movie_title.lower())
        if index is None: return None
        scores = cosine_similarity(self.tfidf_matrix[index], self.tfidf_matrix).flatten()
        ranked = scores.argsort()[::-1]
        recs = []
        for idx in ranked:
            if idx == index: continue
            m = self.movies.iloc[idx]
            recs.append({"movieId": int(m["id"]), "title": m["title"], "similarity": round(float(scores[idx]), 4),
                         "overview": m["overview"], "genres": m["genres_text"].split(), 
                         "releaseDate": str(m["release_date"]) if m["release_date"] else "", "rating": float(m["vote_average"])})
            if len(recs) == limit: break
        return recs