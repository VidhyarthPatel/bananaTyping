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
  glowPreference: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

// Speed thresholds (low values for easy manual testing)
const TIER1_WPM = 20;
const TIER2_WPM = 40;
const TIER3_WPM = 60;

// Pre-seeded static particle positions to ensure hydration safety
const STATIC_PARTICLES = [
  { left: "8%", size: "w-1 h-1", delay: "0.1s", duration: "1.4s" },
  { left: "15%", size: "w-1.5 h-1.5", delay: "0.4s", duration: "1.8s" },
  { left: "22%", size: "w-1 h-1", delay: "0.8s", duration: "1.2s" },
  { left: "30%", size: "w-2 h-2", delay: "0.2s", duration: "1.6s" },
  { left: "38%", size: "w-1 h-1", delay: "0.6s", duration: "1.3s" },
  { left: "45%", size: "w-1.5 h-1.5", delay: "0.9s", duration: "1.9s" },
  { left: "52%", size: "w-1 h-1", delay: "0.3s", duration: "1.5s" },
  { left: "60%", size: "w-2 h-2", delay: "0.7s", duration: "1.1s" },
  { left: "68%", size: "w-1 h-1", delay: "0.5s", duration: "1.7s" },
  { left: "75%", size: "w-1.5 h-1.5", delay: "1.1s", duration: "1.4s" },
  { left: "82%", size: "w-1 h-1", delay: "0.1s", duration: "1.6s" },
  { left: "90%", size: "w-2 h-2", delay: "0.6s", duration: "1.3s" },
  { left: "94%", size: "w-1 h-1", delay: "0.3s", duration: "1.5s" },
  { left: "12%", size: "w-1 h-1", delay: "0.7s", duration: "1.2s" },
  { left: "27%", size: "w-1.5 h-1.5", delay: "1.3s", duration: "1.5s" },
  { left: "41%", size: "w-1 h-1", delay: "0.5s", duration: "1.6s" },
  { left: "58%", size: "w-2 h-2", delay: "1.0s", duration: "1.4s" },
  { left: "70%", size: "w-1 h-1", delay: "0.2s", duration: "1.7s" },
  { left: "85%", size: "w-1.5 h-1.5", delay: "0.8s", duration: "1.3s" },
  { left: "97%", size: "w-1 h-1", delay: "0.4s", duration: "1.5s" },
];

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
  glowPreference,
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

  const activeTier = useMemo(() => {
    if (glowPreference === "off" || !isStarted || isFinished || !wpm) return 0;
    if (wpm >= TIER3_WPM) return 3;
    if (wpm >= TIER2_WPM) return 2;
    if (wpm >= TIER1_WPM) return 1;
    return 0;
  }, [wpm, isStarted, isFinished, glowPreference]);

  const cardBorderGlowClass = useMemo(() => {
    if (activeTier === 1) {
      return "border-[#e2b714]/70 shadow-[0_0_25px_rgba(226,183,20,0.35),_0_0_50px_rgba(226,183,20,0.15)]";
    }
    if (activeTier === 2) {
      return "animate-flame-flicker";
    }
    if (activeTier === 3) {
      return "animate-superhuman-burn";
    }
    return "border-[#1e1e1f] shadow-none";
  }, [activeTier]);

  const caretClass = useMemo(() => {
    let base = "absolute left-0 top-0 transition-[background-color,width,box-shadow] duration-200 pointer-events-none z-10";
    if (activeTier === 1) {
      base += " w-[2.5px] bg-[#e2b714] shadow-[0_0_15px_#e2b714]";
    } else if (activeTier === 2) {
      base += " w-[2.75px] bg-[#f59e0b] shadow-[0_0_20px_#f59e0b]";
    } else if (activeTier === 3) {
      base += " w-[3px] bg-[#ef4444] shadow-[0_0_25px_#ef4444]";
    } else {
      base += " w-[2px] bg-[#e2b714]";
    }
    return `${base} ${isTyping ? "" : "animate-cursor-blink"}`;
  }, [activeTier, isTyping]);

  return (
    <label
      htmlFor="typing-input"
      onClick={() => inputRef.current?.focus()}
      className={`relative block w-full rounded-2xl border bg-[#090909]/60 backdrop-blur-sm pt-12 pb-6 px-8 transition-all duration-300 ${cardBorderGlowClass} cursor-text`}
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
      {/* Absolute positioned particles container */}
      {activeTier > 0 && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl z-0">
          {STATIC_PARTICLES.slice(0, activeTier === 1 ? 6 : activeTier === 2 ? 12 : 20).map((p, idx) => {
            let colorClass = "bg-[#e2b714]";
            if (activeTier === 2) {
              colorClass = idx % 2 === 0 ? "bg-[#e2b714]" : "bg-[#f59e0b]";
            } else if (activeTier === 3) {
              colorClass = idx % 3 === 0 ? "bg-[#e2b714]" : idx % 3 === 1 ? "bg-[#f59e0b]" : "bg-[#ef4444]";
            }
            
            return (
              <div
                key={idx}
                style={{
                  left: p.left,
                  animationDelay: p.delay,
                  animationDuration: p.duration,
                }}
                className={`absolute bottom-0 rounded-full ${p.size} ${colorClass} opacity-0 animate-spark`}
              />
            );
          })}
        </div>
      )}

      {/* Absolute positioned streak indicator badge */}
      {activeTier > 0 && (
        <div className="absolute top-3 right-6 z-20 flex items-center select-none animate-streak-pulse">
          {activeTier === 1 && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#e2b714]/10 border border-[#e2b714]/30 text-[#e2b714]">
              <span>🍌</span>
              <span>FAST {wpm} WPM</span>
            </div>
          )}
          {activeTier === 2 && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#f59e0b]/10 border border-[#f59e0b]/30 text-[#f59e0b] shadow-[0_0_10px_rgba(245,158,11,0.15)]">
              <span>⚡</span>
              <span>SPEED DEMON {wpm} WPM</span>
            </div>
          )}
          {activeTier === 3 && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#ef4444]/15 border border-[#ef4444]/40 text-[#ef4444] shadow-[0_0_15px_rgba(239,68,68,0.25)]">
              <span>🔥</span>
              <span>SUPERHUMAN {wpm} WPM</span>
            </div>
          )}
        </div>
      )}

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

