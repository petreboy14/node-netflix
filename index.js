// Parser for converting Netflix response XML to nice JSON objects
var xml2js = require('xml2js');
var parser = new xml2js.Parser();

var requestor = require('./libs/requestor');

var cacher = require('./libs/cacher');

// Listing of all allowed Netflix API commands
var RESOURCES = {
	SEARCH: {
		TITLES: {
			path: "catalog/titles",
			method: "GET"
		},
		PEOPLE: {
			path: "catalog/people",
			method: "GET"
		},
		INSTANT_WATCH: {
			path: "catalog/titles/index",
			method: "GET"
		},
		AUTOCOMPLETE: {
			path: "catalog/titles/autocomplete",
			method: "GET"
		}
	},
	TITLES: {
		GET_TITLE: {
			path: "catalog/titles/movies",
			method: "GET"
		}
	},
	TOKEN: {
		GET_OAUTH_TOKEN: {
			path: "oauth/request_token",
			method: "GET"
		}
	}
};

// Public API
var netflix = (function() {
	var _conf = {};

	var setConfig = function(conf) {
		if ((typeof(conf) === "undefined") || !conf.hasOwnProperty("sharedSecret") || !conf.hasOwnProperty("key")) {
			throw new Error("setConfig requires at least sharedSecret and consumerKey");	
		}
		
		_conf.sharedSecret = conf.sharedSecret;
		_conf.key = conf.key;
	};

	var requestOAuthToken = function(cb) {
		requestor.runRequest(RESOURCES.TOKEN.GET_OAUTH_TOKEN, _conf, {}, function(error, result) {
			if (error) {
				cb(error);
			} else {
				switch(result) {
					case "Missing Required Consumer Key":
						cb(new Error("Missing Required Consumer Key"));
						break;
					case "Invalid Signature":
						cb(new Error("Invalid Signature"));
						break;
					default:
						var tokenObj = {};
						var ret = result.split("&");
						for (var i = 0; i < ret.length; i++) {
							tokenObj[ret[i].split("=")[0]] = ret[i].split("=")[1];
						}
						cb(null, tokenObj);
						break;
				}
			}
		});
	};

	var runAutocomplete = function(title, cb) {
		if (typeof(title) !== "string" || title.length <= 2) {
			throw new Error("runAutocomplete title should be a valid string of length at least 2 characters");
		}

		// First check if the cache contains the autocomplete data so we don't have to hit Netflix everytime
		cacher.getCache("autocomplete", title.toUpperCase(), function(error, result) {
			if (error) {
				cb(error);
			} else if (result) {
				cb(null, {titles: result, cached: true});
			} else {
				requestor.runRequest(RESOURCES.SEARCH.AUTOCOMPLETE, _conf, {term: title}, function(error, result) {
					if (error) {
						cb(error);
					} else {
						parser.parseString(result, function(error, result) {
							if (result.hasOwnProperty("autocomplete_item")) {
								result = result.autocomplete_item;
							
								var titles = [];
								for (var i = 0, len = result.length; i < len; i++) {
									titles.push(result[i].title["@"].short);
								}

								cacher.setCache("autocomplete", title.toUpperCase(), titles, function(error, result) {
									cb(error, {titles: titles, cached: false});
								});
							} else {
								cb(new Error("Autcomplete found no results"));	
							}
						
						});
					}
				});
			}
		});
	};

	var searchByTitle = function(options, cb) {
		if (typeof(options) === "undefined") {
			throw new Error("searchByTitle should contain at least an options parameter");
		} else if (typeof(options) === "string") {
			options = {title: options};
		}

		if (!options.hasOwnProperty("title")) {
			throw new Error("options passed to searchByTitle should at least contain a title param");
		}

		cacher.getCache("title", options.title.toUpperCase(), function(error, result) {
			if (error) {
				cb(error);
			} else if (result) {
				cb(null, {media: result, cached: true});
			} else {
				requestor.runRequest(RESOURCES.SEARCH.TITLES, _conf, {term: options.title, max_results: 10}, function(error, result) {
					if (error) {
						cb(error);
					} else {
						parser.parseString(result, function(error, result) {
							cb(error, result);
						});
					}
				});
			}
		});
		
	};

	var _getTitle = function(id, cb) {
		if (typeof(id) === "undefined") {
			throw new Error("_getTitle requires a id");
		}

		var path = RESOURCES.TITLES.GET_TITLE.path + "/" + id + "/synopsis";
		requestor.runRequest({path: path, method: "GET"}, _conf, {}, function(error, result) {
			if (error) {
				cb(error);
			} else {
				parser.parseString(result, function(error, result) {
					cb(error, result);
				});
			}
		});
	};

	return {
		config: function(conf) {
			setConfig(conf);
		},

		autocomplete: function(title, cb) {
			runAutocomplete(title, cb);
		},

		reqOAuthToken: function(cb) {
			requestOAuthToken(cb);
		},

		searchTitle: function(data, cb) {
			searchByTitle(data, cb);
		},

		getTitle: function(id, cb) {
			_getTitle(id, cb);
		}
	};
})();

module.exports = netflix;