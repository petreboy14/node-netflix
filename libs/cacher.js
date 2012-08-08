var redis = require('redis');

var EXPIRATION_TIME = 1800;

var cacher = (function() {
	var client = redis.createClient();

	client.on("error", function(error) {
		throw error;
	});

	client.on("end", function() {
		throw new Error("Connection to Redis has been closed");
	});

	var _getCache = function(type, term, cb) {
		client.get(type + "-" + term, function(error, result) {
			if (typeof(result) !== "undefined") {
				result = JSON.parse(result);
			}
			cb(error, result);
		});
	};

	var _setCache = function(type, term, data, cb) {
		client.setex(type + "-" + term, EXPIRATION_TIME, JSON.stringify(data), function(error, result) {
			cb(error, result);
		});
	};

	var _delCache = function(type, term, cb) {
		var toDelete = (type === "multi") ? term : type + "-" + term;
		
		client.del(toDelete, function(error, result) {
			cb(error, result);
		});
	};

	return {
		getCache: function(type, term, cb) {
			_getCache(type, term, cb);
		},

		setCache: function(type, term, data, cb) {
			_setCache(type, term, data, cb);
		},

		delCache: function(type, term, cb) {
			_delCache(type, term, cb);
		}
	};
})();

module.exports = cacher;