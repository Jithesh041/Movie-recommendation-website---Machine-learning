import mongoose from 'mongoose';
const movieSchema = new mongoose.Schema({
  movieId: { type: Number, required: true, unique: true, index: true }, title: { type: String, required: true, index: true },
  overview: String, genres: [String], keywords: [String], cast: [String], director: String,
  releaseDate: String, rating: Number, posterPath: String,
}, { timestamps: true });
export default mongoose.model('Movie', movieSchema);
