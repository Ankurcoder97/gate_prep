import { Subject } from '../models/Subject.js';
import { Topic } from '../models/Topic.js';

export class ClassificationService {
  /**
   * Classifies a question text into appropriate Subject and Topic based on taxonomy and keyword density
   */
  static async classifyQuestion(questionText, branchId, options = []) {
    const fullText = (
      questionText + ' ' + options.map((o) => (typeof o === 'string' ? o : o.text || '')).join(' ')
    ).toLowerCase();

    // Fetch all active subjects and topics for this branch
    let subjects = await Subject.find({ branchId, isActive: true }).lean();
    let topics = await Topic.find({ branchId, isActive: true }).lean();

    // Fallback if this specific branch has no custom subjects yet: look up global active subjects
    if (!subjects.length || !topics.length) {
      subjects = await Subject.find({ isActive: true }).lean();
      topics = await Topic.find({ isActive: true }).lean();
    }

    if (!subjects.length || !topics.length) {
      // Create a foundational subject & topic on the fly to guarantee schema integrity
      let fallbackSub = await Subject.findOne({ branchId });
      if (!fallbackSub) {
        fallbackSub = await Subject.create({
          name: 'General Engineering & Aptitude',
          code: 'GEN-ENG',
          branchId,
          category: 'Core',
          weightageDefault: 100,
          description: 'Core engineering and assessment syllabus',
          order: 1,
        });
      }
      let fallbackTop = await Topic.findOne({ subjectId: fallbackSub._id });
      if (!fallbackTop) {
        fallbackTop = await Topic.create({
          name: 'General Core Questions',
          code: 'GEN-TOPIC',
          subjectId: fallbackSub._id,
          branchId,
          description: 'General core assessment questions',
          subtopics: ['Core'],
          keywords: ['general', 'engineering'],
          order: 1,
        });
      }
      return {
        subjectId: fallbackSub._id,
        topicId: fallbackTop._id,
        confidence: 50,
        subtopic: 'General',
        difficulty: 'medium',
      };
    }

    // 1. Topic Keyword Scoring
    let bestTopic = null;
    let highestScore = 0;

    for (const topic of topics) {
      let score = 0;
      const topicNameLower = topic.name.toLowerCase();

      // Direct topic name match
      if (fullText.includes(topicNameLower)) {
        score += 15;
      }

      // Keywords score
      if (topic.keywords && topic.keywords.length > 0) {
        for (const kw of topic.keywords) {
          if (fullText.includes(kw.toLowerCase())) {
            score += 6;
          }
        }
      }

      // Subtopics score
      if (topic.subtopics && topic.subtopics.length > 0) {
        for (const sub of topic.subtopics) {
          if (fullText.includes(sub.toLowerCase())) {
            score += 8;
          }
        }
      }

      if (score > highestScore) {
        highestScore = score;
        bestTopic = topic;
      }
    }

    let matchedSubjectId = null;
    let matchedTopicId = null;
    let confidence = 0;

    if (bestTopic && highestScore >= 6) {
      matchedTopicId = bestTopic._id;
      matchedSubjectId = bestTopic.subjectId;
      confidence = Math.min(100, Math.round((highestScore / 25) * 100));
    } else {
      // Fallback: Subject-level keyword matching
      let bestSubject = null;
      let subjectScore = 0;

      for (const subject of subjects) {
        let sScore = 0;
        const sNameLower = subject.name.toLowerCase();
        if (fullText.includes(sNameLower)) sScore += 10;

        // Specific branch heuristics
        if (subject.category === 'General Aptitude') {
          if (
            fullText.includes('passage') ||
            fullText.includes('grammatically') ||
            fullText.includes('ratio') ||
            fullText.includes('percentage') ||
            fullText.includes('speed') ||
            fullText.includes('analogy') ||
            fullText.includes('conclude')
          ) {
            sScore += 8;
          }
        } else if (subject.name.includes('Theory of Computation')) {
          if (
            fullText.includes('dfa') ||
            fullText.includes('nfa') ||
            fullText.includes('turing') ||
            fullText.includes('regular language') ||
            fullText.includes('cfg') ||
            fullText.includes('pda') ||
            fullText.includes('decidable')
          ) {
            sScore += 12;
          }
        } else if (subject.name.includes('Databases')) {
          if (
            fullText.includes('sql') ||
            fullText.includes('relational') ||
            fullText.includes('functional dependency') ||
            fullText.includes('serializable') ||
            fullText.includes('b+ tree') ||
            fullText.includes('transaction')
          ) {
            sScore += 12;
          }
        } else if (subject.name.includes('Operating System')) {
          if (
            fullText.includes('deadlock') ||
            fullText.includes('semaphore') ||
            fullText.includes('page replacement') ||
            fullText.includes('round robin') ||
            fullText.includes('virtual memory') ||
            fullText.includes('fork()')
          ) {
            sScore += 12;
          }
        } else if (subject.name.includes('Algorithms')) {
          if (
            fullText.includes('time complexity') ||
            fullText.includes('dijkstra') ||
            fullText.includes('dynamic programming') ||
            fullText.includes('recurrence') ||
            fullText.includes('asymptotic') ||
            fullText.includes('hashing')
          ) {
            sScore += 12;
          }
        } else if (subject.name.includes('Programming') || subject.name.includes('Data Structure')) {
          if (
            fullText.includes('binary search tree') ||
            fullText.includes('linked list') ||
            fullText.includes('pointer') ||
            fullText.includes('array') ||
            fullText.includes('stack') ||
            fullText.includes('queue') ||
            fullText.includes('recursion')
          ) {
            sScore += 12;
          }
        } else if (subject.name.includes('Computer Network')) {
          if (
            fullText.includes('tcp') ||
            fullText.includes('ip address') ||
            fullText.includes('subnet') ||
            fullText.includes('sliding window') ||
            fullText.includes('router') ||
            fullText.includes('congestion') ||
            fullText.includes('ethernet')
          ) {
            sScore += 12;
          }
        } else if (subject.name.includes('Digital Logic')) {
          if (
            fullText.includes('k-map') ||
            fullText.includes('multiplexer') ||
            fullText.includes('flip flop') ||
            fullText.includes('boolean algebra') ||
            fullText.includes('decoder') ||
            fullText.includes('counter')
          ) {
            sScore += 12;
          }
        } else if (subject.name.includes('Engineering Mathematics')) {
          if (
            fullText.includes('matrix') ||
            fullText.includes('eigenvalue') ||
            fullText.includes('probability') ||
            fullText.includes('differential equation') ||
            fullText.includes('calculus') ||
            fullText.includes('graph theory') ||
            fullText.includes('discrete')
          ) {
            sScore += 12;
          }
        }

        if (sScore > subjectScore) {
          subjectScore = sScore;
          bestSubject = subject;
        }
      }

      if (bestSubject) {
        matchedSubjectId = bestSubject._id;
        // Find first or most relevant topic in this subject
        const subjectTopics = topics.filter((t) => t.subjectId.toString() === bestSubject._id.toString());
        if (subjectTopics.length > 0) {
          matchedTopicId = subjectTopics[0]._id;
        }
        confidence = Math.min(80, subjectScore * 6);
      } else {
        // Default to first subject & topic if completely ambiguous
        matchedSubjectId = subjects[0]._id;
        const subTopics = topics.filter((t) => t.subjectId.toString() === subjects[0]._id.toString());
        matchedTopicId = subTopics.length ? subTopics[0]._id : topics[0]._id;
        confidence = 20;
      }
    }

    // Difficulty estimation based on text length, formulas, and concepts
    let difficulty = 'medium';
    if (fullText.length < 120 && !fullText.includes('consider') && !fullText.includes('let')) {
      difficulty = 'easy';
    } else if (fullText.length > 350 || fullText.includes('which of the following are true') || fullText.includes('minimum number of')) {
      difficulty = 'hard';
    }

    return {
      subjectId: matchedSubjectId,
      topicId: matchedTopicId,
      confidence,
      subtopic: bestTopic ? (bestTopic.subtopics[0] || '') : '',
      difficulty,
    };
  }
}
