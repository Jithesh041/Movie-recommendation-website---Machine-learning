import axios from 'axios';
export async function getRecommendations(movieTitle) { const response = await axios.post(`${process.env.ML_SERVICE_URL}/recommend`, { movie_title: movieTitle, limit: 10 }, { timeout: 15000 }); return response.data.recommendations; }
