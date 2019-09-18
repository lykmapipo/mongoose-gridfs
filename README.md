mongoose-gridfs
===============

[![Build Status](https://travis-ci.org/lykmapipo/mongoose-gridfs.svg?branch=master)](https://travis-ci.org/lykmapipo/mongoose-gridfs)

mongoose [gridfs](https://docs.mongodb.com/manual/core/gridfs/) on top of [new gridfs api](http://mongodb.github.io/node-mongodb-native/3.1/tutorials/gridfs/)

*Note!: Only compatible with Mongoose >= 5.7.0*

*Note!: Ensure mongoose connection before use*

## Installation
```sh
$ npm install --save mongoose-gridfs
```

## Usage
```js
const { createReadStream } = require('fs');
const { createModel } = require('mongoose-gridfs');

// use default bucket
const Attachment = createModel();

// or create custom bucket with custom options
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

// read larger file
const readStream = Attachment.read({ _id });

// read smaller file
Attachment.read({ _id }, (error, buffer) => { ... });

// remove file and its content
Attachment.unlink({ _id }, (error) => { ... });
```


**[Read Documentation](DOCUMENTATION.md)**


## Literature Reviewed
- [MongoDB GridFS](https://docs.mongodb.org/manual/core/gridfs/)
- [Node MongoDB GridFS](http://mongodb.github.io/node-mongodb-native/3.1/tutorials/gridfs/)
- [gridfs-stream](https://github.com/aheckmann/gridfs-stream)
- [New Streaming GridFS API](https://thecodebarbarian.com/mongodb-gridfs-stream)
- [New GridFS API](http://mongodb.github.io/node-mongodb-native/3.1/tutorials/gridfs/streaming/)

## License

The MIT License (MIT)

Copyright (c) lykmapipo & Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE. 
