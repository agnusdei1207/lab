# Quartz v5 Research Portal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current hand-written portal with a Quartz v5 site whose home page lists research domains and whose domain pages list their studies.

**Architecture:** Vendor the official Quartz v5 project structure into the existing repository, place all published material under `content/`, and configure the Obsidian-oriented template for search, backlinks, and graph navigation. GitHub Actions builds the site for the existing `/lab/` GitHub Pages path.

**Tech Stack:** Quartz v5, TypeScript, Node.js 22+, npm 10.9.2+, Markdown, GitHub Actions, GitHub Pages

**Spec:** `docs/superpowers/specs/2026-08-31-quartz-v5-research-portal-design.md`

## Global Constraints

- Preserve the public URL `https://agnusdei1207.github.io/lab/`.
- Preserve all existing research Markdown content and image assets.
- The home page shows four domain entries, not an undifferentiated research list.
- Domain pages link to individual research documents.
- Research pages expose search, backlinks, and graph navigation.
- Light and dark modes use an icon toggle; interactive transitions are consistent and respect `prefers-reduced-motion`.
- Do not add a web editor, database, accounts, comments, or server-side search.

---

### Task 1: Install the Quartz v5 foundation

**Files:**
- Create/Modify: Quartz v5 runtime, configuration, package, and workflow files at repository root
- Preserve: `docs/superpowers/**`
- Test: `tests/portal.test.mjs`

**Interfaces:**
- Consumes: official `jackyzha0/quartz` branch `v5`
- Produces: an npm project where `npx quartz build` emits the static site

- [ ] Check `node --version`, `npm --version`, and the clean Git worktree.
- [ ] Fetch the official Quartz v5 source into a temporary directory and copy its tracked runtime files into the repository without copying its `.git` directory.
- [ ] Set `baseUrl` to `agnusdei1207.github.io/lab`, choose Obsidian-compatible link resolution, and set the site title and locale for the research archive.
- [ ] Install dependencies with the lockfile and run `npx quartz build`.
- [ ] Commit the working Quartz foundation.

### Task 2: Migrate research content into domain folders

**Files:**
- Create: `content/index.md`
- Create: `content/에이전트-보안/index.md`
- Create: `content/rag-컨텍스트/index.md`
- Create: `content/ai-모델-보호/index.md`
- Create: `content/플랫폼-평가/index.md`
- Move: existing dated research folders and their images into the matching domain directories
- Test: `tests/portal.test.mjs`

**Interfaces:**
- Consumes: existing six `연구결과.md` files and adjacent PNG assets
- Produces: four linked domain indexes and six publishable research documents

- [ ] Update the portal test to assert the four domain links and every migrated study path.
- [ ] Run `node --test tests/portal.test.mjs` and verify it fails against the unmigrated content tree.
- [ ] Create the concise home page and domain index Markdown files with descriptions and research links.
- [ ] Move each study and its images into the matching domain folder; add consistent title, description, tags, date, and publish frontmatter without changing the report body.
- [ ] Add a small number of meaningful cross-study links so backlinks and the graph contain useful edges.
- [ ] Run the portal test and Quartz production build, then commit the migrated content.

### Task 3: Shape the home, domain, and research layouts

**Files:**
- Modify: `quartz.config.yaml`
- Modify/Create: Quartz custom style or component files selected by the v5 template
- Test: `tests/portal.test.mjs`

**Interfaces:**
- Consumes: the domain hierarchy from Task 2
- Produces: a sparse domain landing page and full research navigation on inner pages

- [ ] Extend the test to assert that the home frontmatter selects the minimal landing layout and that research pages retain graph/backlink components.
- [ ] Run the focused test and verify the new layout assertions fail.
- [ ] Configure the home layout to hide explorer, recent notes, and the global graph while retaining the title, introduction, and domain cards.
- [ ] Configure inner pages with search, table of contents, backlinks, and local/global graph access; add minimal responsive card styling.
- [ ] Add shared motion tokens and icon-toggle styling for cards, links, search, popovers, and graph controls, with a reduced-motion override.
- [ ] Run the tests and Quartz production build, inspect the emitted home and one study HTML file, then commit.

### Task 4: Configure and verify GitHub Pages deployment

**Files:**
- Create/Modify: `.github/workflows/deploy.yml`
- Modify: `README.md`
- Test: generated `public/` output and GitHub Actions configuration

**Interfaces:**
- Consumes: `npm ci` and `npx quartz build`
- Produces: GitHub Pages deployment from `main` at `/lab/`

- [ ] Configure the workflow with Node.js 22, Pages artifact upload, and Pages deployment permissions.
- [ ] Replace the corrupted legacy README with UTF-8 Korean instructions for adding studies and previewing the site.
- [ ] Run `npm ci`, `node --test tests/portal.test.mjs`, and `npx quartz build` from a clean dependency install.
- [ ] Verify generated asset and internal links retain the `/lab/` base path and run `git diff --check`.
- [ ] Commit deployment documentation, push `main` to `origin`, and inspect the workflow result and published site.
