#!/usr/bin/env bash -c make

ALL = html-slim.js html-slim.test.js

all: $(ALL)

test: all
	node --test *.test.js

clean:
	/bin/rm -fr $(ALL)

%.js: ../src/%.ts
	../node_modules/.bin/tsc -p .

.PHONY: all clean test
