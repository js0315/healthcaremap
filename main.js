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
import WebGLTileLayer from 'ol/layer/WebGLTile.js';
import GeoTIFF from 'ol/source/GeoTIFF.js';
import proj4 from 'proj4';
import {register} from 'ol/proj/proj4.js'
import { transformExtent } from 'ol/proj'; 
import {get as getProjection} from 'ol/proj.js';

proj4.defs(
  'EPSG:3067',
  '+proj=utm +zone=35 +ellps=GRS80 +units=m +no_defs +type=crs'
)

register(proj4);

const osmLayer = new TileLayer({
  source: new OSM(),
  visible: true,
});

const topoLayer = new TileLayer({
  source: new XYZ({
    url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attributions:
      "Powered by <a href='https://www.esri.com/en-us/home' target='_blank'>Esri</a>. " + "Source: Esri, DigitalGlobe, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community",
    maxZoom: 10,
    numZoomLevels: 24,
    sphericalMercator: true
  }),
  visible: false,
});

const rasterSource = new GeoTIFF({
    sources: [
    {
      url: './data/Lampotilan_aiheuttama_riski_hellejaksolla_23052024_01062024_suhteessa_vahintaan_65_vuotiaiden_maaraan.tif',
    },
    ]
  })

const rasterLayer = new WebGLTileLayer({
  source: rasterSource
})

const vectorSource = new VectorSource({
  url: './data/servicepoints_hospitals.geojson',
  format: new GeoJSON(),
})

const vectorLayer = new VectorLayer({
  source: vectorSource,
}) 

const map = new Map({
  target: 'map',
  layers: [
    osmLayer,
    topoLayer,
    rasterLayer,
    vectorLayer,
  ],
  view: new View({
    projection: 'EPSG:3857',
    center: [2500000,8500000],
    zoom: 10,
  })
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