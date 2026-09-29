import mongoose from 'mongoose';

const sectionBlueprintSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String, // 'General Aptitude', 'Engineering Mathematics', 'Core'
      required: true,
    },
    targetMarks: {
      type: Number,
      required: true,
    },
    questionDistribution: {
      oneMarkCount: { type: Number, required: true },
      twoMarkCount: { type: Number, required: true },
    },
    allowedSubjectCategories: [String],
  },
  { _id: false }
);

const blueprintSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
      index: true,
    },
    yearPattern: {
      type: Number,
      default: 2026,
    },
    totalMarks: {
      type: Number,
      default: 100,
    },
    durationMinutes: {
      type: Number,
      default: 180,
    },
    totalQuestions: {
      type: Number,
      default: 65,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    sections: [sectionBlueprintSchema],
    markingScheme: {
      mcqOneMarkNegative: { type: Number, default: 0.33 },
      mcqTwoMarkNegative: { type: Number, default: 0.66 },
      msqNegative: { type: Number, default: 0 },
      natNegative: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

export const Blueprint = mongoose.model('Blueprint', blueprintSchema);
