import express from 'express';
import {
  getQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  verifyQuestion,
  batchVerify,
  deleteQuestion,
} from '../controllers/questionController.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getQuestions);
router.get('/:id', protect, getQuestionById);
router.post('/', protect, adminOnly, createQuestion);
router.put('/:id', protect, adminOnly, updateQuestion);
router.patch('/:id/verify', protect, adminOnly, verifyQuestion);
router.post('/batch-verify', protect, adminOnly, batchVerify);
router.delete('/:id', protect, adminOnly, deleteQuestion);

export default router;
