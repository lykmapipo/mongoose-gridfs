'use strict';

// dependencies
const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const mime = require('mime');
const isStream = require('is-stream');
const mongoose = require('mongoose');
const expect = require('chai').expect;
const gridFSStorage = require(path.join(__dirname, '..'));

describe('GridFSStorage', () => {

  // collect ids
  const ids = [];

  it('should export a functional constructor', () => {
    expect(gridFSStorage).to.exist;
    expect(gridFSStorage).to.be.a('function');
  });

  it('should expose underlying files collection', () => {
    const gridfs = gridFSStorage();
    expect(gridfs.collection).to.exist;
  });


  // writes
  it('should write to default gridfs collection', (done) => {
    const gridfs = gridFSStorage();
    expect(gridfs.collection.s.name).to.exist;
    expect(gridfs.collection.s.name).to.be.equal('fs.files');

    const fromFile = path.join(__dirname, 'fixtures', 'text.txt');
    const readableStream = fs.createReadStream(fromFile);

    const filename = 'text.txt';
    const contentType = mime.getType('.txt');
    const options = { filename, contentType };
    gridfs.write(options, readableStream, (error, savedFile) => {
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

  it('should write to custom gridfs collection', (done) => {
    const gridfs = gridFSStorage({ collection: 'attachments' });
    expect(gridfs.collection.s.name).to.exist;
    expect(gridfs.collection.s.name).to.be.equal('attachments.files');

    const fromFile = path.join(__dirname, 'fixtures', 'text.txt');
    const readableStream = fs.createReadStream(fromFile);

    const filename = 'text.txt';
    const contentType = mime.getType('.txt');
    const options = { filename, contentType };
    gridfs.write(options, readableStream, (error, savedFile) => {
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

  it('should return a writable stream if callback not provided', (done) => {
    const gridfs = gridFSStorage();
    const fromFile = path.join(__dirname, 'fixtures', 'text.txt');
    const readableStream = fs.createReadStream(fromFile);

    const filename = 'text.txt';
    const contentType = mime.getType('.txt');
    const options = { filename, contentType };
    const writableStream = gridfs.write(options, readableStream);

    expect(writableStream).to.exist;
    expect(isStream(writableStream)).to.be.true;
    done();

  });


  // reads
  it('should read file content to `Buffer` by id', (done) => {
    const gridfs = gridFSStorage();
    gridfs.readById(ids[0], (error, content) => {
      expect(error).to.not.exist;
      expect(content).to.exist;
      expect(_.isBuffer(content)).to.be.true;
      done(error, content);
    });
  });

  it('should read file content to `Buffer` by filename', (done) => {
    const gridfs = gridFSStorage();
    gridfs.readByName('text.txt', (error, content) => {
      expect(error).to.not.exist;
      expect(content).to.exist;
      expect(_.isBuffer(content)).to.be.true;
      done(error, content);
    });
  });

  it('should return a readable stream if callback not provided', (done) => {
    const gridfs = gridFSStorage();
    const readableStream = gridfs.readById(ids[0]);
    expect(isStream(readableStream)).to.be.true;
    done();
  });

  // finders
  describe.skip('find', () => {
    it('should be able to obtain file details using its objectid',
      function (done) {
        const gridfs = gridFSStorage();
        gridfs.findById(ids[0], function (error, foundFileDetails) {

          expect(error).to.not.exist;
          expect(foundFileDetails._id).to.eql(ids[0]);

          done(error, foundFileDetails);
        });
      });
  });

  // removers
  describe.skip('remove', () => {

    it('should be able to remove a file using its objectid', function (
      done) {
      const gridfs = gridFSStorage();
      gridfs.unlinkById(ids[0], function (error, removedFileId) {
        expect(error).to.not.exist;
        expect(removedFileId).to.eql(ids[0]);
        done(error, removedFileId);
      });
    });

  });

  // model
  describe.skip('mongoose-model', () => {
    let gridfs;
    let Attachment;

    it('should be able to expose mongoose compactible model', () => {
      gridfs = gridFSStorage({
        collection: 'attachments',
        model: 'Attachment'
      });
      Attachment = gridfs.model;

      expect(gridfs.schema).to.exist;
      expect(mongoose.model('Attachment')).to.exist;
      expect(Attachment).to.exist;
    });

    describe('instance', () => {
      it('should be able to write a file', function (done) {

        const attachment = new Attachment({
          filename: 'text2.txt',
          contentType: mime.getType('.txt')
        });

        const readableStream =
          fs.createReadStream(path.join(__dirname, 'fixtures',
            'text.txt'));

        attachment.write(readableStream, function (error,
          savedFile) {

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

      it('should be able to read file content', function (done) {
        Attachment.findById(ids[2], function (error, attachment) {
          if (error) {
            done(error);
          } else {
            attachment.read(function (error, content) {
              expect(error).to.not.exist;
              expect(content).to.exist;
              expect(_.isBuffer(content)).to.be.true;
              done(error, content);
            });
          }
        });
      });

      it('should be able to unlink file', function (done) {
        Attachment.findById(ids[2], function (error, attachment) {
          if (error) {
            done(error);
          } else {
            attachment.unlink(function (error,
              unlinkedAttachment) {
              expect(error).to.not.exist;
              expect(unlinkedAttachment).to.exist;

              expect(unlinkedAttachment._id).to.exist;
              expect(unlinkedAttachment.filename).to.exist;
              expect(unlinkedAttachment.contentType).to
                .exist;
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

    describe('static', () => {
      it('should be able to write a file', function (done) {

        const attachment = {
          filename: 'text2.txt',
          contentType: mime.getType('.txt')
        };

        const readableStream =
          fs.createReadStream(path.join(__dirname, 'fixtures',
            'text.txt'));

        Attachment.write(attachment, readableStream, function (
          error, savedFile) {

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

      it('should be able to read a file content', function (done) {
        Attachment.readById(ids[3], function (error, content) {
          expect(error).to.not.exist;
          expect(content).to.exist;
          expect(_.isBuffer(content)).to.be.true;
          done(error, content);
        });
      });

      it('should be able to unlink file', function (done) {
        Attachment.unlinkById(ids[3], function (error,
          unlinkedAttachment) {
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
