'use strict';


/* dependencies */
const _ = require('lodash');
const read = require('stream-read');
const mongoose = require('mongoose');
const {
  mongo: { GridFSBucket },
  Types: { ObjectId },
} = mongoose;
// const { model, connect } = require('@lykmapipo/mongoose-common');


/* constants */
const DEFAULT_BUCKET_MODEL_NAME = 'File';
const DEFAULT_BUCKET_NAME = 'fs';
const DEFAULT_BUCKET_CHUNK_SIZE = 255 * 1024;
const DEFAULT_BUCKET_OPTIONS = {
  bucketName: DEFAULT_BUCKET_NAME,
  chunkSizeBytes: DEFAULT_BUCKET_CHUNK_SIZE
};


/* getters */

/**
 * @name bucketName
 * @description Bucket name used to prefix 'files' and 'chunks' collections.
 * @return {String}
 * @author lally elias <lallyelias87@mail.com>
 * @license MIT
 * @since 1.0.0
 * @version 0.1.0
 * @instance
 * @example
 * const bucket = createBucket();
 * const bucketName = bucket.bucketName;
 */
Object.defineProperty(GridFSBucket.prototype, 'bucketName', {
  get: function getBucketName() {
    return this.s.options.bucketName;
  }
});


/**
 * @name collection
 * @description Collection used to store file data.
 * @return {Collection}
 * @author lally elias <lallyelias87@mail.com>
 * @license MIT
 * @since 0.1.0
 * @version 0.6.0
 * @instance
 * @example
 */
Object.defineProperty(GridFSBucket.prototype, 'collection', {
  get: function getCollection() {
    return this.s._filesCollection;
  }
});


/**
 * @name collectionName
 * @description Name of a collection used to store file.
 * @return {String}
 * @author lally elias <lallyelias87@mail.com>
 * @license MIT
 * @since 0.1.0
 * @version 0.7.0
 * @instance
 * @example
 */
Object.defineProperty(GridFSBucket.prototype, 'collectionName', {
  get: function getCollectionName() {
    return this.s._filesCollection.s.name;
  }
});


/* streams */

/**
 * @function createWriteStream
 * @name createWriteStream
 * @description Creates a writable stream (GridFSBucketWriteStream) for writing
 * buffers to GridFS for a custom file id. The stream's 'id' property contains
 * the resulting file's id.
 * @param {Object} optns Valid options for write file.
 * @param {ObjectId} [optns._id] A custom id used to identify file doc.
 * @param {String} optns.filename The value of the 'filename' key in the files
 * doc.
 * @param {Number} [optns.chunkSizeBytes] Optional overwrite this bucket's
 * chunkSizeBytes for this file.
 * @param {Object} [optns.metadata] Optional object to store in the file
 * document's `metadata` field.
 * @param {String} [optns.contentType] Optional string to store in the file
 * document's `contentType` field.
 * @param {Array} [optns.aliases] Optional array of strings to store in the
 * file document's `aliases` field.
 * @param {Boolean} [optns.disableMD5=false] If true, disables adding an
 * md5 field to file data.
 * @return {GridFSBucketWriteStream}
 * @author lally elias <lallyelias87@mail.com>
 * @license MIT
 * @since 1.0.0
 * @version 0.1.0
 * @instance
 * @example
 * const bucket = createBucket();
 * const _id = new ObjectId();
 * const filename = 'filename.txt';
 * const readStream = fs.createReadStream(filename);
 * const writeStream = bucket.createWriteStream({_id, filename});
 * readStream.pipe(writeStream);
 */
GridFSBucket.prototype.createWriteStream = function createWriteStream(optns) {
  // ensure options
  const defaults = { _id: new ObjectId() };
  const options = _.merge({}, defaults, optns);
  const { _id, filename } = options;

  // ensure filename
  // TODO ignore and fail safe?
  if (_.isEmpty(filename)) {
    let error = new Error('Missing filename');
    error.status = 400;
    throw error;
  }

  // open write stream
  const writeStream =
    this.openUploadStreamWithId(_id, filename, options);

  // return writeStream
  return writeStream;
};


