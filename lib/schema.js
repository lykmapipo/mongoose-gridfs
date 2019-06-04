'use strict';


/* dependencies */
const _ = require('lodash');
const { Schema, Mixed, copyInstance } = require('@lykmapipo/mongoose-common');


/* constants */
const WRITABLES = ['_id', 'filename', 'contentType', 'aliases', 'metadata'];


/**
 * @function createFileSchema
 * @name createFileSchema
 * @description Create mongoose schema compactible with gridfs files collection.
 * @return {Schema} valid mongoose schema to access specific gridfs
 * files collection.
 * @see {@link https://docs.mongodb.com/manual/core/gridfs/}
 * @see {@link https://docs.mongodb.com/manual/core/gridfs/#the-files-collection}
 * @author lally elias <lallyelias87@mail.com>
 * @license MIT
 * @since 1.0.0
 * @version 0.1.0
 * @private
 */
function createFileSchema(bucket) {
  // obtain collection name from bucket
  const collection = bucket.collectionName;

  // gridfs files collection compactible schema
  // see https://docs.mongodb.com/manual/core/gridfs/#the-files-collection
  const FileSchema = new Schema({
    length: { type: Number, index: true },
    chunkSize: { type: Number, index: true },
    uploadDate: { type: Date, index: true },
    md5: { type: String, trim: true, index: true, searchable: true },
    filename: { type: String, trim: true, index: true, searchable: true },
    contentType: { type: String, trim: true, index: true, searchable: true },
    aliases: { type: [String], sort: true, index: true, searchable: true },
    metadata: { type: Mixed },
  }, { collection, id: false, emitIndexErrors: true });

  // expose timestamps as virtuals
  FileSchema.virtual('createdAt').get(function () { return this.uploadDate; });
  FileSchema.virtual('updatedAt').get(function () { return this.uploadDate; });

  // allow virtuals to be included in toJSON and toObject
  FileSchema.set('toJSON', { virtuals: true });
  FileSchema.set('toObject', { virtuals: true });

  // attach bucket instance
  FileSchema.statics.bucket = bucket;


  /* instances */

  /**
   * @function write
   * @name write
   * @description Write provided file into MongoDB GridFS
   * @param {stream.Readable} stream readable stream
   * @param {Function} [done] a callback to invoke in success or error
   * @return {Model} valid instance of mongoose model.
   * @see {@link https://docs.mongodb.com/manual/core/gridfs/}
   * @see {@link http://mongodb.github.io/node-mongodb-native}
   * @see {@link https://nodejs.org/api/stream.html#stream_writable_streams}
   * @see {@link https://nodejs.org/api/stream.html#stream_readable_streams}
   * @author lally elias <lallyelias87@mail.com>
   * @license MIT
   * @since 1.0.0
   * @version 0.1.0
   * @instance
   * @example
   *
   * const attachment = new Attachment({ filename });
   * attachment.write(readablestream, (error, attached) => {
   *  //=> {_id: ..., filename: ..., ... }
   * });
   *
   */
  FileSchema.methods.write = function write(stream, done) {
    // obtain file writable details
    const file = _.pick(copyInstance(this), WRITABLES);

    // stream file to gridfs
    bucket.writeFile(file, stream, function afterWriteFile(error, created) {
      // back-off error
      if (error) {
        done(error);
      }
      //read file details
      else {
        this.constructor.findById(created._id, done);
      }
    }.bind(this));
  };


  /**
   * @function read
   * @name read
   * @description Read file from MongoDB GridFS
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
   * @return {GridFSBucketReadStream} a GridFSBucketReadStream instance.
   * @see {@link https://docs.mongodb.com/manual/core/gridfs/}
   * @see {@link http://mongodb.github.io/node-mongodb-native}
   * @see {@link https://nodejs.org/api/stream.html#stream_writable_streams}
   * @see {@link https://nodejs.org/api/stream.html#stream_readable_streams}
   * @author lally elias <lallyelias87@mail.com>
   * @license MIT
   * @since 1.0.0
   * @version 0.1.0
   * @instance
   * @example
   *
   * // small file
   * Attachment.findById(_id, (error, attachment) => {
   *   attachment.read((error, content) => { ... });
   * });
   *
   * // large file
   * Attachment.findById(_id, (error, attachment) => {
   *   const readstream = attachment.read();
   *   stream.on('error', fn);
   *   stream.on('data', fn);
   *   stream.on('close', fn);
   * });
   *
   */
  FileSchema.methods.read = function read(done) {
    // stream file out of gridfs
    const _id = this._id;
    const filename = this.filename;
    return bucket.readFile({ _id, filename }, done);
  };


  /**
   * @function unlink
   * @name unlink
   * @alias unlink
   * @description Remove an existing file and its chunks.
   * @param {Function} done a callback to invoke on success or error
   * @return {Model} mongoose model instance
   * @author lally elias <lallyelias87@mail.com>
   * @license MIT
   * @since 1.0.0
   * @version 0.1.0
   * @instance
   * @example
   *
   * attachment.unlink((error, unlinked) => {
   *  //=> {_id: ..., filename: ..., ... }
   * });
   *
   */
  FileSchema.methods.unlink = function unlink(done) {
    // obtain file details
    this.constructor.findById(this._id, function afterFindFile(error, file) {
      // back-off error
      if (error) {
        done(error);
      }
      //remove file from gridfs
      else {
        bucket.deleteFile(file._id, function afterDeleteFile(error /*, id*/ ) {
          done(error, file);
        });
      }
    });
  };


  /* statics */

  /**
   * @function
   * @name write
   * @description Write provided file into MongoDB GridFS
   * @param {Object} file valid file details
   * @param {stream.Readable} stream readable stream
   * @param {Function} [done] a callback to invoke in success or error
   * @return {GridFSBucketWriteStream} a GridFSBucketWriteStream instance.
   * @see {@link https://docs.mongodb.com/manual/core/gridfs/}
   * @see {@link http://mongodb.github.io/node-mongodb-native}
   * @see {@link https://nodejs.org/api/stream.html#stream_writable_streams}
   * @see {@link https://nodejs.org/api/stream.html#stream_readable_streams}
   * @author lally elias <lallyelias87@mail.com>
   * @license MIT
   * @since 1.0.0
   * @version 0.1.0
   * @static
   * @public
   * @example
   *
   * // large file
   * const writeStream = Attachment.write({ filename }, readStream);
   *
   * // small file
   * Attachment.write({ filename }, readstream, (error, file) => {
   *  //=> {_id: ..., filename: ..., ... }
   * });
   *
   */
  FileSchema.statics.write = function write(file, stream, done) {
    const _file = new this(file);
    _file.write(stream, done);
  };


  /**
   * @function read
   * @name read
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
   * @param {Function} [done] a callback to invoke on success or error
   * @return {GridFSBucketReadStream} a GridFSBucketReadStream instance.
   * @see {@link https://docs.mongodb.com/manual/core/gridfs/}
   * @see {@link http://mongodb.github.io/node-mongodb-native}
   * @see {@link https://nodejs.org/api/stream.html#stream_writable_streams}
   * @see {@link https://nodejs.org/api/stream.html#stream_readable_streams}
   * @author lally elias <lallyelias87@mail.com>
   * @license MIT
   * @since 1.0.0
   * @version 0.1.0
   * @static
   * @public
   * @example
   *
   * // small file
   * Attachment.read({ _id }, (error, content) => { ... });
   *
   * // large file
   * const readstream = Attachment.read({ _id });
   * stream.on('error', fn);
   * stream.on('data', fn);
   * stream.on('close', fn);
   *
   */
  FileSchema.statics.read = function read(optns, done) {
    return bucket.readFile(optns, done);
  };


  /**
   * @function unlink
   * @name unlink
   * @alias unlink
   * @description Remove an existing file and its chunks.
   * @param {ObjectId} _id The id of the file doc
   * @param {Function} done a callback to invoke on success or error
   * @return {Model} mongoose model instance
   * @author lally elias <lallyelias87@mail.com>
   * @license MIT
   * @since 1.0.0
   * @version 0.1.0
   * @static
   * @public
   * @example
   *
   * Attachment.unlink(_id, (error, unlinked) => {
   *  //=> {_id: ..., filename: ..., ... }
   * });
   *
   */
  FileSchema.statics.unlink = function unlink(_id, done) {
    this.findById(_id, function (error, file) {
      // back-off error
      if (error) {
        return done(error);
      }

      if (!file) {
        return done(new Error('not found'));
      }

      //remove file from gridfs
      file.unlink(done);
    });
  };

  // return grifs schema
  return FileSchema;

}


/* export bucket schema creator */
module.exports = exports = createFileSchema;
