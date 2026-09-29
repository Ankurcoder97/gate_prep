export class MarkingService {
  /**
   * Evaluates a single question answer according to strict GATE rules
   * Returns { isCorrect: boolean, marksAwarded: number, negativeMarksDeducted: number }
   */
  static evaluateAnswer(question, studentAnswer) {
    if (!studentAnswer) {
      return { isCorrect: false, marksAwarded: 0, negativeMarksDeducted: 0, status: 'NOT_ANSWERED' };
    }

    const { selectedOptions, natAnswer, status } = studentAnswer;
    const isAttempted =
      (selectedOptions && selectedOptions.length > 0) ||
      (natAnswer !== undefined && natAnswer !== null && !isNaN(natAnswer));

    if (!isAttempted || status === 'NOT_VISITED' || status === 'NOT_ANSWERED') {
      return {
        isCorrect: false,
        marksAwarded: 0,
        negativeMarksDeducted: 0,
        status: status || 'NOT_ANSWERED',
      };
    }

    const qMarks = question.marks || 1;
    const qNeg = question.negativeMarks || (qMarks === 1 ? 0.33 : 0.66);

    // 1. Multiple Choice Question (MCQ)
    if (question.questionType === 'MCQ') {
      const selected = Array.isArray(selectedOptions) ? selectedOptions[0] : selectedOptions;
      const correct = Array.isArray(question.correctAnswer) ? question.correctAnswer[0] : question.correctAnswer;

      if (selected && correct && selected.toString().trim().toUpperCase() === correct.toString().trim().toUpperCase()) {
        return {
          isCorrect: true,
          marksAwarded: qMarks,
          negativeMarksDeducted: 0,
          status: status || 'ANSWERED',
        };
      } else {
        return {
          isCorrect: false,
          marksAwarded: 0,
          negativeMarksDeducted: qNeg,
          status: status || 'ANSWERED',
        };
      }
    }

    // 2. Multiple Select Question (MSQ)
    if (question.questionType === 'MSQ') {
      const selected = Array.isArray(selectedOptions)
        ? selectedOptions.map((s) => s.trim().toUpperCase()).sort()
        : [selectedOptions.toString().trim().toUpperCase()];

      let correct = [];
      if (Array.isArray(question.correctAnswer)) {
        correct = question.correctAnswer.map((c) => c.toString().trim().toUpperCase()).sort();
      } else if (typeof question.correctAnswer === 'string') {
        correct = question.correctAnswer.split(',').map((c) => c.trim().toUpperCase()).sort();
      }

      // GATE MSQ Rule: All correct choices and NO wrong choices. All or nothing. No partial, No negative marks.
      const isExactMatch =
        selected.length === correct.length &&
        selected.every((val, index) => val === correct[index]);

      if (isExactMatch) {
        return {
          isCorrect: true,
          marksAwarded: qMarks,
          negativeMarksDeducted: 0,
          status: status || 'ANSWERED',
        };
      } else {
        return {
          isCorrect: false,
          marksAwarded: 0,
          negativeMarksDeducted: 0, // No negative marking in MSQ
          status: status || 'ANSWERED',
        };
      }
    }

    // 3. Numerical Answer Type (NAT)
    if (question.questionType === 'NAT') {
      const studentVal = parseFloat(natAnswer);
      if (isNaN(studentVal)) {
        return {
          isCorrect: false,
          marksAwarded: 0,
          negativeMarksDeducted: 0,
          status: status || 'ANSWERED',
        };
      }

      let isCorrect = false;

      if (question.natRange && (question.natRange.min !== undefined || question.natRange.max !== undefined)) {
        const min = question.natRange.min ?? question.natRange.exact;
        const max = question.natRange.max ?? question.natRange.exact;
        if (studentVal >= min && studentVal <= max) {
          isCorrect = true;
        }
      } else {
        const correctVal = parseFloat(question.correctAnswer);
        if (!isNaN(correctVal) && Math.abs(studentVal - correctVal) <= 0.05) {
          isCorrect = true;
        }
      }

      if (isCorrect) {
        return {
          isCorrect: true,
          marksAwarded: qMarks,
          negativeMarksDeducted: 0,
          status: status || 'ANSWERED',
        };
      } else {
        return {
          isCorrect: false,
          marksAwarded: 0,
          negativeMarksDeducted: 0, // No negative marking in NAT
          status: status || 'ANSWERED',
        };
      }
    }

    return { isCorrect: false, marksAwarded: 0, negativeMarksDeducted: 0, status: 'NOT_ANSWERED' };
  }
}
