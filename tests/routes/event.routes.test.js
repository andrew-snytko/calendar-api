const chai = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');
const db = require('../../src/db');
const { createUser } = require('../../src/db/repositories/user');
const { createEvent } = require('../../src/db/repositories/event');
const server = require('../..');

chai.use(chaiHttp);

const PATH = '/api/events';
const testUser = {
  email: 'user@gmail.com',
  password: '12345',
  name: 'User',
};
const testEvent = {
  description: 'Test Event',
  type: 1,
  startDate: '2018-03-14 16:00',
  endDate: '2018-03-14 18:00',
};

/*
  Missing tests for next routes:
      /today/:offset?/:limit?
      /week/:offset?/:limit?
      /month/:offset?/:limit?
      /date/:date/:offset?/:limit?
*/

function createTestEvent() {
  return new Promise((resolve, reject) => {
    createUser(testUser).then(user => {
      chai
        .request(server)
        .post('/api/auth')
        .send({ email: testUser.email, password: testUser.password })
        .end((err, res) => {
          const accessToken = res.body.accessToken;
          chai
            .request(server)
            .post(`${PATH}`)
            .set('Authorization', accessToken)
            .send(testEvent)
            .end((err, res) => {
              const event = res.body;
              event.accessToken = accessToken;
              resolve(event);
            });
        });
    });
  });
}

