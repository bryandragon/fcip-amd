test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--require should --reporter spec

build:
	./node_modules/.bin/r.js -o ./build.js

.PHONY: test build