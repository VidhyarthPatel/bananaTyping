"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { generateWords } from "./RandomWords";

/**
 * Helper: Determine if a keypress is a valid typing character.
 * Excludes helper keys (Shift, Ctrl, Alt, CapsLock, Arrow keys, etc.) which have key.length > 1.
 * Excludes Ctrl/Cmd/Alt modifier combinations.
 */
const isValidTypingKey = (
  key: string,
  ctrlKey: boolean,
  metaKey: boolean,
  altKey: boolean,
): boolean => {
  return key.length === 1 && !ctrlKey && !metaKey && !altKey;
};

/**
 * Helper: Calculate Words Per Minute (WPM)
 * Calculated as (correct characters / 5) / (elapsed time in minutes).
 */
const calculateWpm = (correctChars: number, elapsedSeconds: number): number => {
  if (elapsedSeconds <= 0.5) return 0;
  const elapsedMinutes = elapsedSeconds / 60;
  return Math.round(correctChars / 5 / elapsedMinutes);
};

/**
 * Helper: Calculate Typing Accuracy
 * Calculated as (correct characters / total typed characters) * 100.
 */
const calculateAccuracy = (
  correctChars: number,
  totalTyped: number,
): number => {
  if (totalTyped <= 0) return 0;
  return Math.round((correctChars / totalTyped) * 100);
};

/**
 * Helper: Determine how many words to generate depending on the timer setting
 */
const getWordCountForTimer = (time: number): number => {
  switch (time) {
    case 15:
      return 60;
    case 30:
      return 80;
    case 60:
      return 150;
    case 120:
      return 300;
    default:
      return 80;
  }
};

