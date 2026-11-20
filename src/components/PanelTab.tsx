import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface PanelTabProps {
  active: boolean;
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  /** Padding utilities; panels use slightly different densities. */
  padding?: string;
  /** Optional trailing content, e.g. a count badge. */
  children?: React.ReactNode;
}

/** Underlined text tab used in the lesson pane and console headers. */
export const PanelTab: React.FC<PanelTabProps> = ({
  active,
  icon: Icon,
  label,
  onClick,
  padding = 'px-3 py-2',
  children,
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`relative flex items-center gap-1.5 ${padding} text-xs font-medium transition-colors cursor-pointer ${
      active
        ? 'text-[var(--text-primary)]'
        : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
    }`}
  >
    <Icon className="h-3.5 w-3.5" />
    <span>{label}</span>
    {children}
    {active && (
      <span
        className="absolute right-2 bottom-0 left-2 h-[2px] rounded-full"
        style={{ backgroundColor: 'var(--accent)' }}
      />
    )}
  </button>
);
