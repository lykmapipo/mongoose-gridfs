mongoose-gridfs
===============

[![Build Status](https://travis-ci.org/lykmapipo/mongoose-gridfs.svg?branch=master)](https://travis-ci.org/lykmapipo/mongoose-gridfs)

mongoose [gridfs](https://docs.mongodb.com/manual/core/gridfs/) on top of [new gridfs api](http://mongodb.github.io/node-mongodb-native/3.1/tutorials/gridfs/)

*Note!: Ensure mongoose connection before use*

## Installation
```sh
$ npm install --save mongoose-gridfs
```

## Usage
```js
const { createReadStream } = require('fs');
const { createModel } = require('mongoose-gridfs');

// use custom bucket with custom options
const Attachment = createModel({
    modelName: 'Attachment',
    connection: connection
});

// write file to gridfs
const readStream = createReadStream('sample.txt');
const options = ({ filename: 'sample.txt', contentType: 'text/plain' });
Attachment.write(options, readStream, (error, file) => {
  //=> {_id: ..., filename: ..., ...}
});

// read  larger file
const readStream = Attachment.readById(objectid);

// read smaller file
Attachment.readById(objectid, (error, buffer) => { ... });

// remove file and its content
Attachment.unlinkById(objectid, (error) => { ... });
```

## API
`mongoose-gridfs` wrap [new gridfs api](http://mongodb.github.io/node-mongodb-native/3.1/tutorials/gridfs/) to provide valid mongoose `schema` and `model` to use with [MongoDB GridFS](https://docs.mongodb.org/manual/core/gridfs/).

Each instance of `mongoose-gridfs` is binded to a specific `GridFS collection` and `mongoose model` or `schema` by using options.

### Options
- `collection` a root collection to use in GridFS. default to `fs`
- `model` a model name to use in mongoose. default to `File`

Example
```js
const gridfs = require('mongoose-gridfs')({
  collection: 'attachments',
  model: 'Attachment'
});
```

### Schema & Model
To obtain underlying model use
```js
const Attachment = gridfs.model
```

To obtain underlying schema for self model registration use
```js
const AttachmentSchema = gridfs.schema;

// attach plugins
// ensure indexes

// register and export a model
module.export = mongoose.model('Attachment', AttachmentSchema);
```

### Static Methods

#### `write(fileDetails:Object, stream:Readable, done(error, createdFile))`
Write a readable stream into gridfs storage

##### Example
```js
const readStream = fs.createReadStream('/some/path/sample.txt');
const options = ({ filename: 'sample.txt', contentType: 'text/plain' });
Attachment.write(options, readStream, (error, attachment) => { ... });
```

#### `readById(objectid:ObjectId, [done(error, fileContent)]):Stream`
Read a file content from gridfs storage.

##### Example for smaller file size
```js
Attachment.readById(objectid, (error, content) => { ... });
```

##### Example for larger file size
```js
const readStream = Attachment.readById(objectid);
readStream.on('error', fn);
readStream.on('data', fn);
readStream.on('close', fn);
```

#### `unlinkById(objectid:ObjectId, done(error, unlinkedFile))`
Remove file details and its content from underlying gridfs collection.

##### Example
```js
Attachment.unlinkById(objectid, (error, unlinkedAttachment) => { ... });
Attachment.unlink(objectid, (error, unlinkedAttachment) => { ... });
```

### Instance Methods

#### `write(stream:Readable, done(error, createdFile))`
Write a readable stream into gridfs storage

##### Example
```js
const readStream = fs.createReadStream('/some/path/sample.txt');
const attachment = new Attachment({
  filename: 'sample.txt',
  contentType: 'text/plain'
});
attachment.write(readStream, function (error, attachment) => { ... });
```

#### `read([done(error, fileContent)]):Stream`
Read a file content from gridfs storage.

##### Example for smaller file size
```js
attachment.read((error, content) => { ... });

```

##### Example for larger file size
```js
const readStream = attachment.read();
readStream.on('error', fn);
readStream.on('data', fn);
readStream.on('close', fn);
```

#### `unlink(done(error, unlinkedFile))`
Remove file details and its content from underlying gridfs collection.

##### Example
```js
attachment.unlink((error, unlinkedAttachment) => { ... });
```

## Literature Reviewed
- [MongoDB GridFS](https://docs.mongodb.org/manual/core/gridfs/)
- [Node MongoDB GridFS](http://mongodb.github.io/node-mongodb-native/3.1/tutorials/gridfs/)
- [gridfs-stream](https://github.com/aheckmann/gridfs-stream)
- [New Streaming GridFS API](https://thecodebarbarian.com/mongodb-gridfs-stream)
- [New GridFS API](http://mongodb.github.io/node-mongodb-native/3.1/tutorials/gridfs/streaming/)

## Licence

The MIT License (MIT)

Copyright (c) 2015 lykmapipo & Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE. 
