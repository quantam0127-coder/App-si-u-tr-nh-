import { MathQuestion, OperationFilter, RankTier } from '../types/game';

export const MIN_TABLE = 2;
export const MAX_TABLE = 9;
export const BASE_POINTS_PER_QUESTION = 100;

export const OPERATION_LABELS: Record<OperationFilter, string> = {
  mixed: 'Tổng hợp',
  multiply: 'Bảng nhân',
  divide: 'Bảng chia',
};

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildDistractors(
  correct: number,
  a: number,
  b: number,
  operator: '×' | '÷'
): number[] {
  const candidates = new Set<number>();

  if (operator === '×') {
    const nearbyProducts = [
      a * (b + 1),
      a * Math.max(1, b - 1),
      (a + 1) * b,
      Math.max(1, a - 1) * b,
      a * (b + 2),
      Math.max(1, a - 2) * b,
      correct + 10,
      correct - 10,
      correct + 2,
      correct - 2,
    ];
    for (const val of nearbyProducts) {
      if (val > 0 && val !== correct) {
        candidates.add(val);
      }
    }
  } else {
    const nearbyQuotients = [
      correct + 1,
      correct - 1,
      correct + 2,
      correct - 2,
      b,
      correct + 3,
      Math.max(1, correct - 3),
    ];
    for (const val of nearbyQuotients) {
      if (val > 0 && val <= MAX_TABLE + 3 && val !== correct) {
        candidates.add(val);
      }
    }
  }

  let safety = 0;
  while (candidates.size < 3 && safety < 50) {
    safety += 1;
    const offset = randomInt(-8, 8);
    const candidate = correct + offset;
    if (candidate > 0 && candidate !== correct) {
      candidates.add(candidate);
    }
  }

  const chosen = shuffleArray(Array.from(candidates)).slice(0, 3);
  return shuffleArray([correct, ...chosen]);
}

export function generateQuestionRound(
  count: number,
  operationFilter: OperationFilter = 'mixed'
): MathQuestion[] {
  // Build randomized pool strictly for multiplication & division tables 2 to 9
  const pool: Array<{ a: number; b: number; operator: '×' | '÷'; answer: number }> = [];

  for (let x = MIN_TABLE; x <= MAX_TABLE; x += 1) {
    for (let y = MIN_TABLE; y <= MAX_TABLE; y += 1) {
      if (operationFilter === 'mixed' || operationFilter === 'multiply') {
        pool.push({
          a: x,
          b: y,
          operator: '×',
          answer: x * y,
        });
      }
      if (operationFilter === 'mixed' || operationFilter === 'divide') {
        const dividend = x * y;
        pool.push({
          a: dividend,
          b: x,
          operator: '÷',
          answer: y,
        });
      }
    }
  }

  // Shuffle completely so questions appear in random non-sequential order
  let shuffledPool = shuffleArray(pool);
  while (shuffledPool.length < count) {
    shuffledPool = shuffledPool.concat(shuffleArray(pool));
  }

  const selected: MathQuestion[] = [];
  let cursor = 0;

  while (selected.length < count && cursor < shuffledPool.length * 2) {
    const item = shuffledPool[cursor % shuffledPool.length];
    cursor += 1;
    const expressionText = `${item.a} ${item.operator} ${item.b}`;

    const prev = selected[selected.length - 1];
    if (prev && prev.expressionText === expressionText) {
      continue;
    }

    selected.push({
      id: `q-${selected.length + 1}-${item.a}-${item.operator}-${item.b}-${Math.random().toString(36).slice(2, 6)}`,
      operandA: item.a,
      operandB: item.b,
      operator: item.operator,
      correctAnswer: item.answer,
      options: buildDistractors(item.answer, item.a, item.b, item.operator),
      expressionText,
    });
  }

  return selected;
}

export function getRankTier(correctCount: number, totalQuestions: number): RankTier {
  const isPerfect = totalQuestions > 0 && correctCount === totalQuestions;
  const ratio = totalQuestions > 0 ? correctCount / totalQuestions : 0;

  if (isPerfect) {
    return {
      grade: 'A',
      title: 'Thành Công Tuyệt Đối!',
      subtitle: 'Xuất sắc! Con đã trả lời đúng 100% câu hỏi và đạt Hạng A!',
      accentColor: 'text-emerald-600',
      badgeBg: 'bg-emerald-50 border-emerald-300 text-emerald-700',
    };
  }
  if (ratio >= 0.7) {
    return {
      grade: 'B',
      title: 'Rất Tốt — Sắp Đạt 100%!',
      subtitle: 'Chỉ còn vài bước nữa thôi! Cố gắng đúng 100% để đạt Hạng A nhé!',
      accentColor: 'text-blue-600',
      badgeBg: 'bg-blue-50 border-blue-300 text-blue-700',
    };
  }
  return {
    grade: 'C',
    title: 'Đừng Nản Lòng — Thử Lại Nhé!',
    subtitle: 'Hãy xem lại các câu chưa đúng bên dưới và thử lại để chinh phục 100% Hạng A!',
    accentColor: 'text-slate-700',
    badgeBg: 'bg-slate-100 border-slate-300 text-slate-700',
  };
}
