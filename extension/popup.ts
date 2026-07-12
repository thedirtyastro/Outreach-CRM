// popup.ts — compiled to popup.js via tsc or esbuild
// Handles the extension popup UI logic

interface ProfileData {
  name: string;
  headline?: string;
  company?: string;
  location?: string;
  bio?: string;
  profileUrl?: string;
  profileImage?: string;
  platform: "linkedin" | "twitter" | "github" | "instagram" | "other";
  email?: string;
  twitter?: string;
  linkedin?: string;
  github?: string;
  instagram?: string;
}

interface StorageData {
  apiKey?: string;
  crmUrl?: string;
}

// ─── DOM refs ────────────────────────────────────────────────────────────────

const $ = (id: string) => document.getElementById(id)!;

const screens = {
  loading:  $("loadingScreen"),
  empty:    $("emptyScreen"),
  noKey:    $("noKeyScreen"),
  profile:  $("profileScreen"),
  settings: $("settingsScreen"),
};

function showScreen(name: keyof typeof screens) {
  Object.values(screens).forEach((s) => s.classList.remove("active"));
  screens[name].classList.add("active");
}

// ─── Storage helpers ──────────────────────────────────────────────────────────

function getStorage(): Promise<StorageData> {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["apiKey", "crmUrl"], (result) => {
      resolve(result as StorageData);
    });
  });
}

function setStorage(data: Partial<StorageData>): Promise<void> {
  return new Promise((resolve) => chrome.storage.sync.set(data, resolve));
}

// ─── Profile detection ────────────────────────────────────────────────────────

async function getProfile(): Promise<ProfileData | null> {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab?.id) return resolve(null);

      chrome.tabs.sendMessage(tab.id, { type: "GET_PROFILE" }, (response) => {
        if (chrome.runtime.lastError || !response?.profile) {
          resolve(null);
        } else {
          resolve(response.profile as ProfileData);
        }
      });
    });
  });
}

// ─── UI helpers ──────────────────────────────────────────────────────────────

function showStatus(type: "success" | "error" | "warning" | "info", message: string) {
  const banner = $("statusBanner");
  banner.className = `status-banner status-${type}`;
  banner.textContent = message;
  banner.style.display = "flex";
}

function setButtonState(btn: HTMLButtonElement, loading: boolean, text: string) {
  btn.disabled = loading;
  btn.textContent = loading ? "…" : text;
}

const PLATFORM_LABELS: Record<string, string> = {
  linkedin: "LinkedIn",
  twitter: "Twitter / X",
  github: "GitHub",
  instagram: "Instagram",
  other: "Web",
};

// ─── Init ─────────────────────────────────────────────────────────────────────

let currentProfile: ProfileData | null = null;
let crmBaseUrl = "";

async function init() {
  showScreen("loading");

  const { apiKey, crmUrl } = await getStorage();
  crmBaseUrl = (crmUrl ?? "").replace(/\/$/, "") || "http://localhost:3000";

  // Populate settings fields
  ($ ("apiKeyInput") as HTMLInputElement).value = apiKey ?? "";
  ($("crmUrlInput") as HTMLInputElement).value = crmBaseUrl;

  if (!apiKey) {
    showScreen("noKey");
    return;
  }

  const profile = await getProfile();
  currentProfile = profile;

  if (!profile) {
    showScreen("empty");
    return;
  }

  renderProfile(profile);
  showScreen("profile");
}

function renderProfile(profile: ProfileData) {
  // Avatar
  const avatarEl = $("avatarEl");
  if (profile.profileImage) {
    avatarEl.innerHTML = `<img src="${escHtml(profile.profileImage)}" alt="" />`;
  } else {
    avatarEl.textContent = profile.name.charAt(0).toUpperCase();
  }

  // Text fields
  $("profileName").textContent = profile.name;
  $("profileHeadline").textContent = profile.headline ?? "";
  $("metaCompany").textContent = profile.company || "—";
  $("metaLocation").textContent = profile.location || "—";

  // Platform badge
  const badge = $("platformBadge");
  badge.textContent = PLATFORM_LABELS[profile.platform] ?? profile.platform;
  badge.className = `badge badge-${profile.platform}`;
}

function escHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// ─── Save to CRM ──────────────────────────────────────────────────────────────

async function saveLeadToCrm(profile: ProfileData, apiKey: string) {
  const saveBtn = $("saveBtn") as HTMLButtonElement;
  setButtonState(saveBtn, true, "Saving…");
  $("statusBanner").style.display = "none";
  $("dupBanner").style.display = "none";

  const payload = {
    name: profile.name,
    platform: profile.platform,
    company: profile.company,
    bio: profile.bio,
    location: profile.location,
    profileImage: profile.profileImage,
    linkedin: profile.linkedin,
    twitter: profile.twitter,
    github: profile.github,
    instagram: profile.instagram,
    email: profile.email,
  };

  try {
    const res = await fetch(`${crmBaseUrl}/api/leads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
        // Also send as Authorization in case the server checks it
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (res.status === 409) {
      const json = await res.json();
      const dupId: string = json.data?.id ?? "";
      const dupBanner = $("dupBanner");
      dupBanner.style.display = "block";
      const dupLink = $("dupLink");
      if (dupId) {
        dupLink.onclick = () => {
          chrome.tabs.create({ url: `${crmBaseUrl}/dashboard/leads/${dupId}` });
          window.close();
        };
      }
      setButtonState(saveBtn, false, "Save to CRM");
      return;
    }

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      showStatus("error", json.error ?? `Error ${res.status}`);
      setButtonState(saveBtn, false, "Save to CRM");
      return;
    }

    showStatus("success", "Lead saved successfully!");
    saveBtn.textContent = "✓ Saved";
    saveBtn.disabled = true;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Network error";
    showStatus("error", `Failed: ${msg}`);
    setButtonState(saveBtn, false, "Save to CRM");
  }
}

// ─── Event listeners ──────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  void init();

  // Save button
  $("saveBtn").addEventListener("click", async () => {
    if (!currentProfile) return;
    const { apiKey } = await getStorage();
    if (!apiKey) {
      showScreen("noKey");
      return;
    }
    await saveLeadToCrm(currentProfile, apiKey);
  });

  // Open dashboard buttons
  ["openDashboard", "openDashboardEmpty"].forEach((id) => {
    $(id).addEventListener("click", () => {
      chrome.tabs.create({ url: `${crmBaseUrl}/dashboard` });
      window.close();
    });
  });

  // Cancel/dismiss
  $("cancelBtn").addEventListener("click", () => window.close());

  // Settings button
  $("settingsBtn").addEventListener("click", () => showScreen("settings"));
  $("backBtn").addEventListener("click", () => void init());

  // Save settings
  $("saveSettings").addEventListener("click", async () => {
    const key = ($("apiKeyInput") as HTMLInputElement).value.trim();
    const url = ($("crmUrlInput") as HTMLInputElement).value.trim();
    await setStorage({ apiKey: key || undefined, crmUrl: url || undefined });
    void init();
  });

  // Inline API key save (no-key screen)
  $("saveInlineKey").addEventListener("click", async () => {
    const key = ($("inlineApiKey") as HTMLInputElement).value.trim();
    if (!key) return;
    await setStorage({ apiKey: key });
    void init();
  });
});
