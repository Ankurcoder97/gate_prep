import mongoose from 'mongoose';

const optionSchema = new mongoose.Schema(
  {
    key: {
      type: String, // 'A', 'B', 'C', 'D'
      required: true,
      trim: true,
      uppercase: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const questionSchema = new mongoose.Schema(
  {
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: [true, 'Question must belong to a branch'],
      index: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Question must belong to a subject'],
      index: true,
    },
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      required: [true, 'Question must belong to a topic'],
      index: true,
    },
    subtopic: {
      type: String,
      default: '',
      trim: true,
    },
    year: {
      type: Number,
      required: [true, 'GATE exam year is required'],
      index: true,
    },
    paper: {
      type: String, // e.g. "CSE", "CSE_SET_1", "ECE"
      default: 'CSE',
      trim: true,
    },
    questionNumber: {
      type: Number,
      required: true,
    },
    questionText: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
    },
    mathLatex: {
      type: String,
      default: '',
    },
    options: [optionSchema],
    correctAnswer: {
      type: mongoose.Schema.Types.Mixed, // 'A', ['A', 'C'], or 4.5
      required: [true, 'Correct answer is required'],
    },
    questionType: {
      type: String,
      enum: ['MCQ', 'MSQ', 'NAT'],
      required: [true, 'Question type (MCQ, MSQ, NAT) is required'],
      index: true,
    },
    natRange: {
      min: { type: Number },
      max: { type: Number },
      exact: { type: Number },
    },
    marks: {
      type: Number,
      enum: [1, 2],
      default: 1,
      required: true,
    },
    negativeMarks: {
      type: Number,
      default: function () {
        if (this.questionType === 'MCQ') {
          return this.marks === 1 ? 0.33 : 0.66;
        }
        return 0; // MSQ and NAT have NO negative marking in GATE
      },
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
      index: true,
    },
    explanation: {
      type: String,
      default: '',
      trim: true,
    },
    sourcePdf: {
      type: String,
      default: '',
    },
    sourceQuestionNumber: {
      type: Number,
    },
    imageUrl: {
      type: String,
      default: '',
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    verified: {
      type: Boolean,
      default: false,
      index: true,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    hash: {
      type: String,
      index: true,
    },
    normalizedText: {
      type: String,
    },
    sourceType: {
      type: String,
      enum: ['GATE_PYQ', 'MOCK', 'AI_ENRICHED'],
      default: 'GATE_PYQ',
    },
    attemptStats: {
      totalAttempts: { type: Number, default: 0 },
      correctAttempts: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for ultra-fast constraint queries in Test Generation
questionSchema.index({ branchId: 1, verified: 1, subjectId: 1, topicId: 1 });
questionSchema.index({ branchId: 1, verified: 1, marks: 1, questionType: 1 });
questionSchema.index({ branchId: 1, year: 1, paper: 1 });

export const Question = mongoose.model('Question', questionSchema);
