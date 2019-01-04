'use strict';


/* dependencies */
const path = require('path');
const { expect } = require('chai');
const {
  DEFAULT_BUCKET_NAME,
  DEFAULT_BUCKET_MODEL_NAME,
  DEFAULT_BUCKET_CHUNK_SIZE,
  DEFAULT_BUCKET_OPTIONS,
  GridFSBucket
} = require(path.join(__dirname, '..', 'lib', 'bucket'));


describe.only('Bucket', () => {
  it('should be a functional constructor', () => {
    expect(GridFSBucket).to.exist;
    expect(GridFSBucket).to.be.a('function');
    expect(GridFSBucket.name).to.be.equal('GridFSBucket');
    expect(GridFSBucket).to.have.length(2);
  });

  it('should be a GridFSBucket', () => {
    expect(GridFSBucket.prototype.openUploadStream).to.exist;
    expect(GridFSBucket.prototype.openUploadStreamWithId).to.exist;
    expect(GridFSBucket.prototype.openDownloadStream).to.exist;
    expect(GridFSBucket.prototype.delete).to.exist;
    expect(GridFSBucket.prototype.find).to.exist;
    expect(GridFSBucket.prototype.openDownloadStreamByName).to.exist;
    expect(GridFSBucket.prototype.rename).to.exist;
    expect(GridFSBucket.prototype.drop).to.exist;
    expect(GridFSBucket.prototype.getLogger).to.exist;
    // custom
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
});
