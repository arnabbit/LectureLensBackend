// DSA-specific types extending the core interfaces
import { ExtractionResult, QuizItem } from '../types';

/**
 * One approach to solving a DSA problem.
 */
export interface DSApproach {
  name: string;                    // e.g. "Brute Force", "Binary Search"
  explanation: string;
  complexity: {
    time: string;                  // e.g. "O(n)", "O(log n)"
    space: string;                 // e.g. "O(1)", "O(n)"
  };
  optimisationScore: number;       // 1 = worst, N = best
}

/**
 * A DSA problem with multiple approaches.
 */
export interface DSAProblem {
  name: string;                    // Short recognizable name
  problemName: string;             // Alias for compatibility with existing Problem model
  problemStatement: string;
  approaches: DSApproach[];
  keyInsights: string[];
}

/**
 * DSA extends the base ExtractionResult with specific problem structures.
 */
export interface DSAExtractionResult extends ExtractionResult<DSAProblem> {
  // concepts will be DSAProblem[]
}

/**
 * DSA-specific quiz: "Which approach is optimal?"
 */
export interface DSAQuizItem extends QuizItem {
  type: 'approach_comparison' | 'complexity_identification' | 'optimality';
  problemName?: string;
  approachIndex?: number;
}