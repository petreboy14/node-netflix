var oauth = require('./oauth');

// Netflix API base path
var BASE_PATH = "http://api-public.netflix.com";

// Utility function to generate signature parameter used in oauth authentication
exports.getSignature = function(resource, params, sharedSecret) {
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
};

// Utility function for building the final path requested by http
exports.buildPath = function(resource, params, signature) {
	var finalURL = "/" + resource.path + "?";

	for (var param in params) {
		if (params.hasOwnProperty(param)) {
			finalURL += param + "=" + params[param] + "&";
		}
	}

	finalURL += "oauth_signature=" + signature;

	return finalURL;
};

// Generates a random nonce for oauth authentication
exports.randomNonce = function() {
	var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

	var newNonce = "";

	for (var i = 0; i < 6; i++) {
		newNonce += chars.charAt(Math.random() * chars.length);
	}

	return newNonce;
}

// Function provided by Netflix to properly percent-escape url
function oAuthEscape(r) {
	return encodeURIComponent(r).replace("!","%21","g").replace("*","%2A","g").replace("'","%27","g").replace("(","%28","g").replace(")","%29","g");
}