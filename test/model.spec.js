'use strict';

// dependencies
const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const mime = require('mime');
const isStream = require('is-stream');
const { expect } = require('chai');
const {
  createModel
} = require(path.join(__dirname, '..'));

describe('gridfs model', () => {

  // collect ids
  let ids = [];

  it('should create default gridfs model', () => {
    const File = createModel();

    expect(File).to.exist;
    expect(File.schema).to.exist;
    expect(File.modelName).to.be.equal('File');
    expect(File.collection.name).to.be.equal('fs.files');
    expect(File.CREATED_AT_FIELD).to.be.equal('uploadDate');
    expect(File.UPDATED_AT_FIELD).to.be.equal('uploadDate');
  });

  it('should create custom gridfs model', () => {
    const Photo = createModel({ modelName: 'Photo' });

    expect(Photo).to.exist;
    expect(Photo.schema).to.exist;
    expect(Photo.modelName).to.be.equal('Photo');
    expect(Photo.collection.name).to.be.equal('photos.files');
    expect(Photo.CREATED_AT_FIELD).to.be.equal('uploadDate');
    expect(Photo.UPDATED_AT_FIELD).to.be.equal('uploadDate');
  });

  it('should create gridfs model with plugins', () => {
    const Image = createModel({ modelName: 'Image' }, (schema) => {
      schema.statics.stats = (optns, done) => done(null, optns);
    });

    expect(Image).to.exist;
    expect(Image.schema).to.exist;
    expect(Image.modelName).to.be.equal('Image');
    expect(Image.collection.name).to.be.equal('images.files');
    expect(Image.stats).to.exist.and.be.a('function');
  });

  describe('instance', () => {

    it('should write file to default bucket', done => {
      const filename = 'text.txt';
      const contentType = mime.getType('.txt');
      const options = { filename, contentType };

      const fromFile = path.join(__dirname, 'fixtures', 'text.txt');
      const readableStream = fs.createReadStream(fromFile);

      const File = createModel();
      const file = new File(options);

      file.write(readableStream, (error, created) => {
        expect(error).to.not.exist;
        expect(created).to.exist;
        expect(created._id).to.exist;
        expect(created.filename).to.exist;
        expect(created.contentType).to.exist;
        expect(created.length).to.exist;
        expect(created.chunkSize).to.exist;
        expect(created.uploadDate).to.exist;
        expect(created.md5).to.exist;
        ids.push(created._id);
        done(error, created);
      });
    });

    it('should write file to custom bucket', done => {
      const filename = 'text.txt';
      const contentType = mime.getType('.txt');
      const options = { filename, contentType };

      const fromFile = path.join(__dirname, 'fixtures', 'text.txt');
      const readableStream = fs.createReadStream(fromFile);

      const Photo = createModel({ modelName: 'Photo' });
      const photo = new Photo(options);

      photo.write(readableStream, (error, created) => {
        expect(error).to.not.exist;
        expect(created).to.exist;
        expect(created._id).to.exist;
        expect(created.filename).to.exist;
        expect(created.contentType).to.exist;
        expect(created.length).to.exist;
        expect(created.chunkSize).to.exist;
        expect(created.uploadDate).to.exist;
        expect(created.md5).to.exist;
        done(error, created);
      });
    });

    it('should read file content to `Buffer`', done => {
      const File = createModel();
      const options = { _id: ids[0] };
      File.findOne(options, (error, file) => {
        if (file) {
          file.read((error, content) => {
            expect(error).to.not.exist;
            expect(content).to.exist;
            expect(_.isBuffer(content)).to.be.true;
            done(error, content);
          });
        } else {
          done(error, file);
        }
      });
    });

    it('should return a readable stream if not callback', done => {
      const File = createModel();
      const options = { _id: ids[0] };
      File.findOne(options, (error, file) => {
        if (file) {
          const readstream = file.read();
          expect(isStream(readstream)).to.be.true;
          done();
        } else {
          done(error, file);
        }
      });
    });

    it('should unlink a file', done => {
      const File = createModel();
      const options = { _id: ids[0] };
      File.findOne(options, (error, file) => {
        if (file) {
          file.unlink((error, unlinked) => {
            expect(error).to.not.exist;
            expect(unlinked).to.exist;
            expect(unlinked._id).to.exist;
            expect(unlinked.filename).to.exist;
            expect(unlinked.contentType).to.exist;
            expect(unlinked.length).to.exist;
            expect(unlinked.chunkSize).to.exist;
            expect(unlinked.uploadDate).to.exist;
            expect(unlinked.md5).to.exist;
            ids = _.tail(ids);
            done(error, unlinked);
          });
        } else {
          done(error, file);
        }
      });
    });

  });


  // static
  describe('static', () => {

    it('should write file to default bucket', done => {
      const filename = 'text.txt';
      const contentType = mime.getType('.txt');
      const options = { filename, contentType };

      const fromFile = path.join(__dirname, 'fixtures', 'text.txt');
      const readableStream = fs.createReadStream(fromFile);

      const File = createModel();

      File.write(options, readableStream, (error, created) => {
        expect(error).to.not.exist;
        expect(created).to.exist;
        expect(created._id).to.exist;
        expect(created.filename).to.exist;
        expect(created.contentType).to.exist;
        expect(created.length).to.exist;
        expect(created.chunkSize).to.exist;
        expect(created.uploadDate).to.exist;
        expect(created.md5).to.exist;
        ids.push(created._id);
        done(error, created);
      });
    });

    it('should write file to custom bucket', done => {
      const filename = 'text.txt';
      const contentType = mime.getType('.txt');
      const options = { filename, contentType };

      const fromFile = path.join(__dirname, 'fixtures', 'text.txt');
      const readableStream = fs.createReadStream(fromFile);

      const Photo = createModel({ modelName: 'Photo' });

      Photo.write(options, readableStream, (error, created) => {
        expect(error).to.not.exist;
        expect(created).to.exist;
        expect(created._id).to.exist;
        expect(created.filename).to.exist;
        expect(created.contentType).to.exist;
        expect(created.length).to.exist;
        expect(created.chunkSize).to.exist;
        expect(created.uploadDate).to.exist;
        expect(created.md5).to.exist;
        done(error, created);
      });
    });

    it('should read file content to `Buffer`', done => {
      const File = createModel();
      const options = { _id: ids[0] };
      File.read(options, (error, content) => {
        expect(error).to.not.exist;
        expect(content).to.exist;
        expect(_.isBuffer(content)).to.be.true;
        done(error, content);
      });
    });

    it('should return a readable stream if no callback', done => {
      const File = createModel();
      const options = { _id: ids[0] };
      const readstream = File.read(options);
      expect(isStream(readstream)).to.be.true;
      done();
    });

    it('should unlink a file', done => {
      const File = createModel();
      const options = { _id: ids[0] };
      File.unlink(options, (error, unlinked) => {
        expect(error).to.not.exist;
        expect(unlinked).to.exist;
        expect(unlinked._id).to.exist;
        expect(unlinked.filename).to.exist;
        expect(unlinked.contentType).to.exist;
        expect(unlinked.length).to.exist;
        expect(unlinked.chunkSize).to.exist;
        expect(unlinked.uploadDate).to.exist;
        expect(unlinked.md5).to.exist;
        ids = _.tail(ids);
        done(error, unlinked);
      });
    });

  });

});
