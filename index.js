'use strict';

//dependencies
var path = require('path');
var storage = require(path.join(__dirname, 'lib', 'storage'));

//export gridfs storage
module.exports = storage;
