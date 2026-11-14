import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { MathQuestion, QuestionResult } from '../types/game';
import { BASE_POINTS_PER_QUESTION } from '../utils/questionGenerator';
import { soundEngine } from '../utils/soundEngine';

interface ArenaStageProps {
  timeLimitSeconds: number;
  questions: MathQuestion[];
  onFinishRound: (results: QuestionResult[], totalScore: number, maxStreak: number) => void;
  onAbortRound: () => void;
}

export function ArenaStage({
  timeLimitSeconds,
  questions,
  onFinishRound,
  onAbortRound,
}: ArenaStageProps) {
  const questionDurationMs = timeLimitSeconds * 1000;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [results, setResults] = useState<QuestionResult[]>([]);

  const [timeLeftMs, setTimeLeftMs] = useState(questionDurationMs);
  const [lockedResult, setLockedResult] = useState<QuestionResult | null>(null);
  const [shakeStage, setShakeStage] = useState(false);

  const lastTickSecondRef = useRef<number>(timeLimitSeconds);
  const questionStartRef = useRef<number>(performance.now());
  const autoAdvanceTimerRef = useRef<number | null>(null);

  const currentQuestion = questions[currentIndex];

  const moveToNext = useCallback(
    (updatedResults: QuestionResult[], updatedScore: number, updatedMaxStreak: number) => {
      if (autoAdvanceTimerRef.current !== null) {
        window.clearTimeout(autoAdvanceTimerRef.current);
        autoAdvanceTimerRef.current = null;
      }

      if (currentIndex + 1 >= questions.length) {
        onFinishRound(updatedResults, updatedScore, updatedMaxStreak);
      } else {
        setCurrentIndex((prev) => prev + 1);
        setLockedResult(null);
        setShakeStage(false);
        setTimeLeftMs(questionDurationMs);
        lastTickSecondRef.current = timeLimitSeconds;
        questionStartRef.current = performance.now();
      }
    },
    [currentIndex, onFinishRound, questionDurationMs, questions.length, timeLimitSeconds]
  );

  const handleTimeout = useCallback(() => {
    if (lockedResult || !currentQuestion) return;

    soundEngine.playTimeout();
    setShakeStage(true);
    setStreak(0);

    const outcome: QuestionResult = {
      question: currentQuestion,
      selectedOption: null,
      status: 'timeout',
      timeUsedSeconds: timeLimitSeconds,
      pointsEarned: 0,
      speedBonus: 0,
      streakBonus: 0,
    };

    const nextResults = [...results, outcome];
    setLockedResult(outcome);
    setResults(nextResults);

    autoAdvanceTimerRef.current = window.setTimeout(() => {
      moveToNext(nextResults, score, maxStreak);
    }, 1700);
  }, [currentQuestion, lockedResult, maxStreak, moveToNext, results, score, timeLimitSeconds]);

  const handleSelectOption = useCallback(
    (optionValue: number) => {
      if (lockedResult || !currentQuestion) return;

      const elapsedMs = Math.min(
        questionDurationMs,
        Math.max(0, performance.now() - questionStartRef.current)
      );
      const timeUsedSeconds = Number((elapsedMs / 1000).toFixed(1));
      const remainingSeconds = Math.ceil(Math.max(0, questionDurationMs - elapsedMs) / 1000);
      const isCorrect = optionValue === currentQuestion.correctAnswer;

      let nextStreak = 0;
      let nextMaxStreak = maxStreak;
      let pointsEarned = 0;
      let speedBonus = 0;
      let streakBonus = 0;

      if (isCorrect) {
        nextStreak = streak + 1;
        nextMaxStreak = Math.max(maxStreak, nextStreak);
        speedBonus = remainingSeconds * 10;
        streakBonus = nextStreak >= 2 ? Math.min(100, (nextStreak - 1) * 20) : 0;
        pointsEarned = BASE_POINTS_PER_QUESTION + speedBonus + streakBonus;
        soundEngine.playCorrect(nextStreak);
      } else {
        setShakeStage(true);
        soundEngine.playWrong();
      }

      const nextScore = score + pointsEarned;
      setStreak(nextStreak);
      setMaxStreak(nextMaxStreak);
      setScore(nextScore);

      const outcome: QuestionResult = {
        question: currentQuestion,
        selectedOption: optionValue,
        status: isCorrect ? 'correct' : 'wrong',
        timeUsedSeconds,
        pointsEarned,
        speedBonus,
        streakBonus,
      };

      const nextResults = [...results, outcome];
      setLockedResult(outcome);
      setResults(nextResults);

      autoAdvanceTimerRef.current = window.setTimeout(() => {
        moveToNext(nextResults, nextScore, nextMaxStreak);
      }, isCorrect ? 1250 : 1650);
    },
    [
      currentQuestion,
      lockedResult,
      maxStreak,
      moveToNext,
      questionDurationMs,
      results,
      score,
      streak,
    ]
  );

  useEffect(() => {
    return () => {
      if (autoAdvanceTimerRef.current !== null) {
        window.clearTimeout(autoAdvanceTimerRef.current);
      }
    };
  }, []);

  // Countdown Interval
  useEffect(() => {
    if (lockedResult || !currentQuestion) return;

    questionStartRef.current = performance.now();
    lastTickSecondRef.current = timeLimitSeconds;
    setTimeLeftMs(questionDurationMs);

    const intervalId = window.setInterval(() => {
      const elapsed = performance.now() - questionStartRef.current;
      const remaining = Math.max(0, questionDurationMs - elapsed);
      setTimeLeftMs(remaining);

      const currentSec = Math.ceil(remaining / 1000);
      if (currentSec < lastTickSecondRef.current && currentSec > 0) {
        lastTickSecondRef.current = currentSec;
        soundEngine.playTick(currentSec <= 3);
      }

      if (remaining <= 0) {
        window.clearInterval(intervalId);
        handleTimeout();
      }
    }, 50);

    return () => window.clearInterval(intervalId);
  }, [currentIndex, currentQuestion, handleTimeout, lockedResult, questionDurationMs, timeLimitSeconds]);

  // Keyboard shortcuts 1-4 or A-D
  useEffect(() => {
    if (lockedResult || !currentQuestion) return;

    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      let idx = -1;
      if (key === '1' || key === 'a') idx = 0;
      else if (key === '2' || key === 'b') idx = 1;
      else if (key === '3' || key === 'c') idx = 2;
      else if (key === '4' || key === 'd') idx = 3;

      if (idx >= 0 && idx < currentQuestion.options.length) {
        e.preventDefault();
        handleSelectOption(currentQuestion.options[idx]);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [currentQuestion, handleSelectOption, lockedResult]);

  if (!currentQuestion) return null;

  const secondsDisplay = Math.ceil(timeLeftMs / 1000);
  const progressRatio = Math.max(0, Math.min(1, timeLeftMs / questionDurationMs));
  const isUrgent = !lockedResult && secondsDisplay <= 3 && secondsDisplay > 0;

  return (
    <div className="space-y-4">
      {/* 3-Column Stat Cards Row (CÂU HỎI · ĐIỂM SỐ · CHUỖI ĐÚNG) */}
      <section aria-label="Thông số trận đấu" className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3.5 text-center shadow-xs">
          <p className="text-[11px] font-bold tracking-wide text-slate-500 uppercase sm:text-xs">
            CÂU HỎI
          </p>
          <p className="font-mono mt-1 text-xl font-extrabold tabular-nums text-slate-900 sm:text-2xl">
            <span>{currentIndex + 1}</span>
            <span>/</span>
            <span>{questions.length}</span>
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3.5 text-center shadow-xs">
          <p className="text-[11px] font-bold tracking-wide text-slate-500 uppercase sm:text-xs">
            ĐIỂM SỐ
          </p>
          <p className="font-mono mt-1 text-xl font-extrabold tabular-nums text-slate-900 sm:text-2xl">
            <span>{score.toLocaleString('vi-VN')}</span>
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3.5 text-center shadow-xs">
          <p className="text-[11px] font-bold tracking-wide text-slate-500 uppercase sm:text-xs">
            CHUỖI ĐÚNG
          </p>
          <p className="font-mono mt-1 text-xl font-extrabold tabular-nums text-slate-900 sm:text-2xl">
            <span>{streak}</span> <span aria-hidden="true">🔥</span>
          </p>
        </div>
      </section>

      {/* Main Question Card */}
      <section
        className={`rounded-2xl border bg-white p-5 shadow-xs transition-colors sm:p-7 ${
          isUrgent
            ? 'border-rose-400 ring-2 ring-rose-500/20'
            : lockedResult?.status === 'correct'
              ? 'border-emerald-400'
              : lockedResult
                ? 'border-rose-400'
                : 'border-slate-200'
        } ${shakeStage ? 'animate-stage-shake' : ''}`}
      >
        {/* Timer Header & Progress Bar */}
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900 uppercase sm:text-base">
              <span aria-hidden="true">⏳</span>
              <span>THỜI GIAN</span>
              {isUrgent ? (
                <span
                  key="urgent-badge"
                  className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 normal-case"
                >
                  <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Sắp hết giờ!</span>
                </span>
              ) : null}
            </div>
            <span
              className={`font-mono text-xl font-extrabold tabular-nums sm:text-2xl ${
                isUrgent ? 'text-rose-600' : 'text-slate-900'
              }`}
            >
              {secondsDisplay}
            </span>
          </div>

          <div className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className={`h-full rounded-full transition-colors duration-150 ${
                isUrgent ? 'bg-rose-500' : 'bg-amber-400'
              }`}
              style={{ width: `${progressRatio * 100}%` }}
            />
          </div>
        </div>

        {/* Question Expression */}
        <div className="my-7 text-center sm:my-8">
          <p className="text-xs font-bold tracking-wider text-slate-500 uppercase sm:text-sm">
            <span>CÂU SỐ </span>
            <span>{currentIndex + 1}</span>
          </p>

          <div className="font-mono mt-3 text-5xl font-extrabold tracking-tight tabular-nums text-slate-950 sm:text-6xl">
            <span>{currentQuestion.operandA}</span>{' '}
            <span>{currentQuestion.operator}</span>{' '}
            <span>{currentQuestion.operandB}</span>{' '}
            <span>=</span>{' '}
            <span className={lockedResult ? 'text-blue-600' : 'text-slate-950'}>
              {lockedResult ? currentQuestion.correctAnswer : '?'}
            </span>
          </div>

          <div className="mt-3 min-h-[38px]">
            {!lockedResult ? (
              <p key="prompt-text" className="text-sm font-semibold text-slate-500 sm:text-base">
                Con hãy chọn đáp án!
              </p>
            ) : (
              <div
                key={`status-${lockedResult.question.id}`}
                role="status"
                className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold ${
                  lockedResult.status === 'correct'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-rose-200 bg-rose-50 text-rose-700'
                }`}
              >
                {lockedResult.status === 'correct' ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                ) : lockedResult.status === 'timeout' ? (
                  <Clock className="h-4 w-4 shrink-0" aria-hidden="true" />
                ) : (
                  <XCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                )}

                <span>
                  {lockedResult.status === 'correct'
                    ? `Chính xác! +${lockedResult.pointsEarned} điểm`
                    : lockedResult.status === 'timeout'
                      ? `Hết giờ — Mất lượt! Đáp án đúng là ${currentQuestion.correctAnswer}`
                      : `Chưa chính xác! Đáp án đúng là ${currentQuestion.correctAnswer}`}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 2x2 Answer Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {currentQuestion.options.map((optionVal, idx) => {
            const isCorrectOpt = optionVal === currentQuestion.correctAnswer;
            const isSelected = lockedResult?.selectedOption === optionVal;

            let btnStyle =
              'border-slate-200 bg-white text-slate-900 hover:border-blue-400 hover:bg-blue-50/40';

            if (lockedResult) {
              if (isCorrectOpt) {
                btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-800';
              } else if (isSelected && !isCorrectOpt) {
                btnStyle = 'border-rose-500 bg-rose-50 text-rose-700';
              } else {
                btnStyle = 'border-slate-200 bg-slate-50 text-slate-400 opacity-70';
              }
            }

            return (
              <button
                key={`${currentQuestion.id}-opt-${idx}`}
                type="button"
                disabled={Boolean(lockedResult)}
                onClick={() => handleSelectOption(optionVal)}
                className={`flex min-h-[72px] items-center justify-center rounded-xl border px-4 py-4 font-mono text-2xl font-extrabold tabular-nums shadow-xs transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 active:scale-[0.98] sm:min-h-[80px] sm:text-3xl ${btnStyle}`}
              >
                <span>{optionVal}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Motivation Line */}
      <p className="flex items-center justify-center gap-1.5 text-center text-sm font-medium text-slate-600">
        <span aria-hidden="true">⚡</span>
        <span>Trả lời càng nhanh, càng có cơ hội nhận điểm thưởng!</span>
      </p>

      {/* Bottom End Round Button */}
      <button
        type="button"
        onClick={onAbortRound}
        className="w-full rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-center text-sm font-bold text-slate-900 shadow-xs transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-blue-600 sm:text-base"
      >
        Kết thúc lượt chơi
      </button>
    </div>
  );
}
