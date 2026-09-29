import express from 'express';
import {
  uploadPaper,
  getAllPapers,
  getPaperById,
  reprocessPaper,
  deletePaper,
} from '../controllers/paperController.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';
import { uploadPdf } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.post('/upload', protect, adminOnly, uploadPdf.single('file'), uploadPaper);
router.get('/', protect, adminOnly, getAllPapers);
router.get('/:id', protect, adminOnly, getPaperById);
router.post('/:id/reprocess', protect, adminOnly, reprocessPaper);
router.delete('/:id', protect, adminOnly, deletePaper);

export default router;
