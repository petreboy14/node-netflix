// Parser for converting Netflix response XML to nice JSON objects
var xml2js = require('xml2js');
var parser = new xml2js.Parser();

var requestor = require('./libs/requestor');

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

	return {
		config: function(conf) {
			setConfig(conf);
		},

		reqOAuthToken: function(cb) {
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
		}
	};
})();

module.exports = netflix;