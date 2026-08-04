.DEFAULT_GOAL := help

SHELL := /bin/bash
PNPM ?= pnpm
NODE_MIN_VERSION := 22.12.0
NODE_HOMEBREW_FORMULA := node@24
PNPM_VERSION := 11.9.0
LOCAL_SITE_URL := http://127.0.0.1:4321/quotes/

.PHONY: help install serve-local status-local stop-local build preview lint check publish clean

##@ General

help: ## Show this help message.
	@printf "\n\033[1mQuotes Vault — available targets:\033[0m\n"
	@awk 'BEGIN {FS = ":.*?## "} \
		/^##@ / { printf "\n\033[1;38;5;208m%s\033[0m\n", substr($$0, 5); next } \
		/^[a-zA-Z0-9_-]+:.*?## / { printf "  \033[97m%-22s\033[0m %s\n", $$1, $$2 }' \
		$(MAKEFILE_LIST)
	@printf "\n"

##@ Setup

install: ## Check prerequisites and install the site dependencies.
	@set -euo pipefail; \
	missing=(); \
	node_state="ok"; \
	pnpm_state="ok"; \
	if ! command -v node >/dev/null 2>&1; then \
		node_state="missing"; \
		missing+=("Node.js $(NODE_MIN_VERSION) or newer"); \
	else \
		node_version="$$(node --version)"; \
		node_version="$${node_version#v}"; \
		IFS=. read -r node_major node_minor node_patch <<< "$$node_version"; \
		if (( node_major < 22 || (node_major == 22 && node_minor < 12) )); then \
			node_state="incompatible"; \
			missing+=("Node.js $(NODE_MIN_VERSION) or newer (found v$$node_version)"); \
		fi; \
	fi; \
	if ! command -v pnpm >/dev/null 2>&1; then \
		pnpm_state="missing"; \
		missing+=("pnpm $(PNPM_VERSION)"); \
	elif ! pnpm_version="$$(pnpm --version 2>/dev/null)"; then \
		pnpm_state="broken"; \
		missing+=("a working pnpm $(PNPM_VERSION) installation"); \
	elif [[ "$$pnpm_version" != "$(PNPM_VERSION)" ]]; then \
		pnpm_state="incompatible"; \
		missing+=("pnpm $(PNPM_VERSION) (found $$pnpm_version)"); \
	fi; \
	if (( $${#missing[@]} > 0 )); then \
		printf "\033[33mMissing or incompatible prerequisites:\033[0m\n"; \
		printf "  - %s\n" "$${missing[@]}"; \
	fi; \
	if [[ "$$node_state" != "ok" ]]; then \
		if [[ "$$(uname -s)" != "Darwin" ]]; then \
			printf "\033[31m❌ Automatic Node.js installation is currently supported only on macOS.\033[0m\n" >&2; \
			exit 1; \
		fi; \
		if ! command -v brew >/dev/null 2>&1; then \
			printf "\033[31m❌ Homebrew is required to install Node.js automatically.\033[0m\n" >&2; \
			printf "Install Homebrew from https://brew.sh/ and run make install again.\n" >&2; \
			exit 1; \
		fi; \
		printf "Install and link Node.js 24 LTS with Homebrew? [y/N] "; \
		if ! read -r response; then response=""; fi; \
		case "$$response" in \
			y|Y|yes|YES) \
				printf "\033[33m🔄 Installing Node.js 24 LTS…\033[0m\n"; \
				brew install $(NODE_HOMEBREW_FORMULA); \
				brew link --overwrite --force $(NODE_HOMEBREW_FORMULA); \
				hash -r; \
				;; \
			*) \
				printf "\033[31m❌ Node.js installation declined; dependencies were not installed.\033[0m\n" >&2; \
				exit 1; \
				;; \
		esac; \
	fi; \
	if [[ "$$pnpm_state" != "ok" ]]; then \
		printf "Install pnpm $(PNPM_VERSION) globally with npm? [y/N] "; \
		if ! read -r response; then response=""; fi; \
		case "$$response" in \
			y|Y|yes|YES) \
				printf "\033[33m🔄 Installing pnpm $(PNPM_VERSION)…\033[0m\n"; \
				npm install --global "pnpm@$(PNPM_VERSION)"; \
				hash -r; \
				;; \
			*) \
				printf "\033[31m❌ pnpm installation declined; dependencies were not installed.\033[0m\n" >&2; \
				exit 1; \
				;; \
		esac; \
	fi; \
	printf "\033[33m🔄 Installing site dependencies…\033[0m\n"; \
	$(PNPM) install --frozen-lockfile; \
	printf "\033[32m✅ Site dependencies installed.\033[0m\n"

