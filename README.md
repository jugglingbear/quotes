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
