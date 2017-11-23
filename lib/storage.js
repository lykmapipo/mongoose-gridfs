'use strict';

//dependencies
const path = require('path');
const _ = require('lodash');
const mongoose = require('mongoose');
const Grid = require('gridfs-stream');
const read = require('stream-read');
Grid.mongo = mongoose.mongo;
const schema = require(path.join(__dirname, 'schema'));

/**
 * @constructor
 * @name GridFSStorage
 * @description stream in and out data to MongoDB GridFS
 * @param {Object} options
 * @param {String} [options.collection] a root collection to use with GridFS
 */
function GridFSStorage(options) {
  //normalize options
  this.options = _.merge({}, {
    model: 'File',
    collection: 'fs',
    mongooseConnection: null
  }, options);

  //get either option connection or mongoose connection
  const conn = this.options.mongooseConnection || mongoose.connection;

  //Check if mongoose is connected.
  if (conn.readyState !== 1) {
    throw new Error('Mongoose is not connected');
  }
  this.storage = new Grid(conn.db);
}

//getters

/**
 * @name collection
 * @description collection used to store file data in mongodb.
 * @return {Collection}
 */
Object.defineProperty(GridFSStorage.prototype, 'collection', {
  get: function () {
    return this.storage.collection(this.options.collection);
  }
});

/**
 * @name model
 * @description mongoose compactible model
 * @return {Model}
 */
Object.defineProperty(GridFSStorage.prototype, 'model', {
  get: function () {
    let model;

    try {
      //obtain model if already exists
      model = mongoose.model(this.options.model);
    } catch (e) {
      //build schema
      const _schema = schema(this);

      //compile model otherwise
      model = mongoose.model(this.options.model, _schema);
    }

    //export model
    return model;
  }
});

/**
 * @name schema
 * @description mongoose compactible schema
 * @return {Schema}
 */
Object.defineProperty(GridFSStorage.prototype, 'schema', {
  get: function () {
    //build schema
    const _schema = schema(this);

    //export mongoose compactible schema
    return _schema;
  }
});


//writers

/**
 * @function
 * @name write
 * @param  {Object}   [fileDetails] valid mongodb GridFS file details
 * @param  {ReadableStream}   stream      valid nodejs ReadableStream
 * @param  {Function} done        a callback to invoke on success or error
 * @returns {WritableStream}
 * @public
 * @see {@link http://mongodb.github.io/node-mongodb-native/api-generated/gridstore.html|GridStore}
 * @see {@link https://nodejs.org/docs/v0.10.36/api/stream.html#stream_class_stream_readable|ReadbaleStream}
 */
GridFSStorage.prototype.write =
  GridFSStorage.prototype.save =
  GridFSStorage.prototype.create =

  function write(fileDetails, stream, done) {
    //ensure filename
    if (!fileDetails || !fileDetails.filename) {
      throw new Error('Missing filename');
    }

    //obtain collection
    const collection = this.options.collection;

    //prepare file details
    fileDetails = _.merge({
      root: collection, //root collection to use with GridFS for storage
    }, fileDetails);

    //normalize contentType field
    if (fileDetails.contentType) {
      // jshint camelcase:false
      fileDetails.content_type = fileDetails.contentType;
      // jshint camelcase:true
      delete fileDetails.contentType;
    }

    // initialize gridfs write stream
    const writestream = this.storage.createWriteStream(fileDetails);

    //stream file into mongodb GridFS
    stream.pipe(writestream);

    //work on the stream
    if (done && _.isFunction(done)) {
      //handle errors
      writestream.on('error', function (error) {
        done(error);
      });

      //finalize write
      writestream.on('close', function (file) {
        done(null, file);
      });
    }
    //return writestream
    else {
      return writestream;
    }

  };


//removers


/**
 * @function
 * @name unlink
 * @description remove an existing file from GridFS storage
 * @param  {Object}   options details for removing file
 * @param  {Function} done    a callback to invoke on success or error
 * @public
 */
GridFSStorage.prototype.unlink = function unlink(options, done) {
  //obtain collection
  const collection = this.options.collection;

  //prepare file remove options
  options = _.merge({
    root: collection
  }, options);

  //TODO ensure filename or _id exists in options

  //remove file from storage
  this.storage.remove(options, done);

};


/**
 * @name unlinkById
 * @description remove an existing file using a specified objectid
 * @param  {ObjectId}   id   objectid of the file in GridFS
 * @param  {Function} done a callback to invoke on success or error
 */
GridFSStorage.prototype.unlinkById = function unlinkById(id, done) {
  //remove file from storage
  this.unlink({
    _id: id
  }, function (error) {
    if (error) {
      done(error);
    } else {
      done(null, id);
    }
  });
};


//finders


/**
 * @function
 * @name findOne
 * @description find an existing file using options provided
 * @param  {Object}   options   valid find conditions
 * @param  {Function} done a callback to invoke on success or error
 * @return {Object}        file details
 * @public
 */
GridFSStorage.prototype.findOne = function (options, done) {
  //obtain collection
  const collection = this.options.collection;

  //prepare file remove options
  options = _.merge({
    root: collection
  }, options);

  //find one existing file
  this.storage.findOne(options, done);
};


/**
 * @function
 * @name findById
 * @description find an existing file by given objectid
 * @param  {ObjectId}   id   valid objectid of the existing file
 * @param  {Function} done a callback to invoke on success or error
 * @return {Object}        file details
 * @public
 */
GridFSStorage.prototype.findById = function (id, done) {
  this.findOne({
    _id: id
  }, done);
};


//readers


/**
 * @function
 * @name readById
 * @param  {ObjectId}   id   valid file objectid
 * @param  {Function} [done] a callback to invoke on success or error.
 *                           Pass callback if filesize is small enough.
 *                           Otherwise consider using stream instead.
 * @return {stream.Readable}
 * @public
 * @example
 * const readableStream = gridfs.readById(50e03d29edfdc00d34000001);
 *
 * gridfs.readById(50e03d29edfdc00d34000001, function(error,content){
 *         ...
 *     });
 */
GridFSStorage.prototype.readById = function (id, done) {
  //obtain collection
  const collection = this.options.collection;

  //prepare file remove options
  const options = {
    _id: id,
    root: collection
  };

  //create a readable stream for a specific file
  const stream = this.storage.createReadStream(options);

  //pipe the whole stream into buffer if callback provided
  if (done && _.isFunction(done)) {
    read(stream, done);
  }

  //return stream
  else {
    return stream;
  }

};


//multer GridFS storage implementation

/**
 * @function
 * @name _handleFile
 * @description multer file write implementation
 * @private
 * @see {@link https://github.com/expressjs/multer/blob/master/StorageEngine.md|StorageEngine}
 */
GridFSStorage.prototype._handleFile = function _handleFile(request, file, done) {
  //obtain file readable stream
  const stream = file.stream;

  //prepare file details
  const fileDetails = _.merge({}, {
    filename: file.originalname,
    contentType: file.mimetype
  });

  this.write(fileDetails, stream, done);
};


/**
 * @function
 * @name _removeFile
 * @description multer file remove implementation
 * @private
 * @see {@link https://github.com/expressjs/multer/blob/master/StorageEngine.md|StorageEngine}
 */
GridFSStorage.prototype._removeFile = function _removeFile(request, file, done) {
  //remove file
  if (file._id) {
    this.removeById(file._id, done);
  }
  //no operation
  else {
    done(null, null);
  }
};


//exports GridFSStorage instance
module.exports = function (options) {
  const gridfs = new GridFSStorage(options);
  gridfs.GridFSStorage = GridFSStorage;
  return gridfs;
};
