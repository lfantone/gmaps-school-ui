'use strict';
var axios = require('axios');

var SchoolService = function() {};

SchoolService.prototype.getSchools = function () {
  return axios.get('http://52.32.15.133/schools');
};

module.exports = new SchoolService();
