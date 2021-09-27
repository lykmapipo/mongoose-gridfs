import { connect, drop } from '@lykmapipo/mongoose-test-helpers';

before((done) => connect(done));

after((done) => drop(done));
