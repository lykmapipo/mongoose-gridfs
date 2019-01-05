'use strict';


/* dependencies */
const _ = require('lodash');
const { Schema, Mixed, copyInstance } = require('@lykmapipo/mongoose-common');


/* constants */
const WRITABLES = ['_id', 'filename', 'contentType', 'aliases', 'metadata'];


/**
 * @function createSchema
 * @name createSchema
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
function createSchema(bucket) {
  // obtain collection name
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
  }, { collection });

  // attach bucket instance
  FileSchema.statics.bucket = bucket;

  /* instances */

  /**
   * @function
   * @name write
   * @description Write provided file into MongoDB GridFS
   * @param {stream.Readable} stream readable stream
   * @param {Function} [done] a callback to invoke in success or error
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
   * @instance
   * @example
   * const attachment = new Attachment({ filename });
   * attachment.write(<readableStream>, (error, attached) => { ... });
   */
  FileSchema.methods.write = function write(stream, done) {
    // obtain file writable details
    const file = _.pick(copyInstance(this), WRITABLES);

    // stream file to gridfs
    bucket.writeFile(file, stream, function (error, created) {
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
   * @param {Function} [done] a callback to invoke on success or error
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
  FileSchema.methods.read = function read(done) {
    // stream file out of gridfs
    const _id = this._id;
    const filename = this.filename;
    return bucket.readFile({ _id, filename }, done);
  };


  /**
   * @function deleteFile
   * @name deleteFile
   * @alias unlink
   * @description Remove an existing file and its chunks.
   * @param {ObjectId} _id The id of the file doc
   * @param {Function} done a callback to invoke on success or error
   * @return {Model} mongoose model instance
   * @author lally elias <lallyelias87@mail.com>
   * @license MIT
   * @since 1.0.0
   * @version 0.1.0
   * @instance
   * @example
   * attachment.unlink((error, unlinked) => { ... });
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


  //static methods


  /**
   * @function
   * @name write
   * @param {Object} fileDetails details of the file
   * @param {stream.Readable}   stream readable stream
   * @param {Function} [done]   a callback to invoke in success or error
   * @public
   * @example
   * Attachment.write({filename:<filename>}, <readableStream>, function(error, createdAttachment){
   *  ...
   * });
   */
  FileSchema.statics.write = function (file, stream, done) {
    const _file = new this(file);
    _file.write(stream, done);
  };


  /**
   * @function
   * @name readById
   * @param {ObjectId} id valid object id
   * @param {Function} done a callback to invoke on success or error
   * @return {stream.Readable}
   * @public
   * @example
   * Attachment.readById(<objectid>,function(error, fileContent){
   *  ...
   * });
   *
   * or for larger file size
   *
   * const stream = Attachment.readById(<id>);
   */
  FileSchema.statics.read = function (optns, done) {
    return bucket.readFile(optns, done);
  };


  /**
   * @function
   * @name unlink
   * @description remove a file from gridfs using specified objectid
   * @param {ObjectId} id valid object id
   * @param {Function} done a callback to invoke on success or error
   * @public
   * @example
   * Attachment.unlinkById(<id>, function(error, unlinkedFileDetails){
   *  ...
   * });
   *
   * or
   *
   * Attachment.unlink(<id>, function(error, unlinkedFileDetails){
   *  ...
   * });
   */
  FileSchema.statics.unlink = function unlink(_id, done) {
    this.findById(_id, function (error, file) {
      if (error) {
        return done(error);
      }

      if (!file) {
        return done(new Error('not found'));
      }

      file.unlink(done);
    });
  };

  // return grifs schema
  return FileSchema;

}


/* export bucket schema creator */
module.exports = exports = createSchema;
