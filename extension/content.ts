// content.ts — runs on matched pages, extracts profile data and responds to popup messages

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

function text(el: Element | null): string {
  return el?.textContent?.trim() ?? "";
}

function attr(el: Element | null, a: string): string {
  return (el as HTMLElement)?.getAttribute(a)?.trim() ?? "";
}

// ─── Platform detection ───────────────────────────────────────────────────────

function detectPlatform(): ProfileData["platform"] {
  const host = window.location.hostname;
  if (host.includes("linkedin.com")) return "linkedin";
  if (host.includes("twitter.com") || host.includes("x.com")) return "twitter";
  if (host.includes("github.com")) return "github";
  if (host.includes("instagram.com")) return "instagram";
  return "other";
}

// ─── Extractors ───────────────────────────────────────────────────────────────

function extractLinkedIn(): Omit<ProfileData, "platform"> | null {
  const name =
    text(document.querySelector("h1.text-heading-xlarge")) ||
    text(document.querySelector("h1"));

  if (!name) return null;

  const headline = text(
    document.querySelector(".text-body-medium.break-words") ||
    document.querySelector("[data-generated-suggestion-target]")
  );

  const company = text(
    document.querySelector(
      'section[data-section="experience"] li:first-child .t-bold span[aria-hidden="true"]'
    )
  );

  const location = text(
    document.querySelector(".text-body-small.inline.t-black--light.break-words")
  );

  const bio = text(
    document.querySelector(
      '[class*="summary"] .visually-hidden ~ span, .display-flex.ph5.pv3 span[aria-hidden="true"]'
    )
  );

  const profileImage =
    attr(document.querySelector(".pv-top-card-profile-picture__image--show"), "src") ||
    attr(document.querySelector("img.profile-photo-edit__preview"), "src") ||
    attr(document.querySelector(".evi-image.lazy-image.ember-view"), "src");

  return {
    name,
    headline,
    company: company || undefined,
    location: location || undefined,
    bio: bio || undefined,
    profileUrl: window.location.href,
    profileImage: profileImage || undefined,
    linkedin: window.location.href,
  };
}

function extractTwitter(): Omit<ProfileData, "platform"> | null {
  // User profile pages: twitter.com/:username or x.com/:username
  const pathParts = window.location.pathname.split("/").filter(Boolean);
  if (pathParts.length === 0 || pathParts[0] === "home" || pathParts[0] === "explore") {
    return null;
  }

  const name =
    text(document.querySelector('[data-testid="UserName"] span:first-child')) ||
    text(document.querySelector('h2[role="heading"]'));

  if (!name) return null;

  const handle =
    text(document.querySelector('[data-testid="UserName"] span:last-child')) ||
    `@${pathParts[0]}`;

  const bio = text(document.querySelector('[data-testid="UserDescription"]'));
  const location = text(document.querySelector('[data-testid="UserLocation"] span'));
  const profileImage =
    attr(
      document.querySelector(
        '[data-testid="UserAvatar-Container-unknown"] img, a[href$="/photo"] img'
      ),
      "src"
    ) || attr(document.querySelector('[data-testid^="UserAvatar"] img'), "src");

  const cleanHandle = handle.replace(/^@/, "");
  const twitterUrl = `https://twitter.com/${cleanHandle}`;

  return {
    name,
    headline: bio.slice(0, 160) || undefined,
    location: location || undefined,
    profileUrl: twitterUrl,
    profileImage: profileImage || undefined,
    twitter: twitterUrl,
  };
}

function extractGitHub(): Omit<ProfileData, "platform"> | null {
  // Only extract on user profile pages (github.com/:username), not repos
  const pathParts = window.location.pathname.split("/").filter(Boolean);
  if (pathParts.length !== 1) return null;

  const name =
    text(document.querySelector('[itemprop="name"]')) ||
    text(document.querySelector(".p-name"));

  if (!name) return null;

  const bio = text(document.querySelector('[data-bio-text], .p-note'));
  const company = text(document.querySelector('[itemprop="worksFor"], .p-org'));
  const location = text(document.querySelector('[itemprop="homeLocation"], .p-label'));
  const email = text(document.querySelector('[itemprop="email"], a[href^="mailto:"]'));

  const profileImage =
    attr(document.querySelector("img.avatar.avatar-user"), "src") ||
    attr(document.querySelector('[itemprop="image"]'), "src");

  const githubUrl = `https://github.com/${pathParts[0]}`;

  return {
    name,
    headline: bio.slice(0, 160) || undefined,
    company: company || undefined,
    location: location || undefined,
    email: email || undefined,
    profileUrl: githubUrl,
    profileImage: profileImage || undefined,
    github: githubUrl,
  };
}

function extractInstagram(): Omit<ProfileData, "platform"> | null {
  // Instagram heavily uses JS rendering; grab what's available in the DOM
  const pathParts = window.location.pathname.split("/").filter(Boolean);
  if (pathParts.length === 0) return null;

  const username = pathParts[0];

  const name =
    text(document.querySelector("h2")) ||
    text(document.querySelector('header h1')) ||
    username;

  const bio = text(document.querySelector('header div.-vDIg span'));
  const profileImage = attr(document.querySelector("header img"), "src");
  const instagramUrl = `https://instagram.com/${username}`;

  return {
    name,
    headline: bio.slice(0, 160) || undefined,
    profileUrl: instagramUrl,
    profileImage: profileImage || undefined,
    instagram: instagramUrl,
  };
}

// ─── Main extract function ────────────────────────────────────────────────────

function extractProfile(): ProfileData | null {
  const platform = detectPlatform();
  let partial: Omit<ProfileData, "platform"> | null = null;

  switch (platform) {
    case "linkedin":  partial = extractLinkedIn(); break;
    case "twitter":   partial = extractTwitter(); break;
    case "github":    partial = extractGitHub(); break;
    case "instagram": partial = extractInstagram(); break;
    default:          return null;
  }

  if (!partial) return null;
  return { ...partial, platform };
}

// ─── Message listener ─────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "GET_PROFILE") {
    const profile = extractProfile();
    sendResponse({ profile });
  }
  return true; // keep channel open for async
});
