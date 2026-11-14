import { useEffect, useState } from 'react';
import { OperationFilter } from '../types/game';
import { OPERATION_LABELS } from '../utils/questionGenerator';
import { soundEngine } from '../utils/soundEngine';

interface IntroCountdownProps {
  operationFilter: OperationFilter;
  timeLimitSeconds: number;
  onComplete: () => void;
}

export function IntroCountdown({
  operationFilter,
  timeLimitSeconds,
  onComplete,
}: IntroCountdownProps) {
  const [introStep, setIntroStep] = useState<number>(3);

  useEffect(() => {
    setIntroStep(3);
    soundEngine.playIntroBeep(false);

    const t1 = window.setTimeout(() => {
      setIntroStep(2);
      soundEngine.playIntroBeep(false);
    }, 500);

    const t2 = window.setTimeout(() => {
      setIntroStep(1);
      soundEngine.playIntroBeep(false);
    }, 1000);

    const t3 = window.setTimeout(() => {
      setIntroStep(0);
      soundEngine.playIntroBeep(true);
    }, 1500);

    const t4 = window.setTimeout(() => {
      onComplete();
    }, 1950);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.clearTimeout(t4);
    };
  }, [onComplete]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-xs">
      <p className="text-sm font-semibold text-blue-600 uppercase">
        <span>{OPERATION_LABELS[operationFilter]}</span>
        <span> · Bảng 2–9</span>
      </p>
      <div className="font-display mt-5 text-6xl font-extrabold tabular-nums text-slate-900 sm:text-7xl">
        <span>{introStep > 0 ? introStep : 'BẮT ĐẦU!'}</span>
      </div>
      <p className="mt-3 text-sm text-slate-500">
        <span>Mỗi câu có </span>
        <span>{timeLimitSeconds}</span>
        <span> giây. Tập trung cao độ!</span>
      </p>
    </div>
  );
}
