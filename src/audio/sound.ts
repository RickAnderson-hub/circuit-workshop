export type SoundName = 'place' | 'remove' | 'solve';

let sharedContext: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof AudioContext === 'undefined') return null;
  if (!sharedContext) sharedContext = new AudioContext();
  return sharedContext;
}

function playTone(ctx: AudioContext, frequency: number, startTime: number, duration: number) {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.value = frequency;
  // Fast attack, exponential decay — avoids the click a hard on/off edge would make.
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(0.2, startTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration);
}

const NOTE_DURATION = 0.12;

const TONES: Record<SoundName, number[]> = {
  place: [660],
  remove: [330],
  solve: [523.25, 659.25, 783.99], // ascending C5-E5-G5
};

export function playSound(name: SoundName, muted: boolean): void {
  if (muted) return;
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  TONES[name].forEach((frequency, index) => {
    playTone(ctx, frequency, now + index * NOTE_DURATION, NOTE_DURATION);
  });
}