export function useTypingTest() {
  const [timer, setTimer] = useState(30);
  const [text, setText] = useState("");
  const [typed, setTyped] = useState("");
  const [timeLeft, setTimeLeft] = useState(30);
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setFinished] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);

  // Mode and difficulty states
  const [hasPunctuation, setHasPunctuation] = useState(false);
  const [hasNumbers, setHasNumbers] = useState(false);
  const [difficulty, setDifficulty] = useState<"easy" | "hard">("easy");
  const [soundPack, setSoundPack] = useState("off");
  const [clickSound, setClickSound] = useState("on");
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [glowPreference, setGlowPreference] = useState("on");

  // States for smooth absolute caret cursor and scrolling viewport
  const [cursorStyle, setCursorStyle] = useState({
    left: 0,
    top: 0,
    height: 0,
  });
  const [scrollOffset, setScrollOffset] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [resizeTrigger, setResizeTrigger] = useState(0);

  // dashboard states
  const [history, setHistory] = useState<
    {
      second: number;
      wpm: number;
      rawWpm: number;
      errors?: number;
      burst?: number;
    }[]
  >([]);
  const [fixes, setFixes] = useState(0);
  const [personalBest, setPersonalBest] = useState<number>(0);
  const [isNewPersonalBest, setIsNewPersonalBest] = useState(false);
  const [incorrectWords, setIncorrectWords] = useState<string[]>([]);
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const [showWordReview, setShowWordReview] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const wordsListRef = useRef<HTMLDivElement | null>(null);
  const activeCharRef = useRef<HTMLSpanElement | null>(null);

  const typedRef = useRef(typed);
  const textRef = useRef(text);
  const totalKeystrokesRef = useRef(0);
  const errorsThisSecondRef = useRef(0);
  const correctCharsThisSecondRef = useRef(0);
  const keystrokesThisSecondRef = useRef(0);

  // Sync refs with state
  useEffect(() => {
    typedRef.current = typed;
  }, [typed]);

  useEffect(() => {
    textRef.current = text;
  }, [text]);

  useEffect(() => {
    totalKeystrokesRef.current = totalKeystrokes;
  }, [totalKeystrokes]);

  // Calculate session metrics (Top of hook body to prevent TDZ issues)
  const correctChars = useMemo(() => {
    let count = 0;
    const len = Math.min(typed.length, text.length);
    for (let i = 0; i < len; i++) {
      if (typed[i] === text[i]) {
        count++;
      }
    }
    return count;
  }, [typed, text]);

  const elapsedSeconds = useMemo(() => {
    if (!startTime) return 0;
    const end = endTime || Date.now();
    return (end - startTime) / 1000;
  }, [startTime, endTime, typed.length, timeLeft]);

  const wpm = useMemo(
    () => calculateWpm(correctChars, elapsedSeconds),
    [correctChars, elapsedSeconds],
  );

  const accuracy = useMemo(
    () => calculateAccuracy(correctChars, totalKeystrokes),
    [correctChars, totalKeystrokes],
  );

  const rawWpm = useMemo(() => {
    if (elapsedSeconds <= 0.5) return 0;
    return Math.round(totalKeystrokes / 5 / (elapsedSeconds / 60));
  }, [totalKeystrokes, elapsedSeconds]);

  const consistency = useMemo(() => {
    if (history.length < 2) return 100;
    const rawWpms = history.map((p) => p.rawWpm);
    const mean = rawWpms.reduce((a, b) => a + b, 0) / rawWpms.length;
    if (mean === 0) return 100;

    const absoluteDeviations = rawWpms.map((val) => Math.abs(val - mean));
    const averageDeviation =
      absoluteDeviations.reduce((a, b) => a + b, 0) / absoluteDeviations.length;
    const cv = averageDeviation / mean;

    const percentage = Math.round((1 - cv) * 100);
    return Math.max(0, Math.min(100, percentage));
  }, [history]);

  // Memoized restart logic to refresh all states and generate new words
  const handleRestart = useCallback(
    (forcePractice?: boolean) => {
      const wordCount = getWordCountForTimer(timer);
      let newText = "";
      const activePractice =
        forcePractice !== undefined ? forcePractice : isPracticeMode;

      if (activePractice && incorrectWords.length > 0) {
        setIsPracticeMode(true);
        const shuffled = [...incorrectWords].sort(() => Math.random() - 0.5);
        const repeated = [];
        while (repeated.length < wordCount) {
          repeated.push(...shuffled);
        }
        newText = repeated.slice(0, wordCount).join(" ");
      } else {
        newText = generateWords(
          wordCount,
          hasPunctuation,
          hasNumbers,
          difficulty,
        );
        setIsPracticeMode(false);
      }

      setText(newText);
      setTyped("");
      setTimeLeft(timer);
      setIsStarted(false);
      setFinished(false);
      setStartTime(null);
      setEndTime(null);
      setIsTyping(false);
      setScrollOffset(0);
      setCursorStyle({ left: 0, top: 0, height: 0 });
      setResetKey((prev) => prev + 1);
      setHistory([]);
      setFixes(0);
      setIsNewPersonalBest(false);
      setShowWordReview(false);
      setTotalKeystrokes(0);
      errorsThisSecondRef.current = 0;
      correctCharsThisSecondRef.current = 0;
      keystrokesThisSecondRef.current = 0;
    },
    [
      timer,
      hasPunctuation,
      hasNumbers,
      difficulty,
      isPracticeMode,
      incorrectWords,
    ],
  );

  // Restart the test whenever any configuration changes
  useEffect(() => {
    handleRestart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer, hasPunctuation, hasNumbers, difficulty]);

  // Keyboard Event Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape or Tab key to restart the test at any point
      if (e.key === "Escape" || e.key === "Tab") {
        e.preventDefault();
        handleRestart();
        return;
      }

      if (isFinished) {
        // If finished, Enter also restarts the test
        if (e.key === "Enter") {
          e.preventDefault();
          handleRestart();
        }
        return;
      }

      // Handle backspace safely, preventing browser back navigation
      if (e.key === "Backspace") {
        e.preventDefault();
        // In hard mode, Backspace is disabled to enforce perfect accuracy
        if (difficulty === "hard") {
          return;
        }

        // Fixes count increment: check if the character being backspaced was incorrect
        const lastIndex = typed.length - 1;
        if (lastIndex >= 0 && typed[lastIndex] !== text[lastIndex]) {
          setFixes((prev) => prev + 1);
        }

        setTyped((prev) => prev.slice(0, -1));
        setIsTyping(true);
        return;
      }

      // Prevent space key from scrolling the page
      if (e.key === " ") {
        e.preventDefault();
      }

      // Verify the pressed key is a valid typing character
      const isValid = isValidTypingKey(e.key, e.ctrlKey, e.metaKey, e.altKey);
      if (!isValid) return;

      // Stop appending characters if we've reached the end of the text
      if (typed.length >= text.length) return;

      const expectedChar = text[typed.length];
      if (e.key === expectedChar) {
        correctCharsThisSecondRef.current += 1;
      } else {
        errorsThisSecondRef.current += 1;
      }
      keystrokesThisSecondRef.current += 1;

      setTyped((prev) => prev + e.key);
      setTotalKeystrokes((total) => total + 1);
      setIsTyping(true);

      // Start the test and record start time on first valid character
      if (!isStarted) {
        setIsStarted(true);
        setStartTime(Date.now());
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFinished, isStarted, text, handleRestart, difficulty, typed]);

  // Reset typing state after a pause to resume cursor blinking
  useEffect(() => {
    if (!isTyping) return;
    const timeout = setTimeout(() => {
      setIsTyping(false);
    }, 500);
    return () => clearTimeout(timeout);
  }, [isTyping, typed.length]);

  // Track coordinates of the active character and compute scrolling translation offset
  useEffect(() => {
    const updateCursorAndScroll = () => {
      if (!wordsListRef.current || !activeCharRef.current) return;

      const wordsListRect = wordsListRef.current.getBoundingClientRect();
      const activeRect = activeCharRef.current.getBoundingClientRect();

      // Measure cursor relative to inner list wrapper (untranslated coordinates)
      const left = activeRect.left - wordsListRect.left;
      const top = activeRect.top - wordsListRect.top + activeRect.height * 0.1;
      const height = activeRect.height * 0.8;

      setCursorStyle({ left, top, height });

      // Handle scrolling: Keep the active typing line at the 2nd line of a 3-line viewport
      const firstChild = wordsListRef.current.children[0] as HTMLElement;
      const lineHeight = firstChild ? firstChild.offsetHeight : 56;
      const activeLine = Math.round(top / lineHeight);
      const scrollLines = Math.max(0, activeLine - 1);
      setScrollOffset(scrollLines * lineHeight);
    };

    // Run measurement immediately and after a short paint cycle
    updateCursorAndScroll();
    const timeoutId = setTimeout(updateCursorAndScroll, 50);

    window.addEventListener("resize", updateCursorAndScroll);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", updateCursorAndScroll);
    };
  }, [typed.length, text]);

  // Listen to window resize events to trigger re-measurement of lines
  useEffect(() => {
    const handleResize = () => setResizeTrigger((prev) => prev + 1);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Dynamic line generation and trimming to maintain exactly activeLine + 2 lines of text
  useEffect(() => {
    if (isFinished || !text || !wordsListRef.current) return;

    const children = wordsListRef.current.children;
    const words = text.split(" ");
    const wordLines: number[] = [];
    const firstChild = wordsListRef.current.children[0] as HTMLElement;
    const lineHeight = firstChild ? firstChild.offsetHeight : 56;

    for (let i = 0; i < words.length; i++) {
      const child = children[i] as HTMLElement;
      if (child) {
        const line = Math.round(child.offsetTop / lineHeight);
        wordLines.push(line);
      }
    }

    if (wordLines.length === 0) return;

    const maxLine = Math.max(...wordLines);

    // Map typed.length to word index using exact indices from the word list
    let activeWordIndex = 0;
    let currentIndex = 0;
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const wordStart = currentIndex;
      const wordEnd = currentIndex + word.length;
      const hasSpace = i < words.length - 1;
      const nextWordStart = wordEnd + (hasSpace ? 1 : 0);

      if (typed.length >= wordStart && typed.length < nextWordStart) {
        activeWordIndex = i;
        break;
      }
      currentIndex = nextWordStart;
    }

    const activeLine = wordLines[activeWordIndex] ?? 0;
    const targetMaxLine = activeLine + 2;

    if (maxLine < targetMaxLine) {
      // Append a batch of 15 words to ensure we get to the next line
      const extraWords = generateWords(
        15,
        hasPunctuation,
        hasNumbers,
        difficulty,
      );
      setText((prev) => prev + " " + extraWords);
    } else if (maxLine > targetMaxLine) {
      // Trim the text to only keep words up to targetMaxLine
      let cutIndex = -1;
      for (let i = 0; i < wordLines.length; i++) {
        if (wordLines[i] > targetMaxLine) {
          cutIndex = i;
          break;
        }
      }
      if (cutIndex !== -1) {
        const trimmedWords = words.slice(0, cutIndex);
        setText(trimmedWords.join(" "));
      }
    }
  }, [
    text,
    typed.length,
    isFinished,
    hasPunctuation,
    hasNumbers,
    difficulty,
    resizeTrigger,
  ]);

  // Timer Countdown Effect
  useEffect(() => {
    if (!isStarted || isFinished) return;

    const interval = setInterval(() => {
      const elapsed = startTime
        ? Math.round((Date.now() - startTime) / 1000)
        : 0;
      if (elapsed > 0) {
        const currentTyped = typedRef.current;
        const currentText = textRef.current;

        let currentCorrect = 0;
        const len = Math.min(currentTyped.length, currentText.length);
        for (let i = 0; i < len; i++) {
          if (currentTyped[i] === currentText[i]) {
            currentCorrect++;
          }
        }

        const elapsedMinutes = elapsed / 60;
        const currentWpm = Math.round(currentCorrect / 5 / elapsedMinutes);
        const currentRawWpm = Math.round(
          totalKeystrokesRef.current / 5 / elapsedMinutes,
        );

        const currentErrors = errorsThisSecondRef.current;
        const currentCorrectThisSecond = correctCharsThisSecondRef.current;
        const currentBurst = currentCorrectThisSecond * 12; // WPM for this 1s interval

        // Reset interval counters
        errorsThisSecondRef.current = 0;
        correctCharsThisSecondRef.current = 0;
        keystrokesThisSecondRef.current = 0;

        setHistory((prev) => [
          ...prev,
          {
            second: elapsed,
            wpm: currentWpm,
            rawWpm: currentRawWpm,
            errors: currentErrors,
            burst: currentBurst,
          },
        ]);
      }

      setTimeLeft((prev) => {
        if (prev <= 1) {
          setFinished(true);
          setEndTime(Date.now());
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isStarted, isFinished, startTime]);

  const calculateIncorrectWords = useCallback(() => {
    const words = textRef.current.split(" ");
    const badWords: string[] = [];
    const currentTyped = typedRef.current;

    let currentIndex = 0;
    words.forEach((word, wordIdx) => {
      let isWordBad = false;
      const wordLen = word.length;

      for (let i = 0; i < wordLen; i++) {
        const globalIdx = currentIndex + i;
        if (globalIdx < currentTyped.length) {
          if (currentTyped[globalIdx] !== word[i]) {
            isWordBad = true;
          }
        }
      }

      const spaceGlobalIndex = currentIndex + wordLen;
      if (
        spaceGlobalIndex < currentTyped.length &&
        wordIdx < words.length - 1
      ) {
        if (currentTyped[spaceGlobalIndex] !== " ") {
          isWordBad = true;
        }
      }

      if (isWordBad) {
        badWords.push(word);
      }

      currentIndex += wordLen + 1; // +1 for space
    });

    return Array.from(new Set(badWords));
  }, []);

  // Load settings on mount
  useEffect(() => {
    const pb = localStorage.getItem("minttyping_pb");
    if (pb) {
      setPersonalBest(parseInt(pb, 10));
    }
    const savedSound = localStorage.getItem("minttyping_sound");
    if (savedSound) {
      setSoundPack(savedSound);
    }
    const savedClickSound = localStorage.getItem("minttyping_click_sound");
    if (savedClickSound) {
      setClickSound(savedClickSound);
    } else {
      setClickSound("on");
    }
    const savedGlow = localStorage.getItem("minttyping_glow");
    if (savedGlow) {
      setGlowPreference(savedGlow);
    } else {
      setGlowPreference("on");
    }

    // Load timer, punctuation, numbers, and difficulty configurations
    const savedTimer = localStorage.getItem("minttyping_timer");
    if (savedTimer) {
      const parsedTimer = parseInt(savedTimer, 10);
      setTimer(parsedTimer);
      setTimeLeft(parsedTimer);
    }
    const savedPunctuation = localStorage.getItem("minttyping_punctuation");
    if (savedPunctuation !== null) {
      setHasPunctuation(savedPunctuation === "true");
    }
    const savedNumbers = localStorage.getItem("minttyping_numbers");
    if (savedNumbers !== null) {
      setHasNumbers(savedNumbers === "true");
    }
    const savedDifficulty = localStorage.getItem("minttyping_difficulty");
    if (savedDifficulty === "easy" || savedDifficulty === "hard") {
      setDifficulty(savedDifficulty as "easy" | "hard");
    }
  }, []);

  // Save sound pack to localStorage
  useEffect(() => {
    localStorage.setItem("minttyping_sound", soundPack);
  }, [soundPack]);

  // Save click sound to localStorage
  useEffect(() => {
    localStorage.setItem("minttyping_click_sound", clickSound);
  }, [clickSound]);

  // Save glow preference to localStorage
  useEffect(() => {
    localStorage.setItem("minttyping_glow", glowPreference);
  }, [glowPreference]);

  // Save timer configuration to localStorage
  useEffect(() => {
    localStorage.setItem("minttyping_timer", timer.toString());
  }, [timer]);

  // Save punctuation configuration to localStorage
  useEffect(() => {
    localStorage.setItem("minttyping_punctuation", hasPunctuation.toString());
  }, [hasPunctuation]);

  // Save numbers configuration to localStorage
  useEffect(() => {
    localStorage.setItem("minttyping_numbers", hasNumbers.toString());
  }, [hasNumbers]);

  // Save difficulty configuration to localStorage
  useEffect(() => {
    localStorage.setItem("minttyping_difficulty", difficulty);
  }, [difficulty]);

  // Calculate results & Personal Best when the test finishes
  useEffect(() => {
    if (isFinished) {
      const bad = calculateIncorrectWords();
      setIncorrectWords(bad);

      const pb = localStorage.getItem("minttyping_pb");
      const currentPb = pb ? parseInt(pb, 10) : 0;

      if (wpm > currentPb) {
        localStorage.setItem("minttyping_pb", wpm.toString());
        setPersonalBest(wpm);
        setIsNewPersonalBest(true);
      } else {
        setPersonalBest(currentPb);
        setIsNewPersonalBest(false);
      }
    }
  }, [isFinished, calculateIncorrectWords, wpm]);

  const copyResultsReport = () => {
    const reportText =
      `MintTyping Test Results\n` +
      `----------------------\n` +
      `WPM: ${wpm}\n` +
      `Accuracy: ${accuracy}%\n` +
      `Raw WPM: ${rawWpm}\n` +
      `Consistency: ${consistency}%\n` +
      `Time: ${Math.round(elapsedSeconds)}s\n` +
      `Fixes: ${fixes}\n` +
      `Difficulty: ${difficulty}\n` +
      `Punctuation: ${hasPunctuation ? "on" : "off"}\n` +
      `Numbers: ${hasNumbers ? "on" : "off"}`;

    navigator.clipboard.writeText(reportText).then(() => {
      setToastMessage("Results report copied to clipboard!");
      setTimeout(() => setToastMessage(null), 3000);
    });
  };

  const downloadResults = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(
        JSON.stringify(
          {
            wpm,
            accuracy,
            rawWpm,
            consistency,
            time: Math.round(elapsedSeconds),
            fixes,
            difficulty,
            hasPunctuation,
            hasNumbers,
            timestamp: new Date().toISOString(),
          },
          null,
          2,
        ),
      );
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `minttyping_result_${Date.now()}.json`,
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const practiceMisspelledWords = () => {
    if (incorrectWords.length === 0) {
      setToastMessage("No misspelled words to practice!");
      setTimeout(() => setToastMessage(null), 2500);
      return;
    }
    handleRestart(true);
  };

  // Listen for custom restart event (e.g., when navigation logo is clicked)
  useEffect(() => {
    const handleCustomRestart = () => {
      handleRestart();
    };
    window.addEventListener("restart-typing-test", handleCustomRestart);
    return () => {
      window.removeEventListener("restart-typing-test", handleCustomRestart);
    };
  }, [handleRestart]);

  // Listen for custom settings sidebar toggle event
  useEffect(() => {
    const handleToggleSettings = () => {
      setSettingsOpen((prev) => !prev);
    };
    window.addEventListener("toggle-settings-sidebar", handleToggleSettings);
    return () => {
      window.removeEventListener("toggle-settings-sidebar", handleToggleSettings);
    };
  }, []);

  return {
    timer,
    setTimer,
    text,
    typed,
    timeLeft,
    setTimeLeft,
    isStarted,
    isFinished,
    startTime,
    endTime,
    hasPunctuation,
    setHasPunctuation,
    hasNumbers,
    setHasNumbers,
    difficulty,
    setDifficulty,
    cursorStyle,
    scrollOffset,
    isTyping,
    resetKey,
    history,
    fixes,
    personalBest,
    isNewPersonalBest,
    incorrectWords,
    isPracticeMode,
    showWordReview,
    setShowWordReview,
    toastMessage,
    totalKeystrokes,
    containerRef,
    wordsListRef,
    activeCharRef,
    wpm,
    accuracy,
    rawWpm,
    consistency,
    elapsedSeconds,
    handleRestart,
    copyResultsReport,
    downloadResults,
    practiceMisspelledWords,
    soundPack,
    setSoundPack,
    clickSound,
    setClickSound,
    isSettingsOpen,
    setSettingsOpen,
    glowPreference,
    setGlowPreference,
  };
}
