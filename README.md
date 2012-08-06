node-netflix
============

An implementation of the Netflix API for Node.js


Testing
=======

To run the tests included with this module create a file in the test directory named auth.json and add this JSON object:
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