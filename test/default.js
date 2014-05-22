
	
	var   Class 		= require('ee-class')
		, log 			= require('ee-log')
		, fs 			= require('fs')
		, assert 		= require('assert');



	var   FSLoader = require('../')
		, loader;



	describe('The FSLoader', function(){
		it('should load all files', function(done){
			var   counter = 0;

			loader = new FSLoader({
				path: __dirname + '/www'
			});

			loader.once('addHash', function(path, file){
				assert.equal(path, '/');
				counter++;
			});

			loader.on('load', function(err){
				if (err) done(err);
				else {
					assert(loader.tree.css);
					assert.equal(counter, 1);
					done();
				}
			});
		});


		it ('should watch its folder', function(done){
			loader.once('addHash', function(path, tree){
				assert.equal(path, '/robots.txt');
				assert(tree.path);
				done();
			});

			fs.writeFile(__dirname + '/www/robots.txt', 'Disallow:/');
		});


		it ('should watch its folder', function(done){
			loader.once('removeHash', function(path, tree){
				assert.equal(path, '/robots.txt');
				assert(tree.path);
				done();
			});

			fs.unlink(__dirname + '/www/robots.txt');
		});


		it('should return even directories', function(){
			assert.equal(loader.getFile('/').isDirectory, true);
		});
	});
	