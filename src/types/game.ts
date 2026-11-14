export type OperationFilter = 'mixed' | 'multiply' | 'divide';

export type GamePhase = 'TITLE_MENU' | 'COUNTDOWN_INTRO' | 'PLAYING' | 'RESULT_SUMMARY';

export type AnswerStatus = 'correct' | 'wrong' | 'timeout';

export interface MathQuestion {
  id: string;
  operandA: number;
  operandB: number;
  operator: '×' | '÷';
  correctAnswer: number;
  options: number[];
  expressionText: string;
}

export interface QuestionResult {
  question: MathQuestion;
  selectedOption: number | null;
  status: AnswerStatus;
  timeUsedSeconds: number;
  pointsEarned: number;
  speedBonus: number;
  streakBonus: number;
}

export interface RankTier {
  grade: 'A' | 'B' | 'C';
  title: string;
  subtitle: string;
  accentColor: string;
  badgeBg: string;
}

export interface LeaderboardEntry {
  id: string;
  operationFilter: OperationFilter;
  score: number;
  correctCount: number;
  totalQuestions: number;
  timeLimitSeconds: number;
  maxStreak: number;
  rankGrade: RankTier['grade'];
  timestamp: number;
}
