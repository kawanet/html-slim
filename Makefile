#!/usr/bin/env bash -c make

ALL = src/html-slim.js src/html-slim.test.js

all: $(ALL)
	make -C cjs $@
	make -C browser $@

test: all
	node --test src/*.test.js
	make -C cjs $@
	@echo 'open browser/test.html'

clean:
	/bin/rm -fr $(ALL)
	make -C cjs $@
	make -C browser $@

%.js: %.ts
	./node_modules/.bin/tsc -p .

.PHONY: all clean test
