// External libraries
var http = require('http');
var oauth = require('./libs/oauth');
var xml2js = require('xml2js');

var parser = new xml2js.Parser();

// Netflix API base path
var BASE_PATH = "http://api-public.netflix.com";

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
	}
};

// Required URL parameters
var URL_REQ = ["oauth_consumer_key", "oauth_nonce", "oauth_signature_method", "oauth_timestamp", "oauth_version"];

// Public API
var netflix = (function() {
	var _conf = {};

	var setConfig = function(conf) {
		if (!conf.hasOwnProperty("sharedSecret") || !conf.hasOwnProperty("consumerKey")) {
			throw new Error("setConfig requires at least sharedSecret and consumerKey");	
		}
		
		_conf.sharedSecret = conf.sharedSecret;
		_conf.consumerKey = conf.consumerKey;
	};

	var runTest = function(cb) {
		if (typeof(cb) !== "function") {
			throw new Error("test requires a callback function");
		}
		
		runRequest(RESOURCES.SEARCH.TITLES, _conf, {max_results: 10, term: "potter"}, function(result) {
			cb(result)
		});
	};

	return {
		config: function(conf) {
			setConfig(conf);
		},

		test: function(cb) {
			setConfig({});	
			runTest(cb);
		}
	};
})();

// Requester function which calls the Netflix API and returns whatever results to user 
function runRequest(resource, auth, options, cb) {
	if (typeof(resource) === "undefined") {
		throw new Error("Illegal resources provided to runRequest");
	}

	if (!(typeof(auth) === "object") || !auth.hasOwnProperty("sharedSecret") || !auth.hasOwnProperty("consumerKey")) {
		throw new Error("Illegal auth provided to runRequest");
	}

	// Generate random nonce and timestamp for request
	var nonce = randomNonce();
	var ts = Math.floor(new Date().getTime() / 1000);

	// The signature requires certain url parameters and all the options to be in ascending alphabetical order first copy array of known required
	// params.
	var pathOptions = URL_REQ.slice(0);

	// Add the remaining optional params
	for (var option in options) {
		if (options.hasOwnProperty(option)) {
			pathOptions.push(option);
		}
	}

	// Sort the parameter array.
	pathOptions.sort();

	// Create a new parameter object with the keys in sorted order
	var params = {};
	for (var i = 0; i < pathOptions.length; i++) {
		switch(pathOptions[i]) {
			case "oauth_consumer_key":
				params["oauth_consumer_key"] = auth.consumerKey;
				break;
			case "oauth_nonce":
				params["oauth_nonce"] = nonce;
				break;
			case "oauth_signature_method":
				params["oauth_signature_method"] = "HMAC-SHA1";
				break;
			case "oauth_timestamp":
				params["oauth_timestamp"] = ts;
				break;
			case "oauth_version":
				params["oauth_version"] = "1.0";
				break;
			default:
				params[pathOptions[i]] = options[pathOptions[i]];
				break;
		}
		
	}

	// Generate signature of request
	var signature = getSignature(resource, params, auth.sharedSecret);

	// Build the path that will be used in the final request
	var path = buildPath(resource, params, signature);

	var httpOptions = {
		host: "api-public.netflix.com",
		port: 80,
		method: resource.method,
		path: path
	};

	// Run the final request and return result to user
	var req = http.request(httpOptions, function(res) {
		var data = "";

		// Build the data chunk by chunk..
		res.on("data", function(chunk) {

			data += chunk;
		});

		// Handle the final data
		res.on("end", function() { 
			parser.parseString(data, function(error, result) {
				console.log(result);
				cb(null, data);
			});
		});
	});

	req.on("error", function(error) {
		cb(error);
	})

	req.end();
}

// Utility function for building the final path requested by http
function buildPath(resource, params, signature) {
	var finalURL = "/" + resource.path + "?";

	for (var param in params) {
		if (params.hasOwnProperty(param)) {
			finalURL += param + "=" + params[param] + "&";
		}
	}

	finalURL += "oauth_signature=" + signature;

	return finalURL;
}

// Utility function to generate signature parameter used in oauth authentication
function getSignature(resource, params, sharedSecret) {
	var sigURL = resource.method + "&" + oAuthEscape(BASE_PATH + "/" + resource.path) + "&";
	var paramString = "";
	for (var param in params) {
		if (params.hasOwnProperty(param)) {
			paramString += param + "=" + params[param] + "&";
		}
	}

	paramString = oAuthEscape(paramString.substring(0, paramString.length-1));

	sigURL += paramString;

	var signer = oauth.SignatureMethod.newMethod("HMAC-SHA1", {consumerSecret: oAuthEscape(sharedSecret)});
	return oAuthEscape(signer.getSignature(sigURL));
}

// Function provided by Netflix to properly percent-escape url
function oAuthEscape(r) {
  return encodeURIComponent(r).replace("!","%21","g").replace("*","%2A","g").replace("'","%27","g").replace("(","%28","g").replace(")","%29","g");
}

// Generates a random nonce for oauth authentication
function randomNonce() {
	var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

	var newNonce = "";

	for (var i = 0; i < 6; i++) {
		newNonce += chars.charAt(Math.random() * chars.length);
	}

	return newNonce;
}

module.exports = netflix;