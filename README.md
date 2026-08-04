# Quotes Vault

A curated collection of memorable quotes from books, games, comics, and life.

This repository is maintained as an **Obsidian vault**, where each quote is stored as an individual Markdown note with YAML frontmatter tags. The collection spans novels, science fiction, fantasy, philosophy, non-fiction, video games, and personal memories.

---

## Structure

```text
vault/
  quotes/   ← quote files (Markdown + YAML frontmatter)
  authors/  ← auto-generated author pages
tags.md     ← tag inventory with counts and descriptions
```

Each quote file contains YAML frontmatter with tags, an author wikilink, a source work, and the quoted text:

```yaml
---
tags: [funny, clever]
---
Author: [[Patrick Rothfuss]]
Book: [[The Name of the Wind]]

"Quoted text here."
```

Author pages are **auto-generated** and contain tag breakdowns, primary vibes, and works with wikilinked quotes.

---

## Tag System

18 tags organized into five categories. See [`tags.md`](tags.md) for full descriptions and counts.

| Category  | Tags                                      |
|-----------|-------------------------------------------|
| Tone      | funny, crude, dark, angry                 |
| Depth     | profound, clever, insightful              |
| Emotional | inspiring, romantic, sad, comforting      |
| Subject   | insult, faith, family, death, craft       |
| Meta      | favorite, personal                        |

---

## Using the Vault

### Open with Obsidian

1. Clone the repo
2. Open it as an Obsidian vault
3. Browse or search quotes — author pages and wikilinks connect everything

### Browse on GitHub

Each quote is stored in an individual Markdown file for easy reading.

### Browse on the web

The repository includes an Astro site with full-text search and filters for authors, books, sources, and tags. The
site is built from the files in `vault/quotes/`; no separate database or copied quote collection is maintained.

Run `make install` to check the required Node.js and pnpm versions and install the site dependencies. On macOS,
the command can install missing or incompatible prerequisites after asking for confirmation before each system
change. Then use the remaining Makefile commands:

```bash
make install
make help
make serve-local
```

The local site is available at [http://127.0.0.1:4321/quotes/](http://127.0.0.1:4321/quotes/).
Repeated `make serve-local` calls report the existing server instead of starting a duplicate. Use `make status-local`
to inspect it and `make stop-local` to stop it.

To validate a production build:

```bash
make check
```

After committing changes on a clean `main` branch, publish them with:

```bash
make publish
```

`make publish` validates the site and pushes `main` to `origin`. The GitHub Pages workflow then builds and deploys
the site. In the repository's GitHub Pages settings, select **GitHub Actions** as the publishing source the first time.

---

## GitHub Copilot Commands

This repo includes custom instructions for GitHub Copilot (in `.github/copilot-instructions.md`). The following commands are available in Copilot Chat:

### "Sync the repo"

Regenerates all derived files from the quote source files:

1. **Rebuilds `tags.md`** — rescans all quotes, updates tag counts, flags unknown tags
2. **Reconciles all `vault/authors/` pages** — rewrites existing pages in place, creates missing pages, and reports
   obsolete pages for explicit deletion approval

Run this after adding, editing, or removing quote files.

### "Add a quote"

Copilot will create a new quote file in `vault/quotes/` with proper frontmatter, tags from the 18-tag system, author wikilink, and source work.

---

## Copyright and Fair Use

All quotations remain the **copyright of their respective authors and publishers**.

Quotes are included here under **fair use** for purposes of reference, scholarship, commentary, and literary appreciation. No attempt is made to reproduce substantial portions of any copyrighted work.

The **structure, formatting, and metadata** of this repository are licensed under the repository license.

---

## License

See the `LICENSE` file for details.

The license applies to the **repository structure and original content**, not to the quoted works themselves.
