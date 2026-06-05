"use client";

import TimerSetting from "./TimerSetting";
import ResultsDashboard from "./ResultsDashboard";
import TypingSandbox from "./TypingSandbox";
import { motion, AnimatePresence } from "motion/react";
import { useTypingTest } from "./useTypingTest";

function PlayGround2() {
  const {
    timer,
    setTimer,
    text,
    typed,
    timeLeft,
    setTimeLeft,
    isStarted,
    isFinished,
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
    showWordReview,
    setShowWordReview,
    toastMessage,
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
  } = useTypingTest();

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
          <ResultsDashboard
            wpm={wpm}
            accuracy={accuracy}
            rawWpm={rawWpm}
            consistency={consistency}
            elapsedSeconds={elapsedSeconds}
            fixes={fixes}
            personalBest={personalBest}
            isNewPersonalBest={isNewPersonalBest}
            incorrectWords={incorrectWords}
            timer={timer}
            hasPunctuation={hasPunctuation}
            hasNumbers={hasNumbers}
            difficulty={difficulty}
            history={history}
            handleRestart={handleRestart}
            copyResultsReport={copyResultsReport}
            downloadResults={downloadResults}
            practiceMisspelledWords={practiceMisspelledWords}
            showWordReview={showWordReview}
            setShowWordReview={setShowWordReview}
            toastMessage={toastMessage}
          />
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

            <TypingSandbox
              text={text}
              typed={typed}
              scrollOffset={scrollOffset}
              cursorStyle={cursorStyle}
              resetKey={resetKey}
              isTyping={isTyping}
              containerRef={containerRef}
              wordsListRef={wordsListRef}
              activeCharRef={activeCharRef}
            />

            {/* Refresh Restart Button below the text */}
            <div className="flex flex-col items-center justify-center mt-6 gap-3">
              <button
                onClick={() => handleRestart()}
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
                <kbd className="bg-[#121212] px-1.5 py-0.5 rounded border border-[#222222] text-[#888888] font-bold">
                  tab
                </kbd>
                <span>+</span>
                <kbd className="bg-[#121212] px-1.5 py-0.5 rounded border border-[#222222] text-[#888888] font-bold">
                  enter
                </kbd>
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
