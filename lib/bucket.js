'use strict';


/* dependencies */
const _ = require('lodash');
const {
  mongo: { GridFSBucket },
  Types: { ObjectId }
} = require('mongoose');
// const { model, connect } = require('@lykmapipo/mongoose-common');

/* constants */
const DEFAULT_MODEL_NAME = 'File';
const DEFAULT_BUCKET_NAME = 'fs';
const DEFAULT_CHUNK_SIZE = 255 * 1024;
const DEFAULT_BUCKET_OPTIONS = {
  bucketName: DEFAULT_BUCKET_NAME,
  chunkSizeBytes: DEFAULT_CHUNK_SIZE
};


/* instances */


/**
 * @function openWriteStream
 * @name openWriteStream
 * @alias writeStream
 * @description  Returns a writable stream (GridFSBucketWriteStream) for writing
 * buffers to GridFS for a custom file id. The stream's 'id' property contains
 * the resulting file's id.
 * @param {ObjectId} _id A custom id used to identify the file
 * @param {String} filename The value of the 'filename' key in the files doc
 * @param {Object} [options] Optional settings.
 * @param {Number} [options.chunkSizeBytes] Optional overwrite this bucket's
 * chunkSizeBytes for this file.
 * @param {Object} [options.metadata] Optional object to store in the file
 * document's `metadata` field.
 * @param {String} [options.contentType] Optional string to store in the file
 * document's `contentType` field.
 * @param {Array} [options.aliases] Optional array of strings to store in the
 * file document's `aliases` field.
 * @param {Boolean} [options.disableMD5=false] If true, disables adding an
 * md5 field to file data.
 * @return {GridFSBucketWriteStream}
 * @author lally elias <lallyelias87@mail.com>
 * @license MIT
 * @since 1.0.0
 * @version 0.1.0
 * @instance
 */
GridFSBucket.prototype.openWriteStream =
  GridFSBucket.prototype.writeStream = function openWriteStream(optns) {
    // ensure options
    const defaults = { _id: new ObjectId() };
    const options = _.merge({}, defaults, optns);
    const { _id, id, filename } = options;

    // ensure filename
    if (_.isEmpty(filename)) {
      throw new Error('Missing filename');
    }

    // open write stream
    const writeStream =
      this.openUploadStreamWithId((_id || id), filename, options);
    return writeStream;
  };


/* statics */
GridFSBucket.DEFAULT_NAME = DEFAULT_BUCKET_NAME;
GridFSBucket.DEFAULT_MODEL_NAME = DEFAULT_MODEL_NAME;
GridFSBucket.DEFAULT_CHUNK_SIZE = DEFAULT_CHUNK_SIZE;
GridFSBucket.DEFAULT_OPTIONS = DEFAULT_BUCKET_OPTIONS;


/* export GridFSBucket */
module.exports = exports = GridFSBucket;
