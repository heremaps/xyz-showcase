const hereCredentials = {
   id: 'amxmh2DxNV8EYfX6W9Lm',
   code: 'WFmyiFcGFxyYEOgrZjDcGA'
}

const xyz = {
   space: 'ugpYaAUf',
   token: 'AHhYRw6-TyaQ1JuNBJp_qwA'
}

const hereIsolineUrl = (coords, range) => `https://isoline.route.api.here.com/routing/7.2/calculateisoline.json?app_id=${hereCredentials.id}&app_code=${hereCredentials.code}&mode=shortest;pedestrian;traffic:disabled&start=geo!${coords.lat},${coords.lng}&range=${range * 60}&rangetype=time`

const maxIsolineRangeLookup = {
   time: 5000,
   distance: 80000
}

const hereGeocoderUrl = (query) => `https://geocoder.api.here.com/6.2/geocode.json?app_id=${hereCredentials.id}&app_code=${hereCredentials.code}&searchtext=${query}`;

const hereReverseGeocodeUrl = (coordinates) => `https://reverse.geocoder.api.here.com/6.2/reversegeocode.json?prox=${coordinates.lat},${coordinates.lng},250&mode=retrieveAddresses&maxresults=1&gen=9&app_id=${hereCredentials.id}&app_code=${hereCredentials.code}`;

const alcoholSearchUrl = (type) => `https://xyz.api.here.com/hub/spaces/${xyz.space}/${type}?access_token=${xyz.token}`;

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
      fetch(alcoholSearchUrl('search')).then(x => x.json()),
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
         const address = res.Response.View[0].Result[0].Location.Address;

         description[0].innerHTML = range;
         const idx = address.Label.indexOf(address.City);
         description[1].innerHTML = [address.Label.substring(0, idx-2), address.City].join(" ");
         searchInput.value = description[1].innerHTML;
      })

      makeIsolineSearch();
    }

    function makeIsolineSearch(){
      fetch(hereIsolineUrl(latlng, range))
      .then(res => res.json())
      .then(res => {
         if (res.hasOwnProperty('response')) {
            makeSpatialSearch(res);
         } 
      });
    }

    function makeSpatialSearch(res){
      const polygon = {
         type: "MultiPolygon",
         coordinates: [[res.response.isoline[0].component[0].shape.map(x => [Number(x.split(',')[1]), Number(x.split(',')[0]), 0])]]
      };

      fetch(alcoholSearchUrl('spatial'), {
         method: 'POST',
         headers: {
            'Content-Type': 'application/geo+json',
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
         if (res.Response.View.length > 0) {
            const location = res.Response.View[0].Result[0].Location.DisplayPosition;
            latlng = {lat: location.Latitude, lng: location.Longitude};

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