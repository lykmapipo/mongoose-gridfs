'use strict';

const { connect, drop } = require('@lykmapipo/mongoose-test-helpers');

before(done => connect(done));

after(done => drop(done));
