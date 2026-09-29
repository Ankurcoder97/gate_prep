import express from 'express';
import { getUserAnalytics } from '../controllers/analyticsController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getUserAnalytics);

export default router;