##@ Development

serve-local: install ## Run the development site at http://127.0.0.1:4321/quotes/.
	@set -euo pipefail; \
	if ! status="$$(ASTRO_TELEMETRY_DISABLED=1 $(PNPM) exec astro dev status 2>&1)"; then \
		printf "\033[31m❌ Unable to check the local development server.\033[0m\n" >&2; \
		printf "%s\n" "$$status" >&2; \
		exit 1; \
	fi; \
	if [[ "$$status" == *"No dev server is running."* ]]; then \
		printf "\033[33m🌐 Serving the development site at $(LOCAL_SITE_URL)…\033[0m\n"; \
		$(PNPM) run dev; \
	else \
		printf "\033[32m✅ The development site is already running at $(LOCAL_SITE_URL).\033[0m\n"; \
		printf "%s\n" "$$status"; \
	fi

status-local: install ## Show the local development server status.
	@printf "\033[33m🌐 Checking the local development server…\033[0m\n"
	@ASTRO_TELEMETRY_DISABLED=1 $(PNPM) exec astro dev status

stop-local: install ## Stop the local development server.
	@printf "\033[33m🌐 Stopping the local development server…\033[0m\n"
	@ASTRO_TELEMETRY_DISABLED=1 $(PNPM) exec astro dev stop

##@ Build and quality

build: install ## Build the production site in dist/.
	@printf "\033[33m📦 Building the production site…\033[0m\n"
	@$(PNPM) run build
	@printf "\033[32m✅ Production build completed.\033[0m\n"

preview: build ## Preview the production build locally.
	@printf "\033[33m🌐 Previewing the production build…\033[0m\n"
	@$(PNPM) run preview

lint: install ## Lint changed Markdown files.
	@printf "\033[33m🧹 Linting changed Markdown files…\033[0m\n"
	@$(PNPM) run lint:markdown
	@printf "\033[32m✅ Markdown lint passed.\033[0m\n"

check: lint ## Validate Markdown, Astro, TypeScript, content, and the production build.
	@printf "\033[33m🧪 Checking Astro, TypeScript, and content…\033[0m\n"
	@$(PNPM) run check
	@printf "\033[33m📦 Verifying the production build…\033[0m\n"
	@$(PNPM) run build
	@printf "\033[32m✅ All checks passed.\033[0m\n"

##@ Publishing

publish: check ## Push a clean main branch to origin and trigger GitHub Pages.
	@if [[ -n "$$(git status --porcelain)" ]]; then \
		printf "\033[31m❌ The working tree must be clean before publishing.\033[0m\n" >&2; \
		exit 1; \
	fi
	@if [[ "$$(git branch --show-current)" != "main" ]]; then \
		printf "\033[31m❌ The main branch must be checked out before publishing.\033[0m\n" >&2; \
		exit 1; \
	fi
	@printf "\033[33m🌐 Publishing main to GitHub Pages…\033[0m\n"
	@git push origin main
	@printf "\033[32m✅ Pushed main; the GitHub Pages deployment was triggered.\033[0m\n"

##@ Maintenance

clean: ## Remove generated Astro output.
	@printf "\033[33m🧼 Removing generated Astro output…\033[0m\n"
	@rm -rf -- .astro dist
	@printf "\033[32m✅ Generated output removed.\033[0m\n"
