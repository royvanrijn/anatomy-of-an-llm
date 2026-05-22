import { defineConfig } from "astro/config";
import svelte from "@astrojs/svelte";

export default defineConfig({
  site: "https://www.royvanrijn.com",
  base: "/anatomy-of-an-llm",
  integrations: [svelte()]
});
