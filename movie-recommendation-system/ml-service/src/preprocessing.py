"""Small, readable data-preparation functions for the recommendation model."""
import ast
import pandas as pd

def names_from_json(value, limit=None):
    try:
        items = ast.literal_eval(value) if isinstance(value, str) else []
        names = [item["name"].replace(" ", "") for item in items if "name" in item]
        return " ".join(names[:limit] if limit else names)
    except (ValueError, SyntaxError, TypeError):
        return ""

def director_from_json(value):
    try:
        crew = ast.literal_eval(value) if isinstance(value, str) else []
        return " ".join(person["name"].replace(" ", "") for person in crew if person.get("job") == "Director")
    except (ValueError, SyntaxError, TypeError):
        return ""

def countries_from_json(value):
    try:
        items = ast.literal_eval(value) if isinstance(value, str) else []
        countries = [item.get("name", "") for item in items if "name" in item]
        normalized = []
        for country in countries:
            if country == "United States of America":
                normalized.append("United States")
            else:
                normalized.append(country)
        return normalized
    except (ValueError, SyntaxError, TypeError):
        return []

def load_and_prepare(movies_path, credits_path):
    movies = pd.read_csv(movies_path)
    credits = pd.read_csv(credits_path)
    credits = credits.rename(columns={"movie_id": "id", "title": "credit_title"})
    data = movies.merge(credits[["id", "cast", "crew"]], on="id", how="inner")

    # FIX: Added "production_countries" to prevent NaN errors
    for column in ["overview", "genres", "keywords", "cast", "crew", "production_countries"]:
        data[column] = data[column].fillna("[]")

    data["genres_text"] = data["genres"].apply(names_from_json)
    data["keywords_text"] = data["keywords"].apply(names_from_json)
    data["cast_text"] = data["cast"].apply(lambda value: names_from_json(value, limit=3))
    data["director_text"] = data["crew"].apply(director_from_json)
    data["production_countries_list"] = data["production_countries"].apply(countries_from_json)
    data["tags"] = (data["overview"] + " " + data["genres_text"] + " " + data["keywords_text"] + " " + data["cast_text"] + " " + data["director_text"]).str.lower()
    
    return data