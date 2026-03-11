# Copilot Instructions — Quotes Vault

## When to Consult Specialized Guides

**Before generating or modifying files**, read the relevant specialized guide:

- **Markdown files:** Read `.github/copilot-markdown.md` for formatting and validation rules


## Vault Structure

```
vault/
  quotes/   ← 254 quote files (Markdown + YAML frontmatter)
  authors/  ← 71 author pages (auto-generated)
tags.md     ← tag inventory with counts and descriptions
```

## Quote File Format

Every quote lives in `vault/quotes/`. Frontmatter uses **bracketed YAML tags only**:

```yaml
---
tags: [funny, clever]
---
Author: [[Patrick Rothfuss]]
Book: [[The Name of the Wind]]

"Quoted text here."
```

- The `Author:` line uses an Obsidian wikilink: `[[First Last]]`.
- Source fields vary: `Book:`, `Game:`, `Comic:`, `Source:`, `Developer:`, `Poet:`, etc.
- A few edge-case files lack an `Author:` line (e.g. dialogue format, personal memoir).

## Git Usage Policy

You may use **read-only** git commands for understanding the repository:

- `git status`, `git log`, `git show`, `git diff`, `git grep`, `git blame`

You are **NOT allowed** to modify repository state:

- ❌ `git add`, `git commit`, `git push`
- ❌ `git checkout -b` or creating new branches
- ❌ `git branch -D` or deleting branches
- ❌ `git tag` or creating/removing tags
- ❌ `git restore`, `git checkout --` or discarding changes
- ❌ `git reset`, `git revert`, `git clean` or modifying working directory
- ❌ Any `git` command that writes, stages, commits, merges, rebases, pushes, or discards changes

**Your role is to generate and edit code only**, never to apply those changes to version control or discard uncommitted work.

## Tag System (18 tags)

Only these tags are valid. See `tags.md` for full descriptions and counts.

| Category | Tags |
|----------|------|
| Tone | funny, crude, dark, angry |
| Depth | profound, clever, insightful |
| Emotional | inspiring, romantic, sad, comforting |
| Subject | insult, faith, family, death, craft |
| Meta | favorite, personal |

Assign **1–4 tags** per quote. Prefer specificity over volume.

## Author Page Format

Author pages live in `vault/authors/` with filename `First_M._Last.md` (spaces → underscores, periods preserved). Each page is **auto-generated** and should not be hand-edited. Format:

```markdown
# Display Name

**N quotes** from **M works**

## Tags

`tag1` (count) · `tag2` (count) · ...

*Primary vibes: top1, top2, top3*    ← only if author has 3+ quotes

## Works

### Book Title
*Source type* (only shown if not a Book)

- [[Quote title 1]]
- [[Quote title 2]]

### Other

- [[Standalone quote]]
```

- Works are grouped by the source field value (Book, Game, Comic, etc.).
- Quotes with no identified work go under **Other**.
- The "Primary vibes" line lists the top 3 tags by count for that author.
- Unknown or anonymous authors go in `Unknown_Author.md`.

## Sync Repo

When the user asks to **"sync the repo"** (or "sync", "update the repo", etc.), perform these steps:

### 1. Regenerate `tags.md`

Scan every `vault/quotes/*.md` file, extract the `tags: [...]` frontmatter, and rebuild `tags.md` with:
- Updated counts per tag
- Total quote count and average tags per quote
- Keep the existing category groupings (Tone / Depth / Emotional / Subject / Meta) and descriptions

If any tag appears in a quote file that is **not** in the 18-tag system, flag it as a warning.

### 2. Regenerate all `vault/authors/` pages

Delete all existing files in `vault/authors/`, then scan every `vault/quotes/*.md` file and rebuild each author page from scratch:

1. **Parse each quote file** to extract:
   - Tags from YAML frontmatter
   - Author name from `Author: [[Name]]` line (strip wikilink brackets)
   - Source work from `Book:`, `Game:`, `Comic:`, `Source:`, `Developer:`, `Poet:` lines (strip wikilink brackets)
   - Source type (the field name, e.g. "Game", "Comic" — default to "Book" if `Book:` is used)

2. **Group quotes by author**, then by work.

3. **Generate the author page** following the format above:
   - Filename: author name with spaces replaced by underscores (`_`), preserving dots and other punctuation
   - `???` or `Unknown` → `Unknown_Author.md`
   - Quote count, work count, tag breakdown sorted by count descending
   - "Primary vibes" line for authors with 3+ quotes (top 3 tags)
   - Works sections with H3 headings, source type annotation if not a Book, wikilinked quote titles
   - Quotes with no identified work go under `### Other`

4. **Report a summary**: number of author pages created, total quotes processed, any warnings (missing authors, unknown tags, etc.).

### Implementation Notes

- Use a Python script for the sync. Create it, run it, then delete it.
- The script should be idempotent — safe to run repeatedly.
- Do not modify any quote files during sync. Sync is read-only on quotes.
- Always validate the output: confirm file counts, spot-check a large author and a small one.

## Markdown Output Formatting

When the user asks for Markdown output to copy-paste, always wrap the entire block in **quadruple backticks**
(`` ```` ``) so that any triple-backtick fenced code blocks inside are preserved literally.

## Terminal Command Chaining

**Never chain terminal commands with `&&`** (e.g., `ruff check && mypy`). Chained commands can cause
the terminal to hang indefinitely. Always run each command as a separate invocation and wait for its
output before running the next.

## Safe Python Execution in the Terminal

**Never use `python3 -c "..."` for non-trivial commands.** The shell (zsh or bash) interprets double
quotes, `$()`, and backslashes before Python sees them, causing silent data corruption or syntax errors.

Instead, use one of these safe alternatives:

- **Heredoc** (preferred) — the single-quoted delimiter prevents all shell expansion:
  ```bash
  python3 << 'PYEOF'
  import json
  data = {"key": "value with $pecial chars"}
  print(json.dumps(data))
  PYEOF
  ```
- **Temporary file** — write a `.py` file via `create_file`, execute it, then delete it.

Reserve `python3 -c` only for trivial one-liners with no special characters in the data.

