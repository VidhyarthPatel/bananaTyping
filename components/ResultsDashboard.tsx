import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const chartWidth = 750;
const chartHeight = 350;
const chartPadding = { top: 15, right: 15, bottom: 25, left: 35 };

interface ResultsDashboardProps {
  wpm: number;
  accuracy: number;
  rawWpm: number;
  consistency: number;
  elapsedSeconds: number;
  fixes: number;
  personalBest: number;
  isNewPersonalBest: boolean;
  incorrectWords: string[];
  timer: number;
  hasPunctuation: boolean;
  hasNumbers: boolean;
  difficulty: "easy" | "hard";
  history: {
    second: number;
    wpm: number;
    rawWpm: number;
    errors?: number;
    burst?: number;
  }[];
  handleRestart: (forcePractice?: boolean) => void;
  copyResultsReport: () => void;
  downloadResults: () => void;
  practiceMisspelledWords: () => void;
  showWordReview: boolean;
  setShowWordReview: React.Dispatch<React.SetStateAction<boolean>>;
  toastMessage: string | null;
}

export default function ResultsDashboard({
  wpm,
  accuracy,
  rawWpm,
  consistency,
  elapsedSeconds,
  fixes,
  personalBest,
  isNewPersonalBest,
  incorrectWords,
  timer,
  hasPunctuation,
  hasNumbers,
  difficulty,
  history,
  handleRestart,
  copyResultsReport,
  downloadResults,
  practiceMisspelledWords,
  showWordReview,
  setShowWordReview,
  toastMessage,
}: ResultsDashboardProps) {
  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number;
    y: number;
    second: number;
    wpm: number;
    rawWpm: number;
    errors: number;
    burst: number;
  } | null>(null);

  const clampedPercent = hoveredPoint
    ? Math.max(15, Math.min(85, (hoveredPoint.y / chartHeight) * 100))
    : 0;
  const diffPercent = hoveredPoint
    ? (hoveredPoint.y / chartHeight) * 100 - clampedPercent
    : 0;
  const arrowTop = hoveredPoint
    ? Math.max(12, Math.min(88, 50 + diffPercent * 2.7))
    : 50;
  const isRightHalf = hoveredPoint
    ? hoveredPoint.second > (history[history.length - 1]?.second || 30) / 2
    : false;
  // Calculate the maximum speed value in history (round up to nearest 10, min 40)
  const maxChartSpeed = useMemo(() => {
    if (history.length === 0) return 40;
    const maxVal = Math.max(...history.map((p) => Math.max(p.wpm, p.rawWpm)));
    return Math.max(40, Math.ceil(maxVal / 10) * 10);
  }, [history]);

  // Compute SVG grid lines (4 horizontal grid lines)
  const gridLines = useMemo(() => {
    const lines = [];
    for (let i = 0; i <= 4; i++) {
      const val = Math.round((maxChartSpeed / 4) * i);
      const y =
        chartHeight -
        chartPadding.bottom -
        (val / maxChartSpeed) *
          (chartHeight - chartPadding.top - chartPadding.bottom);
      lines.push({ val, y });
    }
    return lines;
  }, [maxChartSpeed]);

  // Compute points and paths for WPM and Raw WPM
  const chartPaths = useMemo(() => {
    if (history.length === 0) return { wpmPath: "", rawPath: "", dots: [] };
    const duration = history[history.length - 1].second;

    const getCoords = (sec: number, val: number) => {
      const x =
        chartPadding.left +
        (sec / duration) *
          (chartWidth - chartPadding.left - chartPadding.right);
      const y =
        chartHeight -
        chartPadding.bottom -
        (val / maxChartSpeed) *
          (chartHeight - chartPadding.top - chartPadding.bottom);
      return { x, y };
    };

    let wpmPath = "";
    let rawPath = "";
    const dots: {
      x: number;
      y: number;
      second: number;
      wpm: number;
      rawWpm: number;
    }[] = [];

    history.forEach((p, idx) => {
      const wpmCoords = getCoords(p.second, p.wpm);
      const rawCoords = getCoords(p.second, p.rawWpm);

      if (idx === 0) {
        wpmPath = `M ${wpmCoords.x} ${wpmCoords.y}`;
        rawPath = `M ${rawCoords.x} ${rawCoords.y}`;
      } else {
        wpmPath += ` L ${wpmCoords.x} ${wpmCoords.y}`;
        rawPath += ` L ${rawCoords.x} ${rawCoords.y}`;
      }
      dots.push({
        x: wpmCoords.x,
        y: wpmCoords.y,
        second: p.second,
        wpm: p.wpm,
        rawWpm: p.rawWpm,
      });
    });

    return { wpmPath, rawPath, dots };
  }, [history, maxChartSpeed]);

  // Time labels for X-axis
  const timeLabels = useMemo(() => {
    if (history.length === 0) return [];
    const duration = history[history.length - 1].second;
    const ticks = [];
    const step = Math.max(1, Math.round(duration / 8));
    for (let i = 1; i <= duration; i += step) {
      ticks.push(i);
    }
    if (ticks[ticks.length - 1] !== duration && duration > 1) {
      ticks.push(duration);
    }
    return ticks;
  }, [history]);

  const correctChars = Math.round((wpm * 5 * elapsedSeconds) / 60);
  const totalTyped = Math.round((rawWpm * 5 * elapsedSeconds) / 60);

  return (
    <div className="w-full max-w-5xl px-4 py-6 text-left relative font-mono select-none">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="absolute top-0 left-1/2 -translate-x-1/2 bg-[#e2b714] text-[#000000] px-4 py-2 rounded-lg text-sm font-semibold shadow-lg z-50 flex items-center gap-1.5"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="flex flex-col gap-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Upper Section: Big Stats & SVG Graph */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
          {/* WPM, Accuracy, Personal Best panel */}
          <div className="flex flex-col gap-6 md:col-span-1">
            {/* WPM metric */}
            <div className="flex flex-col">
              <span className="text-[#444444] text-[13px] font-semibold tracking-wider flex items-center">
                wpm
                <svg
                  viewBox="0 0 24 24"
                  className="w-3.5 h-3.5 text-[#444444] cursor-help ml-1 inline-block"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
              </span>
              <span className="text-7xl font-bold text-[#e2b714] mt-1 leading-none select-text">
                {wpm}
              </span>
            </div>

            {/* Accuracy metric */}
            <div className="flex flex-col">
              <span className="text-[#444444] text-[13px] font-semibold tracking-wider">
                accuracy
              </span>
              <span className="text-7xl font-bold text-[#e2b714] mt-1 leading-none select-text">
                {accuracy}%
              </span>
            </div>

            {/* Personal Best metric */}
            <div className="flex flex-col">
              <span className="text-[#444444] text-[13px] font-semibold tracking-wider">
                personal best
              </span>
              <span className="text-7xl font-bold text-[#e2b714] mt-1 leading-none select-text">
                {personalBest}
              </span>
              {isNewPersonalBest && (
                <span className="text-[10px] font-bold text-[#e2b714] uppercase tracking-widest mt-1">
                  ✨ new personal best!
                </span>
              )}
            </div>

            {/* Test Type details */}
            <div className="flex flex-col gap-1.5 text-xs text-[#444444] mt-2">
              <span className="text-[#444444] text-[11px] font-bold uppercase tracking-wider">
                test type
              </span>
              <span className="text-[#e2b714] font-semibold uppercase">
                time {timer}
              </span>
              <span className="text-slate-400 capitalize">
                english
                {hasPunctuation && " + punctuation"}
                {hasNumbers && " + numbers"}
                {difficulty === "hard" && " (hard)"}
              </span>
            </div>
          </div>

          {/* SVG Chart area */}
          <div className="md:col-span-3 flex flex-col justify-center w-full py-1">
            {history.length > 1 ? (
              <div className="relative w-full overflow-x-auto">
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  className="w-full h-auto min-w-[500px]"
                >
                  {/* Horizontal dashed grid lines */}
                  {gridLines.map((line, idx) => (
                    <g key={idx}>
                      <line
                        x1={chartPadding.left}
                        y1={line.y}
                        x2={chartWidth - chartPadding.right}
                        y2={line.y}
                        stroke="#161616"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                      />
                      {/* Grid labels */}
                      <text
                        x={chartPadding.left - 8}
                        y={line.y + 3}
                        fill="#444444"
                        fontSize="9"
                        textAnchor="end"
                        className="font-mono"
                      >
                        {line.val}
                      </text>
                    </g>
                  ))}

                  {/* Y-Axis title rotated */}
                  <text
                    transform="rotate(-90)"
                    x={
                      -(
                        (chartHeight - chartPadding.top - chartPadding.bottom) /
                          2 +
                        chartPadding.top
                      )
                    }
                    y="10"
                    fill="#444444"
                    fontSize="9"
                    textAnchor="middle"
                    className="font-mono tracking-widest uppercase font-bold"
                  >
                    wpm
                  </text>

                  {/* Raw WPM path (Dark gray line) */}
                  {chartPaths.rawPath && (
                    <path
                      d={chartPaths.rawPath}
                      fill="none"
                      stroke="#333333"
                      strokeWidth="1.5"
                      className="transition-all duration-500"
                    />
                  )}

                  {/* WPM path (Yellow line) */}
                  {chartPaths.wpmPath && (
                    <path
                      d={chartPaths.wpmPath}
                      fill="none"
                      stroke="#e2b714"
                      strokeWidth="2.5"
                      className="transition-all duration-500"
                    />
                  )}

                  {/* Dot markers on WPM path */}
                  {chartPaths.dots.map((dot, idx) => {
                    const isHovered = hoveredPoint?.second === dot.second;
                    return (
                      <circle
                        key={idx}
                        cx={dot.x}
                        cy={dot.y}
                        r={isHovered ? 5.5 : 3}
                        fill="#e2b714"
                        stroke="#000000"
                        strokeWidth="1"
                        style={{ transition: "r 0.08s ease" }}
                        className="pointer-events-none"
                      />
                    );
                  })}

                  {/* Red 'x' markers at the bottom for errors */}
                  {history.map((p, idx) => {
                    if (!p.errors || p.errors <= 0) return null;
                    const duration = history[history.length - 1].second;
                    const x =
                      chartPadding.left +
                      (p.second / duration) *
                        (chartWidth - chartPadding.left - chartPadding.right);
                    const y = chartHeight - chartPadding.bottom - 10;
                    return (
                      <text
                        key={`err-x-${idx}`}
                        x={x}
                        y={y}
                        fill="#ca4754"
                        fontSize="10"
                        fontWeight="bold"
                        textAnchor="middle"
                        className="pointer-events-none select-none cursor-default font-mono"
                      >
                        ×
                      </text>
                    );
                  })}

                  {/* Vertical Guide Line when hovering */}
                  {hoveredPoint && (
                    <line
                      x1={hoveredPoint.x}
                      y1={chartPadding.top}
                      x2={hoveredPoint.x}
                      y2={chartHeight - chartPadding.bottom}
                      stroke="#222222"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                      pointerEvents="none"
                    />
                  )}

                  {/* Highlighted Raw WPM dot when hovering */}
                  {hoveredPoint && (
                    <circle
                      cx={hoveredPoint.x}
                      cy={
                        chartHeight -
                        chartPadding.bottom -
                        ((hoveredPoint.rawWpm ?? 0) / maxChartSpeed) *
                          (chartHeight - chartPadding.top - chartPadding.bottom)
                      }
                      r="4.5"
                      fill="#dddddd"
                      stroke="#000000"
                      strokeWidth="1"
                      pointerEvents="none"
                    />
                  )}

                  {/* Invisible hover columns for smooth snapping tooltip */}
                  {history.map((p, idx) => {
                    const duration = history[history.length - 1].second;
                    const x =
                      chartPadding.left +
                      (p.second / duration) *
                        (chartWidth - chartPadding.left - chartPadding.right);
                    const colWidth =
                      (chartWidth - chartPadding.left - chartPadding.right) /
                      duration;

                    return (
                      <rect
                        key={`hover-${idx}`}
                        x={x - colWidth / 2}
                        y={chartPadding.top}
                        width={colWidth}
                        height={
                          chartHeight - chartPadding.top - chartPadding.bottom
                        }
                        fill="transparent"
                        className="cursor-pointer"
                        onMouseEnter={() =>
                          setHoveredPoint({
                            x,
                            y: chartPaths.dots[idx]?.y || 0,
                            second: p.second,
                            wpm: p.wpm,
                            rawWpm: p.rawWpm,
                            errors: p.errors ?? 0,
                            burst: p.burst ?? 0,
                          })
                        }
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                    );
                  })}

                  {/* X-Axis Tick Labels (Time in seconds) */}
                  {timeLabels.map((sec, idx) => {
                    const duration = history[history.length - 1].second;
                    const x =
                      chartPadding.left +
                      (sec / duration) *
                        (chartWidth - chartPadding.left - chartPadding.right);
                    return (
                      <text
                        key={idx}
                        x={x}
                        y={chartHeight - 8}
                        fill="#444444"
                        fontSize="9"
                        textAnchor="middle"
                        className="font-mono"
                      >
                        {sec}
                      </text>
                    );
                  })}
                </svg>

                {hoveredPoint && (
                  <div
                    style={{
                      left: `${(hoveredPoint.x / chartWidth) * 100}%`,
                      top: `${clampedPercent}%`,
                      transform: isRightHalf
                        ? "translate(calc(-100% - 12px), -50%)"
                        : "translate(12px, -50%)",
                    }}
                    className="absolute z-40 bg-[#0b0c0f] border border-[#222222] text-[11px] text-[#dddddd] p-2.5 rounded-lg shadow-xl pointer-events-none font-mono min-w-[125px] flex flex-col gap-1"
                  >
                    {/* Pointer arrow */}
                    <div
                      style={{ top: `${arrowTop}%` }}
                      className={`absolute -translate-y-1/2 w-2 h-2 bg-[#0b0c0f] border-[#222222] rotate-45 ${
                        isRightHalf
                          ? "-right-1 border-r border-t"
                          : "-left-1 border-l border-b"
                      }`}
                    />

                    <div className="text-white font-bold text-xs border-b border-[#222222]/60 pb-1 mb-1">
                      second {hoveredPoint.second}
                    </div>

                    {/* errors */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-[#ca4754] rounded-sm" />
                        <span className="text-slate-400">errors</span>
                      </div>
                      <span className="font-bold text-slate-200">
                        {hoveredPoint.errors}
                      </span>
                    </div>

                    {/* wpm */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-[#e2b714] rounded-sm" />
                        <span className="text-slate-400">wpm</span>
                      </div>
                      <span className="font-bold text-[#e2b714]">
                        {hoveredPoint.wpm}
                      </span>
                    </div>

                    {/* raw */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-[#dddddd] rounded-sm" />
                        <span className="text-slate-400">raw</span>
                      </div>
                      <span className="font-bold text-slate-200">
                        {hoveredPoint.rawWpm}
                      </span>
                    </div>

                    {/* burst */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-[#666666] rounded-sm" />
                        <span className="text-slate-400">burst</span>
                      </div>
                      <span className="font-bold text-slate-200">
                        {hoveredPoint.burst}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-[350px] flex items-center justify-center text-xs text-[#444444] font-mono">
                No chart data available (test completed too quickly)
              </div>
            )}
          </div>
        </div>

        {/* Middle horizontal divider */}
        <div className="w-full h-[1px] bg-[#161616]" />

        {/* Bottom Section: Advanced Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-6 text-left">
          {/* Raw speed */}
          <div className="flex flex-col">
            <span className="text-[#444444] text-[11px] font-bold uppercase tracking-wider">
              raw wpm
            </span>
            <span className="text-3xl font-bold text-slate-200 mt-1 select-text">
              {rawWpm}
            </span>
          </div>

          {/* Characters accuracy stats */}
          <div className="flex flex-col">
            <span className="text-[#444444] text-[11px] font-bold uppercase tracking-wider">
              characters
            </span>
            <span className="text-3xl font-bold text-slate-200 mt-1 select-text">
              {correctChars}/{totalTyped - correctChars}/0/0
            </span>
          </div>

          {/* Speed consistency */}
          <div className="flex flex-col">
            <span className="text-[#444444] text-[11px] font-bold uppercase tracking-wider">
              consistency
            </span>
            <span className="text-3xl font-bold text-slate-200 mt-1 select-text">
              {consistency}%
            </span>
          </div>

          {/* Total test duration */}
          <div className="flex flex-col">
            <span className="text-[#444444] text-[11px] font-bold uppercase tracking-wider">
              time
            </span>
            <span className="text-3xl font-bold text-slate-200 mt-1 select-text">
              {Math.round(elapsedSeconds)}s
            </span>
          </div>

          {/* Backspace Corrections */}
          <div className="flex flex-col">
            <span className="text-[#444444] text-[11px] font-bold uppercase tracking-wider">
              fixes
            </span>
            <span className="text-3xl font-bold text-slate-200 mt-1 select-text">
              {fixes}
            </span>
            <span className="text-[10px] text-[#444444] mt-0.5 leading-tight">
              Backspaces on wrong chars
            </span>
          </div>
        </div>

        {/* Mistakes display (Word Review) */}
        <AnimatePresence>
          {showWordReview && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden bg-[#090909] border border-[#161616] rounded-xl p-4 mt-2"
            >
              <h3 className="text-sm font-semibold text-[#e2b714] mb-3">
                Words with Mistakes
              </h3>
              {incorrectWords.length > 0 ? (
                <div className="flex flex-wrap gap-2 text-xs">
                  {incorrectWords.map((word, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-[#1a1a1a] rounded text-[#ca4754] border border-[#2d1216] select-text"
                    >
                      {word}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#444444]">
                  No mistakes! Perfect run!
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons Row */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#444444] mt-4 font-mono select-none">
          {/* Next Test Button */}
          <button
            onClick={() => handleRestart(false)}
            className="cursor-pointer hover:text-[#e2b714] transition-colors flex items-center font-medium focus:outline-none p-1"
            title="Next Test"
          >
            <svg
              className="w-4 h-4 mr-1.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
            Next Test
          </button>

          {/* Restart Button */}
          <button
            onClick={() => handleRestart()}
            className="cursor-pointer hover:text-[#e2b714] transition-colors flex items-center font-medium focus:outline-none p-1"
            title="Restart Test"
          >
            <svg
              className="w-4 h-4 mr-1.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3-3 3 3m-3-3v12"
              />
            </svg>
            Restart
          </button>

          {/* Screenshot Report Copy Button */}
          <button
            onClick={copyResultsReport}
            className="cursor-pointer hover:text-[#e2b714] transition-colors flex items-center font-medium focus:outline-none p-1"
            title="Copy Report to Clipboard"
          >
            <svg
              className="w-4 h-4 mr-1.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
              />
            </svg>
            Screenshot
          </button>

          {/* Word Review Modal Toggle */}
          <button
            onClick={() => setShowWordReview((prev) => !prev)}
            className={`cursor-pointer transition-colors flex items-center font-medium focus:outline-none p-1 ${
              showWordReview ? "text-[#e2b714]" : "hover:text-[#e2b714]"
            }`}
            title="Show Misspelled Words"
          >
            <svg
              className="w-4 h-4 mr-1.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            Word Review
          </button>

          {/* Practice Words Button */}
          <button
            onClick={practiceMisspelledWords}
            className={`flex items-center font-medium focus:outline-none p-1 transition-colors ${
              incorrectWords.length > 0
                ? "cursor-pointer hover:text-[#e2b714]"
                : "cursor-not-allowed opacity-40"
            }`}
            disabled={incorrectWords.length === 0}
            title="Practice only words you misspelled"
          >
            <svg
              className="w-4 h-4 mr-1.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" stroke="currentColor" />
              <circle cx="12" cy="12" r="6" stroke="currentColor" />
              <circle
                cx="12"
                cy="12"
                r="2"
                stroke="currentColor"
                fill="currentColor"
              />
            </svg>
            Practice Words
          </button>

          {/* Download Results JSON Button */}
          <button
            onClick={downloadResults}
            className="cursor-pointer hover:text-[#e2b714] transition-colors flex items-center font-medium focus:outline-none p-1"
            title="Download results as JSON file"
          >
            <svg
              className="w-4 h-4 mr-1.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download
          </button>
        </div>

        {/* Restart keys tip */}
        <div className="text-[10px] text-[#444444] uppercase tracking-widest font-mono text-center mt-2 flex items-center justify-center gap-1.5">
          Press{" "}
          <kbd className="bg-[#121212] px-1.5 py-0.5 rounded text-slate-300 font-bold border border-[#222222]">
            ESC
          </kbd>{" "}
          or{" "}
          <kbd className="bg-[#121212] px-1.5 py-0.5 rounded text-slate-300 font-bold border border-[#222222]">
            ENTER
          </kbd>{" "}
          to restart
        </div>
      </motion.div>
    </div>
  );
}
