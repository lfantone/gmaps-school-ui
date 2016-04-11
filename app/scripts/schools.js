'use strict';
var _ = require('lodash');
var axios = require('axios');
var parser = new DOMParser();
var host = location.hostname === 'localhost' ? '/api/' : '/';
var path = 'web/xml_reporte.asp';

var SchoolService = function() {};

SchoolService.prototype.getSchools = function() {
  return axios.get(host + path, {
    params: {
      object: 'reportemapa'
    },
    timeout: 2000,
    transformResponse: [this.transformResponse]
  });
};

SchoolService.prototype.transformResponse = function(data) {
  var doc = parser.parseFromString(data, 'application/xml');
  var items = doc.getElementsByTagName('item');
  var self = this;
  var json = _.map(items, function(item) {
    var hired = item.querySelector('montocontratado');
    return {
      id: parseInt(item.querySelector('CUE').innerHTML, 10),
      establishment: _.startCase(item.querySelector('establecimiento').innerHTML),
      geo: {
        lng: parseFloat(item.querySelector('x').innerHTML),
        lat: parseFloat(item.querySelector('y').innerHTML)
      },
      licitation: {
        id: parseInt(item.querySelector('idlicitacion').innerHTML, 10),
        code: item.querySelector('licitacion').innerHTML
      },
      amount: {
        currency: 'ARS',
        official: parseInt(item.querySelector('montooficial').innerHTML, 10),
        hired: hired ? parseInt(hired.innerHTML, 10) : hired
      },
      status: {
        name: _.capitalize(item.querySelector('estado').innerHTML),
        color: item.querySelector('color').innerHTML.replace('#', '')
      },
      program: item.querySelector('programa').innerHTML
    };
  });
  return json;
};

SchoolService.prototype.getSchoolsFromJSON = function() {
  return response;
};

module.exports = new SchoolService();
