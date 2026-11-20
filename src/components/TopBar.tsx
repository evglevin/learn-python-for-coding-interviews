import React, { useEffect, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  PanelLeft,
  PanelLeftClose,
  Moon,
  Sun,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Terminal,
} from 'lucide-react';
import type { Section } from '../types/course';

interface TopBarProps {
  section: Section;
  positionInSection: number;
  sectionTotal: number;
  totalLessons: number;
  solvedCount: number;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

function formatSeconds(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export const TopBar = React.memo(function TopBar({
  section,
  positionInSection,
  sectionTotal,
  totalLessons,
  solvedCount,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  sidebarOpen,
  onToggleSidebar,
  theme,
  onToggleTheme,
}: TopBarProps) {
  const [timerOpen, setTimerOpen] = useState(false);
  const [timerRunning, setTimerRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!timerRunning) return;
    const id = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [timerRunning]);

  const progressRatio = totalLessons > 0 ? solvedCount / totalLessons : 0;
  const radius = 11;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progressRatio);

  return (
    <header
      className="flex h-11 shrink-0 items-center justify-between border-b px-3 select-none"
      style={{
        backgroundColor: 'var(--bg-topbar)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      {/* Left Navigation Cluster */}
      <div className="flex min-w-0 items-center gap-1.5">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="mr-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-500 transition-colors hover:bg-emerald-500/25 cursor-pointer"
          title={sidebarOpen ? 'Hide lessons sidebar' : 'Show lessons sidebar'}
        >
          <Terminal className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={onToggleSidebar}
          className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-hover)] cursor-pointer ${
            sidebarOpen ? 'bg-[var(--bg-elevated)]' : ''
          }`}
          title={sidebarOpen ? 'Hide lessons sidebar' : 'Show lessons sidebar'}
        >
          {sidebarOpen ? (
            <PanelLeftClose className="h-4 w-4 text-[var(--text-muted)]" />
          ) : (
            <PanelLeft className="h-4 w-4 text-[var(--text-muted)]" />
          )}
          <span className="truncate">Python for Coding Interviews</span>
        </button>

        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={onPrev}
            disabled={!hasPrev}
            className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            title="Previous lesson"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={!hasNext}
            className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            title="Next lesson"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="ml-1 hidden items-center gap-1.5 text-xs sm:flex">
          <span className="font-medium text-[var(--text-secondary)]">
            {section.shortTitle}
          </span>
          <span className="text-[var(--text-muted)]">
            ({positionInSection} / {sectionTotal})
          </span>
        </div>
      </div>

      {/* Right Utility Cluster */}
      <div className="flex items-center gap-2">
        {/* Stopwatch Timer */}
        {timerOpen ? (
          <div
            className="flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            <button
              type="button"
              onClick={() => setTimerRunning((r) => !r)}
              className="rounded p-1 text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] cursor-pointer"
              title={timerRunning ? 'Pause timer' : 'Start timer'}
            >
              {timerRunning ? (
                <Pause className="h-3.5 w-3.5 text-amber-400" />
              ) : (
                <Play className="h-3.5 w-3.5 text-emerald-500" />
              )}
            </button>
            <span className="min-w-[42px] text-center font-mono text-xs font-medium text-[var(--text-primary)]">
              {formatSeconds(elapsedSeconds)}
            </span>
            <button
              type="button"
              onClick={() => {
                setTimerRunning(false);
                setElapsedSeconds(0);
              }}
              className="rounded p-1 text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] cursor-pointer"
              title="Reset timer"
            >
              <RotateCcw className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={() => setTimerOpen(false)}
              className="ml-0.5 rounded px-1 text-[10px] text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] cursor-pointer"
              title="Hide timer"
            >
              ×
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              setTimerOpen(true);
              setTimerRunning(true);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] cursor-pointer"
            title="Start interview timer"
          >
            <Timer className="h-4 w-4" />
          </button>
        )}

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={onToggleTheme}
          className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] cursor-pointer"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </button>

        {/* Progress Ring Button */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className="flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors hover:bg-[var(--bg-hover)] cursor-pointer"
          style={{
            borderColor: 'var(--border-subtle)',
            backgroundColor: 'var(--bg-elevated)',
          }}
          title={sidebarOpen ? 'Hide lessons sidebar' : 'Show lessons sidebar'}
        >
          <svg className="h-6 w-6 -rotate-90" viewBox="0 0 28 28">
            <circle
              cx="14"
              cy="14"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="text-[var(--border-strong)]"
            />
            <circle
              cx="14"
              cy="14"
              r={radius}
              fill="none"
              stroke="#22c55e"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              className="transition-all duration-300"
            />
          </svg>
          <span className="font-mono text-xs text-[var(--text-primary)]">
            {solvedCount}/{totalLessons}
          </span>
        </button>
      </div>
    </header>
  );
});
