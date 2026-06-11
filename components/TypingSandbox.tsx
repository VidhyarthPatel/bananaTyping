import React, { useMemo } from "react";
import { motion } from "motion/react";

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

interface TypingSandboxProps {
  text: string;
  typed: string;
  scrollOffset: number;
  cursorStyle: { left: number; top: number; height: number };
  resetKey: number;
  isTyping: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
  wordsListRef: React.RefObject<HTMLDivElement | null>;
  activeCharRef: React.RefObject<HTMLSpanElement | null>;
  wpm: number;
  isStarted: boolean;
  isFinished: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function TypingSandbox({
  text,
  typed,
  scrollOffset,
  cursorStyle,
  resetKey,
  isTyping,
  containerRef,
  wordsListRef,
  activeCharRef,
  wpm,
  isStarted,
  isFinished,
  inputRef,
  handleInputChange,
}: TypingSandboxProps) {
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

  const caretClass = useMemo(() => {
    return `absolute left-0 top-0 pointer-events-none z-10 w-[2px] bg-[#e2b714] ${isTyping ? "" : "animate-cursor-blink"}`;
  }, [isTyping]);

  return (
    <label
      htmlFor="typing-input"
      onClick={() => inputRef.current?.focus()}
      className="relative block w-full rounded-2xl bg-[#090909]/60 backdrop-blur-sm pt-12 pb-6 px-8 cursor-text"
    >
      {/* Hidden input to catch mobile keyboard keypresses */}
      <input
        id="typing-input"
        ref={inputRef}
        type="text"
        value={typed}
        onChange={handleInputChange}
        className="absolute opacity-0 w-px h-px overflow-hidden outline-none pointer-events-auto z-0"
        style={{ caretColor: "transparent", fontSize: "16px" }}
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
      />

      {/* Viewport container */}
      <div
        ref={containerRef}
        className="relative w-full h-[120px] sm:h-[144px] md:h-[168px] overflow-hidden select-none z-10"
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
            y: { type: "spring", stiffness: 300, damping: 30 },
          }}
          className="flex flex-wrap text-2xl sm:text-3xl md:text-4xl font-mono leading-[40px] sm:leading-[48px] md:leading-[56px] select-none text-left tracking-normal w-full max-w-none relative"
        >
          {wordObjects.map((wordObj) => (
            <span key={wordObj.wordIndex} className="inline-flex animate-fade-in">
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
                transition:
                  "transform 0.08s cubic-bezier(0.25, 0.46, 0.45, 0.94), height 0.08s ease",
              }}
              className={caretClass}
            />
          )}
        </motion.div>
      </div>
    </label>
  );
}

