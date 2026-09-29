import mongoose from 'mongoose';

const answerRecordSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    selectedOptions: [
      {
        type: String, // ['A'], ['A', 'C'] for MSQ
      },
    ],
    natAnswer: {
      type: Number, // for NAT numerical input
    },
    status: {
      type: String,
      enum: [
        'NOT_VISITED',
        'NOT_ANSWERED',
        'ANSWERED',
        'MARKED_FOR_REVIEW',
        'ANSWERED_AND_MARKED_FOR_REVIEW',
      ],
      default: 'NOT_VISITED',
    },
    isCorrect: {
      type: Boolean,
      default: false,
    },
    marksAwarded: {
      type: Number,
      default: 0,
    },
    negativeMarksDeducted: {
      type: Number,
      default: 0,
    },
    timeSpentSeconds: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const testAttemptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test',
      required: true,
      index: true,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },
    answers: [answerRecordSchema],
    totalScore: {
      type: Number,
      default: 0,
    },
    totalMarks: {
      type: Number,
      default: 100,
    },
    accuracy: {
      type: Number,
      default: 0, // Percentage e.g. 78.5%
    },
    correctCount: {
      type: Number,
      default: 0,
    },
    incorrectCount: {
      type: Number,
      default: 0,
    },
    unattemptedCount: {
      type: Number,
      default: 0,
    },
    timeTakenSeconds: {
      type: Number,
      default: 0,
    },
    subjectWiseScores: [
      {
        subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
        subjectName: String,
        totalMarks: Number,
        obtainedMarks: Number,
        correctCount: Number,
        incorrectCount: Number,
        unattemptedCount: Number,
        accuracy: Number,
      },
    ],
    topicWiseScores: [
      {
        topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' },
        topicName: String,
        subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
        totalMarks: Number,
        obtainedMarks: Number,
        correctCount: Number,
        incorrectCount: Number,
        unattemptedCount: Number,
        accuracy: Number,
      },
    ],
    submittedAt: {
      type: Date,
    },
    autoSubmitted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

testAttemptSchema.index({ userId: 1, createdAt: -1 });

export const TestAttempt = mongoose.model('TestAttempt', testAttemptSchema);
