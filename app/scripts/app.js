'use strict';
var _ = require('lodash');
var mapsService = require('./maps.js');
var schoolService = require('./schools.js');

function callback(response) {
  if (!_.isEmpty(response.data)) {
    mapsService.addMarkers(response.data);
  }
}

mapsService.initialize({legend: true});
schoolService.getSchools()
  .then(callback)
  .catch(function(response) {
    console.error(response, 'Oops ! There was a connection error. Can\'t reach the API.');
  });
