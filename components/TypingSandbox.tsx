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

  return (
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
          y: { type: "spring", stiffness: 300, damping: 30 },
        }}
        className="flex flex-wrap text-3xl font-mono leading-[48px] select-none text-left tracking-normal w-full max-w-none relative"
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
            className={`absolute left-0 top-0 w-[2px] bg-[#e2b714] pointer-events-none z-10 ${
              isTyping ? "" : "animate-cursor-blink"
            }`}
          />
        )}
      </motion.div>
    </div>
  );
}
