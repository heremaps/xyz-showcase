const {DeckGL, MVTLayer, ArcLayer} = deck;

const apiKey = 'wuhhFoo3HHQ8Bxw68fCZe8iA_J9v4dBnRhSbkAlMup4';
const catalogArn = 'hrn:here:data::olp-here:dh-showcase-flight-routes';
const layerId = 'flight-routes';


var flightRoutesURL = `https://interactive.data.api.platform.here.com/interactive/v1/catalogs/${catalogArn}/layers/${layerId}/search?p.src=AIRPORTCODE&apiKey=${apiKey}`;

async function getRoutes(airportcode) {
  const url = flightRoutesURL.replace('AIRPORTCODE', airportcode);
  return (await fetch(url).then(x => x.json())).features.map(f => {
    return {
      from: {
        name: f.properties.src,
        coordinates: f.geometry.coordinates[0]
      },
      to: {
        name: f.properties.dst,
        coordinates: f.geometry.coordinates[1]
      }
    }
  })
}

async function getRoutesLayer(routes) {
  return new ArcLayer({  
    id:  'ArcLayer',
    data: routes,
    getSourceColor: d => [140, 140, 0],
    getSourcePosition: d => d.from.coordinates,
    getTargetColor: d => [0, 140, 0],
    getTargetPosition: d => d.to.coordinates,
    getWidth: 2,
    greatCircle: false,
    autoHighlight: true,
    highlightColor: [0, 0, 128, 128],
    opacity: 0.5,
    pickable: true
  });
}

async function init() {
  const routes = await getRoutes("SIN");
  const routelayer = await getRoutesLayer(routes);

  const deckgl = new DeckGL({
    container: 'container',
    mapStyle: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    initialViewState: {
      longitude: 103.994003, 
      latitude: 1.35019,
      zoom: 2,
      pitch: 45
    },
    controller: true,
    layers: [routelayer]
  });



  const airports = document.querySelectorAll("input");
  airports.forEach(airport => {
    airport.onchange = async function(){
      const routes = await getRoutes(this.value);
      const layer = await getRoutesLayer(routes);
      const from = routes[0].from.coordinates;

      deckgl.setProps({ 
        layers: [layer],
        initialViewState: {
          longitude: from[0],
          latitude: from[1],
          zoom: 2,
          pitch: 45
        }
      });

    }
  })
}

init();