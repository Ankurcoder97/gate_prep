import crypto from 'crypto';
import stringSimilarity from 'string-similarity';
import { Question } from '../models/Question.js';

export class DeduplicationService {
  /**
   * Normalizes question text for robust comparison
   */
  static normalizeText(text) {
    if (!text) return '';
    return text
      .toLowerCase()
      .replace(/[\r\n\t]+/g, ' ')
      .replace(/[^\w\s]/g, '') // remove punctuations
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Generates a deterministic hash for normalized text
   */
  static generateHash(text) {
    const normalized = this.normalizeText(text);
    return crypto.createHash('sha256').update(normalized).digest('hex');
  }

  /**
   * Checks if a question is a duplicate of any existing question in the DB
   * Returns { isDuplicate: boolean, similarity: number, matchedQuestion: object | null }
   */
  static async checkDuplicate(questionText, branchId, similarityThreshold = 0.88) {
    const hash = this.generateHash(questionText);
    const normalized = this.normalizeText(questionText);

    // 1. Exact hash match
    const exactMatch = await Question.findOne({
      branchId,
      hash,
    });

    if (exactMatch) {
      return {
        isDuplicate: true,
        similarity: 1.0,
        matchedQuestion: exactMatch,
        reason: 'EXACT_HASH_MATCH',
      };
    }

    // 2. Fuzzy similarity check with existing branch questions
    // Fetch recent questions from the same branch
    const candidateQuestions = await Question.find({ branchId })
      .select('questionText normalizedText questionNumber year paper')
      .limit(500)
      .lean();

    if (candidateQuestions.length === 0) {
      return { isDuplicate: false, similarity: 0, matchedQuestion: null };
    }

    const texts = candidateQuestions.map((q) => q.normalizedText || this.normalizeText(q.questionText));
    const match = stringSimilarity.findBestMatch(normalized, texts);

    if (match.bestMatch.rating >= similarityThreshold) {
      const bestCandidate = candidateQuestions[match.bestMatchIndex];
      return {
        isDuplicate: true,
        similarity: match.bestMatch.rating,
        matchedQuestion: bestCandidate,
        reason: 'FUZZY_SIMILARITY_MATCH',
      };
    }

    return {
      isDuplicate: false,
      similarity: match.bestMatch.rating,
      matchedQuestion: null,
    };
  }
}
