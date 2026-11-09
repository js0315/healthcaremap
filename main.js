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

import Cluster from 'ol/source/Cluster.js';
import Text from 'ol/style/Text.js';


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
        1: '#f1eef6',
        2: '#dcc0de',
        3: '#dc85c0',
        4: '#de4899',
        5: '#cf166d',
    };

    return new Style({
        fill: new Fill({
            color: colors[dn] || 'rgba(128, 128, 128, 0.8)',
            stroke: colors[dn] || 'rgba(128, 128, 128, 0.8)',
        })
    });
};

const vectorRiskStyle2 = function (feature) {
    let dn = feature.get('DN');

    if (dn <= 2) {
      dn = 1
    }

    else if (dn > 2 && dn <= 3) {
      dn = 2
    }

    else if (dn > 3 && dn <= 4) {
      dn = 3
    }

    else if (dn > 4) {
      dn = 4
    }

    //else if (dn > 4 && dn <= 5) {
    //  dn = 5
    //}
    const colors = {
        1: '#fdccb8',
        2: '#fc8f6f',
        3: '#c5161c',
        4: '#67000d',
    };

    return new Style({
        fill: new Fill({
            color: colors[dn] || 'rgba(128, 128, 128, 0.8)',
            stroke: colors[dn] || 'rgba(128, 128, 128, 0.8)',
        })
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

const riskVector = new VectorSource({
  url: './data/vektoroitu.geojson',
  format: new GeoJSON(),
})

const riskVector1 = new VectorSource({
  url: './data/d_weighting_risk75_dist25.geojson',
  format: new GeoJSON(),
})

const riskVector2 = new VectorSource({
  url: './data/d_weighting_risk50_dist50.geojson',
  format: new GeoJSON(),
})

const riskVector3 = new VectorSource({
  url: './data/d_weighting_risk25_dist75.geojson',
  format: new GeoJSON(),
})

const riskVector4 = new VectorSource({
  url: './data/d_weighting_risk20_dist80.geojson',
  format: new GeoJSON(),
})

const healthCentreSource = new VectorSource({
  url: './data/healthcare_without_emergency_hospitals.geojson',
  format: new GeoJSON(),
})

const healtCentreCluster = new Cluster({
  distance: 20,
  source: healthCentreSource
})

const healthCentreLayer = new VectorLayer({
  visible: false,
  source: healtCentreCluster,
  style: (feature) => {
    const features = feature.get('features').length;

    if (features == 1) {
      return new Style({
      image: new Icon({
        anchor: [0.5, 0.5],
        anchorXUnits: 'fraction',
        anchorYUnits: 'fraction',
        src: './data/icon2.png',
        scale: 1.0
        })
      },
    )
    } else {
      return new Style ({
        image: new CircleStyle({
          radius: 15,
          fill: new Fill({
            color: '#550DFF'
          }),
          opacity: 0.9,
        }),
        text: new Text({
          text: features.toString(),
          fill: new Fill({
            color: '#ffff'
          })
        })
      })
    }
  }
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
  stroke: vectorRiskStyle,
}) 

const riskLayer1 = new VectorLayer({
  visible: false,
  opacity: 0.8,
  source: riskVector1,
  style: vectorRiskStyle2,
  stroke: vectorRiskStyle2,
}) 


const riskLayer2 = new VectorLayer({
    visible: false,
  opacity: 0.8,
  source: riskVector2,
  style: vectorRiskStyle2,
}) 


const riskLayer3 = new VectorLayer({
  visible: false,
  opacity: 0.8,
  source: riskVector3,
  style: vectorRiskStyle2,
}) 


const riskLayer4 = new VectorLayer({
  visible: false,
  opacity: 0.8,
  source: riskVector4,
  style: vectorRiskStyle2,
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
    riskLayer,
    riskLayer1,
    riskLayer2,
    riskLayer3,
    riskLayer4,
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

        let facility = healthCare[0];

        const clustered = facility.get('features');

        if (clustered) {
          facility = clustered[0];
        }

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

// Toggle visibility between OSM and OpenTopoMap
document.querySelectorAll('input[name="risklayer"]')
  .forEach((radio) => {
    radio.addEventListener('change', () => {
      riskLayer1.setVisible(radio.value === 'risk1');
      riskLayer2.setVisible(radio.value === 'risk2');
      riskLayer3.setVisible(radio.value === 'risk3');
      riskLayer4.setVisible(radio.value === 'risk4');
      riskLayer.setVisible(radio.value === 'risk0');

      const hrLegend = document.getElementById("heatRiskLegend")

      if (event.target.value === 'risk0') {
        hrLegend.innerHTML = (
          `
          <p><strong>Heat risk (class)</strong></p>
          <div class="legend-item">
            <span class="legend-swatch heat-risk-1"></span>
            Very low risk (1)
          </div>

          <div class="legend-item">
            <span class="legend-swatch heat-risk-2"></span>
            Low risk (2)
          </div>

          <div class="legend-item">
            <span class="legend-swatch heat-risk-3"></span>
            Moderate risk (3)
          </div>

          <div class="legend-item">
            <span class="legend-swatch heat-risk-4"></span>
            High risk (4)
          </div>

          <div class="legend-item">
            <span class="legend-swatch heat-risk-5"></span>
            Very high risk (5)
          </div>
          `
        )
      } else {
        hrLegend.innerHTML = (
          `
          <p><strong>Weighted heat/distance risk (risk value)</strong></p>
          <div class="legend-item">
            <span class="legend-swatch weighted-risk-1"></span>
            Low risk (≤2)
          </div>

          <div class="legend-item">
            <span class="legend-swatch weighted-risk-2"></span>
            Moderate risk (2,1-3)
          </div>

          <div class="legend-item">
            <span class="legend-swatch weighted-risk-3"></span>
            High risk (3,1-4)
          </div>

          <div class="legend-item">
            <span class="legend-swatch weighted-risk-4"></span>
            Very high risk (>4)
          </div>
          `
        )
      }

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
    layerFilter: (layer) => (
      layer === riskLayer || layer === riskLayer1 || layer === riskLayer2 || layer === riskLayer3 || layer === riskLayer4   
    )
  });

  const feature = features.length > 0 ? features[0] : undefined;


  if (feature) {
    info.style.left = pixel[0] + 'px';
    info.style.top = pixel[1] + 'px';
    if (feature !== currentFeature) {
      info.style.visibility = 'visible';
      let value = feature.get('DN');
      if (!riskLayer.getVisible()) {
        value = value.toFixed(1);
        info.innerText = `Risk value: ${(value)}`;
      } else{
        info.innerText = `Risk class: ${(value)}`;
      }
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