"use client";

import TimerSetting from "./TimerSetting";
import ResultsDashboard from "./ResultsDashboard";
import TypingSandbox from "./TypingSandbox";
import { motion, AnimatePresence } from "motion/react";
import { useTypingTest } from "./useTypingTest";
import KeyboardSoundManager from "./KeyboardSoundManager";

function Playground() {
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
    soundPack,
    setSoundPack,
    clickSound,
    setClickSound,
    isSettingsOpen,
    setSettingsOpen,
    inputRef,
    handleInputChange,
  } = useTypingTest();

  return (
    <div className="w-full max-w-none flex flex-col flex-1 gap-6 select-none">
      {/* Keyboard Sound player */}
      <KeyboardSoundManager soundPack={soundPack} clickSound={clickSound} />
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
      <div className="flex items-center justify-between min-h-12 h-auto py-2">
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
      <div className="flex-1 flex flex-col items-center justify-center min-h-[240px]">
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
          <div className="w-full flex-1 flex flex-col gap-4 mt-4">
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
              wpm={wpm}
              isStarted={isStarted}
              isFinished={isFinished}
              inputRef={inputRef}
              handleInputChange={handleInputChange}
            />

            {/* Refresh Restart Button below the text */}
            <div className="flex flex-col items-center justify-center mt-auto mb-4 gap-3">
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

      {/* Settings Sidebar Slider Overlay */}
      <AnimatePresence>
        {isSettingsOpen && (
          <>
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSettingsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-40 cursor-pointer"
            />

            {/* Sidebar Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed right-0 top-0 bottom-0 w-80 max-w-[90vw] bg-[#090909]/95 border-l border-[#222222]/80 z-50 p-6 flex flex-col gap-6 text-[#dddddd] font-mono shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#222222]/80 pb-4">
                <h2 className="text-lg font-bold text-[#e2b714] flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.43l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.991l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.645-.869l.214-1.28z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Settings
                </h2>
                <button
                  onClick={() => setSettingsOpen(false)}
                  className="text-[#444444] hover:text-[#dddddd] transition-colors cursor-pointer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Settings Groups */}
              <div className="flex flex-col gap-6 overflow-y-auto pr-1">
                {/* Section 1: Audio Preference */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-xs font-bold text-[#555555] uppercase tracking-wider">
                    Audio Preference
                  </h3>

                  {/* Key sound setting */}
                  <div className="flex flex-col gap-3 bg-[#121212] border border-[#222222]/60 p-4 rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-semibold">
                        Key Sounds
                      </span>
                      <button
                        onClick={() =>
                          setSoundPack(soundPack === "off" ? "classic" : "off")
                        }
                        className={`cursor-pointer w-10 h-5 rounded-full transition-colors relative ${soundPack !== "off" ? "bg-[#e2b714]" : "bg-[#222222]"}`}
                      >
                        <div
                          className={`w-3.5 h-3.5 bg-black rounded-full absolute top-[3px] transition-transform duration-200 ${soundPack !== "off" ? "left-[22px]" : "left-[4px]"}`}
                        />
                      </button>
                    </div>

                    {soundPack !== "off" && (
                      <div className="flex flex-col gap-1.5 mt-1">
                        <span className="text-[10px] text-[#555555]">
                          Sound Pack
                        </span>
                        <select
                          value={soundPack}
                          onChange={(e) => setSoundPack(e.target.value)}
                          className="bg-[#090909] text-[#888888] hover:text-[#dddddd] font-semibold border border-[#222222] rounded px-2.5 py-1.5 focus:outline-none cursor-pointer text-[12px] w-full"
                        >
                          <option value="classic">Classic (Default)</option>
                          <option value="cherrymx-black-pbt">
                            Cherry MX Black
                          </option>
                          <option value="cherrymx-blue-pbt">
                            Cherry MX Blue
                          </option>
                          <option value="cherrymx-brown-pbt">
                            Cherry MX Brown
                          </option>
                          <option value="cherrymx-red-pbt">
                            Cherry MX Red
                          </option>
                          <option value="mx-speed-silver">
                            MX Speed Silver
                          </option>
                          <option value="eg-oreo">EG Oreo</option>
                          <option value="topre-purple-hybrid-pbt">
                            Topre Purple
                          </option>
                          <option value="Creams">Creams</option>
                          <option value="banana split lubed">
                            Banana Split Lubed
                          </option>
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Click sound setting */}
                  <div className="flex items-center justify-between bg-[#121212] border border-[#222222]/60 p-4 rounded-xl">
                    <span className="text-[13px] font-semibold">
                      Click Sounds
                    </span>
                    <button
                      onClick={() =>
                        setClickSound(clickSound === "on" ? "off" : "on")
                      }
                      className={`cursor-pointer w-10 h-5 rounded-full transition-colors relative ${clickSound === "on" ? "bg-[#e2b714]" : "bg-[#222222]"}`}
                    >
                      <div
                        className={`w-3.5 h-3.5 bg-black rounded-full absolute top-[3px] transition-transform duration-200 ${clickSound === "on" ? "left-[22px]" : "left-[4px]"}`}
                      />
                    </button>
                  </div>
                </div>


              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Playground;
