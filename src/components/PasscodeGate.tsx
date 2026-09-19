import { useState, type FormEvent, type ReactNode } from 'react';

const STORAGE_KEY = 'photo-proofing:dashboard-unlocked';

/**
 * IMPORTANT: this is a frontend-only deterrent, not real access control.
 * The passcode ends up in the built JS bundle and can be read by anyone who
 * opens dev tools on the live site — it stops a client from casually
 * stumbling into the dashboard, nothing more. Real protection needs a
 * backend that checks credentials server-side before ever sending gallery
 * data to the browser.
 *
 * The value comes from VITE_DASHBOARD_PASSCODE (set in Netlify's
 * Site settings → Environment variables) rather than being hardcoded here,
 * so it isn't sitting in plain text in the public GitHub repo. See
 * .env.example. Falls back to a default for local dev if unset.
 */
const DASHBOARD_PASSCODE = import.meta.env.VITE_DASHBOARD_PASSCODE ?? 'proofly2026';

function isUnlocked(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function PasscodeGate({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(isUnlocked);
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (input === DASHBOARD_PASSCODE) {
      try {
        localStorage.setItem(STORAGE_KEY, 'true');
      } catch {
        // Non-fatal — unlock still applies for the current render.
      }
      setUnlocked(true);
      setError(false);
    } else {
      setError(true);
    }
  }

  if (unlocked) return <>{children}</>;

  return (
    <div className="page page-passcode">
      <form className="passcode-form" onSubmit={handleSubmit}>
        <h1>Studio access</h1>
        <p>Enter your passcode to view your galleries.</p>
        <input
          type="password"
          autoFocus
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setError(false);
          }}
        />
        {error && <p className="passcode-error">That's not it — try again.</p>}
        <button type="submit" className="primary-button">
          Unlock
        </button>
      </form>
    </div>
  );
}
