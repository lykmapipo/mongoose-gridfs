import _ from 'lodash';
import { Schema, Mixed, copyInstance } from '@lykmapipo/mongoose-common';

/* constants */
const WRITABLES = ['_id', 'filename', 'contentType', 'aliases', 'metadata'];

/**
 * @function createFileSchema
 * @name createFileSchema
 * @description Create mongoose schema compactible with gridfs files collection.
 * @param {object} bucket Valid instance of `GridFSBucket`
 * @returns {object} valid mongoose schema to access specific gridfs
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
  const FileSchema = new Schema(
    {
      length: { type: Number, index: true },
      chunkSize: { type: Number, index: true },
      uploadDate: { type: Date, index: true },
      md5: { type: String, trim: true, index: true, searchable: true },
      filename: { type: String, trim: true, index: true, searchable: true },
      contentType: { type: String, trim: true, index: true, searchable: true },
      aliases: { type: [String], sort: true, index: true, searchable: true },
      metadata: { type: Mixed },
    },
    { collection, id: false, emitIndexErrors: true }
  );

  // expose timestamps as virtuals
  FileSchema.virtual('createdAt').get(function wireCreatedAtVirtualType() {
    return this.uploadDate;
  });
  FileSchema.virtual('updatedAt').get(function wireUpdateAtVirtualType() {
    return this.uploadDate;
  });

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
   * @returns {object} Valid instance of mongoose model.
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
   */
  FileSchema.methods.write = function write(stream, done) {
    // obtain file writable details
    const file = _.pick(copyInstance(this), WRITABLES);

    // stream file to gridfs
    return bucket.writeFile(
      file,
      stream,
      function afterWriteFile(error, created) {
        // back-off error
        if (error) {
          return done(error);
        }
        // read file details
        // eslint-disable-next-line no-underscore-dangle
        return this.constructor.findById(created._id, done);
      }.bind(this)
    );
  };

  /**
   * @function read
   * @name read
   * @description Read file from MongoDB GridFS
   * @param {object} optns valid criteria for read existing file.
   * @param {number} [optns.revision=-1] The revision number relative to the
   * oldest file with the given filename. 0 gets you the oldest file, 1 gets you
   * the 2nd oldest, -1 gets you the newest.
   * @param {number} [optns.start] Optional 0-based offset in bytes to start
   * streaming from.
   * @param {number} [optns.end] Optional 0-based offset in bytes to stop
   * streaming before.
   * @param {Function} [done] a callback to invoke on success or error.
   *
   * Warn!: Pass callback if filesize is small enough.
   * Otherwise consider using stream instead.
   * @returns {object} a GridFSBucketReadStream instance.
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
   */
  FileSchema.methods.read = function read(optns, done) {
    // normalize arguments
    let $optns = optns;
    let cb = done;
    if (_.isFunction(optns)) {
      cb = optns;
      $optns = {};
    }

    // stream file out of gridfs
    const { _id } = this;
    const { filename } = this;
    const $$optns = _.merge({}, $optns, { _id, filename });
    return bucket.readFile($$optns, cb);
  };

  /**
   * @function unlink
   * @name unlink
   * @alias unlink
   * @description Remove an existing file and its chunks.
   * @param {Function} done a callback to invoke on success or error
   * @returns {object} mongoose model instance
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
   */
  FileSchema.methods.unlink = function unlink(done) {
    // obtain file details
    return this.constructor.findById(
      // eslint-disable-next-line no-underscore-dangle
      this._id,
      function afterFindFile(error, file) {
        // back-off error
        if (error) {
          return done(error);
        }
        // remove file from gridfs
        return bucket.deleteFile(
          // eslint-disable-next-line no-underscore-dangle
          file._id,
          function afterDeleteFile($error /* , id */) {
            done($error, file);
          }
        );
      }
    );
  };

  /* statics */

  /**
   * @function
   * @name write
   * @description Write provided file into MongoDB GridFS
   * @param {object} file valid file details
   * @param {stream.Readable} stream readable stream
   * @param {Function} [done] a callback to invoke in success or error
   * @returns {object} a GridFSBucketWriteStream instance.
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
   */
  FileSchema.statics.write = function write(file, stream, done) {
    const $file = new this(file);
    return $file.write(stream, done);
  };

  /**
   * @function read
   * @name read
   * @description Read file from MongoDB GridFS
   * @param {object} optns valid criteria for read existing file.
   * @param {object} optns._id The id of the file doc
   * @param {string} [optns.filename] The name of the file doc to stream
   * @param {number} [optns.revision=-1] The revision number relative to the
   * oldest file with the given filename. 0 gets you the oldest file, 1 gets you
   * the 2nd oldest, -1 gets you the newest.
   * @param {number} [optns.start] Optional 0-based offset in bytes to start
   * streaming from.
   * @param {number} [optns.end] Optional 0-based offset in bytes to stop
   * streaming before.
   *
   * Warn!: Pass callback if filesize is small enough.
   * Otherwise consider using stream instead.
   * @param {Function} [done] a callback to invoke on success or error
   * @returns {object} a GridFSBucketReadStream instance.
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
   */
  FileSchema.statics.read = function read(optns, done) {
    return bucket.readFile(optns, done);
  };

  /**
   * @function unlink
   * @name unlink
   * @alias unlink
   * @description Remove an existing file and its chunks.
   * @param {object} _id The id of the file doc
   * @param {Function} done a callback to invoke on success or error
   * @returns {object} mongoose model instance
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
   */
  FileSchema.statics.unlink = function unlink(_id, done) {
    return this.findById(_id, function afterFindById(error, file) {
      // back-off error
      if (error) {
        return done(error);
      }

      if (!file) {
        return done(new Error('not found'));
      }

      // remove file from gridfs
      return file.unlink(done);
    });
  };

  // return grifs schema
  return FileSchema;
}

/* export bucket schema creator */
export default createFileSchema;
