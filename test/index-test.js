var AWS = require('aws-sdk'),
  index = require('../index'),
  sinon = require('sinon');

require('chai').should();

describe('index', function() {
  beforeEach(function() {
    this.describeInstances = sinon.stub();
    this.describeInstances.yields(null, require('./fixtures/reservations'));
    sinon.stub(AWS, 'EC2').returns({
      describeInstances: this.describeInstances
    });
  });
  afterEach(function() {
    AWS.EC2.restore();
  });

  it('should not error', function(done) {
    return index(function(e) {
      return done(e);
    });
  });

  it('should error if describe instances failes', function(done) {
    this.describeInstances.yields('ERROR');
    return index(function(e) {
      e.should.equal('ERROR');
      return done();
    });
  });

  it('should return expected', function(done) {
    return index(function(e, data) {
      data.should.deep.equal([{
        name: 'microservice-1',
        endpoint: '/api/microservice-1',
        addresses: ['41.41.41.41', '43.43.43.43']
      }, {
        name: 'microservice-2',
        endpoint: '/api/microservice-2',
        addresses: ['42.42.42.42']
      }]);
      return done();
    });
  });
});
