'use strict';
var _ = require('lodash');
var mapsService = require('./maps.js');
var schoolService = require('./schools.js');

mapsService.initialize();
schoolService.getSchools()
  .then(function(response) {
    var schools = response.data.data;

    if (!_.isEmpty(schools)) {
      mapsService.addMarkers(schools);
    }
  })
  .catch(function(response) {
    console.error(response, 'Oops :(');
  });
