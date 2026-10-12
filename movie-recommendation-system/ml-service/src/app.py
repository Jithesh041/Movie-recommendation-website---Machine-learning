import os
from pathlib import Path
from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel, Field
from .preprocessing import load_and_prepare
from .recommender import MovieRecommender

BASE_DIRECTORY = Path(__file__).resolve().parent.parent
movies_path = os.getenv("MOVIES_DATASET_PATH", BASE_DIRECTORY / "data" / "tmdb_5000_movies.csv")
credits_path = os.getenv("CREDITS_DATASET_PATH", BASE_DIRECTORY / "data" / "tmdb_5000_credits.csv")

app = FastAPI(title="Movie Recommendation ML API")
recommender = None


class RecommendationRequest(BaseModel):
    movie_title: str = Field(min_length=1, max_length=200)
    limit: int = Field(default=10, ge=1, le=20)


@app.on_event("startup")
def create_model_once():
    global recommender
    movies = load_and_prepare(movies_path, credits_path)
    recommender = MovieRecommender(movies)


@app.get("/health")
def health():
    return {"status": "ok", "modelLoaded": recommender is not None}


@app.post("/recommend")
def recommend(request: RecommendationRequest):
    results = recommender.recommend(request.movie_title.strip(), request.limit)
    if results is None:
        raise HTTPException(status_code=404, detail="Movie title not found in the dataset.")
    return {"movie": request.movie_title, "recommendations": results}


@app.get("/recommendations/core")
def get_core_recommendations(
    nationality: str = Query(default="United States"),
    limit: int = Query(default=15, ge=1, le=20)
):
    """Core film recommendations (IMDB 8+ or 7+ fallback)"""
    results = recommender.core.recommend(nationality, limit)
    return {"nationality": nationality, "recommendations": results}


@app.get("/recommendations/content")
def get_content_recommendations(
    nationality: str = Query(default="United States"),
    seed_movie: str = Query(default=None),
    limit: int = Query(default=15, ge=1, le=20)
):
    """Content-based recommendations filtered by nationality"""
    results = recommender.content.recommend(nationality, seed_movie, limit)
    return {"nationality": nationality, "recommendations": results}


@app.get("/recommendations/collaborative")
def get_collaborative_recommendations(
    nationality: str = Query(default="United States"),
    user_id: str = Query(default=None),
    limit: int = Query(default=15, ge=1, le=20)
):
    """Collaborative filtered recommendations"""
    results = recommender.collaborative.recommend(nationality, user_id, limit)
    return {"nationality": nationality, "recommendations": results}


@app.get("/recommendations/top")
def get_top_recommendations(
    nationality: str = Query(default="United States"),
    limit: int = Query(default=15, ge=1, le=20)
):
    """Top movies from the specified nationality"""
    results = recommender.top.recommend(nationality, limit)
    return {"nationality": nationality, "recommendations": results}