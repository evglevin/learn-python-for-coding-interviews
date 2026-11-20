import React from 'react';
import type { IncomingProgress } from '../lib/progressLink';

interface ImportProgressDialogProps {
  incoming: IncomingProgress;
  currentSolvedCount: number;
  /** `load` is true when the learner chose to replace this browser's progress. */
  onClose: (load: boolean) => void;
}

function openDialog(dialog: HTMLDialogElement | null) {
  if (dialog && !dialog.open) dialog.showModal();
}

const primaryButton =
  'rounded-md bg-accent-solid px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-solid-hover cursor-pointer';
const secondaryButton =
  'rounded-md px-4 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] cursor-pointer';

const ERROR_COPY = {
  invalid: {
    title: 'Couldn\u2019t read this progress link',
    body: 'The link may have been cut off when it was copied. Your progress in this browser is unchanged.',
  },
  saveFailed: {
    title: 'Couldn\u2019t save the progress from this link',
    body: 'This browser\u2019s storage is full or blocked. Your progress in this browser is unchanged.',
  },
  savePartial: {
    title: 'Only part of the progress was saved',
    body: 'This browser\u2019s storage filled up while saving, so the code from the link was saved but its solved lessons were not. Free up space and open the link again.',
  },
} as const;

function plural(count: number, word: string) {
  return `${count} ${word}${count === 1 ? '' : 's'}`;
}

/**
 * Shown when the page is opened from a progress link. Asks whether to replace the
 * progress saved in this browser; any way of closing it other than "Load" keeps it.
 */
export function ImportProgressDialog({ incoming, currentSolvedCount, onClose }: ImportProgressDialogProps) {
  let content: React.ReactNode;
  if (incoming.status !== 'valid') {
    content = (
      <>
        <h2 id="import-progress-title" className="text-lg font-semibold">
          {ERROR_COPY[incoming.status].title}
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-[var(--text-secondary)]">
          {ERROR_COPY[incoming.status].body}
        </p>
        <form method="dialog" className="mt-6 flex justify-end">
          <button type="submit" autoFocus className={primaryButton}>
            OK
          </button>
        </form>
      </>
    );
  } else {
    const { solved, tabs } = incoming.progress;
    content = (
      <>
        <h2 id="import-progress-title" className="text-lg font-semibold">
          Replace your progress?
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-[var(--text-secondary)]">
          This link has {plural(solved.length, 'solved lesson')} and code for{' '}
          {plural(Object.keys(tabs).length, 'lesson')}. Loading it replaces the progress saved in
          this browser
          {currentSolvedCount > 0 ? ` (${plural(currentSolvedCount, 'solved lesson')})` : ''}.
        </p>
        <form method="dialog" className="mt-6 flex justify-end gap-2">
          {/* Focus the safe choice, so a stray Enter doesn't replace progress. */}
          <button type="submit" value="keep" autoFocus className={secondaryButton}>
            Keep current progress
          </button>
          <button type="submit" value="load" className={primaryButton}>
            Load progress
          </button>
        </form>
      </>
    );
  }

  return (
    <dialog
      ref={openDialog}
      onClose={(e) => onClose(e.currentTarget.returnValue === 'load')}
      // Clicking the backdrop (the dialog element itself, outside the card) closes it.
      onClick={(e) => {
        if (e.target === e.currentTarget) e.currentTarget.close();
      }}
      aria-labelledby="import-progress-title"
      className="m-auto w-[min(480px,calc(100vw-32px))] rounded-xl border p-0 text-[var(--text-primary)] shadow-2xl backdrop:bg-black/50"
      style={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border-subtle)' }}
    >
      <div className="p-5 sm:p-6">{content}</div>
    </dialog>
  );
}
