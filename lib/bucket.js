'use strict';


/* dependencies */
const _ = require('lodash');
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


/* instances streams */


/**
 * @function createWriteStream
 * @name createWriteStream
 * @description  Returns a writable stream (GridFSBucketWriteStream) for writing
 * buffers to GridFS for a custom file id. The stream's 'id' property contains
 * the resulting file's id.
 * @param {Object} optns Optional settings.
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
 * const bucket = createDefaultBucket();
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
 * @description Returns a readable stream (GridFSBucketReadStream) for
 * streaming the file with the given name from GridFS. If there are multiple
 * files with the same name, this will stream the most recent file with the
 * given name (as determined by the `uploadDate` field). You can set the
 * `revision` option to change this behavior.
 * @param {Object} [optns] Optional settings.
 * @param {ObjectId} optns._id The id of the file doc
 * @param {String} [optns.filename] The name of the file doc to stream
 * @param {number} [options.revision=-1] The revision number relative to the
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
 * const bucket = createDefaultBucket();
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
  if (_.isEmpty(filename) || !_id) {
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


/* instances writers */


/* instances removers */
/* instances finders */
/* instances readers */
/* instances rename */

// multer

/* TODO export them */
/* statics */

function createBucket(optns, conn) {
  //TODO accept conn/db?
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
