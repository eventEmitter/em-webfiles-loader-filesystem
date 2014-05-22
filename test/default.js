
	
	var   Class 		= require('ee-class')
		, log 			= require('ee-log')
		, fs 			= require('fs')
		, assert 		= require('assert');



	var   FSLoader = require('../')
		, loader;



	describe('The FSLoader', function(){
		it('should load all files', function(done){
			var   counter = 0
				, results = ['/index.html', '/css/main.css'];

			loader = new FSLoader({
				path: __dirname + '/www'
			});

			loader.once('addHash', function(path, file){
				assert.equal(path, results[counter++]);
			});

			loader.on('load', function(err){
				if (err) done(err);
				else {
					assert.equal(JSON.stringify(loader.tree), '{"css":{"main.css":{"path":"/css/main.css","data":{"type":"Buffer","data":[10,10,98,111,100,121,32,123,10,9,10,125]},"filename":"main.css","abspath":"/home/em/dev/ee/em-webfiles-loader-filesystem/test/www/css/main.css","mimeType":"text/css","charset":"UTF-8","etag":"6bfa3361dd9a9abb140ad45aca232ad8","contentType":"text/css; charset=UTF-8"}},"index.html":{"path":"/index.html","data":{"type":"Buffer","data":[60,33,68,79,67,84,89,80,69,32,104,116,109,108,62,10,60,104,116,109,108,62,10,60,104,101,97,100,62,10,9,60,116,105,116,108,101,62,60,47,116,105,116,108,101,62,10,60,47,104,101,97,100,62,10,60,98,111,100,121,62,10,10,60,47,98,111,100,121,62,10,60,47,104,116,109,108,62]},"filename":"index.html","abspath":"/home/em/dev/ee/em-webfiles-loader-filesystem/test/www/index.html","mimeType":"text/html","charset":"UTF-8","etag":"034fb4e16a1f61527bc1a0013a8ef118","contentType":"text/html; charset=UTF-8"}}');
					assert.equal(counter, 1);
					done();
				}
			});
		});


		it ('should watch its folder', function(done){
			loader.once('addHash', function(path, tree){
				assert.equal(path, '/robots.txt');
				assert.equal(JSON.stringify(tree), '{"path":"/robots.txt","data":{"type":"Buffer","data":[68,105,115,97,108,108,111,119,58,47]},"filename":"robots.txt","abspath":"/home/em/dev/ee/em-webfiles-loader-filesystem/test/www/robots.txt","mimeType":"text/plain","charset":"UTF-8","etag":"082512377fd91759a660618c5a3202a3","contentType":"text/plain; charset=UTF-8"}');
				done();
			});

			fs.writeFile(__dirname + '/www/robots.txt', 'Disallow:/');
		});


		it ('should watch its folder', function(done){
			loader.once('removeHash', function(path, tree){
				assert.equal(path, '/robots.txt');
				assert.equal(JSON.stringify(tree), '{"path":"/robots.txt","data":{"type":"Buffer","data":[68,105,115,97,108,108,111,119,58,47]},"filename":"robots.txt","abspath":"/home/em/dev/ee/em-webfiles-loader-filesystem/test/www/robots.txt","mimeType":"text/plain","charset":"UTF-8","etag":"082512377fd91759a660618c5a3202a3","contentType":"text/plain; charset=UTF-8"}');
				done();
			});

			fs.unlink(__dirname + '/www/robots.txt');
		});
	});
	