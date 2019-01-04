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
  it('should obtain file details using its id', (done) => {
    const gridfs = gridFSStorage();
    gridfs.findById(ids[0], (error, file) => {
      expect(error).to.not.exist;
      expect(file._id).to.eql(ids[0]);
      done(error, file);
    });
  });

  it('should obtain file details using its filename', (done) => {
    const gridfs = gridFSStorage();
    gridfs.findOne({ filename: 'text.txt' }, (error, file) => {
      expect(error).to.not.exist;
      expect(file._id).to.eql(ids[0]);
      done(error, file);
    });
  });


  // removers
  it('should remove a file using its id', (done) => {
    const gridfs = gridFSStorage();
    gridfs.unlinkById(ids[0], (error, fileId) => {
      expect(error).to.not.exist;
      expect(fileId).to.eql(ids[0]);
      done(error, fileId);
    });
  });


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
