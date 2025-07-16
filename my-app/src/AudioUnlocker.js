class AudioUnlocker {
  constructor() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.unlocked = false;

    const unlock = () => {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      this.unlocked = true;
      window.__hasUserInteracted = true;

      window.dispatchEvent(new Event('audioUnlocked')); 

      ['click','touchstart','keydown'].forEach(e =>
        window.removeEventListener(e, unlock, true)
      );
    };

    ['click','touchstart','keydown'].forEach(e =>
      window.addEventListener(e, unlock, { once: true, capture: true, passive: true })
    );
  }
}
export const audioUnlocker = new AudioUnlocker();
