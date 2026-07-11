# OutReach CRM — Chrome Extension

Manifest V3 extension that auto-detects profiles on LinkedIn, Twitter/X, GitHub, and Instagram and lets you save them directly to your CRM with one click.

## Features

- Auto-detects profile on supported sites
- Extracts name, headline, company, location, bio, profile image, and social URL
- Duplicate detection via `/api/leads` before saving
- Shows a save card with platform badge and profile details
- API key–based authentication (no login needed after setup)
- Configurable CRM URL for self-hosted installs

## Build

```bash
# Install esbuild if not already installed
npm install --save-dev esbuild

# Build extension (outputs to extension/dist/)
node extension/build.mjs

# Watch mode during development
node extension/build.mjs --watch
```

## Load in Chrome

1. Run the build: `node extension/build.mjs`
2. Open `chrome://extensions`
3. Enable **Developer mode** (top right)
4. Click **Load unpacked**
5. Select the `extension/dist/` folder

## Setup

1. In your OutReach CRM, go to **Settings → API Key** and generate a key
2. Click the extension icon → click the ⚙ settings icon
3. Paste your API key and set the CRM URL (default: `http://localhost:3000`)
4. Click **Save Settings**

## Supported Sites

| Site | Extracts |
|------|----------|
| LinkedIn | Name, headline, company, location, bio, profile image |
| Twitter / X | Name, bio, location, profile image |
| GitHub | Name, bio, company, location, email |
| Instagram | Name, bio, profile image |

## Notes

- Instagram uses heavy JS rendering — extraction depends on DOM availability
- The extension uses `X-API-Key` and `Authorization: Bearer` headers for auth
- The `/api/leads` `POST` endpoint was updated to accept API key authentication
