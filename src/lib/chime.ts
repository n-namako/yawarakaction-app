"use client";

let sharedContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!sharedContext) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return null;
    sharedContext = new AudioContextClass();
  }
  return sharedContext;
}

// ブラウザの自動再生ポリシー対策：ユーザー操作（スタートボタンのクリックなど）の
// タイミングで呼び出しておくことで、後から鳴らすチャイム音がブロックされないようにする
export function primeAudio() {
  const ctx = getAudioContext();
  if (ctx && ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }
}

// タイマー終了時に鳴らす、やわらかい2音のチャイム音（外部音声ファイルなしで生成）
export function playChime() {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }

  const now = ctx.currentTime;
  const notes = [
    { freq: 880, start: 0, duration: 0.35 },
    { freq: 1318.5, start: 0.15, duration: 0.45 },
  ];

  notes.forEach(({ freq, start, duration }) => {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = freq;

    gainNode.gain.setValueAtTime(0, now + start);
    gainNode.gain.linearRampToValueAtTime(0.25, now + start + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + start + duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(now + start);
    oscillator.stop(now + start + duration + 0.05);
  });
}
