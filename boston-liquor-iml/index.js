
const xyz = {
   catalogARN: 'hrn:here:data::olp-here:dh-showcase',
   layer: 'boston-liquor',
   apiKey: 'wuhhFoo3HHQ8Bxw68fCZe8iA_J9v4dBnRhSbkAlMup4'
}
const maxIsolineRangeLookup = {
   time: 5000,
   distance: 80000
}

const hereIsolineUrl = (coords, range) => `https://isoline.router.hereapi.com/v8/isolines?transportMode=pedestrian&range[type]=distance&range[values]=${range * 60}&origin=${coords.lat},${coords.lng}&apiKey=${xyz.apiKey}`

const hereGeocoderUrl = (query) => `https://geocode.search.hereapi.com/v1/geocode?apiKey=${xyz.apiKey}&q=${query}`;

const hereReverseGeocodeUrl = (coordinates) => `https://revgeocode.search.hereapi.com/v1/revgeocode?at=${coordinates.lat},${coordinates.lng}&apiKey=${xyz.apiKey}`;

const liquorSearchUrl = (type) => `https://interactive.data.api.platform.here.com/interactive/v1/catalogs/${xyz.catalogARN}/layers/${xyz.layer}/${type}?apiKey=${xyz.apiKey}`;

async function init() {
   const tangram = Tangram.leafletLayer({
      scene: 'scene.yaml',
      events: {
         click: handleClick
      }
   })
   const map = L.map('map', {
      center: [42.35999762427866, -71.05780662703944],
      zoom: 12,
      layers: [tangram],
      zoomControl: false
   });

   map.attributionControl.addAttribution('<a href="https://github.com/tangrams/tangram">Tangram</a> | <a href="https://here.xyz">HERE XYZ</a> | <a href="https://www.openstreetmap.org/">OSM</a>');

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

   const isolineCenter = L.geoJSON([]).addTo(map);

   const featureLayer = L.geoJSON(alcohols, {
      pointToLayer: function(feature, latlng) {
         const type = feature.properties.Description;
         let color;
         if (type === 'All_Alcohol') {
            color = '#3C4BF1';
         } else if (type === 'Malt_Wine') {
            color = '#50D05E';
         } else if (type === 'Malt_Wine_Liquor') {
            color = '#E265F0';
         } else if (type === 'Tavern') {
            color = '#EC3B43';
         } else if (type === 'Farmer') {
            color = '#8BFFF2';
         } else { // Other
            color = 'yellow';
         } 
          
         return L.circleMarker(latlng, {
            radius: 5,
            fillColor: color,
            weight: 1,
            opacity: 0,
            fillOpacity: 1
         });
      },
      onEachFeature: (feature, layer) => {
         layer.on('mouseover', t => {
            const feature = t.target.feature;
            const cat = feature.properties['Description'];
            if(!tooltip.checked || !cat) return;
            const content = 
               '<div>' +
               '<h3>'+feature.properties["Business Name"]+'</h3>' +
               '<div>Closes at <strong>' + feature.properties['Closing'] + '</strong></div>' +
               (
                  feature.properties['Capacity']
                  ?
                  '<div>Capacity of <strong>' + feature.properties['Capacity'] + '</strong></div>'
                  : ''
               ) +
               '<div>Located at <strong>' + feature.properties['Address'] + '</strong></div>'+
               (
                  cat === 'All_Alcohol' || cat === 'Malt_Wine' || cat === 'Malt_Wine_Liquor'
                  ?
                  '<div>Serves <strong>' + cat.split('_').join(' ') + '</strong></div>'
                  :
                  '<div>Category of <strong>' + cat + '</strong></div>'
               ) +
               '</div>';
            const popup = L.popup({className: 'custom', closeButton: false})
            .setLatLng(t.latlng)
            .setContent(content)
            .openOn(map);
         });
         layer.on('mouseout', t => {
            map.closePopup();
         })
      }
   }).addTo(map);

   map.flyTo([42.35999762427866, -71.05780662703944], 14, {
      animate: true,
      duration: 1
    });

    function handleClick(evt) {
      latlng = evt.leaflet_event.latlng;

      clear.classList.remove("hidden");
      clear.classList.add("show");
      search.classList.remove("show");
      search.classList.add("hidden");
       

      fetch(hereReverseGeocodeUrl(latlng))
      .then(res => res.json())
      .then(res => {
         console.log(res)
         const address = res.items[0].address;

         description[0].innerHTML = range;
         const idx = address.label.indexOf(address.city);
         description[1].innerHTML = [address.label.substring(0, idx-2), address.city].join(" ");
         searchInput.value = description[1].innerHTML;
      })

      makeIsolineSearch();
    }

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
         type: "MultiPolygon",
         coordinates: [[res.polyline.map(x => [parseFloat(x[1].toFixed(8)), parseFloat(x[0].toFixed(8)), 0])]]
      };

      fetch(liquorSearchUrl('spatial'), {
         method: 'POST',
         headers: {
            'Content-Type': 'application/geo+json'
         },
         body: JSON.stringify(polygon)
      })
      .then(res => res.json())
      .then(res => {
         description[2].innerHTML = res.features.length;
         
         featureLayer.clearLayers();
         featureLayer.addData(polygon);
         featureLayer.addData(res);
         isolineCenter.clearLayers();
         isolineCenter.addData({
            type: "Point",
            coordinates: [latlng.lng, latlng.lat]
         });
      })
    }

    clearButton.addEventListener('click', ()=>{
      featureLayer.clearLayers();
      featureLayer.addData(alcohols);
      isolineCenter.clearLayers();

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
            latlng = res.items[0].position;

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