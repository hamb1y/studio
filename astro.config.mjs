// @ts-check
import { defineConfig } from "astro/config";

// One static page. No integrations are needed: styling is plain CSS and the
// only client code is two small vanilla scripts (the hero rig and the estimator).
export default defineConfig({
  site: "https://studio.rishimalnad.dev",
  output: "static",
  build: {
    // Small stylesheets are inlined into the HTML to save a request.
    inlineStylesheets: "auto",
  },
  compressHTML: true,
});
