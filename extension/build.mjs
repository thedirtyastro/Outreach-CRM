/**
 * build.mjs — builds the extension using esbuild
 *
 * Usage:
 *   node build.mjs          # production build
 *   node build.mjs --watch  # watch mode
 *
 * Outputs compiled JS to extension/dist/
 * Copy popup.html + manifest.json + icons/ to dist/ manually or extend this script.
 */

import * as esbuild from "esbuild";
import { copyFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const isWatch = process.argv.includes("--watch");

const sharedConfig = {
  bundle: true,
  platform: "browser",
  target: "chrome120",
  format: /** @type {"esm"} */ ("esm"),
  minify: !isWatch,
  sourcemap: isWatch ? "inline" : false,
  outdir: join(__dirname, "dist"),
};

const entryPoints = [
  { in: join(__dirname, "popup.ts"),     out: "popup" },
  { in: join(__dirname, "content.ts"),   out: "content" },
  { in: join(__dirname, "background.ts"), out: "background" },
];

async function copyStaticFiles() {
  const distDir = join(__dirname, "dist");
  if (!existsSync(distDir)) mkdirSync(distDir, { recursive: true });

  copyFileSync(join(__dirname, "popup.html"),   join(distDir, "popup.html"));
  copyFileSync(join(__dirname, "manifest.json"), join(distDir, "manifest.json"));

  // Copy icons if they exist
  const iconsDir = join(__dirname, "icons");
  const distIconsDir = join(distDir, "icons");
  if (existsSync(iconsDir)) {
    if (!existsSync(distIconsDir)) mkdirSync(distIconsDir);
    for (const size of ["16", "32", "48", "128"]) {
      const src = join(iconsDir, `icon${size}.png`);
      if (existsSync(src)) {
        copyFileSync(src, join(distIconsDir, `icon${size}.png`));
      }
    }
  }
}

if (isWatch) {
  const ctx = await esbuild.context({ ...sharedConfig, entryPoints });
  await ctx.watch();
  await copyStaticFiles();
  console.log("Watching for changes…");
} else {
  await esbuild.build({ ...sharedConfig, entryPoints });
  await copyStaticFiles();
  console.log("Extension built → extension/dist/");
}