/**
 * @function createReadStream
 * @name createReadStream
 * @description Creates a readable stream (GridFSBucketReadStream) for
 * streaming the file with the given name from GridFS. If there are multiple
 * files with the same name, this will stream the most recent file with the
 * given name (as determined by the `uploadDate` field). You can set the
 * `revision` option to change this behavior.
 * @param {Object} [optns] Valid options for read existing file.
 * @param {ObjectId} optns._id The id of the file doc
 * @param {String} [optns.filename] The name of the file doc to stream
 * @param {Number} [options.revision=-1] The revision number relative to the
 * oldest file with the given filename. 0 gets you the oldest file, 1 gets you
 * the 2nd oldest, -1 gets you the newest.
 * @param {Number} [optns.start] Optional 0-based offset in bytes to start
 * streaming from.
 * @param {Number} [optns.end] Optional 0-based offset in bytes to stop
 * streaming before.
 * @return {GridFSBucketReadStream}
 * @author lally elias <lallyelias87@mail.com>
 * @license MIT
 * @since 1.0.0
 * @version 0.1.0
 * @instance
 * @example
 * const bucket = createBucket();
 * const _id = new ObjectId();
 * const filename = 'filename.txt';
 * const writeStream = fs.createWriteStream(filename);
 * const readStream = bucket.createReadStream({_id, filename});
 * readStream.pipe(writeStream);
 */
GridFSBucket.prototype.createReadStream = function createReadStream(optns) {
  // ensure options
  const options = _.merge({}, optns);
  const { _id, filename } = options;

  // ensure filename or _id
  // TODO ignore and fail safe?
  if (_.isEmpty(filename) && !_id) {
    let error = Error('Missing filename or file id');
    error.status = 400;
    throw error;
  }

  // initalize readStream
  let readStream;

  // open download stream by file id
  if (_id) {
    readStream = this.openDownloadStream(_id, options);
  }

  // open download stream by file name
  if (!_.isEmpty(filename)) {
    readStream = this.openDownloadStreamByName(filename, options);
  }

  // return readStream
  return readStream;
};


/* writers */

/**
 * @function writeFile
 * @name writeFile
 * @description Write provided file into MongoDB GridFS
 * @param {Object} file valid file details
 * @param {ReadableStream} readstream valid nodejs ReadableStream
 * @param {Function} [done] a callback to invoke on success or error
 * @fires GridFSBucketWriteStream#error
 * @fires GridFSBucketWriteStream#finish
 * @return {GridFSBucketWriteStream} a GridFSBucketWriteStream instance.
 * @see {@link https://docs.mongodb.com/manual/core/gridfs/}
 * @see {@link http://mongodb.github.io/node-mongodb-native/3.1/api/GridFSBucket.html}
 * @see {@link http://mongodb.github.io/node-mongodb-native/3.1/api/GridFSBucketWriteStream.html}
 * @see {@link https://nodejs.org/api/stream.html#stream_writable_streams}
 * @see {@link https://nodejs.org/api/stream.html#stream_readable_streams}
 * @author lally elias <lallyelias87@mail.com>
 * @license MIT
 * @since 1.0.0
 * @version 0.1.0
 * @instance
 * @example
 *
 * // large file
 * const bucket = createBucket();
 * const filename = 'filename.txt';
 * const readStream = fs.createReadStream(filename);
 * const writeStream = bucket.writeFile({ filename }, readStream);
 *
 * // small file
 * const bucket = createBucket();
 * const filename = 'filename.txt';
 * const readStream = fs.createReadStream(filename);
 * bucket.writeFile({ filename }, readStream, (error, file) => { ... });
 */
