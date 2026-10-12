# Personalized Movie Recommendation System

A beginner-friendly college major project that recommends similar movies using content-based filtering, TF-IDF vectorization, and cosine similarity.

## Features

- Content-based Top-10 recommendations using TF-IDF and cosine similarity
- Movie catalogue, title search, movie details, watchlist, ratings endpoint, and recommendation history
- JWT registration/login with hashed passwords
- Responsive, streaming-inspired React interface

## Architecture

```text
React frontend → Express API → MongoDB
                     ↓
               Python FastAPI ML service
                     ↓
            TF-IDF + cosine similarity
```

## ML methodology

The Python service joins the two TMDb CSVs, extracts the genre, keywords, first three cast members, director, and overview, then combines them into one `tags` field. `TfidfVectorizer` turns tags into numbers based on important words. Cosine similarity compares a selected movie's vector against all other vectors and returns the closest ten movies. The matrix is built once when the ML service starts, not on every request.

### Project structure

```text
movie-recommendation-system/
├── frontend/       # React user interface
├── backend/        # Node.js and Express REST API
├── ml-service/     # Python recommendation service
└── README.md
```

## Dataset

Place these files in `ml-service/data/`:

- `tmdb_5000_movies.csv`
- `tmdb_5000_credits.csv`

They are intentionally ignored by Git so that large data files are not committed.

## Run locally

### 1. MongoDB

Install and run MongoDB locally, or create a free MongoDB Atlas database. Copy each `.env.example` file to `.env`; set `MONGODB_URI` and replace `JWT_SECRET` with a long random value.

### 2. ML service

```bash
cd ml-service
python -m venv .venv
# Windows
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn src.app:app --reload --port 8000
```

Test it at `http://127.0.0.1:8000/health`. For a small independent recommendation check, run `python src/test_recommender.py`.

### 3. Backend

```bash
cd backend
npm install
npm run seed
npm run dev
```

Seeding imports the CSV movie metadata into MongoDB. The API then starts on `http://localhost:5000`.

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal (normally `http://localhost:5173`).

## Important API endpoints

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET /api/movies`, `GET /api/movies/search?q=avatar`, `GET /api/movies/:id`
- `GET /api/recommendations/:movieId` (authenticated)
- `POST /api/ratings`, `GET/POST/DELETE /api/watchlist` (authenticated)
- `GET /api/recommendations/history` (authenticated)

## Future improvements

Add live movie API data, real poster images, collaborative filtering, recommendation explanations, and Precision@K/Recall@K evaluation only after the current content-based version is working.
