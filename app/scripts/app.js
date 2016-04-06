'use strict';
var _ = require('lodash');
var mapsService = require('./maps.js');
var schoolService = require('./schools.js');

function callback(response) {
  var schools = response.data.data;

  if (!_.isEmpty(schools)) {
    mapsService.addMarkers(schools);
  }
}

mapsService.initialize({legend: true});
callback(schoolService.getSchoolsFromJSON());
// schoolService.getSchools()
//   .then(callback)
//   .catch(function(response) {
//     console.error(response, 'Oops ! There was a connection error. Can\'t reach the API.');
//   });
