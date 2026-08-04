# Markdown Standards

**All generated Markdown** must be free of linting errors whenever possible.

---

## Line Length

- **120 characters maximum**
- Reflow long lines to stay within limit
- Break at logical points (after sentences, before lists, etc.)

---

## Formatting Rules

### Headings (MD022)

- **Must be surrounded by blank lines**
- Example:

  ```markdown
  Some paragraph text.

  ## Section Heading

  More paragraph text.
  ```

### Lists (MD032)

- **Must be surrounded by blank lines**
- Example:

  ```markdown
  Some paragraph text.

  - List item 1
  - List item 2
  - List item 3

  More paragraph text.
  ```

### URLs (MD034)

- **Use proper Markdown link syntax** `[text](url)`
- **Do NOT use bare URLs**
- Example:

  ```markdown
  <!-- Correct -->
  See the [documentation](https://example.com/docs) for details.

  <!-- Incorrect -->
  See https://example.com/docs for details.
  ```

---

## Validation & Fixing

### Direct Linting Command (RECOMMENDED)

**Use this command to check markdown files for linting errors:**

```bash
pnpm exec markdownlint-cli2 --config .markdownlint.json <filename>.md
```

This directly invokes markdownlint-cli2 and shows all errors with line numbers and rule codes.

**Example:**

```bash
pnpm exec markdownlint-cli2 --config .markdownlint.json README.md
```

### Changed-File Linting

Run the package script directly or use the Makefile target. When the worktree is clean, these commands validate the
Markdown files changed by the newest commit:

```bash
pnpm run lint:markdown
make lint
```

`make check` also runs Markdown linting before the Astro and production-build checks.

### What the Linter Checks

The markdownlint-cli2 tool enforces:

- Line length ≤ 120 characters (MD013)
- Headings surrounded by blank lines (MD022)
- Lists surrounded by blank lines (MD032)
- Code blocks surrounded by blank lines (MD031)
- Proper table formatting (MD055, MD056)
- Consistent strong/emphasis style (MD050)
- Proper EOF newlines

---

## VS Code Linting

The VS Code `markdownlint` extension (DavidAnson.vscode-markdownlint) provides real-time linting feedback during
editing. Configuration is in `.markdownlint.json`.

**After generating or editing Markdown files, check for and fix all linting errors shown in VS Code before
proceeding.**

---

## Quick Checklist

Before submitting Markdown files, verify:

- [ ] Lines are ≤ 120 characters
- [ ] Headings surrounded by blank lines (MD022)
- [ ] Lists surrounded by blank lines (MD032)
- [ ] URLs use `[text](url)` syntax (MD034)
- [ ] No trailing whitespace
- [ ] File ends with exactly one newline
- [ ] No markdownlint errors in VS Code
- [ ] `make lint` passes
