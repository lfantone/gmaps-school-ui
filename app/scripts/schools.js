'use strict';
var axios = require('axios');

var SchoolService = function() {};

SchoolService.prototype.getSchools = function () {
  return axios.get(location.protocol + '//' + location.host + ':3000/schools');
};

SchoolService.prototype.getSchoolsFromJSON = function () {
  return axios.get('/schools.json');
};

module.exports = new SchoolService();
