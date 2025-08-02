#!/usr/bin/env bash -c make

all: dist test

dist: ../dist/html-slim.min.js

test: dist ../build/html-slim.browser.js ../build/test.browser.js ../build/assert.browser.js

clean:
	/bin/rm -fr ../dist/ ../build/

../dist/html-slim.min.js: ../build/html-slim.browser.js
	mkdir -p ../dist
	../node_modules/.bin/terser -c -m --ecma 6 -o $@ $<

../build/html-slim.browser.js: html-slim.entry.mjs ../src/html-slim.js
	../node_modules/.bin/rollup $< --file $@ --format iife --name slim \
	    --plugin @rollup/plugin-node-resolve

../build/test.browser.js: rollup.config.mjs ../src/html-slim.test.js Makefile
	../node_modules/.bin/rollup -c $<

../build/assert.browser.js: assert.entry.mjs Makefile
	../node_modules/.bin/rollup $< --file $@ --format iife --name assert \
	    --plugin @rollup/plugin-node-resolve

.PHONY: all clean test
