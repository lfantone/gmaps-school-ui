'use strict';
var axios = require('axios');

var SchoolService = function() {};

SchoolService.prototype.getSchools = function () {
  return axios.get(location.protocol + '//' + location.host + ':3000/schools');
};

module.exports = new SchoolService();
