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
      object: 'reportemapa20160418'
    },
    timeout: 4000,
    transformResponse: [this.transformResponse]
  });
};

SchoolService.prototype.transformResponse = function(data) {
  var doc = parser.parseFromString(data, 'application/xml');
  var items = doc.getElementsByTagName('item_CUE');
  var self = this;
  var json = _.map(items, function(item) {
    return {
      id: parseInt(item.querySelector('CUE').innerHTML, 10),
      establishment: _.startCase(item.querySelector('establecimiento').innerHTML),
      geo: {
        lng: parseFloat(item.querySelector('x').innerHTML),
        lat: parseFloat(item.querySelector('y').innerHTML)
      },
      licitations: _.map(item.querySelector('items_licitaciones').children, function(licitation) {
        var hired = licitation.querySelector('montocontratado').innerHTML;
        var official = licitation.querySelector('montooficial').innerHTML;
        return {
          id: parseInt(licitation.querySelector('idlicitacion').innerHTML, 10),
          code: licitation.querySelector('licitacion').innerHTML,
          amount: {
            currency: 'ARS',
            official: official ? parseInt(official, 10).toLocaleString() : null,
            hired: hired ? parseInt(hired, 10).toLocaleString() : null
          },
          status: {
            name: _.capitalize(licitation.querySelector('estado').innerHTML),
            color: licitation.querySelector('color').innerHTML.replace('#', '')
          },
          program: licitation.querySelector('programa').innerHTML
        };
      })
    };
  });
  return json;
};

SchoolService.prototype.getSchoolsFromJSON = function() {
  return response;
};

module.exports = new SchoolService();
