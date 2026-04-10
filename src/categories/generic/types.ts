// Generic types for non-specialized categories
import { ExtractionResult, QuizItem, Concept } from '../types';

/**
 * A concept card for generic content.
 * Same as base Concept but with importance rating.
 */
export interface GenericConcept extends Concept {
  name: string;
  explanation: string;
  keyTakeaways: string[];
  // Note: NO problems, NO complexity, NO optimisationScore
  // This is intentionally simpler than DSA
}

/**
 * Quiz types that work for any subject.
 */
export type GenericQuizType = 'recall' | 'explain' | 'true_false' | 'key_point';

/**
 * Result of processing a non-DSA lecture.
 */
export interface GenericExtractionResult extends ExtractionResult<GenericConcept> {
  // concepts will be GenericConcept[]
  // Note: NO problems, NO complexity, NO optimisationScore
}

/**
 * Quiz items that work for any subject.
 */
export interface GenericQuizItem extends QuizItem {
  type: GenericQuizType;
  conceptName: string;  // which concept this question is about
}