import type { ScrollSettings, ScrollMode } from "../types";

// Storage keys
const STORAGE_KEY = "readerToolsSettings";

// Save settings to Chrome storage
export async function saveSettings(
  settings: Partial<ScrollSettings>,
): Promise<void> {
  const currentSettings = await loadSettings();
  const newSettings = { ...currentSettings, ...settings };

  await chrome.storage.local.set({ [STORAGE_KEY]: newSettings });
}

// Load settings from Chrome storage
export async function loadSettings(): Promise<ScrollSettings> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  return (
    result[STORAGE_KEY] || {
      mode: "continuous" as ScrollMode,
      speed: 2,
      interval: 3,
      isScrolling: false,
    }
  );
}

// Get the current active tab
export async function getCurrentTab(): Promise<chrome.tabs.Tab | undefined> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

// Execute script in the current tab
export async function executeInTab<T>(
  func: (...args: unknown[]) => T,
  args: unknown[] = [],
): Promise<T | undefined> {
  const tab = await getCurrentTab();
  if (!tab?.id) return undefined;

  const results = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func,
    args,
  });

  return results[0]?.result as T;
}
