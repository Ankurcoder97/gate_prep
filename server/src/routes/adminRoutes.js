import express from 'express';
import {
  getAdminStats,
  getBlueprints,
  createBlueprint,
} from '../controllers/adminController.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/stats', protect, adminOnly, getAdminStats);
router.get('/blueprints', protect, adminOnly, getBlueprints);
router.post('/blueprints', protect, adminOnly, createBlueprint);

export default router;
