import mongoose from 'mongoose';
const historySchema = new mongoose.Schema({ userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, selectedMovie: { movieId: Number, title: String }, recommendedMovies: [{ movieId: Number, title: String, similarity: Number }] }, { timestamps: true });
export default mongoose.model('RecommendationHistory', historySchema);
