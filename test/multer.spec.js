'use strict';


/* dependencies */
const fs = require('fs');
const path = require('path');
const stream = require('stream');
const onFinished = require('on-finished');
const UploadForm = require('form-data');
const multer = require('multer');
const { expect } = require('chai');
const { createBucket } = require(path.join(__dirname, '..'));


/* helpers: https://github.com/expressjs/multer/blob/master/test/_util.js */
const fixture = name => path.join(__dirname, 'fixtures', name);
const file = name => fs.createReadStream(fixture(name));
const fileSize = name => fs.statSync(fixture(name)).size;
const submitForm = (multer, form, cb) => {
  form.getLength((error, length) => {
    if (error) { return cb(error); }

    const req = new stream.PassThrough();

    req.complete = false;
    form.once('end', () => req.complete = true);
    form.pipe(req);
    req.headers = {
      'content-type': 'multipart/form-data; boundary=' + form.getBoundary(),
      'content-length': length
    };

    multer(req, null, (error) => {
      onFinished(req, () => cb(error, req));
    });
  });
};

/* specs: https://github.com/expressjs/multer/blob/master/test/disk-storage.js */
describe('multer storage', () => {

  it('should process parser/form-data POST request', (done) => {
    const storage = createBucket();
    const upload = multer({ storage });

    const form = new UploadForm();
    const parser = upload.single('text');

    const aliases = 'lyrics';
    form.append('name', 'Lyrics');
    form.append('aliases', aliases);
    form.append('text', file('text.txt'));

    submitForm(parser, form, (error, req) => {
      expect(error).to.not.exist;
      expect(req.body.name).to.be.equal('Lyrics');
      expect(req.body.aliases).to.be.equal('lyrics');
      expect(req.file.fieldname).to.be.equal('text');
      expect(req.file.originalname).to.be.equal('text.txt');
      expect(req.file.size).to.be.equal(fileSize('text.txt'));
      expect(req.file.aliases).to.be.eql(['lyrics']);
      expect(req.file.bucketName).to.be.equal(storage.bucketName);

      done(error, req);
    });
  });

  it('should remove uploaded files on error', (done) => {
    const storage = createBucket();
    const upload = multer({ storage });

    const form = new UploadForm();
    const parser = upload.single('text');

    const aliases = 'lyrics';
    form.append('name', 'Lyrics');
    form.append('aliases', aliases);
    form.append('text', file('text.txt'));
    form.append('_text', file('text.txt'));

    submitForm(parser, form, (error) => {
      expect(error).to.exist;
      expect(error.code).to.be.equal('LIMIT_UNEXPECTED_FILE');
      expect(error.field).to.be.equal('_text');
      expect(error.storageErrors).to.be.eql([]);

      done();
    });
  });

  it('should process multiple files', (done) => {
    const storage = createBucket();
    const upload = multer({ storage });

    const form = new UploadForm();
    const parser = upload.array('lyrics');

    const content = file('text.txt');
    form.append('lyrics', content, 'text.txt');
    form.append('lyrics', content, 'text.dat');

    submitForm(parser, form, (error, req) => {
      expect(error).to.not.exist;
      expect(req.files[0].fieldname).to.be.equal('lyrics');
      expect(req.files[0].originalname).to.be.equal('text.txt');
      expect(req.files[0].size).to.be.equal(fileSize('text.txt'));
      expect(req.files[0].bucketName).to.be.equal(storage.bucketName);

      done(error, req);
    });
  });

  it('should process multiple files', (done) => {
    const storage = createBucket();
    const upload = multer({ storage });

    const form = new UploadForm();
    const parser = upload.fields([
      { name: 'en', maxCount: 1 },
      { name: 'sw', maxCount: 1 }
    ]);

    const content = file('text.txt');
    form.append('en', content, 'en.txt');
    form.append('sw', content, 'sw.txt');

    submitForm(parser, form, (error, req) => {
      expect(error).to.not.exist;

      expect(req.files.en[0].fieldname).to.be.equal('en');
      expect(req.files.en[0].originalname).to.be.equal('en.txt');
      expect(req.files.en[0].size).to.be.equal(fileSize('text.txt'));
      expect(req.files.en[0].bucketName).to.be.equal(storage.bucketName);

      expect(req.files.sw[0].fieldname).to.be.equal('sw');
      expect(req.files.sw[0].originalname).to.be.equal('sw.txt');
      expect(req.files.sw[0].size).to.be.equal(fileSize('text.txt'));
      expect(req.files.sw[0].bucketName).to.be.equal(storage.bucketName);

      done(error, req);
    });
  });

});
