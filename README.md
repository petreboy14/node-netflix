node-netflix
============

An implementation of the Netflix API for Node.js. This is a wrapper around the main functionalities that are provided by Netflix such as searching movie titles or updating user account options. This is meant to be used by developers who want to access the Netflix API with a Node.js backend. This module uses optional caching and persistence techniques to provide fast response time for client applications whilst decreasing the number of required API lookups. 

## Installation

Install with:

    npm install node-netflix

Then the module can be used in the normal manner by requiring it:

    var netflix = require('node-netflix');

## Configuration

The first thing that should be done after requiring the node-netflix module is configuring it with your API application key and shared secret key which is given to you when you register your application with Netflix at [http://developer.netflix.com](http://developer.netflix.com):

    netflix.conf(options)

The options parameter should be an object which can take these parameters:

- `key`: required, string. This is the API application key that was assigned to the application you are developing at the Netflix developer site.
- `sharedSecret`: required, string. This is the shared secret key also given you at the Netflix developer site.
- `caching`: object/boolean, default false. Caching improves the module performance by saving information relating to shows in an in-memory store. This results in less requests to the Netflix API for items already searched for and performance increases. As of now Redis is the only supported cache store but that will change when I have time to abstract the caching system out. If passed an object its parameters are:
  - `host`: required, string. This is the IP address or hostname for your Redis server.
  - `port`: required, number. This is the port that your Redis server is listening on. 
  - `password`: string. The password for accessing the Redis server if necessary. 
- `persistence`: boolean, default false. This option is to enable persistence of show information to an external database. This will speed up requests for show information that has already been gathered and decrease the number of direct requests to the Netflix API. For the sake of finishing this module, it will be hardcoded to only work on MongoDB (as that is what the app is being developed with) but later in the future I will abstract persistence to multiple datastores. If passed on object the parameters for correct execution are:
  - `connString`: required, string/array. This is your connection string to your database server/servers.
  - `dbName`: required, string. The name of the database for this module to connect to.
  - `user`: string. A username who has access to the database. This can be left blank if guest has access.
  - `password`: string. The password for the user if one is specified.

The caching and persistence options in the configuration are set to false by default because I don't want to assume that the user of this module will want all the power of storing movie data in caches or databases but they are recommended to be both configured for optimal performance. The details of what is persisted and/or cached and why are described below in their respective sections.

## Usage

This section will explain how to use this module... Coming soon...

## Caching

This module uses caching to speed up the process of retrieving results from the Netflix catalog. This is a work in progress but the jist is that all searches for movie titles, autocompletions, searching by actor, etc. will be stored in an expiration cache so that subsequent requests will not require another call to the Netflix API (and eat up requests per day). As of now the cache is backed by Redis but I will probably create an optional in-app cache and/or MongoDB cache for those who don't want to use Redis. 

All items stored in cache currently will expire in 30 minutes to avoid bloat but I will later add an option to turn this off. 

## Testing

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

    $ mocha -R spec