# em-webfiles-loader-filesystem

FileSystem loder for em-webfiles

## installation

	npm install em-webfiles-loader-filesystem

## build status

[![Build Status](https://travis-ci.org/eventEmitter/em-webfiles-loader-filesystem.png?branch=master)](https://travis-ci.org/eventEmitter/em-webfiles-loader-filesystem)


## usage

### Contructor

	var FSLoader = require('em-webfiles-loader-filesystem');

	var myLoader = new FSLoader({
		path: '/path/to/ww/files'
	});


### load event

is emitted when all files were loaded into the memory

	myLoader.on('load', function(err){

	});


### addHash event

is emitted when a new file was loaded

	myLoader.on('addHash', function(relativePath, fileDescriptor){

	});


### removeHash event

is emitted when a file was removed

	myLoader.on('removeHash', function(relativePath, fileDescriptor){

	});

