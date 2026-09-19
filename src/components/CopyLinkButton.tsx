import { useState } from 'react';

interface CopyLinkButtonProps {
  path: string;
  label?: string;
}

export function CopyLinkButton({ path, label = 'Copy link' }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    const url = `${window.location.origin}${path}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard API unavailable (e.g. insecure context) — fall back to a prompt
      // so the link is still reachable rather than silently failing.
      window.prompt('Copy this link:', url);
    }
  }

  return (
    <button type="button" className="copy-link-button" onClick={handleClick}>
      {copied ? 'Copied!' : label}
    </button>
  );
}
