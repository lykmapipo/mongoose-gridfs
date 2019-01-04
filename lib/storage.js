'use strict';


/* dependencies */
const path = require('path');
const _ = require('lodash');
const mongoose = require('mongoose');
const read = require('stream-read');


/* declarations */
const GridFSBucket = mongoose.mongo.GridFSBucket;
const schema = require(path.join(__dirname, 'schema'));


/**
 * @constructor
 * @name GridFSStorage
 * @description stream in and out data to MongoDB GridFS
 * @param {Object} options
 * @param {String} [options.collection] a root collection to use with GridFS
 * @license MIT
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.6.0
 * @public
 */
function GridFSStorage(options) {

  // normalize options
  this.options = _.merge({}, {
    model: 'File',
    collection: 'fs',
    mongooseConnection: null
  }, options);

  // ensure bucketName
  this.options.bucketName =
    (this.options.bucketName || this.options.collection);

  // get either option connection or default mongoose connection
  this.conn = (this.options.mongooseConnection || mongoose.connection);

  // check if mongoose is connected.
  if (this.conn.readyState !== 1) {
    throw new Error('Mongoose is not connected');
  }

  // initialize grid
  // TODO pass/support additional bucket options
  // TODO rename grid to bucket
  this.storage = new GridFSBucket(this.conn.db, this.options);

}


//getters


/**
 * @name collection
 * @description collection used to store file data in mongodb.
 * @return {Collection}
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.6.0
 * @instance
 */
Object.defineProperty(GridFSStorage.prototype, 'collection', {
  get: function () {
    return this.storage.s._filesCollection;
  }
});


/**
 * @name model
 * @description mongoose compactible model
 * @return {Model}
 * @author lally elias <lallyelias87@mail.com>
 * @since  0.1.0
 * @version 0.4.0
 * @instance
 */
Object.defineProperty(GridFSStorage.prototype, 'model', {
  get: function () {
    // create model for the first time
    if (!this._model) {
      try {
        //obtain model if already exists
        this._model = this.conn.model(this.options.model);
      } catch (e) {

        //build schema
        const _schema = schema(this);

        //compile model otherwise
        this._model = this.conn.model(this.options.model, _schema);
      }
    }

    //export model
    return this._model;
  },
  // allow user to provide customized model
  set: function (v) {
    // TODO check if its an instance of mongoose model
    // TODO if its an instance of schema compile it
    this._model = v;
  }
});


/**
 * @name schema
 * @description mongoose compactible schema
 * @return {Schema}
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.4.0
 * @instance
 */
Object.defineProperty(GridFSStorage.prototype, 'schema', {
  get: function () {
    if (!this._schema) {
      //build schema
      this._schema = schema(this);
    }

    //export mongoose compatible schema
    return this._schema;
  },
  // allow user to provide customized schema
  set: function (v) {
    this._schema = v;
  }
});


//writers


/**
 * @function
 * @name write
 * @param {Object} [fileDetails] valid mongodb GridFS file details
 * @param {ReadableStream} readstream valid nodejs ReadableStream
 * @param {Function} done a callback to invoke on success or error
 * @returns {WritableStream}
 * @see {@link http://mongodb.github.io/node-mongodb-native/api-generated/gridstore.html|GridStore}
 * @see {@link https://nodejs.org/docs/v0.10.36/api/stream.html#stream_class_stream_readable|ReadbaleStream}
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.6.0
 * @instance
 */
