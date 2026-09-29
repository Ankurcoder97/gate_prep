import mongoose from 'mongoose';

const testQuestionSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    order: {
      type: Number,
      required: true,
    },
    marks: {
      type: Number,
      required: true,
    },
    negativeMarks: {
      type: Number,
      default: 0,
    },
    questionType: {
      type: String,
      enum: ['MCQ', 'MSQ', 'NAT'],
      required: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      required: true,
    },
    isRepeatedFallback: {
      type: Boolean,
      default: false, // true if reused from previous attempts because unseen pool was exhausted
    },
  },
  { _id: false }
);

const testSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    testType: {
      type: String,
      enum: ['TOPIC', 'SUBJECT', 'FULL_LENGTH', 'CUSTOM'],
      required: true,
      index: true,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
      index: true,
    },
    selectedSubjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
      },
    ],
    selectedTopics: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Topic',
      },
    ],
    totalMarks: {
      type: Number,
      required: true,
    },
    durationMinutes: {
      type: Number,
      required: true,
    },
    questionCount: {
      type: Number,
      required: true,
    },
    questions: [testQuestionSchema],
    status: {
      type: String,
      enum: ['generated', 'in_progress', 'completed', 'expired'],
      default: 'generated',
      index: true,
    },
    startedAt: {
      type: Date,
    },
    expiresAt: {
      type: Date, // Server-controlled expiration timestamp
    },
    completedAt: {
      type: Date,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    generationMetadata: {
      unseenQuestionsCount: Number,
      repeatedQuestionsCount: Number,
      blueprintUsed: String,
      difficultyDistribution: {
        easy: Number,
        medium: Number,
        hard: Number,
      },
      subjectWiseMarks: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

export const Test = mongoose.model('Test', testSchema);
