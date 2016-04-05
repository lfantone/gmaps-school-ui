'use strict';
var _ = require('lodash');
var colors = {
  50: '34BA46',
  20: 'FE7569',
  30: 'FFFF57'
};
var GoogleMapsService = function() {};

function createDocumentElement(element, innerText) {
  var el = document.createElement(element);
  el.innerText = innerText;

  return el;
}

GoogleMapsService.prototype.initialize = function(opts) {
  var target = document.getElementById('map');
  var options = {
    center: {lat: -35.9975272, lng: -60.1723742},
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    zoom: 6,
    zoomControl: true,
    mapTypeControl: true,
    scaleControl: true,
    streetViewControl: true,
    rotateControl: true
  };

  _.merge(options, opts);
  this.map = new google.maps.Map(target, options);
  this.map.data.loadGeoJson('/bundle/buenos-aires.json');
  this.map.data.setStyle({
    fillColor: 'red',
    fillOpacity: 0.1,
    strokeColor: 'red',
    strokeOpacity: 1,
    strokeWeight: 1,
    zIndex: 1
  });
  this.markers = [];
  return this;
};

GoogleMapsService.prototype.addMarker = function(data, timeout) {
  var marker;
  var self = this;

  window.setTimeout(function() {
    var options = {
      map: self.map,
      position: data.geo,
      title: data.establishment
    };

    _.merge(options, self.createMarkerIcon(data.status.id));

    marker = new google.maps.Marker(options);
    marker.addListener('click', _.bind(self.showInfoWindow, self, data));

    self.markers.push(marker);
  }, timeout);

  return self;
};

GoogleMapsService.prototype.addMarkers = function(data) {
  for (var i = 0; i < data.length; i++) {
    this.addMarker(data[i], i * 50);
  }
};

GoogleMapsService.prototype.clearMarkers = function() {
  for (var i = 0; i < this.markers.length; i++) {
    this.markers[i].setMap(null);
  }

  this.markers = [];
};

GoogleMapsService.prototype.createMarkerIcon = function(color) {
  var pinColor = colors[color] || 'FE7569';
  var pinImage = new google.maps.MarkerImage('http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|' + pinColor,
    new google.maps.Size(21, 34),
    new google.maps.Point(0,0),
    new google.maps.Point(10, 34));
  var pinShadow = new google.maps.MarkerImage('http://chart.apis.google.com/chart?chst=d_map_pin_shadow',
    new google.maps.Size(40, 37),
    new google.maps.Point(0, 0),
    new google.maps.Point(12, 35));

  return {icon: pinImage, shadow: pinShadow};
};

GoogleMapsService.prototype.createInfoWindow = function(data) {
  var wrapper = document.querySelector('.map-container');
  var infoWindow = document.createElement('div');
  var left = document.createElement('div');
  var right = document.createElement('div');
  var title = document.createElement('h3');
  var close = document.createElement('div');
  var button = document.createElement('button');
  var items = [];
  var self = this;

  left.appendChild(title);

  if (data.licitation) {
    items.push(createDocumentElement('p', data.licitation.code));
  }

  if (data.program) {
    items.push(createDocumentElement('p', data.program.name));
  }

  if (data.amount.official) {
    items.push(createDocumentElement('p', 'Presupuesto (oficial): $ ' + data.amount.official));
  }

  if (data.amount.hired) {
    items.push(createDocumentElement('p', 'Presupuesto (contratado): $ ' + data.amount.hired));
  }

  for (var i = 0; i < items.length; i++) {
    items[i].style.margin = 0;
    items[i].style.fontSize = '10px';
    left.appendChild(items[i]);
  }

  infoWindow.appendChild(left);

  right.appendChild(close);
  right.appendChild(button);
  infoWindow.appendChild(right);

  infoWindow.id = 'maps-info-window';
  infoWindow.style.margin = 'auto';
  infoWindow.style.width = '90%'
  infoWindow.style.backgroundColor = 'white';
  infoWindow.style.padding = '10px';
  infoWindow.style.position = 'absolute';
  infoWindow.style.left = '5px';
  infoWindow.style.bottom = '-100px';
  infoWindow.style.opacity = 0;
  infoWindow.style.borderRadius = '5px';

  title.style.margin = 0;
  title.style.fontSize = '12px';
  title.innerText = data.establishment;

  left.style.width = '75%';
  left.style.float = 'left';

  right.style.width = '20%';
  right.style.float = 'right';

  close.style.float = 'right';
  close.style.cursor = 'pointer';
  close.style.padding = '5px 0 0 0';
  close.style.margin = '-15px 0 0 -25px';
  close.style.cursor = 'pointer';
  close.style.width = '5px';
  close.innerText = 'x';
  close.addEventListener('click', _.bind(this.hideInfoWindow, this));

  button.style.borderRadius = '4px';
  button.style.padding = '2px  10px';
  button.style.fontSize = '12px';
  button.style.lineHeight = '1.5rem';
  button.style.cursor = 'pointer';
  button.style.border = '1px solid #009DDC';
  button.style.backgroundColor = '#009DDC';
  button.style.color = '#FFF';
  button.style.boxShadow = 'inset 0 -1px 0 #009DDC';
  button.style.textAlign = 'center';
  button.style.margin = '10px -10px 0 -15px';
  button.innerText = 'Detalles';
  button.addEventListener('click', function(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    self.goToExternalLink(data);
  });

  wrapper.appendChild(infoWindow);

  this.infoWindow = true;
};

GoogleMapsService.prototype.removeInfoWindow = function(data, callback) {
  var infoWindow = document.getElementById('maps-info-window');
  var wrapper = document.querySelector('.map-container');
  wrapper.removeChild(infoWindow);
  delete this.infoWindow;

  if (callback) {
    callback(data);
  }
};

GoogleMapsService.prototype.showInfoWindow = function(data) {
  var el = document.getElementById('maps-info-window');
  var position = 0;
  var opacity = 0;
  var self = this;
  var id;

  function frame() {
    if (position === 50) {
      clearInterval(id);
      self.isInfoOpen = true;
    } else {
      position++;
      opacity += 0.1;
      el.style.bottom = position + 'px';

      if (opacity !== 1) {
        el.style.opacity = opacity;
      }
    }
  }

  if (!this.infoWindow) {
   this.createInfoWindow(data);
   el = document.getElementById('maps-info-window');
  }

  if (this.isInfoOpen) {
    this.hideInfoWindow(undefined, data, function(data) {
      self.showInfoWindow(data);
    });
  } else {
    id = setInterval(frame, 5);
  }
};

GoogleMapsService.prototype.hideInfoWindow = function(event, data, callback) {
  var el = document.getElementById('maps-info-window');
  var position = 50;
  var opacity = 1;
  var id = setInterval(frame, 5);
  var self = this;

  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  function frame() {
    if (position === -150) {
      clearInterval(id);
      self.isInfoOpen = false;
      self.removeInfoWindow(data, callback);
    } else {
      position--;
      opacity -= 0.1;
      el.style.bottom = position + 'px';
      el.style.opacity = opacity;
    }
  }
};

GoogleMapsService.prototype.goToExternalLink = function(data) {
  window.abrirLicitacion(data.licitation);
};

module.exports = new GoogleMapsService();
