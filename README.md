node-netflix
============

An implementation of the Netflix API for Node.js

Installation
============

Install with:

    npm install node-netflix

Usage
=====

This section will explain how to use this module... Coming soon...

Caching
=======

This module uses caching to speed up the process of retrieving results from the Netflix catalog. This is a work in progress but the jist is that all searches for movie titles, autocompletions, searching by actor, etc. will be stored in an expiration cache so that subsequent requests will not require another call to the Netflix API (and eat up requests per day). As of now the cache is backed by Redis but I will probably create an optional in-app cache and/or MongoDB cache for those who don't want to use Redis. 

All items stored in cache currently will expire in 30 minutes to avoid bloat but I will later add an option to turn this off. 

Testing
=======

To run the tests included with this module create a file in the test directory named `auth.json` and add this JSON object:
```js
{
	"key": "YOUR NETFLIX API KEY",
	"sharedSecret": "YOUR NETFLIX APPLICATION SHARED SECRET"
}
```

Then run the tests by first installing the development dependencies:

    $ npm install

then run the tests: 

    $ mocha