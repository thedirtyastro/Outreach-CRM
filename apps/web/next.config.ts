import type { NextConfig } from "next";
import { execSync } from "child_process";

function getNgrokOrigins(): string[] {
  // Check NGROK_HOSTNAME env var first (set this in .env.local for a fixed domain)
  if (process.env.NGROK_HOSTNAME) {
    return [process.env.NGROK_HOSTNAME];
  }
  // Otherwise query the local ngrok API for the active tunnel
  try {
    const out = execSync(
      "curl -sf --max-time 0.5 http://localhost:4040/api/tunnels",
      { encoding: "utf8" }
    );
    const data = JSON.parse(out) as { tunnels: { public_url: string }[] };
    return data.tunnels
      .map((t) => new URL(t.public_url).hostname)
      .filter(Boolean);
  } catch {
    // ngrok not running — skip silently
    return [];
  }
}

const ngrokOrigins = getNgrokOrigins();

const nextConfig: NextConfig = {
  // Transpile local workspace packages (they ship TypeScript source directly)
  transpilePackages: ["@outreach/shared", "@outreach/database", "@outreach/server"],

  // pg uses native Node.js features and must not be bundled by webpack
  serverExternalPackages: ["pg"],

  // Dynamically allow the active ngrok tunnel for HMR in development
  ...(ngrokOrigins.length > 0 && { allowedDevOrigins: ngrokOrigins }),

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
