"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { generateWords } from "./RandomWords";
import TimerSetting from "./TimerSetting";
import { motion, AnimatePresence } from "motion/react";

/**
 * Helper: Determine if a keypress is a valid typing character.
 * Excludes helper keys (Shift, Ctrl, Alt, CapsLock, Arrow keys, etc.) which have key.length > 1.
 * Excludes Ctrl/Cmd/Alt modifier combinations.
 */
const isValidTypingKey = (
  key: string,
  ctrlKey: boolean,
  metaKey: boolean,
  altKey: boolean
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
const calculateAccuracy = (correctChars: number, totalTyped: number): number => {
  if (totalTyped <= 0) return 0;
  return Math.round((correctChars / totalTyped) * 100);
};

/**
 * Helper: Determine how many words to generate depending on the timer setting
 */
const getWordCountForTimer = (time: number): number => {
  switch (time) {
    case 15:
      return 40;
    case 30:
      return 75;
    case 60:
      return 150;
    case 120:
      return 300;
    default:
      return 75;
  }
};

interface CharMetadata {
  char: string;
  globalIndex: number;
}

interface WordMetadata {
  wordIndex: number;
  chars: CharMetadata[];
  hasSpace: boolean;
  spaceGlobalIndex?: number;
}

function PlayGround2() {
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

  // States for smooth absolute caret cursor and scrolling viewport
  const [cursorStyle, setCursorStyle] = useState({ left: 0, top: 0, height: 0 });
  const [scrollOffset, setScrollOffset] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [resizeTrigger, setResizeTrigger] = useState(0);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const wordsListRef = useRef<HTMLDivElement | null>(null);
  const activeCharRef = useRef<HTMLSpanElement | null>(null);

  // Memoized restart logic to refresh all states and generate new words
  const handleRestart = useCallback(() => {
    const wordCount = getWordCountForTimer(timer);
    setText(generateWords(wordCount, hasPunctuation, hasNumbers, difficulty));
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
  }, [timer, hasPunctuation, hasNumbers, difficulty]);

  // Restart the test whenever any configuration changes
  useEffect(() => {
    handleRestart();
  }, [handleRestart]);

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
      setTyped((prev) => {
        if (prev.length >= text.length) return prev;
        return prev + e.key;
      });

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
  }, [isFinished, isStarted, text, handleRestart, difficulty]);

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
      // Each line has a fixed height of 48px
      const lineHeight = 48;
      const activeLine = Math.floor(top / lineHeight);
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
    const lineHeight = 48;

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
      const extraWords = generateWords(15, hasPunctuation, hasNumbers, difficulty);
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
  }, [isStarted, isFinished]);

  // Completion Detection Effect
  useEffect(() => {
    if (isStarted && !isFinished && text && typed.length === text.length) {
      setFinished(true);
      setEndTime(Date.now());
    }
  }, [typed, text, isStarted, isFinished]);

  // Parse text into structured words/characters with global indices to prevent layout shifts
  const wordObjects = useMemo<WordMetadata[]>(() => {
    if (!text) return [];
    const wordsList = text.split(" ");
    let currentIndex = 0;
    return wordsList.map((word, wordIdx) => {
      const chars: CharMetadata[] = word.split("").map((char) => {
        const globalIndex = currentIndex;
        currentIndex++;
        return { char, globalIndex };
      });

      const hasSpace = wordIdx < wordsList.length - 1;
      let spaceGlobalIndex: number | undefined;
      if (hasSpace) {
        spaceGlobalIndex = currentIndex;
        currentIndex++;
      }

      return {
        wordIndex: wordIdx,
        chars,
        hasSpace,
        spaceGlobalIndex,
      };
    });
  }, [text]);

  // Calculate session metrics
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
  }, [startTime, endTime]);

  const wpm = useMemo(
    () => calculateWpm(correctChars, elapsedSeconds),
    [correctChars, elapsedSeconds]
  );

  const accuracy = useMemo(
    () => calculateAccuracy(correctChars, typed.length),
    [correctChars, typed.length]
  );

  return (
    <div className="w-full max-w-none flex flex-col gap-6 select-none">
      {/* CSS Styles for stepping cursor blinking when idle */}
      <style>{`
        @keyframes cursor-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .animate-cursor-blink {
          animation: cursor-blink 1s step-end infinite;
        }
      `}</style>

      {/* Top Bar: Live Timer or Settings */}
      <div className="flex items-center justify-between h-12">
        <div className="text-2xl font-mono text-[#e2b714] font-bold">
          {!isFinished && isStarted && <span>{timeLeft}</span>}
        </div>

        <AnimatePresence mode="wait">
          {!isStarted && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              <TimerSetting
                timer={timer}
                setTimer={setTimer}
                setTimeLeft={setTimeLeft}
                hasPunctuation={hasPunctuation}
                setHasPunctuation={setHasPunctuation}
                hasNumbers={hasNumbers}
                setHasNumbers={setHasNumbers}
                difficulty={difficulty}
                setDifficulty={setDifficulty}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Sandbox Area */}
      <div className="min-h-[240px] flex items-center justify-center">
        {isFinished ? (
          <div className="w-full max-w-md">
            <motion.div
              className="bg-[#121212] border border-[#222222]/80 rounded-2xl p-8 flex flex-col items-center gap-6 shadow-2xl"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-slate-200">Test Completed</h2>

              <div className="grid grid-cols-3 gap-8 w-full text-center">
                <div className="flex flex-col">
                  <span className="text-[#444444] text-xs font-semibold uppercase tracking-wider">
                    WPM
                  </span>
                  <span className="text-5xl font-mono font-bold text-[#e2b714] mt-1">
                    {wpm}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[#444444] text-xs font-semibold uppercase tracking-wider">
                    Accuracy
                  </span>
                  <span className="text-5xl font-mono font-bold text-[#e2b714] mt-1">
                    {accuracy}%
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[#444444] text-xs font-semibold uppercase tracking-wider">
                    Time
                  </span>
                  <span className="text-5xl font-mono font-bold text-slate-300 mt-1">
                    {Math.round(elapsedSeconds)}s
                  </span>
                </div>
              </div>

              <div className="text-xs text-[#444444] font-mono mt-2">
                characters: <span className="text-slate-200">{correctChars}</span> correct |{" "}
                <span className="text-red-500">{typed.length - correctChars}</span> incorrect |{" "}
                <span className="text-[#444444]">{typed.length}</span> total
              </div>

              <button
                onClick={handleRestart}
                className="flex items-center justify-center px-6 py-3 bg-[#222222] hover:bg-[#2c2c2c] text-slate-200 hover:text-white rounded-lg font-medium transition-all duration-200 border border-[#333333] hover:border-[#444444] focus:outline-none focus:ring-2 focus:ring-[#e2b714] shadow-md cursor-pointer group mt-4 w-full"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5 mr-2 transition-transform duration-300 group-hover:rotate-180"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                  />
                </svg>
                Restart Test
              </button>
              <div className="text-[10px] text-[#444444] uppercase tracking-widest font-mono">
                Press{" "}
                <kbd className="bg-[#222222] px-1 py-0.5 rounded text-slate-300 font-bold border border-[#333333]">
                  ESC
                </kbd>{" "}
                or{" "}
                <kbd className="bg-[#222222] px-1 py-0.5 rounded text-slate-300 font-bold border border-[#333333]">
                  ENTER
                </kbd>{" "}
                to restart
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="w-full flex flex-col gap-4 mt-4">
            {/* Globe Language Header */}
            <div className="flex items-center justify-center gap-1.5 text-xs text-[#444444] font-mono select-none mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-3.5 h-3.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.505 0-4.873-.772-6.843-2.091m13.686 0A11.95 11.95 0 0012 4.5c-2.505 0-4.873.772-6.843 2.091m0 0a9 9 0 0113.686 0"
                />
              </svg>
              <span>
                english
                {hasPunctuation && " + punctuation"}
                {hasNumbers && " + numbers"}
                {difficulty === "hard" && " (hard)"}
              </span>
            </div>

            {/* Relative outer container wrapping words with fixed height of 3 lines */}
            <div
              ref={containerRef}
              className="relative w-full h-[144px] overflow-hidden select-none"
            >
              {/* Inner translated list wrapping words and cursor ref */}
              <motion.div
                key={resetKey}
                ref={wordsListRef}
                initial={{ filter: "blur(12px)", opacity: 0, y: 0 }}
                animate={{ filter: "blur(0px)", opacity: 1, y: -scrollOffset }}
                transition={{
                  filter: { duration: 0.45, ease: "easeOut" },
                  opacity: { duration: 0.45, ease: "easeOut" },
                  y: { type: "spring", stiffness: 300, damping: 30 }
                }}
                className="flex flex-wrap text-3xl font-mono leading-[48px] select-none text-left tracking-normal w-full max-w-none relative"
              >
                {wordObjects.map((wordObj) => (
                  <span
                    key={wordObj.wordIndex}
                    className="inline-flex animate-fade-in"
                  >
                    {wordObj.chars.map((charObj) => {
                      const isActive = charObj.globalIndex === typed.length;
                      let colorClass = "text-[#444444]";

                      if (charObj.globalIndex < typed.length) {
                        const isCorrect = typed[charObj.globalIndex] === charObj.char;
                        colorClass = isCorrect
                          ? "text-[#dddddd]"
                          : "text-[#ca4754] border-b-2 border-[#ca4754]";
                      }

                      return (
                        <span
                          key={charObj.globalIndex}
                          ref={isActive ? activeCharRef : null}
                          className={`${colorClass} relative`}
                        >
                          {charObj.char}
                        </span>
                      );
                    })}

                    {/* Render space character with custom error style */}
                    {wordObj.hasSpace && wordObj.spaceGlobalIndex !== undefined && (
                      <span
                        key={`space-${wordObj.wordIndex}`}
                        ref={wordObj.spaceGlobalIndex === typed.length ? activeCharRef : null}
                        className="relative text-[#444444] whitespace-pre"
                      >
                        {typed.length > wordObj.spaceGlobalIndex ? (
                          typed[wordObj.spaceGlobalIndex] === " " ? (
                            " "
                          ) : (
                            <span className="text-[#ca4754] border-b-2 border-[#ca4754]">
                              ·
                            </span>
                          )
                        ) : (
                          " "
                        )}
                      </span>
                    )}
                  </span>
                ))}

                {/* Smooth absolute Caret Cursor inside the translated container */}
                {cursorStyle.height > 0 && (
                  <div
                    style={{
                      transform: `translate3d(${cursorStyle.left}px, ${cursorStyle.top}px, 0)`,
                      height: `${cursorStyle.height}px`,
                      transition: "transform 0.08s cubic-bezier(0.25, 0.46, 0.45, 0.94), height 0.08s ease",
                    }}
                    className={`absolute left-0 top-0 w-[2px] bg-[#e2b714] pointer-events-none z-10 ${
                      isTyping ? "" : "animate-cursor-blink"
                    }`}
                  />
                )}
              </motion.div>
            </div>

            {/* Refresh Restart Button below the text */}
            <div className="flex flex-col items-center justify-center mt-6 gap-3">
              <button
                onClick={handleRestart}
                className="text-[#444444] hover:text-[#e2b714] transition-colors duration-200 focus:outline-none p-2 cursor-pointer group"
                title="Restart Test (or press Esc/Tab)"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  stroke="currentColor"
                  className="w-5 h-5 transition-transform duration-300 group-hover:rotate-180"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                  />
                </svg>
              </button>
              
              {/* Pill instruction card */}
              <div className="text-[10px] font-mono text-[#444444] select-none flex items-center gap-1.5">
                <kbd className="bg-[#121212] px-1.5 py-0.5 rounded border border-[#222222] text-[#888888] font-bold">tab</kbd>
                <span>+</span>
                <kbd className="bg-[#121212] px-1.5 py-0.5 rounded border border-[#222222] text-[#888888] font-bold">enter</kbd>
                <span>- restart test</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PlayGround2;
