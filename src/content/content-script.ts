// Content script that runs on web pages
// This script handles the actual scrolling logic

interface ScrollState {
  animationFrameId: number | null;
  isScrolling: boolean;
  mode: "continuous" | "interval";
  speed: number;
  interval: number;
  intervalTimeoutId: number | null;
}

declare global {
  interface Window {
    __readerToolsState?: ScrollState;
  }
}

// Initialize state
function getState(): ScrollState {
  if (!window.__readerToolsState) {
    window.__readerToolsState = {
      animationFrameId: null,
      isScrolling: false,
      mode: "continuous",
      speed: 2,
      interval: 3,
      intervalTimeoutId: null,
    };
  }
  return window.__readerToolsState;
}

// Speed mapping: 1 = slowest, 10 = fastest
function getScrollSpeed(speed: number): number {
  const speeds: Record<number, number> = {
    1: 0.5,
    2: 1,
    3: 1.5,
    4: 2,
    5: 3,
    6: 4,
    7: 5,
    8: 7,
    9: 10,
    10: 15,
  };
  return speeds[speed] || 1;
}

// Continuous scroll function
function continuousScroll(): void {
  const state = getState();
  if (!state.isScrolling) return;

  const scrollSpeed = getScrollSpeed(state.speed);
  window.scrollBy(0, scrollSpeed);

  if (state.isScrolling) {
    state.animationFrameId = requestAnimationFrame(continuousScroll);
  }
}

// Interval scroll function (scrolls viewport height at intervals)
function intervalScroll(): void {
  const state = getState();
  if (!state.isScrolling) return;

  // Scroll by viewport height
  window.scrollBy({
    top: window.innerHeight * 0.9,
    behavior: "smooth",
  });

  if (state.isScrolling) {
    state.intervalTimeoutId = window.setTimeout(
      intervalScroll,
      state.interval * 1000,
    );
  }
}

// Start scrolling
export function startScroll(
  mode: "continuous" | "interval",
  speed: number,
  interval: number,
): boolean {
  const state = getState();

  // Stop any existing scroll
  stopScroll();

  // Update settings
  state.mode = mode;
  state.speed = speed;
  state.interval = interval;
  state.isScrolling = true;

  if (mode === "continuous") {
    state.animationFrameId = requestAnimationFrame(continuousScroll);
  } else {
    intervalScroll();
  }

  return true;
}

// Stop scrolling
export function stopScroll(): boolean {
  const state = getState();

  state.isScrolling = false;

  if (state.animationFrameId) {
    cancelAnimationFrame(state.animationFrameId);
    state.animationFrameId = null;
  }

  if (state.intervalTimeoutId) {
    clearTimeout(state.intervalTimeoutId);
    state.intervalTimeoutId = null;
  }

  return true;
}

// Toggle scrolling
export function toggleScroll(
  mode: "continuous" | "interval",
  speed: number,
  interval: number,
): boolean {
  const state = getState();

  if (state.isScrolling) {
    stopScroll();
    return false;
  } else {
    startScroll(mode, speed, interval);
    return true;
  }
}

// Get current status
export function getScrollStatus(): boolean {
  return getState().isScrolling;
}

// Listen for keyboard shortcuts
document.addEventListener("keyup", (e) => {
  const state = getState();

  // Space: Toggle scroll
  if (e.code === "Space" && !isInputFocused()) {
    e.preventDefault();
    if (state.isScrolling) {
      stopScroll();
    } else {
      startScroll(state.mode, state.speed, state.interval);
    }
  }
});

function isInputFocused(): boolean {
  const activeElement = document.activeElement;
  return (
    activeElement instanceof HTMLInputElement ||
    activeElement instanceof HTMLTextAreaElement ||
    activeElement?.getAttribute("contenteditable") === "true"
  );
}
