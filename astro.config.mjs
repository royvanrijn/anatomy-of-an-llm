import { defineConfig } from "astro/config";
import svelte from "@astrojs/svelte";

export default defineConfig({
  site: "https://royvanrijn.github.io",
  base: "/TheAnatomyofanLLM",
  integrations: [svelte()]
});
