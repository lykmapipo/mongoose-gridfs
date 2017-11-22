'use strict';

//dependencies
const path = require('path');
const storage = require(path.join(__dirname, 'lib', 'storage'));

//export gridfs storage
module.exports = storage;
