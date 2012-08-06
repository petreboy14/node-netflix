// External dependencies
var fs = require('fs');
var should = require('should');

// Internal dependencies
var netflix = require('../index.js');

describe("Authentication", function() {
	var authObj;
	
	before(function(done) {
		fs.readFile("./test/auth.json", "utf8", function(error, result) {
			if (error) {
				done(error);
			} else {
				try {
					authObj = JSON.parse(result);
					done();

				} catch (error) {
					done(error);
				}			
			}
		});
	});

	describe("Parameter Test", function() {
		it("should have api key", function() {
			should.exist(authObj.key);
			authObj.key.should.be.a("string");
		});
		
		it("should have shared secret", function() {
			should.exist(authObj.sharedSecret);
			authObj.sharedSecret.should.be.a("string");
		});
	});

	describe("Set authentication configuration", function() {
		it("should be able to set config correctly", function() {
			(function() {
				netflix.config(authObj);
			}).should.not.throw();
		});
	});

	describe("Authentication Test", function() {
		it("should successfully authenticate with Netflix Developer API", function(done) {
			netflix.reqOAuthToken(function(error, result) {
				if (error) {
					done(error);	
				} else {
					should.exist(result);
					should.exist(result.oauth_token);
					should.exist(result.oauth_token_secret);
					should.exist(result.application_name);
					should.exist(result.login_url);
					done();
				}
			});
		});
	});
});

