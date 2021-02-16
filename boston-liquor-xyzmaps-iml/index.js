
const xyz = {
   token: "AFuLw_fHSwunbKRiCOuy9gA",
   catalogARN: 'hrn:here:data::olp-here:dh-showcase',
   layer: 'boston-liquor',
   apiKey: 'wuhhFoo3HHQ8Bxw68fCZe8iA_J9v4dBnRhSbkAlMup4'
}
const maxIsolineRangeLookup = {
   time: 5000,
   distance: 80000
}

const hereIsolineUrl = (coords, range) => `https://isoline.router.hereapi.com/v8/isolines?transportMode=pedestrian&range[type]=distance&range[values]=${range * 60}&origin=${coords.latitude},${coords.longitude}&apiKey=${xyz.apiKey}`

const hereGeocoderUrl = (query) => `https://geocode.search.hereapi.com/v1/geocode?apiKey=${xyz.apiKey}&q=${query}`;

const hereReverseGeocodeUrl = (coordinates) => `https://revgeocode.search.hereapi.com/v1/revgeocode?at=${coordinates.latitude},${coordinates.longitude}&apiKey=${xyz.apiKey}`;

const liquorSearchUrl = (type) => `https://interactive.data.api.platform.here.com/interactive/v1/catalogs/${xyz.catalogARN}/layers/${xyz.layer}/${type}?apiKey=${xyz.apiKey}`;

var customStyle = {
   styleGroups: {
      'isoline': [
         {zIndex:0, type:"Polygon", opacity: 0.2, stroke:"#3288FF", fill: '#0000FF', strokeWidth:3},
         {zIndex:1, type:"Line", opacity: 1, stroke:"#3288FF", strokeWidth:3}
      ],
      'All_Alcohol': [{zIndex: 3, type: 'Circle', radius: 7, fill: '#3C4BF1'}],
      'Malt_Wine': [{zIndex: 3, type: 'Circle', radius: 7, fill: '#50D05E'}],
      'Malt_Wine_Liquor': [{zIndex: 3, type: 'Circle', radius: 7, fill: '#E265F0'}],
      'Tavern': [{zIndex: 3, type: 'Circle', radius: 7, fill: '#EC3B43'}],
      'Farmer': [{zIndex: 3, type: 'Circle', radius: 7, fill: '#8BFFF2'}],
      'Other': [{zIndex: 3, type: 'Circle', radius: 7, fill: '#00FFFF'}],
   },
   assign: function(feature){
      return feature.properties.Description;
   }
};
var hiddenStyle = {
   assign: function() {
      return null;
   }
}

