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
  soundPack: string;
  setSoundPack: React.Dispatch<React.SetStateAction<string>>;
  clickSound: string;
  setClickSound: React.Dispatch<React.SetStateAction<string>>;
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
  soundPack,
  setSoundPack,
  clickSound,
  setClickSound,
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
          <span className="text-[10px] mr-1">@</span>
          punctuation
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
          <span className="text-[10px] mr-1">#</span>
          numbers
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
          easy
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
          hard
        </button>
      </div>

      {/* Group 2: Categories (Mockup visual) */}
      <div className="flex items-center gap-2 bg-[#121212] border border-[#222222]/60 px-3 py-1.5 rounded-xl">
        <span className="text-[#e2b714] bg-[#222222] px-2.5 py-0.5 rounded font-semibold flex items-center gap-1.5">
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
        <span className="cursor-not-allowed px-2 py-0.5 hover:text-[#dddddd]/60 transition-colors">words</span>
        <span className="cursor-not-allowed px-2 py-0.5 hover:text-[#dddddd]/60 transition-colors">quote</span>
        <span className="cursor-not-allowed px-2 py-0.5 hover:text-[#dddddd]/60 transition-colors">zen</span>
        <span className="cursor-not-allowed px-2 py-0.5 hover:text-[#dddddd]/60 transition-colors">brain rot</span>
        <span className="cursor-not-allowed px-2 py-0.5 hover:text-[#dddddd]/60 transition-colors">code</span>
        <span className="cursor-not-allowed px-2 py-0.5 hover:text-[#dddddd]/60 transition-colors">custom</span>
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

      {/* Group 4: Keyboard Sound */}
      <div className="flex items-center gap-1.5 bg-[#121212] border border-[#222222]/60 px-3 py-1.5 rounded-xl">
        <button
          onClick={() => setSoundPack((prev) => (prev === "off" ? "cherrymx-blue-pbt" : "off"))}
          className={`cursor-pointer px-2 py-0.5 rounded font-semibold transition-all duration-200 flex items-center gap-1.5 ${
            soundPack !== "off"
              ? "text-[#e2b714] bg-[#222222]"
              : "text-[#444444] hover:text-[#dddddd]"
          }`}
        >
          {soundPack !== "off" ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-3.5 h-3.5"
            >
              <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.063.922-2.063 2.063v4.875c0 1.141.922 2.062 2.063 2.062h1.932l4.5 4.5c.944.945 2.56.276 2.56-1.06V4.06zM18.57 17.47a.75.75 0 11-1.06 1.06 8.25 8.25 0 000-11.66.75.75 0 111.06 1.06 6.75 6.75 0 010 9.54z" />
              <path d="M21.369 20.27a.75.75 0 11-1.06 1.06 12.25 12.25 0 000-17.32.75.75 0 111.06 1.06 10.75 10.75 0 010 15.2z" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-3.5 h-3.5"
            >
              <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.063.922-2.063 2.063v4.875c0 1.141.922 2.062 2.063 2.062h1.932l4.5 4.5c.944.945 2.56.276 2.56-1.06V4.06zM17.78 9.22a.75.75 0 10-1.06 1.06L18.44 12l-1.72 1.72a.75.75 0 001.06 1.06l1.72-1.72 1.72 1.72a.75.75 0 101.06-1.06L20.56 12l2.25-2.25a.75.75 0 00-1.06-1.06L20.56 12l1.72-1.72a.75.75 0 00-1.06-1.06l-1.72 1.72-1.72-1.72z" />
            </svg>
          )}
          key sound
        </button>

        {soundPack !== "off" && (
          <select
            value={soundPack}
            onChange={(e) => setSoundPack(e.target.value)}
            className="bg-[#121212] text-[#888888] hover:text-[#dddddd] font-semibold border-none focus:outline-none cursor-pointer pl-1 text-[11px]"
          >
            <option value="cherrymx-blue-pbt">CherryMX Blue</option>
            <option value="cherrymx-brown-pbt">CherryMX Brown</option>
            <option value="cherrymx-red-pbt">CherryMX Red</option>
            <option value="Creams">Creams</option>
            <option value="banana split lubed">Banana Split</option>
            <option value="topre-purple-hybrid-pbt">Topre Purple</option>
            <option value="mx-speed-silver">Speed Silver</option>
          </select>
        )}
      </div>

      {/* Group 5: Mouse Click Sound */}
      <div className="flex items-center gap-1.5 bg-[#121212] border border-[#222222]/60 px-3 py-1.5 rounded-xl">
        <button
          onClick={() => setClickSound((prev) => (prev === "on" ? "off" : "on"))}
          className={`cursor-pointer px-2 py-0.5 rounded font-semibold transition-all duration-200 flex items-center gap-1.5 ${
            clickSound === "on"
              ? "text-[#e2b714] bg-[#222222]"
              : "text-[#444444] hover:text-[#dddddd]"
          }`}
          title="Mouse/Trackpad Click Sound"
        >
          {clickSound === "on" ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-3.5 h-3.5"
            >
              <path d="M12 2a10 10 0 1010 10A10 10 0 0012 2zm0 18a8 8 0 118-8 8 8 0 01-8 8z" />
              <path d="M12 6a6 6 0 106 6 6 6 0 00-6-6zm0 10a4 4 0 114-4 4 4 0 01-4 4z" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-3.5 h-3.5"
            >
              <path d="M12 2a10 10 0 1010 10A10 10 0 0012 2zm0 18a8 8 0 118-8 8 8 0 01-8 8z" />
              <path d="M4.22 4.22a.75.75 0 000 1.06l14.5 14.5a.75.75 0 001.06-1.06L5.28 4.22a.75.75 0 00-1.06 0z" />
            </svg>
          )}
          click sound
        </button>
      </div>
    </div>
  );
}

export default TimerSetting;
