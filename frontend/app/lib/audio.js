export const playClick = () => {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(950, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.01, ctx.currentTime); // extremely subtle volume
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  } catch (e) {
    // Suppress warning if audio context block policy applies
  }
};
