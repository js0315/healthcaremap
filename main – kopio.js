import Map from 'ol/Map.js';
import View from 'ol/View.js';
import ImageLayer from 'ol/layer/Image.js';
import TileLayer from 'ol/layer/Tile.js';
import ImageWMS from 'ol/source/ImageWMS.js';
import OSM from 'ol/source/OSM.js';
import VectorSource from 'ol/source/Vector.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import VectorLayer from 'ol/layer/Vector.js';
import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import XYZ from 'ol/source/XYZ.js';
import Tile from 'ol/Tile';

// Forest reserve styles based on the 'desig' attribute
const forestStyles = {
  'Forest Reserve': new Style({
    fill: new Fill({
      color: '#006b00'
    }),
    stroke: new Stroke({
      color: '#006b00',
      width: 1
    })
  }),

  'Forest Plantation': new Style({
    fill: new Fill({
      color: '#d3f226'
    }),
    stroke: new Stroke({
      color:'#d3f226',
      width: 1
    })
  }),

  'Nature Forest Reserve': new Style({
    fill: new Fill({
      color: '#81bf00'
    }),
    stroke: new Stroke({
      color: '#81bf00',
      width: 1
    })
  }),

  'Village Land Forest Reserve': new Style({
    fill: new Fill({
      color: '#56cf68'
    }),
    stroke: new Stroke({
      color: '#56cf68',
      width: 1
    })
  })
};

function forestReserveStyleFunction(feature) {
  return forestStyles[feature.get('desig')] || null;
}

// Create a diagonal hatch pattern used to symbolize national parks and conservation areas
function createHatchPattern() {
  const canvas = document.createElement('canvas');
  canvas.width = 10;
  canvas.height = 10;

  const context = canvas.getContext('2d');

  //Draw diagonal hatch line
  context.strokeStyle = '#0000';
  context.lineWidth = 1;

  context.beginPath();
  context.moveTo(0, 0);
  context.lineTo(10, 10);
  context.stroke();

  return context.createPattern(canvas, 'repeat');
}

const nationalParksStyle = new Style({
  fill: new Fill({
    color: createHatchPattern()
  }),
  stroke: new Stroke({
    color: '#000000',
    width: 1
  })
});

const osmLayer = new TileLayer({
  source: new OSM(),
  visible: true,
});

const topoLayer = new TileLayer({
  source: new XYZ({
    url: 'https://{a-c}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attributions:
      'Map data: © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a> | ' +
      'DEM: <a href="https://viewfinderpanoramas.org/" target="_blank" rel="noopener noreferrer">SRTM</a>, ' +
      '<a href="https://sonny.4lima.de" target="_blank" rel="noopener noreferrer">Sonny</a> | ' +
      'Map style: © <a href="https://opentopomap.org" target="_blank" rel="noopener noreferrer">OpenTopoMap</a> ' +
      '(<a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noopener noreferrer">CC-BY-SA</a>)',
    maxZoom: 10,
  }),
  visible: false,
});

const layers = [
  osmLayer,
  topoLayer,

  new VectorLayer({
    source: new VectorSource({
      format: new GeoJSON(),
      url: './data/tanz_forest_reserves22.json'
    }),
    style: forestReserveStyleFunction
  }),


  new VectorLayer({
    source: new VectorSource({
      format: new GeoJSON(),
      url: './data/tanz_nat_parks_conserv.json'
    }),
    style: nationalParksStyle
  }),

  new ImageLayer({
    extent: [3228700, -1381359, 4567834, -162868],
    source: new ImageWMS({
      url: 'https://crd.resilienceacademy.ac.tz/geoserver/wms',
      params: {'LAYERS': 'geonode:tanzania_international_conservation_areas_2026'},
      ratio: 1,
      serverType: 'geoserver',
    }),
  }),
];
const map = new Map({
  layers: layers,
  target: 'map',
  view: new View({
    center: [3862074, -732904],
    zoom: 6,
  }),
});

// Toggle visibility between OSM and OpenTopoMap
document.querySelectorAll('input[name="basemap"]')
  .forEach((radio) => {
    radio.addEventListener('change', () => {
      osmLayer.setVisible(radio.value === 'osm');
      topoLayer.setVisible(radio.value === 'topo');
    });
  });

// Show or hide the map information panel (abstract)
const infoButton = document.getElementById("info-button");
const abstractPanel = document.getElementById("abstract-panel");

infoButton.addEventListener("click", () => {
  const isExpanded =
    infoButton.getAttribute("aria-expanded") === "true";

  abstractPanel.hidden = isExpanded;

  infoButton.setAttribute(
    "aria-expanded",
    String(!isExpanded)
  );

  infoButton.setAttribute(
    "aria-label",
    isExpanded ? "Show map abstract" : "Hide map abstract"
  );
});

// https://crd.resilienceacademy.ac.tz/geoserver/geonode/tanzania_international_conservation_areas_2026/ows