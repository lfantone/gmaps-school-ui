'use strict';
var _ = require('lodash');
var colors = {
  50: '34BA46',
  20: 'FE7569',
  30: 'FFFF57'
};

var GoogleMapsService = function() {};

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
  this.markers = [];
  return this;
};

GoogleMapsService.prototype.addMarker = function(data, timeout) {
  var marker;
  var self = this;

  window.setTimeout(function() {
    var options = {
      animation: google.maps.Animation.DROP,
      map: self.map,
      position: {lat: data.geo.lng, lng: data.geo.lat},
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
    this.addMarker(data[i], i * 200);
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
  var items = [document.createElement('p'), document.createElement('p'), document.createElement('p')];
  var close = document.createElement('div');
  var button = document.createElement('button');

  left.appendChild(title);
  for (var i = 0; i < items.length; i++) {
    // items[i].innerText =
    items[i].style.margin = 0;

    left.appendChild(items[i]);
  }
  infoWindow.appendChild(left);

  right.appendChild(close);
  right.appendChild(button);
  infoWindow.appendChild(right);

  infoWindow.id = 'maps-info-window';
  infoWindow.style.margin = 'auto';
  infoWindow.style.width = '80%'
  infoWindow.style.backgroundColor = 'white';
  infoWindow.style.padding = '10px';
  infoWindow.style.position = 'absolute';
  infoWindow.style.left = '20px';
  infoWindow.style.bottom = '-100px';
  infoWindow.style.opacity = 0;

  title.style.margin = 0;
  title.style.fontSize = '14px';
  title.innerText = data.establishment;

  left.style.width = '80%';
  left.style.float = 'left';

  right.style.width = '20%';
  right.style.float = 'right';

  close.style.fontSize = 'small';
  close.style.float = 'right';
  close.style.cursor = 'pointer';
  close.style.marginBottom = '5px';
  close.innerText = 'close';
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
  button.innerText = 'Detalles';
  button.addEventListener('click', _.bind(this.goToExternalLink, this));

  wrapper.appendChild(infoWindow);

  this.infoWindow = true;
};

GoogleMapsService.prototype.removeInfoWindow = function () {
  var infoWindow = document.getElementById('maps-info-window');
  var wrapper = document.querySelector('.map-container');
  wrapper.removeChild(infoWindow);
  delete this.infoWindow;
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

  if (!this.isInfoOpen) {
    id = setInterval(frame, 5);
  }
};

GoogleMapsService.prototype.hideInfoWindow = function(event) {
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
      self.removeInfoWindow();
    } else {
      position--;
      opacity -= 0.1;
      el.style.bottom = position + 'px';
      el.style.opacity = opacity;
    }
  }
};

GoogleMapsService.prototype.goToExternalLink = function(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  return '';
};

module.exports = new GoogleMapsService();
