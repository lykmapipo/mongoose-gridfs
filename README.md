mongoose-gridfs
===============

[![Build Status](https://travis-ci.org/lykmapipo/mongoose-gridfs.svg?branch=master)](https://travis-ci.org/lykmapipo/mongoose-gridfs)

mongoose [gridfs](https://docs.mongodb.com/manual/core/gridfs/) on top of [gridfs-stream](https://github.com/aheckmann/gridfs-stream)

*Note!: Ensure mongoose connection before use*

## Installation
```sh
$ npm install --save mongoose mongoose-gridfs
```

## Usage
```js
var fs = require('fs');
var mongoose = require('mongoose');

//mongoose connect
mongoose.connect('mongodb://localhost/test');

//instantiate mongoose-gridfs
var gridfs = require('mongoose-gridfs')({
  collection:'attachments',
  model:'Attachment',
  mongooseConnection: mongoose.connection
});

//obtain a model
Attachment = gridfs.model;

//create or save a file
Attachment.write({
  filename:'sample.txt', 
  contentType:'text/plain'
  }, 
  fs.createReadStream('/some/path/sample.txt'), 
  function(error, createdFile){
    ...
});

//for larger file size
//read a file and receive a stream
var stream  = Attachment.readById(<objectid>);

//for smaller file size
//read a file and receive a buffer
Attachment.readById(<objectid>, function(error, buffer){
  ...
});

//remove file details and its content from gridfs
Attachment.unlinkById(<objectid>, function(error, unlinkedAttachment){
  ...
});
```

## API
`mongoose-gridfs` wrap [gridfs-stream](https://github.com/aheckmann/gridfs-stream) to provide valid mongoose `schema` and `model` to use with [MongoDB GridFS](https://docs.mongodb.org/manual/core/gridfs/).

Each instance of `mongoose-gridfs` is binded to a specific `GridFS collection` and `mongoose model` or `schema` by using options.

### Options
- `collection` a root collection to use in GridFS. default to `fs`
- `model` a model name to use in mongoose. default to `File`

Example
```js
//instantiate mongoose-gridfs
var gridfs = require('mongoose-gridfs')({
  collection:'attachments',
  model:'Attachment'
});
```

### Schema & Model
To obtain underlying model use
```js
var Attachment = gridfs.model
```

To obtain underlying schema for self model registration use
```js
var AttachmentSchema = gridfs.schema;

//attach plugins
//ensure indexes

//register and export a model
module.export = mongoose.model('Attachment', AttachmentSchema);
```

### Static Methods

#### `write(fileDetails:Object, stream:Readable, done(error, createdFile))`
Write a readable stream into gridfs storage

##### Example
```js
Attachment.write({
filename:'sample.txt',
contentType:'text/plain'
},
fs.createReadStream('/some/path/sample.txt'),
function(error, savedAttachment){
  ...
});
```

#### `readById(objectid:ObjectId, [done(error, fileContent)]):Stream`
Read a file content from gridfs storage.

##### Example for smaller file size
```js
Attachment.readById(<objectid>, function(error, content){
  ...
})
```

##### Example for larger file size
```js
var stream = Attachment.readById(<objectid>);

stream.on('error', fn);

stream.on('data', fn);

stream.on('close', fn);
```

#### `unlinkById(objectid:ObjectId, done(error, unlinkedFile))`
Remove file details and its content from underlying gridfs collection.

##### Example
```js
Attachment.unlinkById(<objectid>, function(error, unlinkedAttachment){
  ...
});

or

Attachment.unlink(<objectid>, function(error, unlinkedAttachment){
  ...
});
```

### Instance Methods

#### `write(stream:Readable, done(error, createdFile))`
Write a readable stream into gridfs storage

##### Example
```js
var attachment = new Attachment({
  filename:'sample.txt',
  contentType:'text/plain'
});

attachment.write(
fs.createReadStream('/some/path/sample.txt'),
function(error, savedAttachment){
  ...
});
```

#### `read([done(error, fileContent)]):Stream`
Read a file content from gridfs storage.

##### Example for smaller file size
```js
attachment.read(function(error, content){
  ...
})
```

##### Example for larger file size
```js
var stream = attachment.read();

stream.on('error', fn);

stream.on('data', fn);

stream.on('close', fn);
```

#### `unlink(done(error, unlinkedFile))`
Remove file details and its content from underlying gridfs collection.

##### Example
```js
attachment.unlink(<objectid>, function(error, unlinkedAttachment){
  ...
});
```

## Literature Reviewed
- [MongoDB GridFS](https://docs.mongodb.org/manual/core/gridfs/)
- [gridfs-stream](https://github.com/aheckmann/gridfs-stream)

## Licence

The MIT License (MIT)

Copyright (c) 2015 lykmapipo & Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE. 
