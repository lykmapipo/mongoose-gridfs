'use strict';

/**
 * observation submission specification
 */

// dependencies
var path = require('path');
var fs = require('fs');
var mime = require('mime');
var isStream = require('is-stream');
var mongoose = require('mongoose');
var _ = require('lodash');
var expect = require('chai').expect;
var gridFSStorage = require(path.join(__dirname, '..', 'lib', 'storage'));

describe('GridFSStorage', function() {

	//collect ids
	var ids = [];

	it('should export a functional constructor', function() {
		expect(gridFSStorage).to.exist;
		expect(gridFSStorage).to.be.a.function;
	});

	it('should expose underlying files collection', function() {
		var gridfs = gridFSStorage();
		expect(gridfs.collection).to.exist;
	});


	describe('write', function() {

		it('should be able to write a readable stream to default `gridfs` collection', function(done) {

			var gridfs = gridFSStorage();
			var readableStream =
				fs.createReadStream(path.join(__dirname, 'fixtures', 'text.txt'));

			gridfs.write({
				filename: 'text.txt',
				contentType: mime.lookup('.txt')
			}, readableStream, function(error, savedFile) {

				expect(error).to.not.exist;
				expect(savedFile).to.exist;

				expect(savedFile._id).to.exist;
				expect(savedFile.filename).to.exist;
				expect(savedFile.contentType).to.exist;
				expect(savedFile.length).to.exist;
				expect(savedFile.chunkSize).to.exist;
				expect(savedFile.uploadDate).to.exist;
				expect(savedFile.md5).to.exist;

				ids.push(savedFile._id);

				done(error, savedFile);
			});

		});

		it('should be able to write a readable stream to custom `gridfs` collection', function(done) {

			var gridfs = gridFSStorage({
				collection: 'attachments'
			});

			var readableStream =
				fs.createReadStream(path.join(__dirname, 'fixtures', 'text.txt'));

			gridfs.write({
				filename: 'text.txt',
				contentType: mime.lookup('.txt')
			}, readableStream, function(error, savedFile) {

				expect(error).to.not.exist;
				expect(savedFile).to.exist;

				expect(savedFile._id).to.exist;
				expect(savedFile.filename).to.exist;
				expect(savedFile.contentType).to.exist;
				expect(savedFile.length).to.exist;
				expect(savedFile.chunkSize).to.exist;
				expect(savedFile.uploadDate).to.exist;
				expect(savedFile.md5).to.exist;

				ids.push(savedFile._id);

				done(error, savedFile);
			});

		});

		it('should be able to return a writable stream if no callback', function(done) {

			var gridfs = gridFSStorage();
			var readableStream =
				fs.createReadStream(path.join(__dirname, 'fixtures', 'text.txt'));

			var writableStream = gridfs.write({
				filename: 'text.txt',
				contentType: mime.lookup('.txt')
			}, readableStream);

			expect(isStream(writableStream)).to.be.true;

			done();

		});

	});

	describe('read', function() {

		it('should be able to read file content to `Buffer` using it objectid', function(done) {
			var gridfs = gridFSStorage();
			gridfs.readById(ids[0], function(error, fileContent) {

				expect(error).to.not.exist;
				expect(fileContent).to.exist;
				expect(_.isBuffer(fileContent)).to.be.true;

				done(error, fileContent);
			});
		});

		it('should be able to return readable stream if callback not provided', function(done) {
			var gridfs = gridFSStorage();
			var readableStream = gridfs.readById(ids[0]);
			expect(isStream(readableStream)).to.be.true;
			done();
		});

	});

	describe('find', function() {
		it('should be able to obtain file details using its objectid', function(done) {
			var gridfs = gridFSStorage();
			gridfs.findById(ids[0], function(error, foundFileDetails) {

				expect(error).to.not.exist;
				expect(foundFileDetails._id).to.eql(ids[0]);

				done(error, foundFileDetails);
			});
		});
	});

	describe('remove', function() {

		it('should be able to remove a file using its objectid', function(done) {
			var gridfs = gridFSStorage();
			gridfs.unlinkById(ids[0], function(error, removedFileId) {
				expect(error).to.not.exist;
				expect(removedFileId).to.eql(ids[0]);
				done(error, removedFileId);
			});
		});

	});

	describe('mongoose-model', function() {
		var gridfs;
		var Attachment;

		it('should be able to expose mongoose compactible model', function() {
			gridfs = gridFSStorage({
				collection: 'attachments',
				model: 'Attachment'
			});
			Attachment = gridfs.model;

			expect(gridfs.schema).to.exist;
			expect(mongoose.model('Attachment')).to.exist;
			expect(Attachment).to.exist;
		});

		describe('instance', function() {
			it('should be able to write a file', function(done) {

				var attachment = new Attachment({
					filename: 'text2.txt',
					contentType: mime.lookup('.txt')
				});

				var readableStream =
					fs.createReadStream(path.join(__dirname, 'fixtures', 'text.txt'));

				attachment.write(readableStream, function(error, savedFile) {

					expect(error).to.not.exist;
					expect(savedFile).to.exist;

					expect(savedFile._id).to.exist;
					expect(savedFile.filename).to.exist;
					expect(savedFile.contentType).to.exist;
					expect(savedFile.length).to.exist;
					expect(savedFile.chunkSize).to.exist;
					expect(savedFile.uploadDate).to.exist;
					expect(savedFile.md5).to.exist;

					ids.push(savedFile._id);

					done(error, savedFile);
				});

			});

			it('should be able to read file content', function(done) {
				Attachment.findById(ids[2], function(error, attachment) {
					if (error) {
						done(error);
					} else {
						attachment.read(function(error, content) {
							expect(error).to.not.exist;
							expect(content).to.exist;
							expect(_.isBuffer(content)).to.be.true;
							done(error, content);
						});
					}
				});
			});

			it('should be able to unlink file', function(done) {
				Attachment.findById(ids[2], function(error, attachment) {
					if (error) {
						done(error);
					} else {
						attachment.unlink(function(error, unlinkedAttachment) {
							expect(error).to.not.exist;
							expect(unlinkedAttachment).to.exist;

							expect(unlinkedAttachment._id).to.exist;
							expect(unlinkedAttachment.filename).to.exist;
							expect(unlinkedAttachment.contentType).to.exist;
							expect(unlinkedAttachment.length).to.exist;
							expect(unlinkedAttachment.chunkSize).to.exist;
							expect(unlinkedAttachment.uploadDate).to.exist;
							expect(unlinkedAttachment.md5).to.exist;

							done(error, unlinkedAttachment);
						});
					}
				});
			});
		});

		describe('static', function() {
			it('should be able to write a file', function(done) {

				var attachment = {
					filename: 'text2.txt',
					contentType: mime.lookup('.txt')
				};

				var readableStream =
					fs.createReadStream(path.join(__dirname, 'fixtures', 'text.txt'));

				Attachment.write(attachment, readableStream, function(error, savedFile) {

					expect(error).to.not.exist;
					expect(savedFile).to.exist;

					expect(savedFile._id).to.exist;
					expect(savedFile.filename).to.exist;
					expect(savedFile.contentType).to.exist;
					expect(savedFile.length).to.exist;
					expect(savedFile.chunkSize).to.exist;
					expect(savedFile.uploadDate).to.exist;
					expect(savedFile.md5).to.exist;

					ids.push(savedFile._id);

					done(error, savedFile);
				});

			});

			it('should be able to read a file content', function(done) {
				Attachment.readById(ids[3], function(error, content) {
					expect(error).to.not.exist;
					expect(content).to.exist;
					expect(_.isBuffer(content)).to.be.true;
					done(error, content);
				});
			});

			it('should be able to unlink file', function(done) {
				Attachment.unlinkById(ids[3], function(error, unlinkedAttachment) {
					expect(error).to.not.exist;
					expect(unlinkedAttachment).to.exist;

					expect(unlinkedAttachment._id).to.exist;
					expect(unlinkedAttachment.filename).to.exist;
					expect(unlinkedAttachment.contentType).to.exist;
					expect(unlinkedAttachment.length).to.exist;
					expect(unlinkedAttachment.chunkSize).to.exist;
					expect(unlinkedAttachment.uploadDate).to.exist;
					expect(unlinkedAttachment.md5).to.exist;

					done(error, unlinkedAttachment);
				});
			});
		});

	});

});