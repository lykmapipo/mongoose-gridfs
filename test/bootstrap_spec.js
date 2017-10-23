'use strict';

//set environment to test
process.env.NODE_ENV = 'test';

//dependencies
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

/**
 * @description wipe all mongoose model data and drop all indexes
 */
function wipe(done) {
    mongoose.connection.db.dropDatabase(done);
}

before(function(done) {
    //setup database
    mongoose.connection.on('connected', function() {
        done();
    });

    mongoose.connect('mongodb://localhost/mongoose-gridfs');
});

// restore initial environment
after(function(done) {
    wipe(done);
});