describe('routes: event', () => {
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
    it('should create event with valid fields', done => {
      createUser(testUser).then(user => {
        chai
          .request(server)
          .post('/api/auth')
          .send({ email: testUser.email, password: testUser.password })
          .end((err, res) => {
            chai
              .request(server)
              .post(`${PATH}`)
              .set('Authorization', res.body.accessToken)
              .send(testEvent)
              .end((err, res) => {
                should.not.exist(err);
                res.status.should.eql(200);
                res.type.should.eql('application/json');
                res.body.should.have.property('id');
                res.body.should.have.property('description');
                res.body.should.have.property('startDate');
                res.body.should.have.property('endDate');
                res.body.should.have.property('type');
                res.body.type.should.have.property('id');
                res.body.type.should.have.property('name');
                done();
              });
          });
      });
    });

    it('should not create event for not authorized user', done => {
      createUser(testUser).then(user => {
        chai
          .request(server)
          .post(`${PATH}`)
          .send({ ...testEvent, type: undefined })
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

    it('should not create event without type', done => {
      createUser(testUser).then(user => {
        chai
          .request(server)
          .post('/api/auth')
          .send({ email: testUser.email, password: testUser.password })
          .end((err, res) => {
            chai
              .request(server)
              .post(`${PATH}`)
              .set('Authorization', res.body.accessToken)
              .send({ ...testEvent, type: undefined })
              .end((err, res) => {
                should.exist(err);
                res.status.should.eql(400);
                res.type.should.eql('application/json');
                res.body.should.have.property('status');
                res.body.status.should.eql(400);
                res.body.should.have.property('message');
                res.body.message.should.eql('Event type is required');
                done();
              });
          });
      });
    });

    it('should not create event without start date', done => {
      createUser(testUser).then(user => {
        chai
          .request(server)
          .post('/api/auth')
          .send({ email: testUser.email, password: testUser.password })
          .end((err, res) => {
            chai
              .request(server)
              .post(`${PATH}`)
              .set('Authorization', res.body.accessToken)
              .send({ ...testEvent, startDate: undefined })
              .end((err, res) => {
                should.exist(err);
                res.status.should.eql(400);
                res.type.should.eql('application/json');
                res.body.should.have.property('status');
                res.body.status.should.eql(400);
                res.body.should.have.property('message');
                res.body.message.should.eql('Invalid event date');
                done();
              });
          });
      });
    });

    it('should not create event with invalid start date', done => {
      createUser(testUser).then(user => {
        chai
          .request(server)
          .post('/api/auth')
          .send({ email: testUser.email, password: testUser.password })
          .end((err, res) => {
            chai
              .request(server)
              .post(`${PATH}`)
              .set('Authorization', res.body.accessToken)
              .send({ ...testEvent, startDate: 'invalid date' })
              .end((err, res) => {
                should.exist(err);
                res.status.should.eql(400);
                res.type.should.eql('application/json');
                res.body.should.have.property('status');
                res.body.status.should.eql(400);
                res.body.should.have.property('message');
                res.body.message.should.eql('Invalid event date');
                done();
              });
          });
      });
    });

    it('should not create event with invalid end date', done => {
      createUser(testUser).then(user => {
        chai
          .request(server)
          .post('/api/auth')
          .send({ email: testUser.email, password: testUser.password })
          .end((err, res) => {
            chai
              .request(server)
              .post(`${PATH}`)
              .set('Authorization', res.body.accessToken)
              .send({ ...testEvent, endDate: 'invalid date' })
              .end((err, res) => {
                should.exist(err);
                res.status.should.eql(400);
                res.type.should.eql('application/json');
                res.body.should.have.property('status');
                res.body.status.should.eql(400);
                res.body.should.have.property('message');
                res.body.message.should.eql('Invalid event end date');
                done();
              });
          });
      });
    });

    it('should not create event with end date that greater than start date', done => {
      createUser(testUser).then(user => {
        chai
          .request(server)
          .post('/api/auth')
          .send({ email: testUser.email, password: testUser.password })
          .end((err, res) => {
            chai
              .request(server)
              .post(`${PATH}`)
              .set('Authorization', res.body.accessToken)
              .send({
                ...testEvent,
                startDate: '2018-03-14 16:00',
                endDate: '2018-03-14 14:00',
              })
              .end((err, res) => {
                should.exist(err);
                res.status.should.eql(400);
                res.type.should.eql('application/json');
                res.body.should.have.property('status');
                res.body.status.should.eql(400);
                res.body.should.have.property('message');
                res.body.message.should.eql('Invalid event time range');
                done();
              });
          });
      });

      it('should not create event with invalid event type', done => {
        createUser(testUser).then(user => {
          chai
            .request(server)
            .post('/api/auth')
            .send({ email: testUser.email, password: testUser.password })
            .end((err, res) => {
              chai
                .request(server)
                .post(`${PATH}`)
                .set('Authorization', res.body.accessToken)
                .send({
                  ...testEvent,
                  type: 'invalid type',
                })
                .end((err, res) => {
                  should.exist(err);
                  res.status.should.eql(400);
                  res.type.should.eql('application/json');
                  res.body.should.have.property('status');
                  res.body.status.should.eql(400);
                  res.body.should.have.property('message');
                  res.body.message.should.eql('Invalid event type');
                  done();
                });
            });
        });
      });
    });
  });

  describe(`DELETE ${PATH}/:id`, () => {
    it('should delete event with valid id', done => {
      createTestEvent().then(event => {
        chai
          .request(server)
          .delete(`${PATH}/${event.id}`)
          .set('Authorization', event.accessToken)
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

    it('should not delete event for not authorized user', done => {
      createTestEvent().then(event => {
        chai
          .request(server)
          .delete(`${PATH}/${event.id}`)
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

    it('should not delete event with invalid id', done => {
      createTestEvent().then(event => {
        chai
          .request(server)
          .delete(`${PATH}/invalid-id`)
          .set('Authorization', event.accessToken)
          .end((err, res) => {
            should.exist(err);
            res.status.should.eql(400);
            res.type.should.eql('application/json');
            res.body.should.have.property('status');
            res.body.status.should.eql(400);
            res.body.should.have.property('message');
            res.body.message.should.eql('Invalid event id');
            done();
          });
      });
    });

    it('should not delete not existing event', done => {
      createTestEvent().then(event => {
        chai
          .request(server)
          .delete(`${PATH}/100500`)
          .set('Authorization', event.accessToken)
          .end((err, res) => {
            should.exist(err);
            res.status.should.eql(404);
            res.type.should.eql('application/json');
            res.body.should.have.property('status');
            res.body.status.should.eql(404);
            res.body.should.have.property('message');
            res.body.message.should.eql('Not Found');
            done();
          });
      });
    });
  });

  describe(`PUT ${PATH}`, () => {
    it('should update event with valid fields', done => {
      createTestEvent().then(event => {
        chai
          .request(server)
          .put(`${PATH}/${event.id}`)
          .send({
            description: 'Updated Test Event',
            type: 2,
            startDate: '2018-03-15 16:00',
            endDate: '2018-03-15 18:00',
          })
          .set('Authorization', event.accessToken)
          .end((err, res) => {
            should.not.exist(err);
            res.status.should.eql(200);
            res.type.should.eql('application/json');
            res.body.should.have.property('id');
            res.body.should.have.property('description');
            res.body.should.have.property('startDate');
            res.body.should.have.property('endDate');
            res.body.should.have.property('type');
            res.body.type.should.have.property('id');
            res.body.type.should.have.property('name');
            done();
          });
      });
    });

    it('should not update event for not authorized user', done => {
      createTestEvent().then(event => {
        chai
          .request(server)
          .put(`${PATH}/${event.id}`)
          .set('Authorization', 'invalid access token')
          .send({
            description: 'Updated Test Event',
            type: 2,
            startDate: '2018-03-15 16:00',
            endDate: '2018-03-15 18:00',
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

    it('should not update event with invalid id', done => {
      createTestEvent().then(event => {
        chai
          .request(server)
          .put(`${PATH}/invalid-id`)
          .send({
            description: 'Updated Test Event',
            type: 2,
            startDate: '2018-03-15 16:00',
            endDate: '2018-03-15 18:00',
          })
          .set('Authorization', event.accessToken)
          .end((err, res) => {
            should.exist(err);
            res.status.should.eql(400);
            res.type.should.eql('application/json');
            res.body.should.have.property('status');
            res.body.status.should.eql(400);
            res.body.should.have.property('message');
            res.body.message.should.eql('Invalid event id');
            done();
          });
      });
    });

    it('should not update not existing event', done => {
      createTestEvent().then(event => {
        chai
          .request(server)
          .put(`${PATH}/100500`)
          .send({
            description: 'Updated Test Event',
            type: 2,
            startDate: '2018-03-15 16:00',
            endDate: '2018-03-15 18:00',
          })
          .set('Authorization', event.accessToken)
          .end((err, res) => {
            should.exist(err);
            res.status.should.eql(404);
            res.type.should.eql('application/json');
            res.body.should.have.property('status');
            res.body.status.should.eql(404);
            res.body.should.have.property('message');
            res.body.message.should.eql('Not Found');
            done();
          });
      });
    });

    it('should not update event with invalid start date', done => {
      createTestEvent().then(event => {
        chai
          .request(server)
          .put(`${PATH}/${event.id}`)
          .send({
            startDate: 'invalid date',
          })
          .set('Authorization', event.accessToken)
          .end((err, res) => {
            should.exist(err);
            res.status.should.eql(400);
            res.type.should.eql('application/json');
            res.body.should.have.property('status');
            res.body.status.should.eql(400);
            res.body.should.have.property('message');
            res.body.message.should.eql('Invalid event date');
            done();
          });
      });
    });

    it('should not update event with invalid end date', done => {
      createTestEvent().then(event => {
        chai
          .request(server)
          .put(`${PATH}/${event.id}`)
          .send({
            endDate: 'invalid date',
          })
          .set('Authorization', event.accessToken)
          .end((err, res) => {
            should.exist(err);
            res.status.should.eql(400);
            res.type.should.eql('application/json');
            res.body.should.have.property('status');
            res.body.status.should.eql(400);
            res.body.should.have.property('message');
            res.body.message.should.eql('Invalid event end date');
            done();
          });
      });
    });

    it('should not update event with end date that greater than start date', done => {
      createTestEvent().then(event => {
        chai
          .request(server)
          .put(`${PATH}/${event.id}`)
          .send({
            startDate: '2018-03-14 16:00',
            endDate: '2018-03-14 14:00',
          })
          .set('Authorization', event.accessToken)
          .end((err, res) => {
            should.exist(err);
            res.status.should.eql(400);
            res.type.should.eql('application/json');
            res.body.should.have.property('status');
            res.body.status.should.eql(400);
            res.body.should.have.property('message');
            res.body.message.should.eql('Invalid event time range');
            done();
          });
      });
    });

    it('should not update event with invalid type', done => {
      createTestEvent().then(event => {
        chai
          .request(server)
          .put(`${PATH}/${event.id}`)
          .send({
            type: 'invalid type',
          })
          .set('Authorization', event.accessToken)
          .end((err, res) => {
            should.exist(err);
            res.status.should.eql(400);
            res.type.should.eql('application/json');
            res.body.should.have.property('status');
            res.body.status.should.eql(400);
            res.body.should.have.property('message');
            res.body.message.should.eql('Invalid event type');
            done();
          });
      });
    });

    it('should not update event without changes', done => {
      createTestEvent().then(event => {
        chai
          .request(server)
          .put(`${PATH}/${event.id}`)
          .send()
          .set('Authorization', event.accessToken)
          .end((err, res) => {
            should.exist(err);
            res.status.should.eql(400);
            res.type.should.eql('application/json');
            res.body.should.have.property('status');
            res.body.status.should.eql(400);
            res.body.should.have.property('message');
            res.body.message.should.eql('No data to update');
            done();
          });
      });
    });
  });
});
