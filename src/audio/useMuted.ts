import { useEffect, useState } from 'react';

const MUTE_KEY = 'circuit-workshop:muted';

function loadMuted(): boolean {
  return localStorage.getItem(MUTE_KEY) === 'true';
}

export function useMuted(): [boolean, () => void] {
  const [muted, setMuted] = useState(loadMuted);

  useEffect(() => {
    localStorage.setItem(MUTE_KEY, String(muted));
  }, [muted]);

  return [muted, () => setMuted((current) => !current)];
}
