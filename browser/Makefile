#!/usr/bin/env bash -c make

all: dist test

dist: ../dist/html-slim.min.js

test: dist ../build/html-slim.browser.js ../build/test.browser.js ../build/chai.browser.js

clean:
	/bin/rm -fr ../dist/ ../build/

../dist/html-slim.min.js: ../build/html-slim.browser.js
	mkdir -p ../dist
	../node_modules/.bin/terser -c -m --ecma 6 -o $@ $<
	@ls -l $@
	[ "$$(wc -c < $@)" -lt 100000 ]
	@echo ""

../build/html-slim.browser.js: html-slim.entry.mjs ../src/html-slim.js
	../node_modules/.bin/rollup $< --file $@ --format iife --name slim \
	    --plugin @rollup/plugin-commonjs \
	    --plugin @rollup/plugin-node-resolve

../build/test.browser.js: rollup.config.mjs ../src/html-slim.test.js Makefile
	../node_modules/.bin/rollup -c $<
	@ls -l $@

../build/chai.browser.js: ../node_modules/chai/register-assert.js ../node_modules/chai/index.js
	@mkdir -p $(dir $@)
	../node_modules/.bin/rollup --input $< --format iife --file $@
	@ls -l $@
	[ "$$(wc -c < $@)" -lt 200000 ]
	@echo ""

.PHONY: all clean test
