# Force bash so `set -o pipefail` works in the recipes below.
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
MINJS_DST := ../dist/html-slim.min.js
CLI_DST := ../bin/html-slim.cli.js
BROWSER_TEST_DST := ../browser/tests/bundled.mjs
BUILDER_TEST_DST := ./tests/bundled.mjs

MJS_CONFIG := ./rollup-mjs.config.ts
MINJS_CONFIG := ./rollup-minjs.config.ts
CLI_CONFIG := ./rollup-cli.config.ts
BROWSER_TEST_CONFIG := ./rollup-browser-test.config.ts
BUILDER_TEST_CONFIG := ./rollup-builder-test.config.ts

MJS_MAX_BYTES := 10000
MINJS_MAX_BYTES := 110000
CLI_MAX_BYTES := 5000
TEST_MAX_BYTES := 30000

ALL := $(MJS_DST) $(MINJS_DST) $(CLI_DST)

# Build/test paths require Node's native TypeScript type-strip (default on
# Node 22.18+). Older runtimes (e.g. Node 20) report BUILDABLE=NO and can
# still verify pre-built bundles via the builder/pack targets.
BUILDABLE := $(shell node -e 'console.log(process.features.typescript ? "YES" : "NO")')

####

# Build all artifacts.
all: is-buildable $(ALL)

# Gate consumed by `all` and `npm prepack` so a build starts only where it
# can finish: with native type-strip and the devDependencies installed.
is-buildable:
	@ [ "$(BUILDABLE)" = "YES" ] && [ -f ../node_modules/.bin/rollup ]

# Inverse gate for `npm prepare`: a consumer install skips build/test and
# relies on prebuilt artifacts; contributors build on a capable runtime.
is-not-buildable:
	@ [ "$(BUILDABLE)" != "YES" ] || [ ! -f ../node_modules/.bin/rollup ]

$(MJS_DST): $(MJS_CONFIG) $(SRC) $(BUILDER_SRC)
	@mkdir -p $(dir $@)
	../node_modules/.bin/rollup -c $<
	@ls -l $@
	@test "$$(wc -c < $@)" -le $(MJS_MAX_BYTES) || { echo "ERROR: $@ exceeds $(MJS_MAX_BYTES) byte cap" >&2; exit 1; }
	@echo ""

$(MINJS_DST): $(MINJS_CONFIG) $(SRC) $(BUILDER_SRC) $(PKG_DST)
	@mkdir -p $(dir $@)
	../node_modules/.bin/rollup -c $<
	@ls -l $@
	@test "$$(wc -c < $@)" -le $(MINJS_MAX_BYTES) || { echo "ERROR: $@ exceeds $(MINJS_MAX_BYTES) byte cap" >&2; exit 1; }
	@echo ""

# The CLI resolves the library through the package name, so it needs the
# published entrypoints in place before it can be bundled.
$(CLI_DST): $(CLI_CONFIG) $(CLI_SRC) $(BUILDER_SRC) $(MJS_DST)
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

$(BROWSER_TEST_DST): $(BROWSER_TEST_CONFIG) $(SRC) $(BUILDER_SRC) $(TEST_SRC) $(BROWSER_SRC) $(MINJS_DST)
	@mkdir -p $(dir $@)
	../node_modules/.bin/rollup -c $<
	@ls -l $@
	@test "$$(wc -c < $@)" -le $(TEST_MAX_BYTES) || { echo "ERROR: $@ exceeds $(TEST_MAX_BYTES) byte cap" >&2; exit 1; }
	@echo ""

$(BUILDER_TEST_DST): $(BUILDER_TEST_CONFIG) $(SRC) $(BUILDER_SRC) $(TEST_SRC) $(MJS_DST)
	@mkdir -p $(dir $@)
	../node_modules/.bin/rollup -c $<
	@ls -l $@
	@test "$$(wc -c < $@)" -le $(TEST_MAX_BYTES) || { echo "ERROR: $@ exceeds $(TEST_MAX_BYTES) byte cap" >&2; exit 1; }
	@echo ""

####

# Consumer `npm install` skips the heavy test-full step to keep install fast.
# `npm pack` re-runs prepare for a fresh build; tests are skipped there too
# because CI runs them explicitly around the pack, while `npm publish`
# reports npm_command=publish and still gets the full run.
test:
	@case "$$npm_command" in \
		install|ci|pack) echo "npm $$npm_command detected: skipping full tests." ;; \
		*) $(MAKE) test-full ;; \
	esac

test-full: all
	cd .. && node_modules/.bin/tsc --noEmit
	cd .. && node_modules/.bin/ts-refine format --check && node_modules/.bin/ts-refine imports --check
	cd .. && node --test src/*.test.ts

####

clean:
	/bin/rm -fr $(ALL) $(BROWSER_TEST_DST) $(BUILDER_TEST_DST) $(PKG_DST)

.PHONY: all clean test test-full is-buildable is-not-buildable
