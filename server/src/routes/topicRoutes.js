import express from 'express';
import {
  getTopicsBySubject,
  getTopicsByBranch,
  createTopic,
  updateTopic,
  deleteTopic,
} from '../controllers/topicController.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/subject/:subjectId', getTopicsBySubject);
router.get('/branch/:branchId', getTopicsByBranch);
router.post('/', protect, adminOnly, createTopic);
router.put('/:id', protect, adminOnly, updateTopic);
router.delete('/:id', protect, adminOnly, deleteTopic);

export default router;
