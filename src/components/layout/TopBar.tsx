import { useState } from 'react';
import type { User } from 'firebase/auth';
import { Check, Cloud, LogOut, RotateCcw } from 'lucide-react';
import type { WorkspaceView } from '../../types/venture';

interface TopBarProps {
  activeView: WorkspaceView;
  hasSelectedVenture: boolean;
  lastSavedAt: string;
  saveFeedback: string | null;
  cloudSynced: boolean;
  user: User | null;
  authReady: boolean;
  signingIn: boolean;
  onSignIn: () => void;
  onSignOut: () => void;
  onChangeView: (view: WorkspaceView) => void;
  onRequestReset: () => void;
}

function formatTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Saved';
  }
}

function GoogleMark() {
  return (
    <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
      />
    </svg>
  );
}

export function TopBar({
  activeView,
  hasSelectedVenture,
  lastSavedAt,
  saveFeedback,
  cloudSynced,
  user,
  authReady,
  signingIn,
  onSignIn,
  onSignOut,
  onChangeView,
  onRequestReset,
}: TopBarProps) {
  const [avatarFailed, setAvatarFailed] = useState(false);

  const initials = (user?.displayName || user?.email || 'U')
    .trim()
    .charAt(0)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-[#0B162C] text-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single Brand Wordmark */}
        <button
          type="button"
          onClick={() => onChangeView('venture-bank')}
          className="flex items-center gap-2.5 whitespace-nowrap shrink-0 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-emerald-600 font-display text-sm font-bold text-white">
            M
          </span>
          <span className="font-display text-base font-bold tracking-tight text-white">
            MessMind Venture Studio
          </span>
        </button>

        {/* Zone 2: Primary Navigation Links */}
        <nav
          aria-label="Primary studio navigation"
          className="flex items-center gap-5"
        >
          <button
            type="button"
            onClick={() => onChangeView('venture-bank')}
            className={`whitespace-nowrap shrink-0 border-b-2 py-1 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-emerald-400 ${
              activeView === 'venture-bank'
                ? 'border-emerald-400 text-white'
                : 'border-transparent text-slate-300 hover:text-white'
            }`}
          >
            Venture Bank
          </button>

          <button
            type="button"
            disabled={!hasSelectedVenture}
            onClick={() => onChangeView('competition-lab')}
            className={`whitespace-nowrap shrink-0 border-b-2 py-1 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-emerald-400 disabled:cursor-not-allowed disabled:opacity-45 ${
              activeView === 'competition-lab'
                ? 'border-emerald-400 text-white'
                : 'border-transparent text-slate-300 hover:text-white'
            }`}
          >
            Competition Lab
          </button>
        </nav>

        {/* Zone 3: Save State, Google Account & Reset Action */}
        <div className="flex shrink-0 items-center gap-3">
          <div
            aria-live="polite"
            className="hidden items-center gap-1.5 text-xs lg:flex"
          >
            {saveFeedback ? (
              <span className="flex items-center gap-1.5 font-medium text-emerald-300">
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{saveFeedback}</span>
              </span>
            ) : user && cloudSynced ? (
              <span className="flex items-center gap-1.5 text-emerald-300 tabular-nums">
                <Cloud className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Synced · {formatTime(lastSavedAt)}</span>
              </span>
            ) : (
              <span className="text-slate-400 tabular-nums">
                Saved locally · {formatTime(lastSavedAt)}
              </span>
            )}
          </div>

          {authReady &&
            (user ? (
              <div className="flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900/70 px-2.5 py-1.5">
                {user.photoURL && !avatarFailed ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Google user avatar'}
                    referrerPolicy="no-referrer"
                    onError={() => setAvatarFailed(true)}
                    className="h-5 w-5 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white">
                    {initials}
                  </span>
                )}
                <span className="hidden max-w-[130px] truncate text-xs font-medium text-slate-200 sm:inline">
                  {user.displayName || user.email}
                </span>
                <button
                  type="button"
                  onClick={onSignOut}
                  title="Sign out"
                  className="inline-flex items-center gap-1 whitespace-nowrap shrink-0 rounded px-1.5 py-0.5 text-[11px] font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white focus-visible:outline-2 focus-visible:outline-emerald-400"
                >
                  <LogOut className="h-3 w-3" aria-hidden="true" />
                  <span className="hidden md:inline">Sign out</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onSignIn}
                disabled={signingIn}
                className="inline-flex items-center gap-2 whitespace-nowrap shrink-0 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <GoogleMark />
                <span>{signingIn ? 'Signing in...' : 'Sign in with Google'}</span>
              </button>
            ))}

          <button
            type="button"
            onClick={onRequestReset}
            className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-md border border-slate-700 bg-slate-900/70 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:border-slate-500 hover:bg-slate-800 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
            <span className="hidden sm:inline">Reset Workspace</span>
          </button>
        </div>
      </div>
    </header>
  );
}
