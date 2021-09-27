# mongoose-gridfs

[![Build Status](https://app.travis-ci.com/lykmapipo/mongoose-gridfs.svg?branch=master)](https://app.travis-ci.com/lykmapipo/mongoose-gridfs)
[![Dependencies Status](https://david-dm.org/lykmapipo/mongoose-gridfs.svg)](https://david-dm.org/lykmapipo/mongoose-gridfs)
[![Coverage Status](https://coveralls.io/repos/github/lykmapipo/mongoose-gridfs/badge.svg?branch=master)](https://coveralls.io/github/lykmapipo/mongoose-gridfs?branch=master)
[![GitHub License](https://img.shields.io/github/license/lykmapipo/mongoose-gridfs)](https://github.com/lykmapipo/mongoose-gridfs/blob/master/LICENSE)

[![Commitizen Friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Code Style](https://badgen.net/badge/code%20style/airbnb/ff5a5f?icon=airbnb)](https://github.com/airbnb/javascript)
[![npm version](https://img.shields.io/npm/v/mongoose-gridfs)](https://www.npmjs.com/package/mongoose-gridfs)

mongoose [gridfs](https://docs.mongodb.com/manual/core/gridfs/) on top of [new gridfs api](http://mongodb.github.io/node-mongodb-native/3.1/tutorials/gridfs/)

*Note!: Only compatible with Mongoose >= 6.0.7+*

*Note!: Ensure mongoose connection before use*

## Requirements

- [NodeJS v13+](https://nodejs.org)
- [Npm v6.12+](https://www.npmjs.com/)
- [MongoDB v4+](https://www.mongodb.com/)
- [Mongoose v6+](https://github.com/Automattic/mongoose)

## Installation
```sh
$ npm install --save mongoose mongoose-gridfs
```

## Usage
```js
import { createReadStream } from 'fs';
import { createModel } from 'mongoose-gridfs';

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

## Testing

- Clone this repository

- Install all development dependencies

```sh
npm install
```

- Run example

```sh
npm run dev
```

- Then run test

```sh
npm test
```

## Contribute

It will be nice, if you open an issue first so that we can know what is going on, then, fork this repo and push in your ideas. Do not forget to add a bit of test(s) of what value you adding.

## License

The MIT License (MIT)

Copyright (c) CodeTanzania & Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
