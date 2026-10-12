import mongoose from 'mongoose';
const ratingSchema = new mongoose.Schema({ userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, movieId: { type: Number, required: true }, rating: { type: Number, min: 1, max: 5, required: true } }, { timestamps: true });
ratingSchema.index({ userId: 1, movieId: 1 }, { unique: true });
export default mongoose.model('Rating', ratingSchema);
