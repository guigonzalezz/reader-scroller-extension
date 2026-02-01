export type ScrollMode = "continuous" | "interval";

export interface ScrollSettings {
  mode: ScrollMode;
  speed: number; // 1-10 for continuous mode
  interval: number; // in seconds for interval mode
  isScrolling: boolean;
}

export const DEFAULT_SETTINGS: ScrollSettings = {
  mode: "continuous",
  speed: 2,
  interval: 3,
  isScrolling: false,
};

export interface ChromeMessage {
  action: "startScroll" | "stopScroll" | "getStatus" | "updateSettings";
  settings?: Partial<ScrollSettings>;
}

export interface ChromeResponse {
  success: boolean;
  isScrolling?: boolean;
  error?: string;
}
