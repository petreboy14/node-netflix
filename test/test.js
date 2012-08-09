// External dependencies
var fs = require('fs');
var should = require('should');
var util = require('util');

// Internal dependencies
var cacher = require('../libs/cacher');
var netflix = require('../index.js');

describe("Netflix Tests", function() {
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

	describe("Authentication Tests", function() {

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

	describe("Caching Tests", function() {
		describe("Non-existent cache item", function() {
			it("should not find the title entered", function(done) {
				cacher.getCache("autocomplete", "harr", function(error, result) {
					should.not.exist(error);
					should.not.exist(result);
					done();
				});
			});
		});

		describe("Adding a cache item", function() {
			it("should add an item to cache without error", function(done) {
				cacher.setCache("autocomplete", "HARRY", ["this", "is", "a", "test"], function(error, result) {
					if (error) {
						done(error);
					} else {
						should.exist(result);
						result.should.be.a("string");
						result.should.eql("OK");
						done();
					}
				});
			});
		});

		describe("Retrieving the cached item", function() {
			it("should be able to successfully retrieve the saved item", function(done) {
				cacher.getCache("autocomplete", "HARRY", function(error, result) {
					if(error) {
						done(error);
					} else {
						should.exist(result);
						result.should.be.an.instanceOf(Array);
						result[0].should.eql("this");
						result[1].should.eql("is");
						result[2].should.eql("a");
						result[3].should.eql("test");
						done();
					}
				});
			});
		});

		describe("Deleting a cache item", function() {
			it("should be able to delete a cached item", function(done) {
				cacher.delCache("autocomplete", "HARRY", function(error, result) {
					if (error) {
						done(error);
					} else {
						should.exist(result);
						result.should.equal(1);
						done();	
					}
				});
			});
		});
	});

	describe("Searching Tests", function() {
		describe("Title autocomplete", function() {
			it("should provide a list of autocomplete titles uncached", function(done) {
				netflix.autocomplete("HARRY", function(error, result) {
					if (error) {
						done(error);
					} else {
						result.should.have.ownProperty("titles");
						result.should.have.ownProperty("cached");
						result.cached.should.be.false;
						result.titles.should.be.an.instanceOf(Array);
						result.titles.should.not.be.empty;
						result.titles[0].should.be.a("string");
						done();
					}
				});
			});

			it("should provide a list of autocomplete titles cached", function(done) {
				netflix.autocomplete("HARRY", function(error, result) {
					if (error) {
						done(error);
					} else {
						result.should.have.ownProperty("titles");
						result.should.have.ownProperty("cached");
						result.cached.should.be.true;
						result.titles.should.be.an.instanceOf(Array);
						result.titles.should.not.be.empty;
						result.titles[0].should.be.a("string");
						done();
					}
				});
			});
		});

		describe("Title Searches", function() {
			it("should be able to search by title", function(done) {
				netflix.searchTitle("Harry Potter and the Deathly Hallows: Part II", function(error, result) {
					if (error) {
						done(error);
					} else {
						util.log(util.inspect(result, false, 5));
						done();
					}
				})
			});
		});

		describe("People searches", function() {
			it("should be able to search by actors/directors");
		});
	});

	describe("Retrieval Tests", function() {
		describe("Getting a movie's general info by its id", function() {
			it("should return data for a movie by its id", function(done) {
				netflix.getTitle(70120085, function(error, result) {
					if (error) {
						done(error);
					} else {
						util.log(util.inspect(result, false, 5));
						done();
					}
				});
			});
		});
	});

	after(function(done) {
		cacher.delCache("multi", ["autocomplete-HARRY", "autocomplete-harr"], function(error, result) {
			if (error) {
				done(error);
			}
			done();
		});
	});
});

