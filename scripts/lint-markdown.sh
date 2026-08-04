#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

readonly config_file=".markdownlint.json"
declare -a markdown_files=()

append_unique_file() {
    local candidate="$1"
    local existing

    for existing in "${markdown_files[@]-}"; do
        if [[ "$candidate" == "$existing" ]]; then
            return
        fi
    done

    markdown_files+=("$candidate")
}

collect_files() {
    local file

    while IFS= read -r -d '' file; do
        append_unique_file "$file"
    done
}

if (( $# > 0 )); then
    for file in "$@"; do
        append_unique_file "$file"
    done
else
    collect_files < <(git diff --name-only --diff-filter=ACMR -z -- '*.md')
    collect_files < <(git diff --cached --name-only --diff-filter=ACMR -z -- '*.md')
    collect_files < <(git ls-files --others --exclude-standard -z -- '*.md')

    if (( ${#markdown_files[@]} == 0 )); then
        collect_files < <(git diff-tree --root --no-commit-id --name-only --diff-filter=ACMR -r -z HEAD -- '*.md')
    fi
fi

if (( ${#markdown_files[@]} == 0 )); then
    printf 'No Markdown files to lint.\n'
    exit 0
fi

pnpm exec markdownlint-cli2 --config "$config_file" "${markdown_files[@]}"
