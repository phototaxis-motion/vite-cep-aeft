import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import htmlPlugin from "vite-plugin-html-config";

// https://github.com/ahwgs/vite-plugin-html-config
const htmlPluginConfig = {
  // Head links
  links: [
    // preload
    {
      rel: "preload",
      href: "index.js",
    },
    {
      rel: "stylesheet",
      href: "./assets/index.css",
    },
  ],

  // Body scripts
  scripts: [
    `window.onerror = function (message, source, lineno, colno, error) {
      alert("Error: " + message + " in " + source + " at line " + lineno + " column " + colno);
      return false;
    };
    `,
    {
      src: "./assets/index.js",
      type: "text/javascript",
    },
  ],
};
// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        format: "iife",
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`,
      },
    },
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  plugins: [vue(), htmlPlugin(htmlPluginConfig)],
});
