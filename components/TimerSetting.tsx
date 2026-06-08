import React from "react";

interface TimerSettingProps {
  timer: number;
  setTimer: React.Dispatch<React.SetStateAction<number>>;
  setTimeLeft: React.Dispatch<React.SetStateAction<number>>;
  hasPunctuation: boolean;
  setHasPunctuation: React.Dispatch<React.SetStateAction<boolean>>;
  hasNumbers: boolean;
  setHasNumbers: React.Dispatch<React.SetStateAction<boolean>>;
  difficulty: "easy" | "hard";
  setDifficulty: React.Dispatch<React.SetStateAction<"easy" | "hard">>;
}

function TimerSetting({
  timer,
  setTimer,
  setTimeLeft,
  hasPunctuation,
  setHasPunctuation,
  hasNumbers,
  setHasNumbers,
  difficulty,
  setDifficulty,
}: TimerSettingProps) {
  const times = [15, 30, 60, 120];

  const handleClick = (time: number) => {
    setTimer(time);
    setTimeLeft(time);
  };

  return (
    <div className="flex items-center gap-4 select-none flex-wrap justify-center font-mono text-[13px] text-[#444444] w-full">
      {/* Group 1: Modes & Difficulty */}
      <div className="flex items-center gap-1.5 bg-[#121212] border border-[#222222]/60 px-3 py-1.5 rounded-xl">
        {/* Punctuation toggle */}
        <button
          onClick={() => setHasPunctuation((prev) => !prev)}
          className={`cursor-pointer px-2 py-0.5 rounded font-semibold transition-all duration-200 flex items-center ${
            hasPunctuation
              ? "text-[#e2b714] bg-[#222222]"
              : "text-[#444444] hover:text-[#dddddd]"
          }`}
        >
          <span className="text-[10px] sm:mr-1">@</span>
          <span className="hidden sm:inline">punctuation</span>
        </button>

        {/* Numbers toggle */}
        <button
          onClick={() => setHasNumbers((prev) => !prev)}
          className={`cursor-pointer px-2 py-0.5 rounded font-semibold transition-all duration-200 flex items-center ${
            hasNumbers
              ? "text-[#e2b714] bg-[#222222]"
              : "text-[#444444] hover:text-[#dddddd]"
          }`}
        >
          <span className="text-[10px] sm:mr-1">#</span>
          <span className="hidden sm:inline">numbers</span>
        </button>

        <span className="w-[1px] h-3.5 bg-[#222222] mx-1"></span>

        {/* Easy mode select */}
        <button
          onClick={() => setDifficulty("easy")}
          className={`cursor-pointer px-2 py-0.5 rounded font-semibold transition-all duration-200 flex items-center gap-1.5 ${
            difficulty === "easy"
              ? "text-[#e2b714] bg-[#222222]"
              : "text-[#444444] hover:text-[#dddddd]"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 24 24"
            className="w-3.5 h-3.5"
          >
            <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32l8.4-8.4z" />
            <path d="M5.25 5.25a3 3 0 00-3 3v10.5a3 3 0 003 3h10.5a3 3 0 003-3V13.5a.75.75 0 00-1.5 0v5.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5V8.25a1.5 1.5 0 011.5-1.5h5.25a.75.75 0 000-1.5H5.25z" />
          </svg>
          <span className="hidden sm:inline">easy</span>
        </button>

        {/* Hard mode select */}
        <button
          onClick={() => setDifficulty("hard")}
          className={`cursor-pointer px-2 py-0.5 rounded font-semibold transition-all duration-200 flex items-center gap-1.5 ${
            difficulty === "hard"
              ? "text-[#e2b714] bg-[#222222]"
              : "text-[#444444] hover:text-[#dddddd]"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 24 24"
            className="w-3.5 h-3.5"
          >
            <path
              fillRule="evenodd"
              d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z"
              clipRule="evenodd"
            />
          </svg>
          <span className="hidden sm:inline">hard</span>
        </button>
      </div>

      {/* Group 2: Categories (Mockup visual) */}
      <div className="flex items-center gap-2 bg-[#121212] border border-[#222222]/60 px-3 py-1.5 rounded-xl max-w-full overflow-x-auto whitespace-nowrap scrollbar-none">
        <span className="text-[#e2b714] bg-[#222222] px-2.5 py-0.5 rounded font-semibold flex items-center gap-1.5 shrink-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="w-3.5 h-3.5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          time
        </span>
        <span className="cursor-not-allowed px-2 py-0.5 hover:text-[#dddddd]/60 transition-colors shrink-0">words</span>
        <span className="cursor-not-allowed px-2 py-0.5 hover:text-[#dddddd]/60 transition-colors shrink-0">quote</span>
        <span className="cursor-not-allowed px-2 py-0.5 hover:text-[#dddddd]/60 transition-colors shrink-0">zen</span>
        <span className="cursor-not-allowed px-2 py-0.5 hover:text-[#dddddd]/60 transition-colors shrink-0">brain rot</span>
        <span className="cursor-not-allowed px-2 py-0.5 hover:text-[#dddddd]/60 transition-colors shrink-0">code</span>
        <span className="cursor-not-allowed px-2 py-0.5 hover:text-[#dddddd]/60 transition-colors shrink-0">custom</span>
      </div>

      {/* Group 3: Durations */}
      <div className="flex items-center gap-1 bg-[#121212] border border-[#222222]/60 px-2.5 py-1.5 rounded-xl">
        {times.map((time) => (
          <button
            className={`cursor-pointer px-3 py-0.5 rounded text-[13px] font-semibold transition-all duration-200 ${
              timer === time
                ? "text-[#e2b714] bg-[#222222]"
                : "text-[#444444] hover:text-[#dddddd]"
            }`}
            onClick={() => handleClick(time)}
            key={time}
          >
            {time}
          </button>
        ))}
      </div>
    </div>
  );
}

export default TimerSetting;
