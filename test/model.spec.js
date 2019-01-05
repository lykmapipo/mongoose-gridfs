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
} = require(path.join(__dirname, '..', 'lib', 'bucket'));

describe('gridfs model', () => {

  // collect ids
  let ids = [];

  it('should create default gridfs model', () => {
    const File = createModel();

    expect(File).to.exist;
    expect(File.schema).to.exist;
    expect(File.modelName).to.be.equal('File');
    expect(File.collection.name).to.be.equal('fs.files');
  });

  it('should create custom gridfs model', () => {
    const Photo = createModel({ modelName: 'Photo' });

    expect(Photo).to.exist;
    expect(Photo.schema).to.exist;
    expect(Photo.modelName).to.be.equal('Photo');
    expect(Photo.collection.name).to.be.equal('photos.files');
  });

  describe('instance', () => {

    it('should write file to default bucket', (done) => {
      const filename = 'text.txt';
      const contentType = mime.getType('.txt');
      const options = { filename, contentType };

      const fromFile = path.join(__dirname, 'fixtures', 'text.txt');
      const readableStream = fs.createReadStream(fromFile);

      const File = createModel();
      const file = new File(options);

      file.write(readableStream, (error, _file) => {
        expect(error).to.not.exist;
        expect(_file).to.exist;
        expect(_file._id).to.exist;
        expect(_file.filename).to.exist;
        expect(_file.contentType).to.exist;
        expect(_file.length).to.exist;
        expect(_file.chunkSize).to.exist;
        expect(_file.uploadDate).to.exist;
        expect(_file.md5).to.exist;
        ids.push(_file._id);
        done(error, _file);
      });
    });

    it('should write file to custom bucket', (done) => {
      const filename = 'text.txt';
      const contentType = mime.getType('.txt');
      const options = { filename, contentType };

      const fromFile = path.join(__dirname, 'fixtures', 'text.txt');
      const readableStream = fs.createReadStream(fromFile);

      const Photo = createModel({ modelName: 'Photo' });
      const photo = new Photo(options);

      photo.write(readableStream, (error, _photo) => {
        expect(error).to.not.exist;
        expect(_photo).to.exist;
        expect(_photo._id).to.exist;
        expect(_photo.filename).to.exist;
        expect(_photo.contentType).to.exist;
        expect(_photo.length).to.exist;
        expect(_photo.chunkSize).to.exist;
        expect(_photo.uploadDate).to.exist;
        expect(_photo.md5).to.exist;
        done(error, _photo);
      });
    });

    it('should read file content to `Buffer`', (done) => {
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

    it('should return a readable stream if not callback', (done) => {
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

    it('should unlink a file', (done) => {
      const File = createModel();
      const options = { _id: ids[0] };
      File.findOne(options, (error, file) => {
        if (file) {
          file.unlink((error, _file) => {
            expect(error).to.not.exist;
            expect(_file).to.exist;
            expect(_file._id).to.exist;
            expect(_file.filename).to.exist;
            expect(_file.contentType).to.exist;
            expect(_file.length).to.exist;
            expect(_file.chunkSize).to.exist;
            expect(_file.uploadDate).to.exist;
            expect(_file.md5).to.exist;
            ids = _.tail(ids);
            done(error, _file);
          });
        } else {
          done(error, file);
        }
      });
    });

  });


  // static
  describe('static', () => {

    it('should write file to default bucket', (done) => {
      const filename = 'text.txt';
      const contentType = mime.getType('.txt');
      const options = { filename, contentType };

      const fromFile = path.join(__dirname, 'fixtures', 'text.txt');
      const readableStream = fs.createReadStream(fromFile);

      const File = createModel();

      File.write(options, readableStream, (error, _file) => {
        expect(error).to.not.exist;
        expect(_file).to.exist;
        expect(_file._id).to.exist;
        expect(_file.filename).to.exist;
        expect(_file.contentType).to.exist;
        expect(_file.length).to.exist;
        expect(_file.chunkSize).to.exist;
        expect(_file.uploadDate).to.exist;
        expect(_file.md5).to.exist;
        ids.push(_file._id);
        done(error, _file);
      });
    });

    it('should write file to custom bucket', (done) => {
      const filename = 'text.txt';
      const contentType = mime.getType('.txt');
      const options = { filename, contentType };

      const fromFile = path.join(__dirname, 'fixtures', 'text.txt');
      const readableStream = fs.createReadStream(fromFile);

      const Photo = createModel({ modelName: 'Photo' });

      Photo.write(options, readableStream, (error, _photo) => {
        expect(error).to.not.exist;
        expect(_photo).to.exist;
        expect(_photo._id).to.exist;
        expect(_photo.filename).to.exist;
        expect(_photo.contentType).to.exist;
        expect(_photo.length).to.exist;
        expect(_photo.chunkSize).to.exist;
        expect(_photo.uploadDate).to.exist;
        expect(_photo.md5).to.exist;
        done(error, _photo);
      });
    });

    it('should read file content to `Buffer`', (done) => {
      const File = createModel();
      const options = { _id: ids[0] };
      File.read(options, (error, content) => {
        expect(error).to.not.exist;
        expect(content).to.exist;
        expect(_.isBuffer(content)).to.be.true;
        done(error, content);
      });
    });

    it('should return a readable stream if no callback', (done) => {
      const File = createModel();
      const options = { _id: ids[0] };
      const readstream = File.read(options);
      expect(isStream(readstream)).to.be.true;
      done();
    });

    it('should unlink a file', (done) => {
      const File = createModel();
      const options = { _id: ids[0] };
      File.unlink(options, (error, _file) => {
        expect(error).to.not.exist;
        expect(_file).to.exist;
        expect(_file._id).to.exist;
        expect(_file.filename).to.exist;
        expect(_file.contentType).to.exist;
        expect(_file.length).to.exist;
        expect(_file.chunkSize).to.exist;
        expect(_file.uploadDate).to.exist;
        expect(_file.md5).to.exist;
        ids = _.tail(ids);
        done(error, _file);
      });
    });

  });

});
