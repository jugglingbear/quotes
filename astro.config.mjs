import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://jugglingbear.github.io",
  base: "/quotes",
  output: "static",
  trailingSlash: "always",
});
