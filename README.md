# Hops or Not

This is a demo app that I wrote for a presentation to the Fort Collins Internet Pros meetup in February 2013. The slides from my talk are available on SpeakerDeck: !!!TODO!!!

Hops or Not is a beer rating app. It is a full-stack JavaScript app. The back end is written on top of Node.js/Express and MongoDB/Mongoose. The front end is written with jQuery, Underscore and Backbone.

## Requirements

In order to run this app, you will need the following software installed:

[ImageMagick](http://www.imagemagick.org/)
[Node.js](http://nodejs.org/)
[MongoDB](http://www.mongodb.org/)

## Installation

To install the app, simply clone it and install its local dependencies.

```bash
git clone https://github.com/bryandragon/fcip-amd
cd fcip-amd
npm install
```

## Running

To run the app:

```bash
node server/app.js
```

The first time the app is run it will bootstrap the database with some brewery and beer data located in the `server/data` directory.

## Running Tests

To run the Mocha tests:

```bash
make test
```

## Building the release version

To optimize and minify the client-side code:

```bash
make build
```

Then, to run the app in production mode:

```bash
NODE_ENV=production node server/app.js
```

## Resources

### Backbone.js
* [Backbone.js](http://backbonejs.org/)
* [Underscore.js](http://underscorejs.org/)

### Require.js
* [http://requirejs.org/](require.js)
* [https://github.com/jrburke/r.js](r.js)

### CommonJS
* [CommonJS](http://www.commonjs.org/)
* [Modules Spec](http://wiki.commonjs.org/wiki/Modules/1.1)
* [AMD Spec](http://wiki.commonjs.org/wiki/Modules/AsynchronousDefinition)
* [AMD Loader Plugin Spec](https://github.com/amdjs/amdjs-api/wiki/AMD)

### Other AMD Loaders
* [almond.js](https://github.com/jrburke/almond)
* [curl.js](https://github.com/cujojs/curl)
* [Dojo](https://github.com/dojo/dojo)
* [rapotor.js](https://github.com/raptorjs/raptorjs)

### Other Popular JS frameworks
* http://spinejs.com/
* http://canjs.us/
* http://batmanjs.org/
* http://emberjs.com/
* http://angularjs.org/
* http://meteor.com/
