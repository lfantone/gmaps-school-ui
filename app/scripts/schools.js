'use strict';
var axios = require('axios');
var response = require('./schools.json');

var SchoolService = function() {};

SchoolService.prototype.getSchools = function () {
  return axios.get(location.protocol + '//' + location.host + ':3000/schools', {timeout: 2000});
};

SchoolService.prototype.getSchoolsFromJSON = function () {
  return response;
};

module.exports = new SchoolService();
