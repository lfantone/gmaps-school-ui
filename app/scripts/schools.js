'use strict';
var axios = require('axios');

var SchoolService = function() {};

SchoolService.prototype.getSchools = function () {
  return axios.get(location.protocol + '//' + location.host + ':3000/schools', {timeout: 2000});
};

SchoolService.prototype.getSchoolsFromJSON = function () {
  return axios.get(location.protocol + '//' + location.host + '/master/js/schools.json');
};

module.exports = new SchoolService();
