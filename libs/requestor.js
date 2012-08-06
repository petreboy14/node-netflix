// External libraries
var http = require('http');

// Internal libraries
var helpers = require('./helpers');

// Required URL parameters
var URL_REQ = ["oauth_consumer_key", "oauth_nonce", "oauth_signature_method", "oauth_timestamp", "oauth_version"];

// Requester function which calls the Netflix API and returns whatever results to user 
exports.runRequest = function(resource, auth, options, cb) {
	if (typeof(resource) === "undefined") {
		throw new Error("Illegal resources provided to runRequest");
	}

	if (!(typeof(auth) === "object") || !auth.hasOwnProperty("sharedSecret") || !auth.hasOwnProperty("key")) {
		throw new Error("Illegal auth provided to runRequest");
	}

	// Generate random nonce and timestamp for request
	var nonce = helpers.randomNonce();
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
				params["oauth_consumer_key"] = auth.key;
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
	var signature = helpers.getSignature(resource, params, auth.sharedSecret);

	// Build the path that will be used in the final request
	var path = helpers.buildPath(resource, params, signature);

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
			cb(null, data);
		});
	});

	req.on("error", function(error) {
		cb(error);
	})

	req.end();
}