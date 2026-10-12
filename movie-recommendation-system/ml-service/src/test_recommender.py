from pathlib import Path
from preprocessing import load_and_prepare
from recommender import MovieRecommender

base = Path(__file__).resolve().parent.parent
movies = load_and_prepare(base / "data" / "tmdb_5000_movies.csv", base / "data" / "tmdb_5000_credits.csv")
engine = MovieRecommender(movies)

for title in ["Avatar", "The Dark Knight"]:
    results = engine.recommend(title, 3)
    assert results and results[0]["title"] != title
    print(title, "->", [item["title"] for item in results])

assert engine.recommend("A movie that does not exist") is None
print("Recommendation checks passed.")
