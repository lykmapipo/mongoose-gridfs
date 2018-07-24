'use strict';


/* dependencies */
const _ = require('lodash');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Mixed = Schema.Types.Mixed;
const WRITABLES = ['_id', 'filename', 'contentType', 'aliases', 'metadata'];


/**
 * @description gridfs compactible schema
 * @type {Function}
 * @return {Schema} valid mongoose schema
 * @private
 */
module.exports = function (gridFSStorage) {
  //prepare collection
  const collection = [gridFSStorage.options.collection, 'files'].join('.');

  const GridFSSchema = new Schema({
    length: {
      type: Number
    },
    chunkSize: {
      type: Number
    },
    uploadDate: {
      type: Date
    },
    md5: {
      type: String
    },
    filename: {
      type: String
    },
    contentType: {
      type: String
    },
    aliases: {
      type: [String]
    },
    metadata: {
      type: Mixed
    },
  }, {
    collection: collection
  });


  //attach GridFSStorage instance
  GridFSSchema.statics.gridfs = gridFSStorage;

  //instance methods

  /**
   * @function
   * @name write
   * @param  {stream.Readable}   stream readable stream
   * @param  {Function} [done]   a callback to invoke in success or error
   * @private
   * @example
   * const attachment = new Attachment({filename:<filename>});
   * attachment.write(<readableStream>, function(error,createdAttachment){
   *  ...
   * });
   */
  GridFSSchema.methods.write = function (stream, done) {
    //obtain writable file details
    const fileDetails = _.pick(this.toObject(), WRITABLES);

    //stream file to gridfs
    return gridFSStorage.write(fileDetails, stream, function (error,
      createdFile) {
      if (error) {
        done(error);
      } else {
        //read file details
        gridFSStorage.model.findById(createdFile._id, done);
      }
    });
  };


  /**
   * @function
   * @name read
   * @param  {Function} [done] a callback to invoke on success or error
   * @return {stream.Readable}
   * @private
   * @example
   * Attachment.findById(<objectid>).exec(function(error, attachment){
   *  attachment.read(function(error, fileContent){
   *   ...
   *  });
   * });
   *
   * or for larger file size use stream
   *
   * Attachment.findById(<objectid>).exec(function(error, attachment){
   *  const stream = attachment.read();
   *  stream.on('error', fn);
   *  stream.on('data', fn);
   *  stream.on('close', fn);
   * });
   */
  GridFSSchema.methods.read = function (done) {
    //stream file out of gridfs
    return gridFSStorage.readById(this._id, done);
  };


  /**
   * @function
   * @name readByFileName
   * @param {String} filename valid file name
   * @param  {Function} done a callback to invoke on success or error
   * @return {stream.Readable}
   * @public
   * @example
   * Attachment.readByFileName(<filename>,function(error, fileContent){
   *  ...
   * });
   *
   * or for larger file size
   *
   * const stream = Attachment.readByFileName(<filename>);
   */
  GridFSSchema.statics.readByFileName = function (filename, done) {
    return gridFSStorage.readByFileName(filename, done);
  };


  /**
   * @function
   * @name unlink
   * @description remove file from gridfs and file collection
   * @param  {Function} done a callback to invoke on success or error
   * @private
   * @return {Model} mongoose model instance
   * @example
   * attachment.unlink(function(error, unlinkedAttachment){
   *  ...
   * });
   */
  GridFSSchema.methods.unlink = function (done) {
    //obtain file details
    gridFSStorage.model.findById(this._id, function (error, fileDetails) {
      if (error) {
        done(error);
      } else {
        //remove file from gridfs
        gridFSStorage.unlinkById(fileDetails._id, function (_error /*, id*/ ) {
          done(_error, fileDetails);
        });
      }
    });
  };


  //static methods


  /**
   * @function
   * @name write
   * @param {Object} fileDetails details of the file
   * @param  {stream.Readable}   stream readable stream
   * @param  {Function} [done]   a callback to invoke in success or error
   * @public
   * @example
   * Attachment.write({filename:<filename>}, <readableStream>, function(error, createdAttachment){
   *  ...
   * });
   */
  GridFSSchema.statics.write = function (fileDetails, stream, done) {
    const $new = new this(fileDetails);
    $new.write(stream, done);
  };


  /**
   * @function
   * @name readById
   * @param {ObjectId} id valid object id
   * @param  {Function} done a callback to invoke on success or error
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
  GridFSSchema.statics.readById = function (id, done) {
    return gridFSStorage.readById(id, done);
  };


  /**
   * @function
   * @name unlinkById
   * @description remove a file from gridfs using specified objectid
   * @param {ObjectId} id valid object id
   * @param  {Function} done a callback to invoke on success or error
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
  GridFSSchema.statics.unlinkById =
    GridFSSchema.statics.unlink = function (id, done) {
      gridFSStorage.model.findById(id, function (error, foundInstance) {
        if (error) {
          return done(error);
        }

        if (!foundInstance) {
          return done(new Error('not found'));
        }

        foundInstance.unlink(done);
      });
    };

  //return grifs schema
  return GridFSSchema;

};
