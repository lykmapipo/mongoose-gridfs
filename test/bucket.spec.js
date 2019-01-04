'use strict';


/* dependencies */
const path = require('path');
const { expect } = require('chai');
const {
  DEFAULT_BUCKET_NAME,
  DEFAULT_BUCKET_MODEL_NAME,
  DEFAULT_BUCKET_CHUNK_SIZE,
  DEFAULT_BUCKET_OPTIONS,
  createBucket,
  GridFSBucket
} = require(path.join(__dirname, '..', 'lib', 'bucket'));


describe.only('mongoose gridfs', () => {
  // collect ids
  // const ids = [];

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
    const bucket = createBucket({ bucketName: 'songs' });
    expect(bucket.bucketName).to.exist;
    expect(bucket.bucketName).to.be.equal('songs');

    expect(bucket.collection).to.exist;
    expect(bucket.collectionName).to.exist;
    expect(bucket.collectionName).to.be.equal('songs.files');
  });

});
