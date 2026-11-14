import { CheckCircle2, Clock, RotateCcw, Settings2, Sparkles, Target, Trophy, XCircle } from 'lucide-react';
import { LeaderboardEntry, OperationFilter, QuestionResult } from '../types/game';
import { getRankTier, OPERATION_LABELS } from '../utils/questionGenerator';
import { ConfettiCanvas } from './ConfettiCanvas';

interface SummaryScreenProps {
  operationFilter: OperationFilter;
  timeLimitSeconds: number;
  results: QuestionResult[];
  totalScore: number;
  maxStreak: number;
  leaderboard: LeaderboardEntry[];
  currentEntryId: string | null;
  onPlayAgain: () => void;
  onBackToLobby: () => void;
}

export function SummaryScreen({
  operationFilter,
  timeLimitSeconds,
  results,
  totalScore,
  maxStreak,
  leaderboard,
  currentEntryId,
  onPlayAgain,
  onBackToLobby,
}: SummaryScreenProps) {
  const totalQuestions = results.length;
  const correctCount = results.filter((r) => r.status === 'correct').length;
  const wrongCount = results.filter((r) => r.status === 'wrong').length;
  const timeoutCount = results.filter((r) => r.status === 'timeout').length;
  const missedCount = totalQuestions - correctCount;
  const isPerfect = totalQuestions > 0 && correctCount === totalQuestions;
  const accuracyPct = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const avgTime =
    totalQuestions > 0
      ? (results.reduce((acc, r) => acc + r.timeUsedSeconds, 0) / totalQuestions).toFixed(1)
      : '0.0';

  const rankTier = getRankTier(correctCount, totalQuestions);
  const currentPosition =
    currentEntryId !== null
      ? leaderboard.findIndex((item) => item.id === currentEntryId) + 1
      : 0;

  return (
    <div className="space-y-5">
      <ConfettiCanvas active={isPerfect} />

      {/* Achievement & Rank Card */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
        <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <div>
            <p className="text-xs font-semibold text-slate-500">
              <span>{OPERATION_LABELS[operationFilter]}</span>
              <span> · Bảng 2–9 · </span>
              <span>{timeLimitSeconds}s/câu</span>
              {currentPosition > 0 ? (
                <span key="rank-pos"> · Hạng #{currentPosition}</span>
              ) : null}
            </p>
            <h2 className="font-display mt-1.5 text-2xl font-extrabold text-slate-900">
              {rankTier.title}
            </h2>
            <p className="mt-1 text-sm text-slate-600">{rankTier.subtitle}</p>
          </div>

          <div
            className={`flex shrink-0 flex-col items-center rounded-xl border px-5 py-3 text-center ${rankTier.badgeBg}`}
          >
            <span className="text-[11px] font-bold uppercase">Xếp hạng</span>
            <span className="font-display mt-0.5 text-3xl font-extrabold">
              <span>Hạng {rankTier.grade}</span>
            </span>
          </div>
        </div>

        {/* 100% Goal Encouragement Banner */}
        <div
          className={`mt-4 flex items-start gap-3 rounded-xl border p-4 ${
            isPerfect
              ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
              : 'border-amber-300 bg-amber-50 text-amber-950'
          }`}
        >
          {isPerfect ? (
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
          ) : (
            <Target className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
          )}
          <div className="text-sm">
            {isPerfect ? (
              <p className="font-bold">
                Chúc mừng! Con đã trả lời đúng 100% ({correctCount}/{totalQuestions} câu) và đạt
                thành công tuyệt đối!
              </p>
            ) : (
              <div>
                <p className="font-bold">
                  Mục tiêu Thành công tuyệt đối: Đúng 100% ({totalQuestions}/{totalQuestions} câu)
                </p>
                <p className="mt-1 text-xs leading-relaxed text-amber-900 sm:text-sm">
                  Con đã đạt {accuracyPct}% (còn thiếu {missedCount} câu nữa). Hãy xem lại các câu
                  chưa đúng bên dưới và thi đấu lại để chinh phục mốc 100% nhé!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 3-Column Stat Row */}
        <div className="mt-5 grid grid-cols-3 gap-2.5 sm:gap-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-center">
            <p className="text-[11px] font-bold text-slate-500 uppercase">Tổng điểm</p>
            <p className="font-mono mt-1 text-xl font-extrabold tabular-nums text-blue-600 sm:text-2xl">
              {totalScore.toLocaleString('vi-VN')}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-center">
            <p className="text-[11px] font-bold text-slate-500 uppercase">Trả lời đúng</p>
            <p className="font-mono mt-1 text-xl font-extrabold tabular-nums text-emerald-600 sm:text-2xl">
              <span>{correctCount}</span>
              <span>/</span>
              <span>{totalQuestions}</span>
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-center">
            <p className="text-[11px] font-bold text-slate-500 uppercase">Chuỗi tối đa</p>
            <p className="font-mono mt-1 text-xl font-extrabold tabular-nums text-amber-600 sm:text-2xl">
              <span>{maxStreak}</span> <span aria-hidden="true">🔥</span>
            </p>
          </div>
        </div>

        <p className="mt-3 text-center text-xs font-medium text-slate-500">
          Chính xác {accuracyPct}% · Sai: {wrongCount} câu · Mất lượt (hết giờ): {timeoutCount} câu
          · Tốc độ TB: {avgTime} giây/câu
        </p>

        {/* Action Buttons */}
        <div className="mt-5 space-y-2.5">
          <button
            type="button"
            onClick={onPlayAgain}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-5 py-3.5 font-display text-base font-extrabold text-white uppercase shadow-sm transition-colors hover:bg-blue-700"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            <span>{isPerfect ? 'CHƠI LẠI GIỮ PHONG ĐỘ' : 'THỬ LẠI ĐỂ ĐẠT 100%'}</span>
          </button>

          <button
            type="button"
            onClick={onBackToLobby}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-900 transition-colors hover:bg-slate-50"
          >
            <Settings2 className="h-4 w-4" aria-hidden="true" />
            <span>Chọn thử thách khác</span>
          </button>
        </div>
      </section>

      {/* Question Review List */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
        <h3 className="font-display text-base font-bold text-slate-900">
          Chi tiết các câu hỏi ({totalQuestions} câu)
        </h3>

        <div className="mt-3.5 max-h-[300px] space-y-2 overflow-y-auto pr-1">
          {results.map((item, idx) => (
            <div
              key={item.question.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-2.5 text-sm"
            >
              <div className="flex items-center gap-2.5">
                {item.status === 'correct' ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                ) : item.status === 'timeout' ? (
                  <Clock className="h-4 w-4 shrink-0 text-rose-600" aria-hidden="true" />
                ) : (
                  <XCircle className="h-4 w-4 shrink-0 text-rose-600" aria-hidden="true" />
                )}

                <div>
                  <span className="font-mono font-bold text-slate-900">
                    Câu {idx + 1}: {item.question.expressionText} = {item.question.correctAnswer}
                  </span>
                  <p className="text-xs text-slate-500">
                    {item.status === 'correct'
                      ? `Đúng trong ${item.timeUsedSeconds}s`
                      : item.status === 'timeout'
                        ? 'Hết giờ — Mất lượt'
                        : `Đã chọn: ${item.selectedOption}`}
                  </p>
                </div>
              </div>

              <span
                className={`font-mono text-sm font-bold tabular-nums shrink-0 ${
                  item.pointsEarned > 0 ? 'text-blue-600' : 'text-slate-400'
                }`}
              >
                +{item.pointsEarned}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Arena Leaderboard */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" aria-hidden="true" />
          <h3 className="font-display text-base font-bold text-slate-900">
            Bảng xếp hạng thành tích
          </h3>
        </div>

        <div className="mt-3.5 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs font-semibold text-slate-500">
              <tr>
                <th className="py-2 pr-3">Hạng</th>
                <th className="py-2 pr-3">Thử thách</th>
                <th className="py-2 pr-3 text-right">Đúng</th>
                <th className="py-2 pr-3 text-right">Cấp</th>
                <th className="py-2 text-right">Điểm</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leaderboard.slice(0, 8).map((entry, idx) => {
                const isCurrent = entry.id === currentEntryId;
                return (
                  <tr key={entry.id} className={isCurrent ? 'bg-blue-50/70' : ''}>
                    <td className="py-2.5 pr-3 font-mono font-bold tabular-nums text-blue-600">
                      #{idx + 1}
                    </td>
                    <td className="py-2.5 pr-3 font-semibold text-slate-900">
                      <span>{OPERATION_LABELS[entry.operationFilter] ?? 'Tổng hợp'}</span>{' '}
                      <span className="text-xs font-normal text-slate-500">
                        ({entry.timeLimitSeconds}s)
                      </span>
                      {isCurrent ? (
                        <span key="current-badge" className="ml-1.5 text-xs font-semibold text-blue-600">
                          (Lượt này)
                        </span>
                      ) : null}
                    </td>
                    <td className="py-2.5 pr-3 text-right font-mono tabular-nums text-slate-600">
                      {entry.correctCount}/{entry.totalQuestions}
                    </td>
                    <td className="py-2.5 pr-3 text-right font-mono font-bold text-amber-600">
                      {entry.rankGrade}
                    </td>
                    <td className="py-2.5 text-right font-mono font-bold tabular-nums text-slate-900">
                      {entry.score.toLocaleString('vi-VN')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
