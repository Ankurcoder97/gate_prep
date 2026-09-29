import express from 'express';
import {
  generateTest,
  getTestById,
  startTest,
  saveAnswer,
  submitTest,
  getTestResult,
  getTestHistory,
} from '../controllers/testController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/generate', protect, generateTest);
router.get('/history', protect, getTestHistory);
router.get('/:id', protect, getTestById);
router.post('/:id/start', protect, startTest);
router.post('/:id/answer', protect, saveAnswer);
router.post('/:id/submit', protect, submitTest);
router.get('/:id/result', protect, getTestResult);

export default router;
