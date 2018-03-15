const chai = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');
const db = require('../../src/db');
const { createUser } = require('../../src/db/repositories/user');
const server = require('../..');

chai.use(chaiHttp);

const PATH = '/api/users';
const testUser = {
  email: 'user@gmail.com',
  password: '12345',
  name: 'User',
};

describe('routes: users', () => {
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
    it('should create new user', done => {
      chai
        .request(server)
        .post(`${PATH}`)
        .send(testUser)
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

    it('should not create new user without required fields', done => {
      chai
        .request(server)
        .post(`${PATH}`)
        .send({ email: testUser.email })
        .end((err, res) => {
          should.exist(err);
          res.status.should.eql(400);
          res.type.should.eql('application/json');
          res.body.should.have.property('status');
          res.body.status.should.eql(400);
          res.body.should.have.property('message');
          res.body.message.should.eql('Email and password are required');
          done();
        });
    });

    it('should not create new user with existing email', done => {
      createUser(testUser).then(user => {
        chai
          .request(server)
          .post(`${PATH}`)
          .send(testUser)
          .end((err, res) => {
            should.exist(err);
            res.status.should.eql(400);
            res.type.should.eql('application/json');
            res.body.should.have.property('status');
            res.body.status.should.eql(400);
            res.body.should.have.property('message');
            res.body.message.should.eql('User already exists');
            done();
          });
      });
    });
  });

  describe(`POST ${PATH}/token/refresh`, () => {
    it('should refresh user access token', done => {
      chai
        .request(server)
        .post(`${PATH}`)
        .send(testUser)
        .end((err, res) => {
          chai
            .request(server)
            .post(`${PATH}/token/refresh`)
            .send({
              accessToken: res.body.accessToken,
              refreshToken: res.body.refreshToken,
            })
            .end((err, res) => {
              should.not.exist(err);
              res.status.should.eql(200);
              res.type.should.eql('application/json');
              res.body.should.have.property('accessToken');
              res.body.accessToken.should.match(/^Bearer\s\S+$/);
              res.body.should.have.property('refreshToken');
              done();
            });
        });
    });

    it('should not refresh user access token with invalid current access token', done => {
      chai
        .request(server)
        .post(`${PATH}`)
        .send(testUser)
        .end((err, res) => {
          chai
            .request(server)
            .post(`${PATH}/token/refresh`)
            .send({
              accessToken: 'invalid access token',
              refreshToken: res.body.refreshToken,
            })
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

    it('should not refresh user access token with invalid refresh token', done => {
      chai
        .request(server)
        .post(`${PATH}`)
        .send(testUser)
        .end((err, res) => {
          chai
            .request(server)
            .post(`${PATH}/token/refresh`)
            .send({
              accessToken: res.body.accessToken,
              refreshToken: 'invalid refresh token',
            })
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