GridFSStorage.prototype.write =
  GridFSStorage.prototype.save =
  GridFSStorage.prototype.create =

  function write(fileDetails, readstream, done) {

    // ensure filename
    //TODO if no filename generate new objectid for saving
    if (!fileDetails || !fileDetails.filename) {
      throw new Error('Missing filename');
    }

    // prepare file details
    //TODO force required options check openUploadStream(filename, options)
    //TODO ensure id is valid object id
    fileDetails = _.merge({}, fileDetails);
    const { _id, id, filename } = fileDetails;
    const __id = (_id || id);

    // initialize gridfs bucket write stream
    const writestream = (
      __id ?
      this.storage.openUploadStreamWithId(__id, filename, fileDetails) :
      this.storage.openUploadStream(filename, fileDetails)
    );

    // stream file into mongodb gridfs bucket
    readstream.pipe(writestream);

    // work on the stream
    if (done && _.isFunction(done)) {

      // handle errors
      writestream.on('error', function (error) {
        return done(error);
      });

      // finalize write
      writestream.on('finish', function (file) {
        return done(null, file);
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
 * @param {Object} options details for removing file
 * @param {Function} done a callback to invoke on success or error
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.6.0
 * @instance
 */
GridFSStorage.prototype.unlink = function unlink(options, done) {

  //prepare file remove options
  options = _.merge({}, options);

  //TODO support options
  //delete(id, callback)

  //remove file from storage
  this.storage.delete(options._id, done);

};


/**
 * @name unlinkById
 * @description remove an existing file using a specified objectid
 * @param {ObjectId} id objectid of the file in GridFS
 * @param {Function} done a callback to invoke on success or error
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.6.0
 * @instance
 */
GridFSStorage.prototype.unlinkById = function unlinkById(id, done) {
  //TODO support options
  //delete(id, callback)

  //remove file from storage
  this.unlink({ _id: id }, function (error) {
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
 * @param {Object} options valid find conditions
 * @param {Function} done a callback to invoke on success or error
 * @return {Object} file details
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.6.0
 * @instance
 */
GridFSStorage.prototype.findOne = function findOne(options, done) {

  // TODO support options
  // find(filter, options)

  // prepare file remove options
  options = _.merge({}, options);

  // find one existing file
  try {
    const cursor = this.storage.find(options);
    if (!cursor) { return done(new Error('Collection not found')); }
    cursor.next(done);
  }
  // catch find errors
  catch (error) {
    done(error);
  }

};


/**
 * @function
 * @name findById
 * @description find an existing file by given objectid
 * @param {ObjectId} id valid objectid of the existing file
 * @param {Function} done a callback to invoke on success or error
 * @return {Object} file details
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.6.0
 * @instance
 */
GridFSStorage.prototype.findById = function findById(id, done) {
  // TODO support options
  // find(filter, options)
  this.findOne({ _id: id }, done);
};


//readers


/**
 * @function
 * @name readById
 * @param {ObjectId} id valid file objectid
 * @param {Function} [done] a callback to invoke on success or error.
 *
 * Warn!: Pass callback if filesize is small enough.
 * Otherwise consider using stream instead.
 *
 * @return {stream.Readable}
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.6.0
 * @instance
 * @example
 * const readableStream = gridfs.readById(<id>);
 *
 * or
 *
 * gridfs.readById(<id>, function (error, content){ ... });
 *
 */
GridFSStorage.prototype.readById = function readById(id, done) {

  // TODO support options
  // openDownloadStream(id, options)

  //create a readable stream for a specific file
  const stream = this.storage.openDownloadStream(id);

  //pipe the whole stream into buffer if callback provided
  if (done && _.isFunction(done)) {
    read(stream, done);
  }

  //return stream
  else {
    return stream;
  }

};


/**
 * @function
 * @name readByFileName
 * @param {String} filename valid file name
 * @param {Function} [done] a callback to invoke on success or error.
 *
 * Warn!: Pass callback if filesize is small enough.
 * Otherwise consider using stream instead.
 *
 * @return {stream.Readable}
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.6.0
 * @instance
 * @example
 * const readableStream = gridfs.readByFileName("my_file.txt");
 *
 * or
 *
 * gridfs.readByFileName("my_file.txt",  function (error, content){ ... });
 *
 */
GridFSStorage.prototype.readByFileName =
  GridFSStorage.prototype.readByName = function readByName(filename, done) {

    // TODO support options
    // openDownloadStreamByName(filename, options)

    //create a readable stream for a specific file
    const stream = this.storage.openDownloadStreamByName(filename);

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
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.4.0
 * @instance
 * @see {@link https://github.com/expressjs/multer/blob/master/StorageEngine.md|StorageEngine}
 */
GridFSStorage.prototype._handleFile =
  function _handleFile(request, file, done) {

    //obtain file readable stream
    const stream = file.stream;

    //prepare file details
    const fileDetails = _.merge({}, {
      // _id: new ObjectId(),
      filename: file.originalname,
      contentType: file.mimetype
    });

    //write stream
    this.write(fileDetails, stream, done);

  };


/**
 * @function
 * @name _removeFile
 * @description multer file remove implementation
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.6.0
 * @instance
 * @see {@link https://github.com/expressjs/multer/blob/master/StorageEngine.md|StorageEngine}
 */
GridFSStorage.prototype._removeFile =
  function _removeFile(request, file, done) {

    //remove file
    if (file._id) {
      this.unlinkById(file._id, done);
    }

    //no operation
    else {
      done(null, null);
    }

  };


/* exports GridFSStorage instance */
module.exports = function (options) {
  const gridfs = new GridFSStorage(options);
  gridfs.GridFSStorage = GridFSStorage;
  return gridfs;
};
