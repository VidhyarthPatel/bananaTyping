"use client";

import { useEffect, useState } from "react";

function Playground() {
  const para =
    "back what might increase and group small without a before of begin a over might people only play set each if call long around say set more the between day system end to people up form play life high also back way other hand change";

  const [typed, setTyped] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent special keys
      if (e.key.length > 1 && e.key !== "Backspace") return;

      // Handle backspace
      if (e.key === "Backspace") {
        setTyped((prev) => prev.slice(0, -1));
        return;
      }

      // Add typed character
      setTyped((prev) => prev + e.key);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="flex items-center justify-center flex-1 px-10">
      <p className="text-4xl tracking-wider leading-14 flex flex-wrap gap-x-4 gap-y-4">
        {para.split(" ").map((word, wordIndex) => {
          return (
            <span key={wordIndex} className="flex">
              {word.split("").map((char, charIndex) => {
                const globalIndex =
                  para.split(" ").slice(0, wordIndex).join(" ").length +
                  wordIndex +
                  charIndex;

                let color = "text-gray-500";

                if (globalIndex < typed.length) {
                  color =
                    typed[globalIndex] === char
                      ? "text-green-500"
                      : "text-red-500";
                }

                return (
                  <span key={charIndex} className={`${color} relative`}>
                    {char}

                    {globalIndex === typed.length && (
                      <span className="absolute left-0 top-0 w-0.5 h-full bg-black animate-pulse" />
                    )}
                  </span>
                );
              })}
            </span>
          );
        })}
      </p>
    </div>
  );
}

export default Playground;
