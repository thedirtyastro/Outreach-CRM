// background.ts — Manifest V3 service worker
// Handles extension lifecycle events and tab-change notifications

const SUPPORTED_HOSTS = [
  "linkedin.com",
  "twitter.com",
  "x.com",
  "github.com",
  "instagram.com",
];

function isSupportedUrl(url: string | undefined): boolean {
  if (!url) return false;
  try {
    const { hostname } = new URL(url);
    return SUPPORTED_HOSTS.some((h) => hostname.endsWith(h));
  } catch {
    return false;
  }
}

// Badge helpers ──────────────────────────────────────────────────────────────

function setBadge(tabId: number, text: string, color: string) {
  chrome.action.setBadgeText({ tabId, text });
  chrome.action.setBadgeBackgroundColor({ tabId, color });
}

function clearBadge(tabId: number) {
  chrome.action.setBadgeText({ tabId, text: "" });
}

// Show a subtle indicator dot when on a supported social profile page ─────────

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete") return;

  if (isSupportedUrl(tab.url)) {
    setBadge(tabId, "●", "#2563eb");
  } else {
    clearBadge(tabId);
  }
});

chrome.tabs.onActivated.addListener(({ tabId }) => {
  chrome.tabs.get(tabId, (tab) => {
    if (chrome.runtime.lastError) return;
    if (isSupportedUrl(tab.url)) {
      setBadge(tabId, "●", "#2563eb");
    } else {
      clearBadge(tabId);
    }
  });
});

// Extension install / update messaging ───────────────────────────────────────

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    chrome.tabs.create({ url: "https://outreachcrm.app/dashboard/settings" });
  }
});
