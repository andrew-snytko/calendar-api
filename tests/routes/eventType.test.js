const chai = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');
const db = require('../../src/db');
const { createUser } = require('../../src/db/repositories/user');
const { createEvent } = require('../../src/db/repositories/eventType');
const server = require('../..');

chai.use(chaiHttp);

const PATH = '/api/event-types';
const testUser = {
  email: 'user@gmail.com',
  password: '12345',
  name: 'User',
};

describe('routes: event-type', () => {
  beforeEach(() => {
    return db.migrate
      .rollback()
      .then(() => {
        return db.migrate.latest();
      })
      .then(() => {
        return db.seed.run();
      });
  });
  afterEach(() => {
    return db.migrate.rollback();
  });

  describe(`GET ${PATH}`, () => {
    it('should get list of all event types', done => {
      createUser(testUser).then(user => {
        chai
          .request(server)
          .post('/api/auth')
          .send({ email: testUser.email, password: testUser.password })
          .end((err, res) => {
            chai
              .request(server)
              .get(`${PATH}`)
              .set('Authorization', res.body.accessToken)
              .end((err, res) => {
                should.not.exist(err);
                res.status.should.eql(200);
                res.type.should.eql('application/json');
                res.body.should.have.property('rows');
                res.body.rows.should.to.be.an('array');
                res.body.should.have.property('total');
                done();
              });
          });
      });
    });

    it('should not get list of all event types for not authorized user', done => {
      chai
        .request(server)
        .get(`${PATH}`)
        .end((err, res) => {
          should.exist(err);
          res.status.should.eql(401);
          res.type.should.eql('application/json');
          res.body.should.have.property('status');
          res.body.status.should.eql(401);
          res.body.should.have.property('message');
          res.body.message.should.eql('Unauthorized');
          done();
        });
    });
  });
});
