const chai = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');
const db = require('../../src/db');
const { createUser } = require('../../src/db/repositories/user');
const server = require('../..');

chai.use(chaiHttp);

const PATH = '/api/auth';
const testUser = {
  email: 'user@gmail.com',
  password: '12345',
  name: 'User',
};

describe('routes: auth', () => {
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

  describe(`POST ${PATH}`, () => {
    it('should authenticate user with valid email and password', done => {
      createUser(testUser).then(user => {
        chai
          .request(server)
          .post(`${PATH}`)
          .send({ email: testUser.email, password: testUser.password })
          .end((err, res) => {
            should.not.exist(err);
            res.status.should.eql(200);
            res.type.should.eql('application/json');
            res.body.should.have.property('id');
            res.body.should.have.property('email');
            res.body.should.have.property('name');
            res.body.should.have.property('accessToken');
            res.body.accessToken.should.match(/^Bearer\s\S+$/);
            res.body.should.have.property('refreshToken');
            done();
          });
      });
    });

    it('should not authenticate user with invalid email', done => {
      createUser(testUser).then(user => {
        chai
          .request(server)
          .post(`${PATH}`)
          .send({ email: 'invalid email', password: testUser.password })
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

    it('should not authenticate user with invalid password', done => {
      createUser(testUser).then(user => {
        chai
          .request(server)
          .post(`${PATH}`)
          .send({ email: testUser.email, password: 'invalid password' })
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

  describe(`POST ${PATH}/logout`, () => {
    it('should logout user with valid access token', done => {
      createUser(testUser).then(user => {
        chai
          .request(server)
          .post(`${PATH}`)
          .send({ email: testUser.email, password: testUser.password })
          .end((err, res) => {
            chai
              .request(server)
              .post(`${PATH}/logout`)
              .set('Authorization', res.body.accessToken)
              .send()
              .end((err, res) => {
                should.not.exist(err);
                res.status.should.eql(200);
                res.type.should.eql('application/json');
                res.body.should.have.property('status');
                res.body.status.should.eql(200);
                res.body.should.have.property('message');
                res.body.message.should.eql('Ok');
                done();
              });
          });
      });
    });

    it('should not logout user with invalid access token', done => {
      createUser(testUser).then(user => {
        chai
          .request(server)
          .post(`${PATH}`)
          .send({ email: testUser.email, password: testUser.password })
          .end((err, res) => {
            chai
              .request(server)
              .post(`${PATH}/logout`)
              .set('Authorization', 'invalid access token')
              .send()
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
  });
});
