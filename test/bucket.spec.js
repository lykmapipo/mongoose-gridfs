'use strict';


/* dependencies */
const { expect } = require('chai');
const Bucket = require('../lib/bucket');


describe.only('Bucket', () => {
  it('should be a functional constructor', () => {
    expect(Bucket).to.exist;
    expect(Bucket).to.be.a('function');
    expect(Bucket.name).to.be.equal('GridFSBucket');
    expect(Bucket).to.have.length(2);
  });

  it('should be a GridFSBucket', () => {
    expect(Bucket.prototype.openUploadStream).to.exist;
    expect(Bucket.prototype.openUploadStreamWithId).to.exist;
    expect(Bucket.prototype.openDownloadStream).to.exist;
    expect(Bucket.prototype.delete).to.exist;
    expect(Bucket.prototype.find).to.exist;
    expect(Bucket.prototype.openDownloadStreamByName).to.exist;
    expect(Bucket.prototype.rename).to.exist;
    expect(Bucket.prototype.drop).to.exist;
    expect(Bucket.prototype.getLogger).to.exist;
  });

  it('should expose default options', () => {
    expect(Bucket.DEFAULT_BUCKET_NAME).to.exist;
    expect(Bucket.DEFAULT_BUCKET_NAME).to.be.equal('fs');
    expect(Bucket.DEFAULT_BUCKET_MODEL_NAME).to.exist;
    expect(Bucket.DEFAULT_BUCKET_MODEL_NAME).to.be.equal('File');
    expect(Bucket.DEFAULT_BUCKET_CHUNK_SIZE).to.exist;
    expect(Bucket.DEFAULT_BUCKET_CHUNK_SIZE).to.equal(255 * 1024);
    expect(Bucket.DEFAULT_BUCKET_OPTIONS).to.exist;
    expect(Bucket.DEFAULT_BUCKET_OPTIONS).to.be.eql({
      bucketName: 'fs',
      chunkSizeBytes: 255 * 1024
    });
  });
});
