# AGENTS.md — Generic Agent Instructions

This file is the **agent-agnostic** source of truth for AI coding assistants working in this
repository (Copilot, Claude Code, Cursor, Aider, Codex, Continue, etc.). Tool-specific extensions,
if any, live alongside it (e.g. `.github/copilot-instructions.md`, `.github/instructions/*.md`).

---

## Project Overview

- **What this is:** A curated Obsidian vault of memorable quotes from published works and personal life.
- **Primary languages:** Markdown and YAML for vault content; Astro, TypeScript, and CSS for the web UI;
  Python is used for maintenance automation.
- **Package/build tooling:** Obsidian for vault management; Astro and pnpm for the web UI; GitHub Actions
  deploys the site to GitHub Pages.
- **Linters / formatters:** markdownlint-cli2, configured by `.markdownlint.json`; Astro and TypeScript
  validation runs through `astro check`.
- **Test framework:** No formal test suite; `make check` runs Astro, TypeScript, content, and production-build
  validation, while synchronization includes structural and count validation.
- **Docs:** `README.md`, `docs/`, `tags.md`, and `.github/copilot-instructions.md`.

## Repository Layout and Workflows

- `vault/quotes/` contains the source-of-truth quote notes.
- `vault/authors/` contains derived author indexes; reconcile them in place rather than deleting them first.
- `tags.md` is the derived tag inventory and must agree with the quote frontmatter.
- `vault/.obsidian/` contains the shared Obsidian vault configuration.
- `docs/` contains project documentation that does not belong inside the vault.
- `src/` contains the Astro web UI, including pages, components, layouts, styles, and quote-data helpers.
- `.github/workflows/deploy-pages.yml` builds and deploys the web UI to GitHub Pages.
- Before adding a quote or synchronizing derived files, read `.github/copilot-instructions.md` for the complete
  project-specific format, tag vocabulary, reconciliation procedure, and validation steps.

---

## Interaction Conventions

- Be direct. Implement changes rather than only describing them when the intent is clear.
- Keep explanations brief; expand only for complex work or when asked.
- Do not auto-open generated files (reports, HTML) — just report the path.

---

## Git Usage Policy

You may use **read-only** git commands:

- `git status`, `git log`, `git show`, `git diff`, `git grep`, `git blame`

You are **NOT allowed** to modify repository state without explicit user request:

- `git add`, `git commit`, `git push`
- `git checkout -b`, branch creation/deletion, `git tag`
- `git restore`, `git checkout --`, `git reset`, `git revert`, `git clean`, `git stash`
- Any git command that writes, stages, commits, merges, rebases, pushes, or discards changes

Your role is to generate and edit code, not to apply it to version control or discard uncommitted work.

---

## File Deletion Policy

**Never delete a file without explicit per-file confirmation from the user**, even when
permissions allow it. Applies to `rm`, `git rm`, trash, and overwriting renames. No exceptions
for cleanup, migrated content, or "obvious" cases. A prior approved deletion does not authorize
the next one. Ask, wait for a clear "yes", then delete.

---

## Scratch / Temporary Files

- Put **all** transient files (ad-hoc scripts, extracted archives, intermediate JSON, captured
  tool output such as `lint_output.txt` or coverage snapshots) in a repo-local `temp/` directory.
- **Never** drop scratch files in the repo root or any source tree — they pollute `git status`.
- **Never use `/tmp/`** — editor workspace-trust gates make it painful, and secrets shouldn't leak
  outside the workspace. If a tool insists on writing to the cwd, `cd temp/` first or redirect.

---

## General File Standards (all file types)