var bgLayer = new here.xyz.maps.layers.MVTLayer({
    name: 'background layer',
    min: 1,
    max: 20,
    remote: {
        url: 'https://xyz.api.here.com/tiles/osmbase/512/all/{z}/{x}/{y}.mvt?access_token='+xyz.token
    },
    style: {
      backgroundColor: '#FFFFFF',
      strokeWidthZoomScale: (level) => level > 17 ? 1 : level > 14 ? .5 : level > 9 ? .25 : .1,

      styleGroups: {
          'landuse': [{zIndex: 0, type: 'Polygon', fill: '#E9EEF1'}],
          'pier': [{zIndex: 1, type: 'Polygon', fill: '#E9EEF1', stroke: '#c8b89d', strokeWidth: 2}],
          'park': [{zIndex: 1, type: 'Polygon', fill: '#E9EEF1'}],
          'nature_reserve': [{zIndex: 1, type: 'Polygon', fill: '#E9EEF1'}],
          'hospital': [{zIndex: 1, type: 'Polygon', fill: '#f3d3d3'}],
          'water': [{zIndex: 2, type: 'Polygon', fill: 'rgb(222,225,227)'}],
          'path': [{zIndex: 3, type: 'Line', stroke: '#E9EEF1', strokeWidth: 2}],
          'tunnel': [{zIndex: 3, type: 'Line', stroke: '#D3DCE1', strokeWidth: 14}],
          'ferry': [{zIndex: 4, type: 'Line', stroke: '#164ac8', strokeWidth: 1}],
          'highway': [{zIndex: 5, type: 'Line', stroke: '#D3DCE1', strokeWidth: 16}],
          'boundaries': [{zIndex: 6, type: 'Line', stroke: '#b3b1ad', strokeWidth: 2}],
          'buildings': [{
              zIndex: 7, type: 'Polygon', fill: 'rgb(155,175,196)',
              // define extrude in meters to display polygons with extrusion
              extrude: (feature) => feature.properties.height || 25
          }],
          'roads': [{zIndex: 4, type: 'Line', stroke: '#D3DCE1', strokeWidth: 2}, {
              zIndex: 6, type: 'Text', fill: '#222222',
              font: '12px sans-serif',
              strokeWidth: 2,
              stroke: 'white', text: (f) => f.properties.name,
              // Alignment for Text. "map" aligns to the plane of the map.
              alignment: 'map',
              // Text with a higher priority (lower value) will be drawn before lower priorities (higher value)
              // make sure "road labels" are drawn after "place labels".
              priority: 2
          }],
          'places': [{
              zIndex: 8,
              type: 'Text',
              text: (f) => f.properties.name,
              stroke: 'black',
              fill: 'white',
              font: "18px sans-serif",
              strokeWidth: 4,
              // set collide property to false to enable label collision detection [default]
              collide: false,
              // Alignment for Text. "viewport" aligns to the plane of the viewport/screen.
              alignment: 'viewport',
              // Text with a higher priority (lower value) will be drawn before lower priorities (higher value)
              // In case of "place label" and "road label" are colliding "place label" will be draw
              // because priority 1 is smaller than priority 2
              priority: 1
          }]
      },

      assign: (feature, zoom) => {
          let props = feature.properties;
          let kind = props.kind;
          let layer = props.layer;
          let geom = feature.geometry.type;

          if (layer == 'landuse') {
              switch (kind) {
                  case 'pier':
                      return 'pier';
                  case 'nature_reserve':
                      return 'nature_reserve';
                  case 'park':
                  case 'garden':
                  case 'pedestrian':
                  case 'forrest':
                      return 'park';
                  case 'hospital':
                      return 'hospital';
                  default:
                      return 'landuse'
              }
          }

          if (layer == 'water') {
              if (geom == 'LineString' || geom == 'MultiLineString') {
                  return;
              }
          } else if (layer == 'roads') {
              if (kind == 'rail' || kind == 'ferry') {
                  return;
              }
              if (props.is_tunnel && zoom > 13) {
                  return 'tunnel';
              }
              if (kind == 'highway' || kind == 'path') {
                  return kind;
              }
          }
          return layer;
      }
   }
});

var liquorLayer = new here.xyz.maps.layers.TileLayer({
   name: 'liquor',
   min: 1,
   max: 20,
   provider: new here.xyz.maps.providers.IMLProvider({
      level: 10,
      layer: xyz.layer,
      catalog: xyz.catalogARN,
      credentials: {
          apiKey: xyz.apiKey,
      }
   }),

   style: customStyle
});
var utilsLayer = new here.xyz.maps.layers.TileLayer({
   min: 1,
   max: 20,
   provider: new here.xyz.maps.providers.LocalProvider ({
      name:  'utilsProvider'
   }),
   style: customStyle
});

