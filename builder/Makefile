# Force bash so `set -o pipefail` works in the smoke-minjs recipe below.
SHELL := bash
.SHELLFLAGS := -eo pipefail -c

# Tests live beside the sources, so the library inputs are the src/ files
# with the test files filtered back out.
SRC := $(filter-out %.test.ts,$(wildcard ../src/*.ts))
TEST_SRC := $(wildcard ../src/*.test.ts)
CLI_SRC := $(wildcard ../bin/*.ts)
TYPES := $(wildcard ../types/*.d.ts)
BUILDER_SRC := $(wildcard ./*.ts)
BROWSER_SRC := $(wildcard ../browser/*.cjs)

PKG_DST := ../dist/package.json
MJS_DST := ../dist/html-slim.mjs
CJS_DST := ../dist/html-slim.cjs
MINJS_DST := ../dist/html-slim.min.js
CLI_DST := ../bin/html-slim.cli.js
TEST_DST := ../browser/tests/bundled.js
TESTS_DST := ../builder/tests/bundled.js

MJS_CONFIG := ./rollup-mjs.config.ts
CJS_CONFIG := ./rollup-cjs.config.ts
MINJS_CONFIG := ./rollup-minjs.config.ts
CLI_CONFIG := ./rollup-cli.config.ts
TEST_CONFIG := ./rollup-test.config.ts
TESTS_CONFIG := ./rollup-tests.config.ts

# Documented runtime named export that must be verified in every bundle.
NAMED_EXPORTS := slim

# Every target gets its own cap because each bundle has a different
# legitimate shape. The .mjs/.cjs pair externalizes `dependencies`, so
# these two only ever hold this package's own code — six figures here
# would mean htmlparser2 and friends leaked in.
MJS_MAX_BYTES := 12000
CJS_MAX_BYTES := 12000

# The browser bundle inlines `dependencies` on purpose: nothing resolves
# node_modules at the other end. The cap therefore guards against
# unexpected growth rather than against a dep leak.
MINJS_MAX_BYTES := 130000

# The CLI externalizes both `dependencies` and the package itself, so it
# carries little more than argv handling.
CLI_MAX_BYTES := 8000

# The browser test bundle inlines the test sources plus the node:test and
# node:assert shims. The package is externalized through
# browser/import.cjs so it does not count toward this.
TEST_MAX_BYTES := 30000

ALL := $(MJS_DST) $(CJS_DST) $(MINJS_DST) $(CLI_DST) $(TEST_DST) $(TESTS_DST)

# Build/test paths require Node's native TypeScript type-strip (default on
# Node 22.18+). Older runtimes (e.g. Node 20) report BUILDABLE=NO and can
# still verify pre-built bundles via `make smoke`.
BUILDABLE := $(shell node -e 'console.log(process.features.typescript ? "YES" : "NO")')

####

# Build all artifacts.
all: is-buildable $(ALL)

# Gate consumed by `all` and `npm prepack`: fail loudly unless type-strip
# is available and this is not a NODE_ENV=production install.
is-buildable:
	@ [ "$(BUILDABLE)" = "YES" ] && [ "$(NODE_ENV)" != "production" ]

# Inverse gate used by `npm prepare`: skip build/test without type-strip
# or under NODE_ENV=production; build manually in those environments.
is-not-buildable:
	@ [ "$(BUILDABLE)" != "YES" ] || [ "$(NODE_ENV)" = "production" ]

$(MJS_DST): $(MJS_CONFIG) $(SRC) $(BUILDER_SRC)
	@mkdir -p $(dir $@)
	../node_modules/.bin/rollup -c $<
	@ls -l $@
	@test "$$(wc -c < $@)" -le $(MJS_MAX_BYTES) || { echo "ERROR: $@ exceeds $(MJS_MAX_BYTES) byte cap" >&2; exit 1; }
	@echo ""

$(CJS_DST): $(CJS_CONFIG) $(SRC) $(BUILDER_SRC)
	@mkdir -p $(dir $@)
	../node_modules/.bin/rollup -c $<
	@ls -l $@
	@test "$$(wc -c < $@)" -le $(CJS_MAX_BYTES) || { echo "ERROR: $@ exceeds $(CJS_MAX_BYTES) byte cap" >&2; exit 1; }
	@echo ""

$(MINJS_DST): $(MINJS_CONFIG) $(SRC) $(BUILDER_SRC) $(PKG_DST)
	@mkdir -p $(dir $@)
	../node_modules/.bin/rollup -c $<
	@ls -l $@
	@test "$$(wc -c < $@)" -le $(MINJS_MAX_BYTES) || { echo "ERROR: $@ exceeds $(MINJS_MAX_BYTES) byte cap" >&2; exit 1; }
	@echo ""

# The CLI resolves the library through the package name, so it needs the
# published entrypoints in place before it can be bundled.
$(CLI_DST): $(CLI_CONFIG) $(CLI_SRC) $(BUILDER_SRC) $(MJS_DST) $(CJS_DST)
	../node_modules/.bin/rollup -c $<
	@chmod +x $@
	@ls -l $@
	@test "$$(wc -c < $@)" -le $(CLI_MAX_BYTES) || { echo "ERROR: $@ exceeds $(CLI_MAX_BYTES) byte cap" >&2; exit 1; }
	@echo ""

$(PKG_DST):
	@mkdir -p $(dir $@)
	echo '{"type":"commonjs"}' > $@
	@ls -l $@
	@echo ""

# Browser test bundle loaded by browser/tests.html
$(TEST_DST): $(TEST_CONFIG) $(SRC) $(BUILDER_SRC) $(TEST_SRC) $(BROWSER_SRC) $(MINJS_DST)
	@mkdir -p $(dir $@)
	../node_modules/.bin/rollup -c $<
	@ls -l $@
	@test "$$(wc -c < $@)" -le $(TEST_MAX_BYTES) || { echo "ERROR: $@ exceeds $(TEST_MAX_BYTES) byte cap" >&2; exit 1; }
	@echo ""

# Plain-JS bundle of the test suites, importing the package by name.
# Runs against dist/ on any supported Node runtime without type-strip.
$(TESTS_DST): $(TESTS_CONFIG) $(SRC) $(BUILDER_SRC) $(TEST_SRC) $(MJS_DST)
	@mkdir -p $(dir $@)
	../node_modules/.bin/rollup -c $<
	@ls -l $@
	@test "$$(wc -c < $@)" -le $(TEST_MAX_BYTES) || { echo "ERROR: $@ exceeds $(TEST_MAX_BYTES) byte cap" >&2; exit 1; }
	@echo ""

####

# Verify the bundles by importing/requiring the package itself, which
# exercises the exports/main mapping a consumer would take.
smoke: smoke-mjs smoke-cjs smoke-minjs smoke-cli

smoke-mjs: $(MJS_DST)
	cd .. && node --input-type=module -e 'const m = await import("html-slim"); for (const k of process.argv.slice(1)) { if (typeof m[k] !== "function") { console.error("missing MJS export:", k); process.exit(1); } console.log("MJS export OK:", k); }' $(NAMED_EXPORTS)

smoke-cjs: $(CJS_DST)
	cd .. && node --input-type=commonjs -e 'const m = require("html-slim"); for (const k of process.argv.slice(1)) { if (typeof m[k] !== "function") { console.error("missing CJS export:", k); process.exit(1); } console.log("CJS export OK:", k); }' $(NAMED_EXPORTS)

# Smoke the .min.js in two consumer shapes: the browser IIFE global and
# a CJS require(), since the bundle is intentionally dual-use.
smoke-minjs: $(MINJS_DST) $(PKG_DST)
	(cat $< && echo '; if (typeof slim !== "function") { console.error("missing browser global: slim"); process.exit(1); } console.log("browser export OK: slim")') | node -
	cd .. && node --input-type=commonjs -e 'const m = require("./dist/html-slim.min.js"); for (const k of process.argv.slice(1)) { if (typeof m[k] !== "function") { console.error("missing minjs CJS export:", k); process.exit(1); } console.log("minjs CJS export OK:", k); }' $(NAMED_EXPORTS)

# The CLI is the only artifact a consumer executes, so run it end to end.
# Comment removal is on by default, which makes for an unambiguous check.
smoke-cli: $(CLI_DST)
	cd .. && echo '<p>a</p><!-- c -->' | node $(patsubst ../%,%,$(CLI_DST)) | grep -qx '<p>a</p>'
	@echo "CLI OK"

####

# Consumer `npm install` skips the heavy test-full step to keep install fast.
test:
	@case "$$npm_command" in \
		install|ci) echo "npm $$npm_command detected: skipping full tests." ;; \
		*) $(MAKE) test-full ;; \
	esac

test-full: all
	cd .. && node_modules/.bin/tsc --noEmit
	cd .. && node_modules/.bin/ts-refine format --check && node_modules/.bin/ts-refine imports --check
	cd .. && node --test src/*.test.ts

# Run the bundled suites against dist/. CI uses this to cover runtimes
# older than the build requirement, where the .ts sources cannot run.
test-bundled: $(TESTS_DST) smoke
	cd .. && REPEAT=$${REPEAT:-1} node --test builder/tests/bundled.js

####

clean:
	/bin/rm -fr $(ALL)

.PHONY: all clean test smoke smoke-mjs smoke-cjs smoke-minjs smoke-cli test-full test-bundled is-buildable is-not-buildable
