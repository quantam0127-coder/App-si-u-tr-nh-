import { Award, Trophy } from 'lucide-react';
import { LeaderboardEntry, OperationFilter } from '../types/game';
import { OPERATION_LABELS } from '../utils/questionGenerator';

interface TitleLobbyProps {
  timeLimitSeconds: number;
  onTimeLimitChange: (seconds: number) => void;
  questionCount: number;
  onQuestionCountChange: (count: number) => void;
  operationFilter: OperationFilter;
  onOperationFilterChange: (op: OperationFilter) => void;
  leaderboard: LeaderboardEntry[];
  onClearLeaderboard: () => void;
  onStartGame: () => void;
}

const TIME_OPTIONS = [5, 10, 15];
const QUESTION_COUNTS = [10, 15, 20];

export function TitleLobby({
  timeLimitSeconds,
  onTimeLimitChange,
  questionCount,
  onQuestionCountChange,
  operationFilter,
  onOperationFilterChange,
  leaderboard,
  onClearLeaderboard,
  onStartGame,
}: TitleLobbyProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartGame();
  };

  return (
    <div className="space-y-5">
      {/* Main Challenge Setup Card */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6"
      >
        <h2 className="font-display flex items-center gap-2 text-lg font-bold text-slate-900 sm:text-xl">
          <span aria-hidden="true">🎮</span>
          <span>Chọn thử thách</span>
        </h2>

        {/* Operation Filter (Tổng hợp · Bảng nhân · Bảng chia) */}
        <div className="mt-3.5 grid grid-cols-3 gap-2.5">
          {(
            [
              { id: 'mixed', label: 'Tổng hợp' },
              { id: 'multiply', label: 'Bảng nhân' },
              { id: 'divide', label: 'Bảng chia' },
            ] as const
          ).map((op) => {
            const active = operationFilter === op.id;
            return (
              <button
                key={op.id}
                type="button"
                onClick={() => onOperationFilterChange(op.id)}
                className={`min-h-[54px] rounded-xl border px-3 py-3 text-center text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-blue-600 sm:text-base ${
                  active
                    ? 'border-[#2563EB] bg-[#2563EB] text-white shadow-xs'
                    : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
                }`}
              >
                {op.label}
              </button>
            );
          })}
        </div>

        {/* Time Limit per Question */}
        <div className="mt-5">
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 sm:text-base">
            <span aria-hidden="true">⏱️</span>
            <span>Thời gian mỗi câu</span>
          </h3>
          <div className="mt-2.5 grid grid-cols-3 gap-2.5">
            {TIME_OPTIONS.map((sec) => {
              const active = timeLimitSeconds === sec;
              return (
                <button
                  key={sec}
                  type="button"
                  onClick={() => onTimeLimitChange(sec)}
                  className={`min-h-[48px] rounded-xl border px-3 py-2.5 text-center text-sm font-bold tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-blue-600 sm:text-base ${
                    active
                      ? 'border-[#2563EB] bg-[#2563EB] text-white shadow-xs'
                      : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  {sec} giây
                </button>
              );
            })}
          </div>
        </div>

        {/* Question Count */}
        <div className="mt-5">
          <h3 className="text-sm font-bold text-slate-900 sm:text-base">Số câu trong một lượt</h3>
          <div className="mt-2.5 grid grid-cols-3 gap-2.5">
            {QUESTION_COUNTS.map((cnt) => {
              const active = questionCount === cnt;
              return (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => onQuestionCountChange(cnt)}
                  className={`min-h-[48px] rounded-xl border px-3 py-2.5 text-center text-sm font-bold tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-blue-600 sm:text-base ${
                    active
                      ? 'border-[#2563EB] bg-[#2563EB] text-white shadow-xs'
                      : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  {cnt} câu
                </button>
              );
            })}
          </div>
        </div>

        {/* Primary CTA Button */}
        <button
          type="submit"
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-5 py-4 font-display text-base font-extrabold tracking-wide text-white uppercase shadow-sm transition-colors hover:bg-blue-700 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <span aria-hidden="true">🚀</span>
          <span>BẮT ĐẦU THỬ THÁCH</span>
        </button>
      </form>

      {/* Hall of Fame Leaderboard */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" aria-hidden="true" />
            <h2 className="font-display text-base font-bold text-slate-900 sm:text-lg">
              Bảng xếp hạng thành tích
            </h2>
          </div>

          {leaderboard.length > 0 && (
            <button
              type="button"
              onClick={onClearLeaderboard}
              className="text-xs font-semibold text-slate-500 transition-colors hover:text-rose-600 whitespace-nowrap"
            >
              Xóa lịch sử
            </button>
          )}
        </div>

        {leaderboard.length === 0 ? (
          <div key="empty-leaderboard" className="mt-4 rounded-xl bg-slate-50 px-4 py-6 text-center">
            <Award className="mx-auto h-7 w-7 text-slate-400" aria-hidden="true" />
            <p className="mt-2 text-sm font-medium text-slate-600">
              Chưa có thành tích nào được lưu.
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              Hoàn thành một lượt thi bảng nhân chia 2–9 để ghi danh!
            </p>
          </div>
        ) : (
          <div key="leaderboard-table" className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs font-semibold text-slate-500">
                <tr>
                  <th className="py-2 pr-3">Hạng</th>
                  <th className="py-2 pr-3">Thử thách</th>
                  <th className="py-2 pr-3 text-right">Đúng</th>
                  <th className="py-2 pr-3 text-right">Danh hiệu</th>
                  <th className="py-2 text-right">Điểm</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaderboard.slice(0, 6).map((entry, idx) => (
                  <tr key={entry.id}>
                    <td className="py-2.5 pr-3 font-mono font-bold tabular-nums text-blue-600">
                      #{idx + 1}
                    </td>
                    <td className="py-2.5 pr-3 font-semibold text-slate-900">
                      {OPERATION_LABELS[entry.operationFilter] ?? 'Tổng hợp'}{' '}
                      <span className="text-xs font-normal text-slate-500">
                        ({entry.timeLimitSeconds}s)
                      </span>
                    </td>
                    <td className="py-2.5 pr-3 text-right font-mono tabular-nums text-slate-600">
                      {entry.correctCount}/{entry.totalQuestions}
                    </td>
                    <td className="py-2.5 pr-3 text-right font-mono font-bold text-amber-600">
                      Hạng {entry.rankGrade}
                    </td>
                    <td className="py-2.5 text-right font-mono font-bold tabular-nums text-slate-900">
                      {entry.score.toLocaleString('vi-VN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
