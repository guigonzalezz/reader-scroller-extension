import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { copyFileSync, mkdirSync, existsSync, cpSync, writeFileSync, readFileSync } from "fs";

// Plugin to copy extension files after build
function copyExtensionFiles() {
  return {
    name: "copy-extension-files",
    closeBundle() {
      const distDir = resolve(__dirname, "dist");

      // Copy manifest.json
      copyFileSync(
        resolve(__dirname, "src/manifest.json"),
        resolve(distDir, "manifest.json"),
      );

      // Copy images folder
      const imagesDir = resolve(distDir, "images");
      if (!existsSync(imagesDir)) {
        mkdirSync(imagesDir, { recursive: true });
      }

      const srcImages = resolve(__dirname, "images");
      if (existsSync(srcImages)) {
        cpSync(srcImages, imagesDir, { recursive: true });
      }

      // Create popup.html that references the built files
      const popupHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Reader Tools</title>
    <link rel="stylesheet" href="popup.css" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="popup.js"></script>
  </body>
</html>`;
      writeFileSync(resolve(distDir, "popup.html"), popupHtml);
    },
  };
}

export default defineConfig({
  plugins: [react(), copyExtensionFiles()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, "src/popup/main.tsx"),
        "content-script": resolve(__dirname, "src/content/content-script.ts"),
      },
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "chunks/[name]-[hash].js",
        assetFileNames: "[name][extname]",
      },
    },
  },
});
