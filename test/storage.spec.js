'use strict';

// dependencies
const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const mime = require('mime');
const mongoose = require('mongoose');
const expect = require('chai').expect;
const gridFSStorage = require(path.join(__dirname, '..'));

describe('GridFSStorage', () => {

  // collect ids
  const ids = [];

  // model
  describe('mongoose model', () => {
    let gridfs;
    let Attachment;

    it('should expose mongoose compactible model', () => {
      gridfs = gridFSStorage({ collection: 'attachments', model: 'Attachment' });
      Attachment = gridfs.model;

      expect(gridfs.schema).to.exist;
      expect(mongoose.model('Attachment')).to.exist;
      expect(Attachment).to.exist;
    });

    // instance
    it('instance should write a file', (done) => {
      const attachment = new Attachment({
        filename: 'text2.txt',
        contentType: mime.getType('.txt')
      });

      const fromFile = path.join(__dirname, 'fixtures', 'text.txt');
      const readableStream = fs.createReadStream(fromFile);

      attachment.write(readableStream, (error, file) => {
        expect(error).to.not.exist;
        expect(file).to.exist;
        expect(file._id).to.exist;
        expect(file.filename).to.exist;
        expect(file.contentType).to.exist;
        expect(file.length).to.exist;
        expect(file.chunkSize).to.exist;
        expect(file.uploadDate).to.exist;
        expect(file.md5).to.exist;
        ids.push(file._id);
        done(error, file);
      });

    });

    it('instance should read a file content', (done) => {
      Attachment.findById(ids[2], (error, attachment) => {
        if (error) {
          done(error);
        } else {
          attachment.read((error, content) => {
            expect(error).to.not.exist;
            expect(content).to.exist;
            expect(_.isBuffer(content)).to.be.true;
            done(error, content);
          });
        }
      });
    });

    it('instance should unlink a file', (done) => {
      Attachment.findById(ids[2], (error, attachment) => {
        if (error) {
          done(error);
        } else {
          attachment.unlink((error, file) => {
            expect(error).to.not.exist;
            expect(file).to.exist;
            expect(file._id).to.exist;
            expect(file.filename).to.exist;
            expect(file.contentType).to.exist;
            expect(file.length).to.exist;
            expect(file.chunkSize).to.exist;
            expect(file.uploadDate).to.exist;
            expect(file.md5).to.exist;
            done(error, file);
          });
        }
      });
    });

    // static
    it('static should write a file', (done) => {
      const attachment = {
        filename: 'text2.txt',
        contentType: mime.getType('.txt')
      };

      const fromFile = path.join(__dirname, 'fixtures', 'text.txt');
      const readableStream = fs.createReadStream(fromFile);

      Attachment.write(attachment, readableStream, (error, file) => {
        expect(error).to.not.exist;
        expect(file).to.exist;
        expect(file._id).to.exist;
        expect(file.filename).to.exist;
        expect(file.contentType).to.exist;
        expect(file.length).to.exist;
        expect(file.chunkSize).to.exist;
        expect(file.uploadDate).to.exist;
        expect(file.md5).to.exist;
        ids.push(file._id);
        done(error, file);
      });

    });

    it('static should read a file content', (done) => {
      Attachment.readById(ids[3], (error, content) => {
        expect(error).to.not.exist;
        expect(content).to.exist;
        expect(_.isBuffer(content)).to.be.true;
        done(error, content);
      });
    });

    it('static should unlink a file', (done) => {
      Attachment.unlinkById(ids[3], (error, file) => {
        expect(error).to.not.exist;
        expect(file).to.exist;
        expect(file._id).to.exist;
        expect(file.filename).to.exist;
        expect(file.contentType).to.exist;
        expect(file.length).to.exist;
        expect(file.chunkSize).to.exist;
        expect(file.uploadDate).to.exist;
        expect(file.md5).to.exist;
        done(error, file);
      });
    });
  });

});