GridFSBucket.prototype.writeFile = function writeFile(file, readstream, done) {
  // ensure file details
  const _file = _.merge({}, { _id: new ObjectId() }, file);

  // create file write stream
  const writestream = this.createWriteStream(_file);

  // stream file into mongodb gridfs bucket
  readstream.pipe(writestream);

  // work on the stream
  if (done && _.isFunction(done)) {

    // handle errors
    writestream.on('error', function onWriteFileError(error) {
      return done(error);
    });

    // finalize write
    writestream.on('finish', function onWriteFileFinish(file) {
      return done(null, file);
    });

  }

  //return writestream
  else {
    return writestream;
  }

};

/* readers */

/**
 * @function readFile
 * @name readFile
 * @description Read file from MongoDB GridFS
 * @param {Object} optns valid criteria for read existing file.
 * @param {ObjectId} optns._id The id of the file doc
 * @param {String} [optns.filename] The name of the file doc to stream
 * @param {Number} [options.revision=-1] The revision number relative to the
 * oldest file with the given filename. 0 gets you the oldest file, 1 gets you
 * the 2nd oldest, -1 gets you the newest.
 * @param {Number} [optns.start] Optional 0-based offset in bytes to start
 * streaming from.
 * @param {Number} [optns.end] Optional 0-based offset in bytes to stop
 * streaming before.
 * @param {Function} [done] a callback to invoke on success or error.
 *
 * Warn!: Pass callback if filesize is small enough.
 * Otherwise consider using stream instead.
 *
 * @fires GridFSBucketReadStream#error
 * @fires GridFSBucketReadStream#file
 * @return {GridFSBucketReadStream} a GridFSBucketReadStream instance.
 * @see {@link https://docs.mongodb.com/manual/core/gridfs/}
 * @see {@link http://mongodb.github.io/node-mongodb-native/3.1/api/GridFSBucket.html}
 * @see {@link http://mongodb.github.io/node-mongodb-native/3.1/api/GridFSBucket.html}
 * @see {@link https://nodejs.org/api/stream.html#stream_writable_streams}
 * @see {@link https://nodejs.org/api/stream.html#stream_readable_streams}
 * @author lally elias <lallyelias87@mail.com>
 * @license MIT
 * @since 1.0.0
 * @version 0.1.0
 * @instance
 * @example
 *
 * // large file
 * const bucket = createBucket();
 * const filename = 'filename.txt';
 * const readStream = bucket.readFile({ filename });
 *
 * // small file
 * const bucket = createBucket();
 * const filename = 'filename.txt';
 * bucket.readFile({ filename }, (error, buffer) => { ... });
 */
GridFSBucket.prototype.readFile = function readFile(optns, done) {
  // ensure options
  const _optns = _.merge({}, optns);

  //create file read stream
  const readstream = this.createReadStream(_optns);

  //pipe the whole stream into buffer if callback provided
  if (done && _.isFunction(done)) {
    return read(readstream, done);
  }

  //return stream
  else {
    return readstream;
  }

};
/* instances removers */
/* instances finders */
/* instances rename */
/* multer storage */

/* statics */

function createBucket(optns, conn) {
  //TODO ensure mongoose connection of not exist
  //TODO cache created buckets and return them if exists than create new
  // ensure options
  const options = _.merge({}, DEFAULT_BUCKET_OPTIONS, optns);
  // ensure connection
  const connection = (conn || mongoose.connection);
  // obtain db
  const db = connection.db;
  // create GridFSBucket
  const bucket = new GridFSBucket(db, options);
  // return bucket
  return bucket;
}


/* export GridFSBucket */
module.exports = exports = {
  DEFAULT_BUCKET_NAME,
  DEFAULT_BUCKET_MODEL_NAME,
  DEFAULT_BUCKET_CHUNK_SIZE,
  DEFAULT_BUCKET_OPTIONS,
  GridFSBucket,
  createBucket
};
