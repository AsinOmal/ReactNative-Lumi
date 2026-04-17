import { useState, useRef, useCallback, useEffect } from 'react';
import { Animated } from 'react-native';
import { playSound } from '../utils/gameSound';
import { config } from '../constants/config';
import { useAuthStore } from '../store/useAuthStore';
import { logActivityEvent } from '../services/parentalControlsService';

interface UseARGameLoopProps {
  wordQueue: string[];
}

// 📖 What this does:
// Manages the 60-second game timer, score, streak (wrongCount), 
// and the 'correct/wrong' UI feedback animations. 
// It also tracks whether the game is currently running or over.
export const useARGameLoop = ({ wordQueue }: UseARGameLoopProps) => {
  const { user } = useAuthStore();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const [timeLeft, setTimeLeft] = useState(config.AR_GAME_DURATION_SEC);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isTapping = useRef(false);
  const feedbackAnim = useRef(new Animated.Value(0)).current;
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  useEffect(() => {
    if (!gameStarted) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        const next = t - 1;
        if (next <= 10 && next > 0) playSound('tick');
        if (next <= 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          playSound('gameover');
          setTimedOut(true);
          setGameOver(true);
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [gameStarted]);

  const flashFeedback = useCallback((type: 'correct' | 'wrong', cb?: () => void) => {
    setFeedback(type);
    Animated.sequence([
      Animated.timing(feedbackAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
      Animated.delay(type === 'correct' ? 700 : 500),
      Animated.timing(feedbackAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start(() => { setFeedback(null); cb?.(); });
  }, [feedbackAnim]);

  const handleCorrect = useCallback((word: string) => {
    if (isTapping.current || gameOver) return;
    isTapping.current = true;
    setScore(s => s + 10);
    setFoundWords(prev => [...prev, word]);
    playSound('correct');
    // Log to parent activity log — fire-and-forget, never stalls game loop
    if (user) {
      logActivityEvent(user.uid, { word, flagged: false, source: 'ar_word_find' }).catch(() => {});
    }
    flashFeedback('correct', () => {
      isTapping.current = false;
      if (currentIdx + 1 >= wordQueue.length) {
        if (timerRef.current) clearInterval(timerRef.current);
        playSound('victory');
        setGameOver(true);
      } else {
        setCurrentIdx(i => i + 1);
      }
    });
  }, [currentIdx, wordQueue.length, gameOver, flashFeedback]);

  const handleWrong = useCallback((_word: string) => {
    if (isTapping.current || gameOver) return;
    isTapping.current = true;
    setScore(s => Math.max(0, s - 5));
    setWrongCount(c => c + 1);
    playSound('wrong');
    flashFeedback('wrong', () => { isTapping.current = false; });
  }, [gameOver, flashFeedback]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  return {
    currentIdx,
    targetWord: wordQueue[currentIdx] ?? '',
    foundWords,
    score,
    wrongCount,
    gameOver,
    timedOut,
    gameStarted,
    setGameStarted,
    timeLeft,
    feedback,
    feedbackAnim,
    handleCorrect,
    handleWrong,
    stopTimer,
  };
};
