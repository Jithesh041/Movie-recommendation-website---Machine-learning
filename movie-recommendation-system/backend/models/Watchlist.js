import mongoose from 'mongoose';
const watchlistSchema = new mongoose.Schema({ userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, movieId: { type: Number, required: true } }, { timestamps: true });
watchlistSchema.index({ userId: 1, movieId: 1 }, { unique: true });
export default mongoose.model('Watchlist', watchlistSchema);
