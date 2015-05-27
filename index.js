var _ = require('lodash'),
  AWS = require('aws-sdk');

AWS.config.update({
  region: process.env.AWS_REGION
});

function parse(instance) {
  var parsed = {
    ipaddress: instance.PrivateIpAddress
  };

  return _.reduce(instance.Tags, function(result, tag) {
    if (tag.Key.indexOf('ganglion-') === 0) {
      result[tag.Key.substr(9)] = tag.Value;
    }
    return result;
  }, parsed);
}

function add(dictionary, mapped, details) {
  if (!dictionary[details.name]) {
    var item = {
      name: details.name,
      endpoint: details.endpoint,
      addresses: []
    };
    dictionary[details.name] = item;
    mapped.push(item);
  }
  dictionary[details.name].addresses.push(details.ipaddress + ':' + details.port);
}

module.exports = function(done) {
  return new AWS.EC2().describeInstances(function(e, data) {
    if (e) {
      return done(e);
    }

    var dictionary = {};
    var mapped = [];

    _.forEach(data.Reservations, function(reservation) {
      _.forEach(reservation.Instances, function(instance) {
        if (instance.State.Name === 'running') {
          add(dictionary, mapped, parse(instance));
        }
      });
    });

    return done(null, mapped);
  });
};
