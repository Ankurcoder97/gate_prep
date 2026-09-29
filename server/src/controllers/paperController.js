import { Paper } from '../models/Paper.js';
import { Question } from '../models/Question.js';
import { PdfParserService } from '../services/pdfParserService.js';

export const uploadPaper = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF file' });
    }

    const { title, branchId, year, session } = req.body;

    if (!title || !branchId || !year) {
      return res.status(400).json({
        success: false,
        message: 'Title, Branch, and Exam Year are required',
      });
    }

    const paper = await Paper.create({
      title,
      branchId,
      year: parseInt(year, 10),
      session: session || 'Session 1',
      fileUrl: req.file.path,
      originalFileName: req.file.originalname,
      fileSize: req.file.size,
      status: 'uploaded',
      uploadedBy: req.user._id,
      parsingLogs: [
        {
          step: 'uploaded',
          status: 'completed',
          timestamp: new Date(),
          message: `PDF '${req.file.originalname}' (${Math.round(req.file.size / 1024)} KB) uploaded. Initializing ingestion pipeline...`,
        },
      ],
    });

    // Start background processing pipeline without blocking the response
    PdfParserService.processPaper(paper._id).catch((err) => {
      console.error('[Async Paper Ingestion Error]', err);
    });

    res.status(202).json({
      success: true,
      message: 'Paper uploaded successfully. Background ingestion pipeline started.',
      data: paper,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllPapers = async (req, res, next) => {
  try {
    const { branchId, year } = req.query;
    const query = {};
    if (branchId) query.branchId = branchId;
    if (year) query.year = parseInt(year, 10);

    const papers = await Paper.find(query)
      .populate('branchId', 'name code')
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: papers.length,
      data: papers,
    });
  } catch (error) {
    next(error);
  }
};

export const getPaperById = async (req, res, next) => {
  try {
    const paper = await Paper.findById(req.params.id)
      .populate('branchId', 'name code')
      .populate('uploadedBy', 'name email');

    if (!paper) {
      return res.status(404).json({ success: false, message: 'Paper not found' });
    }

    const questionsCount = await Question.countDocuments({
      paper: paper.title,
      year: paper.year,
    });

    const verifiedCount = await Question.countDocuments({
      paper: paper.title,
      year: paper.year,
      verified: true,
    });

    res.json({
      success: true,
      data: {
        paper,
        questionsCount,
        verifiedCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const reprocessPaper = async (req, res, next) => {
  try {
    const paper = await Paper.findById(req.params.id);
    if (!paper) return res.status(404).json({ success: false, message: 'Paper not found' });

    paper.status = 'processing';
    paper.parsingLogs.push({
      step: 'reprocessing',
      status: 'in_progress',
      timestamp: new Date(),
      message: 'Paper re-processing triggered manually by admin.',
    });
    await paper.save();

    PdfParserService.processPaper(paper._id).catch((err) => {
      console.error('[Reprocess Error]', err);
    });

    res.json({
      success: true,
      message: 'Paper re-processing initiated',
      data: paper,
    });
  } catch (error) {
    next(error);
  }
};

export const deletePaper = async (req, res, next) => {
  try {
    const paper = await Paper.findByIdAndDelete(req.params.id);
    if (!paper) return res.status(404).json({ success: false, message: 'Paper not found' });
    res.json({ success: true, message: 'Paper deleted successfully' });
  } catch (error) {
    next(error);
  }
};
