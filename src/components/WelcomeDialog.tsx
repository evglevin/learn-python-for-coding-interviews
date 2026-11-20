import React, { useEffect, useRef } from 'react';
import { BookOpen, Code2, HardDrive, Play } from 'lucide-react';

interface WelcomeDialogProps {
  totalLessons: number;
  totalSections: number;
  onClose: () => void;
}

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);
const MOD = isMac ? '⌘' : 'Ctrl';

const Kbd: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <kbd className="rounded border border-[var(--border-strong)] bg-[var(--bg-elevated)] px-1.5 py-px font-mono text-[11px] text-[var(--text-primary)]">
    {children}
  </kbd>
);

/** One-time introduction shown on first launch. Any way of closing it counts as dismissal. */
export function WelcomeDialog({ totalLessons, totalSections, onClose }: WelcomeDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  const points = [
    {
      icon: BookOpen,
      title: 'Read the lesson',
      body: `${totalLessons} short lessons in ${totalSections} sections cover the Python you need for interviews: sorting, hashmaps, heaps and more.`,
    },
    {
      icon: Code2,
      title: 'Write code in the editor',
      body: 'Your Python runs right in the browser, so there\'s nothing to install.',
    },
    {
      icon: Play,
      title: 'Run and submit',
      body: (
        <>
          <strong>Run</strong> (<Kbd>{MOD} + Enter</Kbd>) runs your code and compares its output
          to the expected output. <strong>Submit</strong> (<Kbd>{MOD} + Shift + Enter</Kbd>) runs
          the tests and marks the lesson solved when they all pass.
        </>
      ),
    },
    {
      icon: HardDrive,
      title: 'Pick up where you left off',
      body: 'Your code and solved lessons are saved automatically in this browser.',
    },
  ];

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      // Clicking the backdrop (the dialog element itself, outside the card) closes it.
      onClick={(e) => {
        if (e.target === e.currentTarget) e.currentTarget.close();
      }}
      aria-labelledby="welcome-title"
      className="m-auto w-[min(480px,calc(100vw-32px))] rounded-xl border p-0 text-[var(--text-primary)] shadow-2xl backdrop:bg-black/50"
      style={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border-subtle)' }}
    >
      <div className="p-6">
        <h2 id="welcome-title" className="text-lg font-semibold">
          Welcome to Python for Coding Interviews
        </h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          A hands-on course for writing clean, idiomatic Python under interview pressure.
        </p>

        <ul className="mt-5 space-y-4">
          {points.map(({ icon: Icon, title, body }) => (
            <li key={title} className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[var(--bg-elevated)] text-[var(--accent-tab)]">
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-medium">{title}</div>
                <div className="mt-0.5 text-[13px] leading-relaxed text-[var(--text-secondary)]">
                  {body}
                </div>
              </div>
            </li>
          ))}
        </ul>

        <form method="dialog" className="mt-6 flex justify-end">
          <button
            type="submit"
            autoFocus
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 cursor-pointer"
          >
            Get started
          </button>
        </form>
      </div>
    </dialog>
  );
}
