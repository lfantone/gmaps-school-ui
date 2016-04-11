'use strict';

var _ = require('lodash');
var colors = ['#FFFFFF', '#40E0D0', '#9ACD32', '#8D38C9'];
var status = ['Elegibilidad', 'Llamada', 'Contratada', 'Finalizada'];

var GoogleMapsService = function() {};

function createDocumentElement(element, innerText) {
  var el = document.createElement(element);
  el.innerText = innerText;

  return el;
}

GoogleMapsService.prototype.initialize = function(opts) {
  var target = document.getElementById('map');
  var options = {
    center: {lat: -37.3083781, lng: -60.1022673},
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    zoom: 6,
    zoomControl: true,
    mapTypeControl: true,
    scaleControl: true,
    streetViewControl: true,
    rotateControl: true
  };
  var legend;

  if (opts.legend) {
    this.createLegend(target);
    delete opts.legend;
  }

  _.merge(options, opts);
  this.map = new google.maps.Map(target, options);
  this.map.data.loadGeoJson('/web/js/buenos-aires.json');
  this.map.data.setStyle({
    fillColor: 'red',
    fillOpacity: 0.05,
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

    _.merge(options, self.createMarkerIcon(data.status.color));

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
  var pinColor = color || 'FE7569';
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
    items.push(createDocumentElement('p', data.program));
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
  infoWindow.style.backgroundColor = 'white';
  infoWindow.style.borderRadius = '3px';
  infoWindow.style.bottom = '-100px';
  infoWindow.style.boxShadow = 'rgba(0, 0, 0, 0.298039) 0px 1px 4px -1px';
  infoWindow.style.fontFamily = 'Roboto, Arial, sans-serif';
  infoWindow.style.left = '5px';
  infoWindow.style.margin = 'auto';
  infoWindow.style.opacity = 0;
  infoWindow.style.padding = '10px';
  infoWindow.style.position = 'absolute';
  infoWindow.style.textAlign = 'left';
  infoWindow.style.width = '90%'

  title.style.fontSize = '12px';
  title.style.margin = 0;
  title.innerText = data.establishment;

  close.style.cursor = 'pointer';
  close.style.position = 'absolute';
  close.style.right = '10px';
  close.style.top = 0;
  close.style.width = '5px';
  close.innerText = 'x';
  close.addEventListener('click', _.bind(this.hideInfoWindow, this));

  button.style.backgroundColor = '#009DDC';
  button.style.border = '1px solid #009DDC';
  button.style.borderRadius = '4px';
  button.style.bottom = '5px';
  button.style.boxShadow = 'inset 0 -1px 0 #009DDC';
  button.style.color = '#FFF';
  button.style.cursor = 'pointer';
  button.style.fontSize = '12px';
  button.style.lineHeight = '1.5rem';
  button.style.padding = '2px  10px';
  button.style.position = 'absolute';
  button.style.right = '10px';
  button.style.textAlign = 'center';
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

GoogleMapsService.prototype.createLegend = function(target) {
  var container = document.createElement('div');
  var items = [document.createElement('div'), document.createElement('div'), document.createElement('div'), document.createElement('div')];
  var legend;
  var color;

  container.style.backgroundColor = 'white';
  container.style.borderRadius = '2px';
  container.style.boxShadow = 'rgba(0, 0, 0, 0.298039) 0px 1px 4px -1px';
  container.style.fontFamily = 'Roboto, Arial, sans-serif';
  container.style.fontSize = '9px';
  container.style.position = 'absolute';
  container.style.right = '2px';
  container.style.padding = '5px 0';
  container.style.top = '9px';
  container.style.width = '65%';

  for (var i = 0; i < items.length; i++) {
    legend = document.createElement('p');
    legend.style.margin = 0;
    legend.innerText = status[i];

    color = document.createElement('span');
    color.style.backgroundColor = colors[i];
    color.style.border = '1px solid black';
    color.style.borderRadius = '3px';
    color.style.float = 'left';
    color.style.height = '8px';
    color.style.margin = '0 5px 0';
    color.style.width = '8px';

    items[i].style.width = '33%';
    items[i].style.float = 'left';
    items[i].appendChild(color);
    items[i].appendChild(legend);
    container.appendChild(items[i]);
  }

  target.parentElement.appendChild(container);
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
  window.abrirLicitacion(data.licitation.id);
};

module.exports = new GoogleMapsService();