async function init() {
   // setup the Map Display
   const display = new here.xyz.maps.Map( document.getElementById("map"), {
       zoomLevel : 12,
       center: { longitude: -71.05780662703944, latitude: 42.35999762427866},
   
       behavior: {
         pitch: true,
         rotate: true
      },
      pitch: 30,
      rotate: 30,
       // add layers to display
       layers: [bgLayer, liquorLayer, utilsLayer]
   });

   var range = 20; // 20 min walk distance
   var latlng;
   const tooltip = document.querySelector('#tooltip');
   const clear = document.querySelector('.clear-filter');
   const clearButton = document.querySelector('.clear-filter button');
   const slider = document.querySelector('.clear-filter input');
   const walkingDistance = document.querySelector('.clear-filter span');
   const search = document.querySelector('.search-address');
   const searchButton = document.querySelector('.search-address button');
   const description = document.querySelectorAll('.clear-filter p strong');
   const searchInput = document.querySelector('.search-address input');

   const [alcohols] = await Promise.all([
      fetch(liquorSearchUrl('search')).then(x => x.json()),
   ])


   display.addEventListener("pointerup", function(e) {
      latlng = display.pixelToGeo(e.mapX, e.mapY);

      clear.classList.remove("hidden");
      clear.classList.add("show");
      search.classList.remove("show");
      search.classList.add("hidden");
       

      fetch(hereReverseGeocodeUrl(latlng))
      .then(res => res.json())
      .then(res => {
         const address = res.items[0].address;

         description[0].innerHTML = range;
         const idx = address.label.indexOf(address.city);
         description[1].innerHTML = [address.label.substring(0, idx-2), address.city].join(" ");
         searchInput.value = description[1].innerHTML;
      })

      makeIsolineSearch();
   })

   display.setCenter({longitude: -71.05780662703944, latitude: 42.35999762427866});
   display.setZoomlevel(14, window.innerWidth/2, window.innerHeight/2, 1000)


   function makeIsolineSearch(){
      fetch(hereIsolineUrl(latlng, range))
      .then(res => res.json())
      .then(res => {
         if (res.hasOwnProperty('isolines')) {
            makeSpatialSearch(decode(res.isolines[0].polygons[0].outer));
         } 
      });
    }

    function makeSpatialSearch(res){
      const polygon = {
         geometry: {
            type: "MultiPolygon",
            coordinates: [[res.polyline.map(x => [parseFloat(x[1].toFixed(8)), parseFloat(x[0].toFixed(8)), 0])]]
         },
         properties: {
            Description: "isoline"
         },
         type: "Feature"
      };

      fetch(liquorSearchUrl('spatial'), {
         method: 'POST',
         headers: {
            'Content-Type': 'application/geo+json'
         },
         body: JSON.stringify(polygon.geometry)
      })
      .then(res => res.json())
      .then(res => {
         description[2].innerHTML = res.features.length;
         utilsLayer.getProvider().clear();
         res.features.forEach((f)=>{
            utilsLayer.addFeature(f);
         })
         utilsLayer.addFeature(polygon);
         
         liquorLayer.setStyle(hiddenStyle)
         utilsLayer.addFeature({
            geometry: {
               type: "Point",
               coordinates: [latlng.longitude, latlng.latitude]
            },
            properties: {
               Description: "isoline"
            },
            type: "Feature"
         });
      })
    }

    clearButton.addEventListener('click', ()=>{
      liquorLayer.setStyle(customStyle);
      utilsLayer.getProvider().clear();
      display.refresh()

      search.classList.remove("hidden");
      search.classList.add("show");
      clear.classList.remove("show");
      clear.classList.add("hidden");
   })

   searchButton.addEventListener('click', ()=>{
      fetch(hereGeocoderUrl(searchInput.value))
      .then(res => res.json())
      .then(res => {
         if (res.items.length > 0) {
            latlng = {latitude: res.items[0].position.lat, longitude: res.items[0].position.lng};

            clear.classList.remove("hidden");
            clear.classList.add("show");
            search.classList.remove("show");
            search.classList.add("hidden");

            makeIsolineSearch();
         } else {
            searchInput.value = 'Error!';
         }
      });
   });

   slider.addEventListener('input', function(e) {
      // Value indicator
      range = e.target.value;
      walkingDistance.innerHTML = range + ' minutes';
      description[0].innerHTML = range;
   });
   slider.addEventListener('pointerup', async function(e) {
      makeIsolineSearch();
   });
}

init();