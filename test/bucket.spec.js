'use strict';


/* dependencies */
const path = require('path');
const _ = require('lodash');
const fs = require('fs');
const mime = require('mime');
const { expect } = require('chai');
const {
  DEFAULT_BUCKET_NAME,
  DEFAULT_BUCKET_MODEL_NAME,
  DEFAULT_BUCKET_CHUNK_SIZE,
  DEFAULT_BUCKET_OPTIONS,
  createBucket,
  GridFSBucket
} = require(path.join(__dirname, '..'));

const isStream = (stream) => {
  return stream !== null &&
    typeof stream === 'object' &&
    typeof stream.pipe === 'function';
};

describe('mongoose gridfs', () => {
  // collect file ids
  const ids = [];

  it('should export GridFSBucket', () => {
    expect(GridFSBucket).to.exist;
    expect(GridFSBucket).to.be.a('function');
    expect(GridFSBucket.name).to.be.equal('GridFSBucket');
    expect(GridFSBucket).to.have.length(2);
    expect(GridFSBucket.prototype.openUploadStream).to.exist;
    expect(GridFSBucket.prototype.openUploadStreamWithId).to.exist;
    expect(GridFSBucket.prototype.openDownloadStream).to.exist;
    expect(GridFSBucket.prototype.delete).to.exist;
    expect(GridFSBucket.prototype.find).to.exist;
    expect(GridFSBucket.prototype.openDownloadStreamByName).to.exist;
    expect(GridFSBucket.prototype.rename).to.exist;
    expect(GridFSBucket.prototype.drop).to.exist;
    expect(GridFSBucket.prototype.getLogger).to.exist;
    expect(GridFSBucket.prototype.createWriteStream).to.exist;
    expect(GridFSBucket.prototype.createReadStream).to.exist;
  });

  it('should expose default options', () => {
    expect(DEFAULT_BUCKET_NAME).to.exist;
    expect(DEFAULT_BUCKET_NAME).to.be.equal('fs');
    expect(DEFAULT_BUCKET_MODEL_NAME).to.exist;
    expect(DEFAULT_BUCKET_MODEL_NAME).to.be.equal('File');
    expect(DEFAULT_BUCKET_CHUNK_SIZE).to.exist;
    expect(DEFAULT_BUCKET_CHUNK_SIZE).to.equal(255 * 1024);
    expect(DEFAULT_BUCKET_OPTIONS).to.exist;
    expect(DEFAULT_BUCKET_OPTIONS).to.be.eql({
      modelName: 'File',
      bucketName: 'fs',
      chunkSizeBytes: 255 * 1024
    });
  });

  it('should create default bucket', () => {
    const bucket = createBucket();
    expect(bucket.bucketName).to.exist;
    expect(bucket.bucketName).to.be.equal('fs');

    expect(bucket.collection).to.exist;
    expect(bucket.collectionName).to.exist;
    expect(bucket.collectionName).to.be.equal('fs.files');
  });

  it('should create custom bucket', () => {
    const bucket = createBucket({ bucketName: 'lyrics' });
    expect(bucket.bucketName).to.exist;
    expect(bucket.bucketName).to.be.equal('lyrics');

    expect(bucket.collection).to.exist;
    expect(bucket.collectionName).to.exist;
    expect(bucket.collectionName).to.be.equal('lyrics.files');
  });


  // writers
  it('should write to default bucket', (done) => {
    const bucket = createBucket();
    expect(bucket.collection).to.exist;
    expect(bucket.collectionName).to.exist;
    expect(bucket.collectionName).to.be.equal('fs.files');

    const fromFile = path.join(__dirname, 'fixtures', 'text.txt');
    const readableStream = fs.createReadStream(fromFile);

    const filename = 'text.txt';
    const contentType = mime.getType('.txt');
    const options = { filename, contentType };
    bucket.writeFile(options, readableStream, (error, file) => {
      expect(error).to.not.exist;
      expect(file).to.exist;
      expect(file._id).to.exist;
      expect(file.filename).to.exist;
      expect(file.contentType).to.exist;
      expect(file.length).to.exist;
      expect(file.chunkSize).to.exist;
      expect(file.uploadDate).to.exist;
      // expect(file.md5).to.exist;
      ids.push(file._id);
      done(error, file);
    });
  });

  it('should write to custom bucket', (done) => {
    const bucket = createBucket({ bucketName: 'lyrics' });
    expect(bucket.collection).to.exist;
    expect(bucket.collectionName).to.exist;
    expect(bucket.collectionName).to.be.equal('lyrics.files');

    const fromFile = path.join(__dirname, 'fixtures', 'text.txt');
    const readableStream = fs.createReadStream(fromFile);

    const filename = 'text.txt';
    const contentType = mime.getType('.txt');
    const options = { filename, contentType };
    bucket.writeFile(options, readableStream, (error, file) => {
      expect(error).to.not.exist;
      expect(file).to.exist;
      expect(file._id).to.exist;
      expect(file.filename).to.exist;
      expect(file.contentType).to.exist;
      expect(file.length).to.exist;
      expect(file.chunkSize).to.exist;
      expect(file.uploadDate).to.exist;
      // expect(file.md5).to.exist;
      ids.push(file._id);
      done(error, file);
    });
  });

  it('should return a writable stream if callback not provided', (done) => {
    const bucket = createBucket();
    const fromFile = path.join(__dirname, 'fixtures', 'text.txt');
    const readableStream = fs.createReadStream(fromFile);

    const filename = 'text.txt';
    const contentType = mime.getType('.txt');
    const options = { filename, contentType };
    const writestream = bucket.writeFile(options, readableStream);

    expect(writestream).to.exist;
    expect(isStream(writestream)).to.be.true;

    writestream.on('error', error => done(error));
    writestream.on('finish', file => done(null, file));
  });


  // readers
  it('should read file content to `Buffer` by _id', (done) => {
    const bucket = createBucket();
    const options = { _id: ids[0] };
    bucket.readFile(options, (error, content) => {
      expect(error).to.not.exist;
      expect(content).to.exist;
      expect(_.isBuffer(content)).to.be.true;
      done(error, content);
    });
  });

  it('should read file content to `Buffer` by filename', (done) => {
    const bucket = createBucket();
    const options = { filename: 'text.txt' };
    bucket.readFile(options, (error, content) => {
      expect(error).to.not.exist;
      expect(content).to.exist;
      expect(_.isBuffer(content)).to.be.true;
      done(error, content);
    });
  });

  it('should return a readable stream if callback not provided', (done) => {
    const bucket = createBucket();
    const options = { filename: 'text.txt' };
    const readstream = bucket.readFile(options);
    expect(isStream(readstream)).to.be.true;
    done();
  });


  // finders
  it('should obtain file details using its _id', (done) => {
    const bucket = createBucket();
    const _id = ids[0];
    bucket.findOne({ _id }, (error, file) => {
      expect(error).to.not.exist;
      expect(file._id).to.eql(ids[0]);
      done(error, file);
    });
  });

  it('should obtain file details using its filename', (done) => {
    const bucket = createBucket();
    bucket.findOne({ filename: 'text.txt' }, (error, file) => {
      expect(error).to.not.exist;
      expect(file._id).to.eql(ids[0]);
      done(error, file);
    });
  });

  it('should obtain file details using its _id', (done) => {
    const bucket = createBucket();
    bucket.findById(ids[0], (error, file) => {
      expect(error).to.not.exist;
      expect(file._id).to.eql(ids[0]);
      done(error, file);
    });
  });


  // removers
  it('should remove a file using its id', (done) => {
    const bucket = createBucket();
    bucket.deleteFile(ids[0], (error, result) => {
      expect(error).to.not.exist;
      expect(result).to.eql(ids[0]);
      done(error, result);
    });
  });

});
