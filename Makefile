#!/usr/bin/env bash -c make

ALL = src/html-slim.js src/html-slim.test.js

all: $(ALL)
	make -C cjs $@
	make -C browser $@

# Consumer `npm install` and `npm ci` skip the heavy test-full step.
# CI re-runs `npm test` explicitly so the validation appears in logs.
test:
	@case "$$npm_command" in \
		install|ci) echo "npm $$npm_command detected: skipping full tests." ;; \
		*) $(MAKE) test-full ;; \
	esac

test-full: all
	./node_modules/.bin/ts-refine format --check && ./node_modules/.bin/ts-refine imports --check
	node --test src/*.test.js
	make -C cjs test
	@echo 'open browser/test.html'

clean:
	/bin/rm -fr $(ALL)
	make -C cjs $@
	make -C browser $@

%.js: %.ts
	./node_modules/.bin/tsc -p .

.PHONY: all clean test test-full
