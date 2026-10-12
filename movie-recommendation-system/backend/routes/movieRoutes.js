import { Router } from 'express'; import { getMovie, listMovies, searchMovies } from '../controllers/movieController.js';
const router = Router(); router.get('/search', searchMovies); router.get('/', listMovies); router.get('/:id', getMovie); export default router;
