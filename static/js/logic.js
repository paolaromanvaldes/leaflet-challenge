// initializing leaflet map 
var map = L.map('map').setView([0, 0], 2);

// adding openstreet map 
var osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
}).addTo(map);

/// adding satellite view layer from ArcGIS free map resource 
var satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; Esri &mdash; Source: Esri'
});

//adding control layer
var baseMaps = {
  "OpenStreetMap": osmLayer,
  "Satellite": satelliteLayer
};

L.control.layers(baseMaps).addTo(map);

/// fetching for the earthquake data 
fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson')
  .then(response => response.json())
  .then(data => {
    /// looping through json to find magnitude and plotting geometry 
    var earthquakeLayer = L.layerGroup().addTo(map);
    data.features.forEach(feature => {
      var mag = feature.properties.mag;
      var depth = feature.geometry.coordinates[2];
      /// changing the size based on magnitude 
      var size = mag * 5;
      var color = getColor(depth);
     ///adding circle markers to the map 
      var circle = L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
        radius: size,
        color: 'black',
        fillColor: color,
        fillOpacity: 0.7
      }).addTo(earthquakeLayer);

      circle.bindPopup(`<b>Location:</b> ${feature.properties.place}<br><b>Magnitude:</b> ${mag}<br><b>Depth:</b> ${depth} km`);
    });

    // adding all the earthquakes to map 
    var overlayMaps = {
      "Earthquakes": earthquakeLayer
    };

    // fetching the tectonic plates data from the provided link 
    fetch('https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json')
      .then(response => response.json())
      .then(tectonicData => {
        var tectonicLayer = L.geoJSON(tectonicData, {
          style: function (feature) {
            return {
              color: 'red',
              weight: 1
            };
          }
        }).addTo(map);

        // addding the tectonic plates layer to the map 
        overlayMaps["Tectonic Plates"] = tectonicLayer;

        // add control layer to both overlay and base maps
        L.control.layers(baseMaps, overlayMaps).addTo(map);
// add legend
var legend = L.control({position: 'bottomright'});
legend.onAdd = function (map) {
  var div = L.DomUtil.create('div', 'info legend');
  var depths = [-10, 10, 30, 50, 70, 90];
  var labels = [];

  for (var i = 0; i < depths.length; i++) {
    div.innerHTML +=
      '<i style="background:' + getColor(depths[i] + 1) + '"></i> ' +
      depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + ' km<br>' : '+ km');
  }

  return div;
};
legend.addTo(map);
      });
  });

//change color based on depth value
function getColor(d) {
  return d > 90 ? '#9700ce' :
         d > 70  ? '#0043ce' :
         d > 50  ? '#00ce1b' :
         d > 30  ? '#f8ff04' :
         d > 10  ? '#ffad04' :
         d > -10 ? '#ff4904' :
                   '#ff0404';
}