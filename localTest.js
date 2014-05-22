
	
	var   Class 		= require('ee-class')
		, log 			= require('ee-log')
		, assert 		= require('assert');



	var   FSLoader = require('./')
		, loader;


	loader = new FSLoader({
		path: __dirname + '/test/www'
	});


	loader.load(function(err){
		log(err, loader);
	});