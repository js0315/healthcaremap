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
import CircleStyle from 'ol/style/Circle.js' // Circle vis
import Icon from 'ol/style/Icon';
import Overlay from 'ol/Overlay';

proj4.defs(
  'EPSG:3067',
  '+proj=utm +zone=35 +ellps=GRS80 +units=m +no_defs +type=crs'
)

register(proj4);

// Styles
const hospitalPointStyle = new Style({
  image: new CircleStyle({
    radius: 6,
    fill: new Fill({color: "red"}),
    stroke: new Stroke({ color: "gray", width: 3}),
  })
})

const vectorRiskStyle = function (feature) {
    const dn = feature.get('DN');

    const colors = {
        1: '#fff5f0',
        2: '#fdccb8',
        3: '#fc8f6f',
        4: '#f44d38',
        5: '#c5161c',
    };

    return new Style({
        fill: new Fill({
            color: colors[dn] || 'rgba(128, 128, 128, 0.8)'
        })
        // No Stroke: polygons have no borders
    });
};

const hospitalMarkerStyle = new Style({
  image: new Icon({
    anchor: [0.5, 0.5],
    anchorXUnits: 'fraction',
    anchorYUnits: 'fraction',
    src: './data/icon.png',
    scale: 1.0,
  })
})

const healthCentreMarkerStyle = new Style({
  image: new Icon({
    anchor: [0.5, 0.5],
    anchorXUnits: 'fraction',
    anchorYUnits: 'fraction',
    src: './data/icon2.png',
    scale: 1.0,
  })
})

// Layers:
const osmLayer = new TileLayer({
  source: new OSM(),
  visible: true,
});

const topoLayer = new TileLayer({
  source: new XYZ({
    url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attributions:
      "Powered by <a href='https://www.esri.com/en-us/home' target='_blank'>Esri</a>. " + "Source: Esri, DigitalGlobe, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community",
    //maxZoom: 10,
    //numZoomLevels: 24,
    sphericalMercator: true
  }),
  visible: false,
});

const rasterSource = new GeoTIFF({
  interpolate: false,
    sources: [
    {
      url: './data/Lampotilan_aiheuttama_riski_hellejaksolla_23052024_01062024_suhteessa_vahintaan_65_vuotiaiden_maaraan.tif',
    },
    ]
  })

const rasterLayer = new WebGLTileLayer({
  normalize: false,
  opacity: 1,
  source: rasterSource,
  style: {
    color: [

      'interpolate',

      ['linear'],

      ['band', 1],

      0,     [255, 0, 0],

      1,    [0, 255, 0],

      2,   [0, 0, 255],

      3,   [230, 190, 100],

      4,   [180, 120, 70],

      5,   [150, 110, 100],


    ]

    }
})

const riskVector = new VectorSource({
  url: './data/vektoroitu.geojson',
  format: new GeoJSON(),
})

const healthCentreSource = new VectorSource({
  url: './data/healthcare_without_emergency_hospitals.geojson',
  format: new GeoJSON(),
})

const healthCentreLayer = new VectorLayer({
  source: healthCentreSource,
  style: healthCentreMarkerStyle,
}) 

const hospitalSource = new VectorSource({
  url: './data/servicepoints_hospitals.geojson',
  format: new GeoJSON(),
})

const hospitalLayer = new VectorLayer({
  source: hospitalSource,
  style: hospitalMarkerStyle,
}) 

const riskLayer = new VectorLayer({
  opacity: 0.8,
  source: riskVector,
  style: vectorRiskStyle,
}) 

const healthFacilityToggle = document.getElementById('healthfacility-toggle');
healthFacilityToggle.addEventListener('change', () => {
  healthCentreLayer.setVisible(healthFacilityToggle.checked);
});

const map = new Map({
  target: 'map',
  layers: [
    osmLayer,
    topoLayer,
    //rasterLayer,
    riskLayer,
    healthCentreLayer,
    hospitalLayer,
  ],
  view: new View({
    projection: 'EPSG:3067',
    center: [239994.720, 6710964.953],
    zoom: 12,
  })
});

const popupElement = document.createElement('div');
popupElement.className = 'ol-popup';

const popup = new Overlay({
    element: popupElement,
    positioning: 'bottom-center',
    stopEvent: true,
    offset: [0, -10],
});

map.addOverlay(popup);

map.on('click', (event) => {

    const healthCare = map.getFeaturesAtPixel(event.pixel, {
        layerFilter: (layer) => layer === hospitalLayer || layer === healthCentreLayer
    });

    if (healthCare.length > 0) {

        const facility = healthCare[0];

        const facilityName = facility.get('kohteen_ni');
        const facilityInfo = facility.get('osoite');

        popupElement.replaceChildren();

        const title = document.createElement('b');
        title.textContent = facilityName || 'Healthcare facility';

        const info = document.createElement('div');
        info.textContent = facilityInfo || '';

        popupElement.append(title, info);

        // Pass a mutable copy of the coordinate
        popup.setPosition([...event.coordinate]);

    } else {
        popup.setPosition(undefined);
    }
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

const info = document.getElementById('info');

let currentFeature;
const displayFeatureInfo = function (pixel, target) {
  const features = map.getFeaturesAtPixel(pixel, {
    layerFilter: (layer) => layer === riskLayer
  });

  const feature = features.length > 0 ? features[0] : undefined;


  if (feature) {
    info.style.left = pixel[0] + 'px';
    info.style.top = pixel[1] + 'px';
    if (feature !== currentFeature) {
      info.style.visibility = 'visible';
      info.innerText = `Risk class: ${feature.get('DN')}`;
    }
  } else {
    info.style.visibility = 'hidden';
  }
  currentFeature = feature;
};

map.on('pointermove', function (evt) {
  if (evt.dragging) {
    info.style.visibility = 'hidden';
    currentFeature = undefined;
    return;
  }
  displayFeatureInfo(evt.pixel, evt.originalEvent.target);
});

map.on('click', function (evt) {
  displayFeatureInfo(evt.pixel, evt.originalEvent.target);
});

map.getTargetElement().addEventListener('pointerleave', function () {
  currentFeature = undefined;
  info.style.visibility = 'hidden';
});