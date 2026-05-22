# Deploying To GitHub Pages

This project is static-first, so GitHub Pages is a good option for early reviewer access.

## 1) Decide your Pages mode

GitHub supports:

- **Project pages**: `https://<user>.github.io/<repo>/`
- **User/org pages**: `https://<user>.github.io/`

If you use **project pages**, you must set Astro `base` to `/<repo>/`.

## 2) Configure Astro base/site

Update `astro.config.mjs` to include `site` and `base`.

Example for project pages (`repo` = `TheAnatomyofanLLM`):

```js
import { defineConfig } from "astro/config";
import svelte from "@astrojs/svelte";

export default defineConfig({
  site: "https://<user>.github.io",
  base: "/TheAnatomyofanLLM",
  integrations: [svelte()]
});
```

For user/org pages, use:

```js
site: "https://<user>.github.io",
base: "/"
```

## 3) Add GitHub Actions workflow

Create `.github/workflows/deploy-pages.yml`:

```yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run generate:data
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

## 4) Enable Pages in repository settings

1. Go to `Settings -> Pages`.
2. Under **Build and deployment**, choose **GitHub Actions**.

## 5) Push and verify

Push to `main`.  
After the workflow passes, open your Pages URL and validate:

- chapter navigation links
- static assets paths
- interactive islands hydration

## Reviewer tip

For early reviews, include a short disclaimer in the site (`BETA`) and in the README that visuals and copy are still being refined.

