import mongoose from 'mongoose';

const paperLogSchema = new mongoose.Schema(
  {
    step: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'failed', 'warning'],
      default: 'in_progress',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    message: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const paperSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Paper title is required'],
      trim: true,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: [true, 'Paper must be associated with a branch'],
      index: true,
    },
    year: {
      type: Number,
      required: [true, 'Exam year is required'],
      index: true,
    },
    session: {
      type: String,
      default: 'Session 1',
      trim: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    originalFileName: {
      type: String,
    },
    fileSize: {
      type: Number,
    },
    status: {
      type: String,
      enum: [
        'uploaded',
        'processing',
        'extracting_text',
        'detecting_questions',
        'classifying_topics',
        'deduplicating',
        'completed',
        'error',
      ],
      default: 'uploaded',
      index: true,
    },
    totalQuestionsDetected: {
      type: Number,
      default: 0,
    },
    verifiedQuestionsCount: {
      type: Number,
      default: 0,
    },
    extractionSummary: {
      mcqCount: { type: Number, default: 0 },
      msqCount: { type: Number, default: 0 },
      natCount: { type: Number, default: 0 },
      oneMarkCount: { type: Number, default: 0 },
      twoMarkCount: { type: Number, default: 0 },
      duplicatesFound: { type: Number, default: 0 },
    },
    parsingLogs: [paperLogSchema],
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

export const Paper = mongoose.model('Paper', paperSchema);
