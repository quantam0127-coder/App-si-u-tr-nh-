/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useState } from 'react';
import { ArenaStage } from './components/ArenaStage';
import { HeroBanner } from './components/HeroBanner';
import { IntroCountdown } from './components/IntroCountdown';
import { SoundBar } from './components/SoundBar';
import { SummaryScreen } from './components/SummaryScreen';
import { TitleLobby } from './components/TitleLobby';
import {
  GamePhase,
  LeaderboardEntry,
  MathQuestion,
  OperationFilter,
  QuestionResult,
} from './types/game';
import { generateQuestionRound, getRankTier } from './utils/questionGenerator';
import { soundEngine } from './utils/soundEngine';

const LEADERBOARD_STORAGE_KEY = 'dau_truong_sieu_tri_nho_leaderboard_v2';

function loadLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(LEADERBOARD_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [phase, setPhase] = useState<GamePhase>('TITLE_MENU');
  const [isMuted, setIsMuted] = useState(false);

  const [timeLimitSeconds, setTimeLimitSeconds] = useState<number>(10);
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [operationFilter, setOperationFilter] = useState<OperationFilter>('mixed');

  const [questions, setQuestions] = useState<MathQuestion[]>([]);
  const [roundResults, setRoundResults] = useState<QuestionResult[]>([]);
  const [finalScore, setFinalScore] = useState(0);
  const [finalMaxStreak, setFinalMaxStreak] = useState(0);
  const [currentEntryId, setCurrentEntryId] = useState<string | null>(null);

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => loadLeaderboard());

  useEffect(() => {
    try {
      localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(leaderboard));
    } catch {
      // Ignore storage quota errors cleanly
    }
  }, [leaderboard]);

  useEffect(() => {
    return () => {
      soundEngine.stopMusic();
    };
  }, []);

  const handleToggleMute = useCallback(() => {
    soundEngine.unlock();
    const nextMuted = soundEngine.toggleMute();
    setIsMuted(nextMuted);

    if (!nextMuted && (phase === 'PLAYING' || phase === 'COUNTDOWN_INTRO')) {
      soundEngine.startMusic('arena');
    } else if (!nextMuted && phase === 'TITLE_MENU') {
      soundEngine.startMusic('lobby');
    }
  }, [phase]);

  const startNewRound = useCallback(() => {
    soundEngine.unlock();

    const nextQuestions = generateQuestionRound(questionCount, operationFilter);
    setQuestions(nextQuestions);
    setRoundResults([]);
    setFinalScore(0);
    setFinalMaxStreak(0);
    setCurrentEntryId(null);
    setPhase('COUNTDOWN_INTRO');

    if (!soundEngine.getMuted()) {
      soundEngine.startMusic('arena');
    }
  }, [operationFilter, questionCount]);

  const handleIntroComplete = useCallback(() => {
    setPhase('PLAYING');
    if (!soundEngine.getMuted()) {
      soundEngine.startMusic('arena');
    }
  }, []);

  const handleFinishRound = useCallback(
    (results: QuestionResult[], totalScore: number, maxStreak: number) => {
      const correctCount = results.filter((r) => r.status === 'correct').length;
      const isPerfect = results.length > 0 && correctCount === results.length;

      soundEngine.stopMusic();
      soundEngine.playVictory(isPerfect);

      const tier = getRankTier(correctCount, results.length);
      const entryId = `run-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

      const newEntry: LeaderboardEntry = {
        id: entryId,
        operationFilter,
        score: totalScore,
        correctCount,
        totalQuestions: results.length,
        timeLimitSeconds,
        maxStreak,
        rankGrade: tier.grade,
        timestamp: Date.now(),
      };

      setLeaderboard((prev) =>
        [...prev, newEntry]
          .sort((a, b) => b.score - a.score || b.correctCount - a.correctCount)
          .slice(0, 20)
      );

      setRoundResults(results);
      setFinalScore(totalScore);
      setFinalMaxStreak(maxStreak);
      setCurrentEntryId(entryId);
      setPhase('RESULT_SUMMARY');
    },
    [operationFilter, timeLimitSeconds]
  );

  const handleReturnLobby = useCallback(() => {
    soundEngine.stopMusic();
    setPhase('TITLE_MENU');
  }, []);

  const handleClearLeaderboard = useCallback(() => {
    setLeaderboard([]);
    setCurrentEntryId(null);
  }, []);

  const isPlaying = phase === 'COUNTDOWN_INTRO' || phase === 'PLAYING';

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
      <div className="mx-auto w-full max-w-xl space-y-4 px-4 py-4 sm:px-6 sm:py-6">
        <HeroBanner compact={isPlaying} />

        <SoundBar isMuted={isMuted} onToggleMute={handleToggleMute} />

        <main>
          {phase === 'TITLE_MENU' ? (
            <TitleLobby
              key="phase-lobby"
              timeLimitSeconds={timeLimitSeconds}
              onTimeLimitChange={setTimeLimitSeconds}
              questionCount={questionCount}
              onQuestionCountChange={setQuestionCount}
              operationFilter={operationFilter}
              onOperationFilterChange={setOperationFilter}
              leaderboard={leaderboard}
              onClearLeaderboard={handleClearLeaderboard}
              onStartGame={startNewRound}
            />
          ) : null}

          {phase === 'COUNTDOWN_INTRO' ? (
            <IntroCountdown
              key="phase-intro"
              operationFilter={operationFilter}
              timeLimitSeconds={timeLimitSeconds}
              onComplete={handleIntroComplete}
            />
          ) : null}

          {phase === 'PLAYING' ? (
            <ArenaStage
              key="phase-playing"
              timeLimitSeconds={timeLimitSeconds}
              questions={questions}
              onFinishRound={handleFinishRound}
              onAbortRound={handleReturnLobby}
            />
          ) : null}

          {phase === 'RESULT_SUMMARY' ? (
            <SummaryScreen
              key="phase-summary"
              operationFilter={operationFilter}
              timeLimitSeconds={timeLimitSeconds}
              results={roundResults}
              totalScore={finalScore}
              maxStreak={finalMaxStreak}
              leaderboard={leaderboard}
              currentEntryId={currentEntryId}
              onPlayAgain={startNewRound}
              onBackToLobby={handleReturnLobby}
            />
          ) : null}
        </main>
      </div>
    </div>
  );
}
