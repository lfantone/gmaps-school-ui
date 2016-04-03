'use strict';
var axios = require('axios');

var SchoolService = function() {};

SchoolService.prototype.getSchools = function () {
  return axios.get('http://localhost:3000/schools');
};

module.exports = new SchoolService();
