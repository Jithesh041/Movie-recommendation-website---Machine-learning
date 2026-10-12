import 'dotenv/config'; import express from 'express'; import cors from 'cors'; import { connectDatabase } from './config/database.js';
import authRoutes from './routes/authRoutes.js'; import movieRoutes from './routes/movieRoutes.js'; import userMovieRoutes from './routes/userMovieRoutes.js'; import recommendationRoutes from './routes/recommendationRoutes.js';
const app = express(); const clientOrigins = [process.env.CLIENT_URL, 'http://127.0.0.1:5173'].filter(Boolean); app.use(cors({ origin: clientOrigins, credentials: true })); app.use(express.json());
app.get('/health', (req, res) => res.json({ status: 'ok' })); app.use('/api/auth', authRoutes); app.use('/api/movies', movieRoutes); app.use('/api', userMovieRoutes); app.use('/api/recommendations', recommendationRoutes);
app.use((error, req, res, next) => { console.error(error.message); res.status(500).json({ message: 'Something went wrong. Please try again.' }); });
connectDatabase().then(() => app.listen(process.env.PORT || 5000, () => console.log('Backend running'))).catch((error) => { console.error('Database connection failed:', error.message); process.exit(1); });
