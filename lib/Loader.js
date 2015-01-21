!function(){

    var   Class             = require('ee-class')
        , log               = require('ee-log')
        , fs                = require('fs')
        , mime              = require('mime')
        , path              = require('path')
        , type              = require('ee-types')
        , crypto            = require('crypto')
        , async             = require('ee-async')
        , Loader            = require('em-webfiles-loader')
        , File              = require('em-webfiles-file')
        , Directory         = require('em-webfiles-directory')
        , argv              = require('ee-argv');



    var debug = argv.has('dev-webfiles');



    module.exports = new Class({
        inherits: Loader

        , init: function init(options) {
            init.super.call(this);

            if (!options || !type.string(options.path)) throw new Error('Missing path options!');

            Class.define(this, '_eventCache', Class({}));
            Class.define(this, '_rootPath', Class(options.path));

            this.load(function(err){
                process.nextTick(function(){
                    this.emit('load', err);
                }.bind(this));
            }.bind(this));


            this.on('addHash', function(hash, file){
                this._hashTree[hash] = file;
            }.bind(this));

            this.on('removeHash', function(hash, file){
                if (this._hashTree[hash]) delete this._hashTree[hash];
            }.bind(this));
        }



        , load: function(callback) {
            if (debug) log.warn('Filesystem loader started ...');

            this._load('', this.tree, callback);
        }



        // load all files from the fs
        , _load: function(pathname, tree, callback) {
            var absPath = path.join(this._rootPath, pathname+'/');

            pathname += '/';

            if (debug) log.debug('Scanning «'+pathname+'» ...');

            fs.readdir(absPath, function(err, files){
                if (err) callback(err);
                else {
                    this.emit('add', pathname, tree);
                    this.emit('addHash', pathname, tree);

                    async.each(files, function(file, next) {
                        var   filePath      = path.join(pathname, file)
                            , absFilePath   = path.join(absPath, file);

                        fs.stat(absFilePath, function(err, stats){
                            if (err) next(err);
                            else {
                                if (stats.isDirectory()) {
                                    if (debug) log.debug('Path «'+filePath+'» is a directory ...');
                                    tree[file] = new Directory();

                                    this._load(filePath, tree[file], next);
                                }
                                else if(stats.isFile()) {
                                    if (debug) log.debug('Path «'+filePath+'» is a file ...');

                                    this._loadFile(filePath, tree, next);
                                }
                                else if (debug) log.debug('Ignoring file «'+filePath+'» since its not a directory or a regular file ...');
                            }
                        }.bind(this));
                    }.bind(this), callback);

                    this._addWatch(absPath, tree);
                }
            }.bind(this));
        }





        , _loadFile: function(relativePath, tree, callback) {
            var   absolutePath  = path.join(this._rootPath, relativePath)
                , file          = relativePath.substr(relativePath.lastIndexOf('/')+1);


            fs.readFile(absolutePath, function(err, data) {
                var mimeType;

                if (err) callback(err);
                else {
                    mimeType = mime.lookup(file);

                    if (debug) log.info('File «'+relativePath.cyan+'» stored ...');
                    tree[file] = new File({
                          data      : data
                        , filename  : file
                        , path      : relativePath
                        , abspath   : absolutePath
                        , etag      : this._createETAG(data)
                        , mimeType  : mimeType
                        , charset   : mime.charsets.lookup(mimeType, '')
                    });

                    this.emit('add', relativePath, tree[file]);
                    this.emit('addHash', relativePath, tree[file]);

                    callback();
                }
            }.bind(this));
        }




        , _addWatch: function(pathname, tree) {
            var   handleName
                , handle;

            try {
                handle = fs.watch(pathname, function(evt, filename){
                    handleName = pathname+filename;

                    if (!this._eventCache[handleName]) this._eventCache[handleName] = {};
                    if (this._eventCache[handleName]) clearTimeout(this._eventCache[pathname+filename].timer);

                    // wait som eime, there may be more events for the same file
                    this._eventCache[handleName].timer = setTimeout(function(){
                        this.emit('change', this._getRelativeRootPath(handleName));

                        this._handleChange(handleName);
                    }.bind(this), 100);
                }.bind(this));

                Class.define(tree, '___watchHandle', {value:handle});
            } catch (err) {
                log.error('Failed to create filesystem watcher for «'+pathname+'», your files will not be reloaded when changed ....');
                log(err);
            }
        }



        , _removeWatch: function(tree) {
            if (tree.___watchHandle) tree.___watchHandle.close();

            if (tree.isDirectory) {
                Object.keys(tree).forEach(function(key){
                    this._removeWatch(tree[key]);
                }.bind(this));
            }
        }



        , _handleChange: function(pathname) {
            var   relativePath  = this._getRelativeRootPath(pathname)
                , fileName      = pathname.substr(pathname.lastIndexOf('/')+1)
                , subtree       = this._getSubTree(relativePath.split('/').slice(0, -1).filter(function(item){return !!item.length;}), this.tree)
                , file          = subtree[fileName];

            fs.stat(pathname, function(err, stats){
                if (file) {
                    delete this.tree[relativePath];
                    this._removeWatch(file);
                    this.emit('remove', relativePath, file);
                    this.emit('removeHash', relativePath, file);
                }

                if (stats) {
                    if (stats.isDirectory()) this._load(relativePath, subtree, function(){});
                    else this._loadFile(relativePath, subtree, function(){});
                }
            }.bind(this));
        }



        , _getSubTree: function(parts, tree) {
            if (parts.length) {
                if (parts.length > 1) return this._getSubTree(parts.slice(1), tree[parts[0]]);
                else return tree[parts[0]];
            }
            return this.tree;
        }



        , _getRelativeRootPath: function(pathname) {
            return pathname.substr(this._rootPath.length);
        }



        , _createETAG: function(data) {
            return crypto.createHash('md5').update(data).digest('hex');
        }
    });
}();
