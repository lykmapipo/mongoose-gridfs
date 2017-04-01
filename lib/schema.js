'use strict';

//dependencies
var _ = require('lodash');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Mixed = Schema.Types.Mixed;
var WRITABLES = ['filename', 'contentType', 'aliases', 'metadata'];

/**
 * @description gridfs compactible schema
 * @type {Function}
 * @return {Schema} valid mongoose schema
 */
module.exports = function(gridFSStorage) {
	//prepare collection
	var collection = [gridFSStorage.options.collection, 'files'].join('.');
	var model = gridFSStorage.options.model;

	var GridFSSchema = new Schema({
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
		aliases: [{
			type: String
		}],
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
	 * var attachment = new Attachment({filename:<filename>});
	 * attachment.write(<readableStream>, function(error,createdAttachment){
	 * 	...
	 * });
	 */
	GridFSSchema.methods.write = function(stream, done) {
		//obtain writable file details
		var fileDetails = _.pick(this.toObject(), WRITABLES);

		//grab gridfs
		var gridfs = gridFSStorage.connection.model(model).gridfs;

		//stream file to gridfs
		gridfs.write(fileDetails, stream, function(error, createdFile) {
			if (error) {
				done(error);
			} else {
				//read file details
				gridFSStorage.connection.model(model).findById(createdFile._id, done);
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
	 * 	attachment.read(function(error, fileContent){
	 * 	 ...
	 * 	});
	 * });
	 *
	 * or for larger file size use stream
	 * 
	 * Attachment.findById(<objectid>).exec(function(error, attachment){
	 * 	var stream = attachment.read();
	 * 	stream.on('error', fn);
	 * 	stream.on('data', fn);
	 * 	stream.on('close', fn);
	 * });
	 */
	GridFSSchema.methods.read = function(done) {
		//grab gridfs
		var gridfs = gridFSStorage.connection.model(model).gridfs;

		//stream file out of gridfs
		return gridfs.readById(this._id, done);
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
	GridFSSchema.methods.unlink = function(done) {
		//grab gridfs
		var gridfs = gridFSStorage.connection.model(model).gridfs;

		//obtain file details
		gridFSStorage.connection.model(model).findById(this._id, function(error, fileDetails) {
			if (error) {
				done(error);
			} else {
				//remove file from gridfs
				gridfs.unlinkById(fileDetails._id, function(_error /*, id*/ ) {
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
	 * 	...
	 * });
	 */
	GridFSSchema.statics.write = function(fileDetails, stream, done) {
		var $new = new this(fileDetails);
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
	 * 	...
	 * });
	 *
	 * or for larger file size
	 *
	 * var stream = Attachment.readById(<id>);
	 */
	GridFSSchema.statics.readById = function(id, done) {
		return this.gridfs.readById(id, done);
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
	 * 	...
	 * });
	 *
	 * or
	 *
	 * Attachment.unlink(<id>, function(error, unlinkedFileDetails){
	 * 	...
	 * });
	 */
	GridFSSchema.statics.unlinkById =
		GridFSSchema.statics.unlink = function(id, done) {
			gridFSStorage.connection.model(model).findById(id).exec(function(error, foundInstance) {
				foundInstance.unlink(done);
			});
		};

	//return grifs schema
	return GridFSSchema;
	
};