import { useState, useEffect, useCallback, useRef } from "react";
import { Play, Pause, Minus, Plus, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Kbd } from "@/components/ui/kbd";
import type { ScrollMode, ScrollSettings } from "@/types";
import { saveSettings, loadSettings, getCurrentTab } from "@/lib/chrome-utils";

const MODE_OPTIONS = [
  { value: "continuous", label: "Continuous" },
  { value: "interval", label: "Interval" },
];

const BUY_ME_COFFEE_URL = "https://buymeacoffee.com/guigonzalezz";

export function ReaderToolsPopup() {
  const [settings, setSettings] = useState<ScrollSettings>({
    mode: "continuous",
    speed: 2,
    interval: 3,
    isScrolling: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isIdle, setIsIdle] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const idleTimeoutRef = useRef<number | null>(null);

  // Reset idle timer on any interaction
  const resetIdleTimer = useCallback(() => {
    setIsIdle(false);
    if (idleTimeoutRef.current) {
      clearTimeout(idleTimeoutRef.current);
    }
    idleTimeoutRef.current = window.setTimeout(() => {
      setIsIdle(true);
    }, 5000); // 5 seconds
  }, []);

  // Setup idle detection
  useEffect(() => {
    resetIdleTimer();

    const handleInteraction = () => resetIdleTimer();

    window.addEventListener("mousemove", handleInteraction);
    window.addEventListener("mousedown", handleInteraction);
    window.addEventListener("keydown", handleInteraction);
    window.addEventListener("scroll", handleInteraction);

    return () => {
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }
      window.removeEventListener("mousemove", handleInteraction);
      window.removeEventListener("mousedown", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
      window.removeEventListener("scroll", handleInteraction);
    };
  }, [resetIdleTimer]);

  // Load settings on mount
  useEffect(() => {
    loadSettings().then((loaded) => {
      setSettings(loaded);
      setIsLoading(false);
    });
  }, []);

  // Save settings when they change
  useEffect(() => {
    if (!isLoading) {
      saveSettings(settings);
    }
  }, [settings, isLoading]);

  // Reference to track if we should handle the space key
  const handleStartStopRef = useRef<(() => void) | null>(null);

  // Listen for Space key in popup
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        if (handleStartStopRef.current) {
          handleStartStopRef.current();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const updateSetting = useCallback(
    <K extends keyof ScrollSettings>(key: K, value: ScrollSettings[K]) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const handleStartStop = useCallback(async () => {
    const tab = await getCurrentTab();
    if (!tab?.id) return;

    const newIsScrolling = !settings.isScrolling;

    if (newIsScrolling) {
      // Start scrolling
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (mode: string, speed: number, interval: number) => {
          // Inline the scroll logic for execution context
          interface ScrollState {
            animationFrameId: number | null;
            isScrolling: boolean;
            mode: "continuous" | "interval";
            speed: number;
            interval: number;
            intervalTimeoutId: number | null;
          }

          const w = window as Window & { __readerToolsState?: ScrollState };

          if (!w.__readerToolsState) {
            w.__readerToolsState = {
              animationFrameId: null,
              isScrolling: false,
              mode: "continuous",
              speed: 2,
              interval: 3,
              intervalTimeoutId: null,
            };
          }

          const state = w.__readerToolsState!;

          // Stop any existing scroll
          state.isScrolling = false;
          if (state.animationFrameId) {
            cancelAnimationFrame(state.animationFrameId);
            state.animationFrameId = null;
          }
          if (state.intervalTimeoutId) {
            clearTimeout(state.intervalTimeoutId);
            state.intervalTimeoutId = null;
          }

          // Update settings
          state.mode = mode as "continuous" | "interval";
          state.speed = speed;
          state.interval = interval;
          state.isScrolling = true;

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
          const scrollSpeed = speeds[speed] || 1;

          function continuousScroll() {
            if (!state.isScrolling) return;
            window.scrollBy(0, scrollSpeed);
            if (state.isScrolling) {
              state.animationFrameId = requestAnimationFrame(continuousScroll);
            }
          }

          function intervalScroll() {
            if (!state.isScrolling) return;
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

          if (mode === "continuous") {
            state.animationFrameId = requestAnimationFrame(continuousScroll);
          } else {
            intervalScroll();
          }
        },
        args: [settings.mode, settings.speed, settings.interval],
      });
    } else {
      // Stop scrolling
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          interface ScrollState {
            animationFrameId: number | null;
            isScrolling: boolean;
            intervalTimeoutId: number | null;
          }
          const w = window as Window & { __readerToolsState?: ScrollState };
          const state = w.__readerToolsState;
          if (state) {
            state.isScrolling = false;
            if (state.animationFrameId) {
              cancelAnimationFrame(state.animationFrameId);
              state.animationFrameId = null;
            }
            if (state.intervalTimeoutId) {
              clearTimeout(state.intervalTimeoutId);
              state.intervalTimeoutId = null;
            }
          }
        },
      });
    }

    updateSetting("isScrolling", newIsScrolling);
  }, [settings, updateSetting]);

  // Keep the ref updated with latest handleStartStop
  useEffect(() => {
    handleStartStopRef.current = handleStartStop;
  }, [handleStartStop]);

  const handleSpeedChange = useCallback(
    async (delta: number) => {
      const key = settings.mode === "continuous" ? "speed" : "interval";
      const currentValue = settings[key];

      if (key === "speed") {
        const newValue = Math.max(1, Math.min(10, currentValue + delta));
        updateSetting("speed", newValue);
      } else {
        const newValue = Math.max(1, Math.min(30, currentValue + delta));
        updateSetting("interval", newValue);
      }

      // Stop scrolling when speed/interval changes
      if (settings.isScrolling) {
        const tab = await getCurrentTab();
        if (tab?.id) {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
              interface ScrollState {
                animationFrameId: number | null;
                isScrolling: boolean;
                intervalTimeoutId: number | null;
              }
              const w = window as Window & { __readerToolsState?: ScrollState };
              const state = w.__readerToolsState;
              if (state) {
                state.isScrolling = false;
                if (state.animationFrameId) {
                  cancelAnimationFrame(state.animationFrameId);
                  state.animationFrameId = null;
                }
                if (state.intervalTimeoutId) {
                  clearTimeout(state.intervalTimeoutId);
                  state.intervalTimeoutId = null;
                }
              }
            },
          });
        }
        updateSetting("isScrolling", false);
      }
    },
    [settings, updateSetting],
  );

  const handleBuyMeCoffee = () => {
    window.open(BUY_ME_COFFEE_URL, "_blank");
  };

  if (isLoading) {
    return (
      <div className="w-[320px] p-6 flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div
      className={`w-[320px] bg-background text-foreground transition-opacity duration-300 ${
        isIdle ? "opacity-20" : "opacity-100"
      }`}
    >
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3 mb-6">
          <img src="images/icon-128.png" alt="Reader Scroller" className="h-6 w-6" />
          <h1 className="text-lg font-semibold tracking-wide">
            <span className="text-orange-500">R</span>EADER <span className="text-rose-500">S</span>CROLLER
          </h1>
        </div>

        {/* Auto-Scroll Control */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">Auto-Scroll</span>
          <Button
            variant={settings.isScrolling ? "destructive" : "secondary"}
            size="sm"
            onClick={handleStartStop}
            className="gap-2"
          >
            {settings.isScrolling ? (
              <>
                <Pause className="h-4 w-4" />
                Stop
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Start
              </>
            )}
          </Button>
        </div>

        {/* Mode Selection */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">Mode</span>
          <Select
            value={settings.mode}
            onValueChange={(value) =>
              updateSetting("mode", value as ScrollMode)
            }
            options={MODE_OPTIONS}
          />
        </div>

        {/* Speed/Interval Control */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">
            {settings.mode === "continuous" ? "Speed" : "Interval"}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleSpeedChange(-1)}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[32px] text-center">
              {settings.mode === "continuous"
                ? `${settings.speed}x`
                : `${settings.interval}s`}
            </span>
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleSpeedChange(1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border my-4" />

        {/* Keyboard Shortcut */}
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Toggle Scroll</span>
            <Kbd>Space</Kbd>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border my-4" />

        {/* Buy Me a Coffee */}
        <div className="relative flex justify-end">
          <button
            onClick={handleBuyMeCoffee}
            onMouseEnter={() => setShowQR(true)}
            onMouseLeave={() => setShowQR(false)}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#FFDD00] hover:bg-[#FFDD00]/90 text-black rounded-lg font-medium text-xs transition-all hover:scale-105"
          >
            <Coffee className="h-3.5 w-3.5" />
            Buy me a coffee
          </button>

          {/* QR Code on hover */}
          {showQR && (
            <div className="absolute bottom-full right-0 mb-2 p-2 bg-white rounded-lg shadow-lg z-10">
              <img
                src="images/bmc_qr.png"
                alt="Buy me a coffee QR"
                className="w-32 h-32"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
