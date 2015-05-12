var _ = require('lodash'),
  AWS = require('aws-sdk');

AWS.config.update({
  region: process.env.AWS_REGION
});

module.exports = function(done) {
  new AWS.EC2().describeInstances(function(e, data) {
    if (e) {
      return done(e);
    }

    var dictionary = {};
    var mapped = [];

    _.forEach(data.Reservations, function(reservation) {
      _.forEach(reservation.Instances, function(instance) {
        if (instance.State.Name === 'running') {
          var name, endpoint, port;
          _.forEach(instance.Tags, function(tag) {
            if (tag.Key === 'ganglion-name') {
              name = tag.Value;
            } else if (tag.Key === 'ganglion-endpoint') {
              endpoint = tag.Value;
            } else if (tag.Key === 'ganglion-port') {
              port = tag.Value;
            }
          });
          if (!dictionary[name]) {
            var item = {
              name: name,
              endpoint: endpoint,
              addresses: []
            };
            dictionary[name] = item;
            mapped.push(item);
          }
          dictionary[name].addresses.push(instance.PrivateIpAddress + ':' + port);
        }
      });
    });

    return done(null, mapped);
  });
};