- **No trailing whitespace** on any line.
- **Blank lines contain no spaces or tabs.**
- **Every file ends with exactly one newline.**
- Line-length limits (see per-language sections): default **120 characters**.
- New files must comply fully; for modified files, only the changed sections must comply
  (don't reflow unrelated lines unless asked).

---

## Python Standards

Applies to `**/*.py`.

### Linting & type checking

- All **new** code must pass the project's linters and type checker with **zero warnings/errors**
  (e.g. `ruff`, `flake8`, `pylint`, `mypy`).
- Run linters **separately**, not chained with `&&` — chaining can hang some terminals and hides
  which step failed.
- **Do not fix pre-existing lint errors** in untouched code unless explicitly requested.

### Style

- **Line length: 120 characters max.** Break long lines logically (arguments, method chains).
- **Type hints required** for all functions, methods, and class attributes.
- **Imports** grouped stdlib → third-party → local, blank line between groups (isort/ruff sorts).
- **Docstring indentation must be a multiple of 2 spaces** (2 or 4). Avoid odd-width (3-space)
  hanging indents — editor indent guides flag them.
- **No magic numbers/values** — use named enums/constants.
- Prefer a real CLI library (e.g. `click`) over `argparse` for new tools; set help width to 120.

### Testing

- Unit tests mirror the package structure under `tests/`.
- Tests must pass with no warnings before code is considered done.

---

## Markdown Standards

Applies to `**/*.md`. All generated Markdown should be lint-clean.

- Before generating or modifying Markdown, read `docs/markdown-standards.md` for the detailed formatting and
  validation workflow.

- **Line length: 120 characters max.** Reflow long lines at logical points.
- **Headings surrounded by blank lines** (MD022).
- **Lists surrounded by blank lines** (MD032).
- **Code blocks surrounded by blank lines** (MD031).
- **Separate consecutive bold/key-value lines with blank lines** — adjacent single-newline lines
  merge into one paragraph. This is the most common rendering bug:

  ```markdown
  <!-- Correct: each renders on its own line -->
  **Key:** value

  **Another:** value

  <!-- Incorrect: merges into one paragraph -->
  **Key:** value
  **Another:** value
  ```

- **Use link syntax** `[text](url)`, never bare URLs (MD034).
- **Mermaid diagrams:** wrap each block with per-block `<!-- markdownlint-disable MD013 -->` /
  `<!-- markdownlint-enable MD013 -->` directives, since diagram labels routinely exceed the line
  limit. Don't globally disable MD013 in code blocks.
- Validate one file with: `pnpm exec markdownlint-cli2 --config .markdownlint.json <file>.md`.
- Validate changed Markdown with: `pnpm run lint:markdown` or `make lint`.

---

## Shell Script Standards

Applies to `**/*.sh`, `**/*.bash`, `**/*.zsh`.

- **Shebang:** `#!/usr/bin/env bash` (prefer bash; use zsh/sh only when genuinely required).
- **Strict mode** at the top of new bash scripts:

  ```bash
  #!/usr/bin/env bash
  set -euo pipefail
  ```

  Add `IFS=$'\n\t'` when processing filenames/fields with possible spaces.

- **Lint clean** with `shellcheck` (no unexplained `# shellcheck disable=...`).
- **Always quote variables:** `"$var"`, `"${name}_suffix"`.
- Use `[[ ... ]]` over `[ ... ]`; use `$()` over backticks.
- Lowercase locals (declared `local`), UPPERCASE for env/exported vars.
- Print errors to stderr and exit non-zero. Trap cleanup for temp files.
- Don't `eval`, don't parse `ls`, don't `cat file | grep` (use `grep pattern file`).

---

## Makefile Standards

Applies to `**/Makefile`, `**/*.mk`.

- Include a **self-documenting `help` target** as the default goal (`.DEFAULT_GOAL := help`), with
  each user-facing target carrying an inline `## Description` comment rendered by an awk pass.
- Target names use **lowercase kebab-case** (`build-docs`, `run-tests`).
- Internal/helper targets get **no** `##` comment (keeps them out of the help listing).
- Standard targets to provide where relevant: `check`, `install`, `lint`, `test`, `coverage`,
  `build`, `clean`.
- Group user-facing targets under one or more **`##@ Section` headers**. Section headers are part of the
  standard help format and are required even for short Makefiles; use a single `##@ Commands` section when
  additional categories would add noise.

### Colorized self-documenting help

Every Makefile should render a scannable, colorized help listing when a user types `make` or
`make help`. Use a single awk pass over `$(MAKEFILE_LIST)` that walks targets in **source order**
(don't pipe through `sort` — it breaks source ordering and `##@` grouping):

```makefile
.DEFAULT_GOAL := help

##@ Commands

.PHONY: help
help:  ## Show this help message
	@printf "\n\033[1mProject Name — available targets:\033[0m\n"
	@awk 'BEGIN {FS = ":.*?## "} \
		/^##@ / { printf "\n\033[1;38;5;208m%s\033[0m\n", substr($$0, 5); next } \
		/^[a-zA-Z0-9_-]+:.*?## / { printf "  \033[97m%-22s\033[0m %s\n", $$1, $$2 }' \
		$(MAKEFILE_LIST)
	@printf "\n"
```

- Use **`printf`, never `echo`**, for ANSI escapes — `echo` behavior varies across shells and may
  print `\033` literally.
- Bump the `%-22s` column width if target names are longer.

### ANSI color scheme

| Code | Color | Usage |
|------|-------|-------|
| `\033[1m` | **Bold** | Top-level help banner (`Project — available targets:`) |
| `\033[0m` | Reset | End of styled text |
| `\033[1;38;5;208m` | Bold orange (256-color) | `##@` section headers in `make help` |
| `\033[97m` | Bright white | Target names in help |
| `\033[32m` | Green | Success messages |
| `\033[31m` | Red | Error messages |
| `\033[33m` | Yellow | Warnings |

Orange headers + bright-white target names is the standard scheme — warm, high-contrast, and
readable on both light and dark backgrounds. The `38;5;208` 256-color code works in every modern
terminal; fall back to plain `\033[33m` yellow only for known 16-color-only TTYs. Avoid
magenta/cyan for headers and targets (harder to read on light backgrounds).

### Emoji progress markers

Use emoji as visual markers in `@printf` output to make build progress scannable:

| Emoji | Meaning | Emoji | Meaning |
|-------|---------|-------|---------|
| ✅ | Success / check passed | 📦 | Building / packaging |
| ❌ | Failure / check failed | 🔄 | Reinstalling / refreshing |
| 🧪 | Running tests | 🌐 | Serving / networking |
| 🧹 | Linting / formatting | 🎯 | Coverage analysis |
| 🧼 | Cleaning artifacts | ☣️ | Destructive / cache-clearing |

### Upgrading an existing Makefile

When editing a Makefile that lacks the self-documenting help system, **ask the user first**. If
they agree: add the `help` target as the first target, set `.DEFAULT_GOAL := help`, add
`## Description` comments to user-facing targets, group those targets beneath `##@` section markers,
add missing `.PHONY` declarations, and verify the output (section headings bold orange, target names
bright white, all in source order).

---

## Tool-Failure / Partial-Data Policy

**Never proceed on assumptions when a tool fails or returns partial data.** If a tool crashes,
truncates output mid-record, returns a wrong-typed value, embeds an error in normal output, or
returns an empty result that "shouldn't" be empty — **stop and fix the gap** before continuing.
Order of preference:

1. Patch the tool so it produces clean output (durable fix).
2. Re-invoke with different flags (e.g. `--json` to bypass a broken text formatter).
3. Ask the user.

A wrong answer from incomplete context is worse than no answer — it anchors the user on bad
framing and wastes their time.

---

## Best Practices

1. **New/modified code must be lint-clean** — zero warnings/errors from the project's linters.
2. **Don't fix unrelated pre-existing issues** unless explicitly asked.
3. **Run the test suite after modifying library code.**
4. **Avoid over-engineering** — only change what's requested or clearly necessary. No speculative
   features, helpers, or abstractions for one-time use.
5. **Don't add comments/docstrings/type-annotations to code you didn't change.**
6. **Comment the WHY, not the WHAT** — skip comments that restate obvious code; explain non-obvious
   reasoning, quirks, races, or workarounds.
7. **Read files before editing them**; understand existing code before changing it.
8. **Prefer editing existing files** over creating new ones; don't create docs to describe changes
   unless requested.
9. **Never use `lang -c "..."` one-liners for non-trivial code** — the shell mangles quotes/`$()`.
   Use a heredoc with a quoted delimiter, or write a temp script, run it, then delete it.
10. **Confirm before destructive or hard-to-reverse actions** (deletes, force-push, dropping
    tables, `rm -rf`, modifying shared infra). Take local, reversible actions freely.
