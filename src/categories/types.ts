// Core interfaces for category modules
export interface CategoryConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface Concept {
  name: string;
  explanation: string;
  keyTakeaways: string[];
}

export interface ExtractionResult<T = Concept> {
  concepts: T[];
  metadata: {
    lectureTitle?: string;
    duration?: number;
    [key: string]: any;
  };
}

export interface QuizItem {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface CategoryModule {
  config: CategoryConfig;
  extract(transcript: string): Promise<ExtractionResult<any>>;
  generateQuiz(result: ExtractionResult<any>): Promise<QuizItem[]>;
}