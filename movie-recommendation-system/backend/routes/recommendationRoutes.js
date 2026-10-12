import { Router } from 'express'; import { requireAuth } from '../middleware/authMiddleware.js'; import { history, recommendations } from '../controllers/recommendationController.js';
const router = Router(); router.use(requireAuth); router.get('/history', history); router.get('/:movieId', recommendations); export default router;
