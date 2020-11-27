const routesUrl = `https://xyz.api.here.com/hub/spaces/zvEXPAdl/search?access_token=AN4BOGrRT_2XHOsEFHCG3QA`;
const neighborhoodsUrl = `https://xyz.api.here.com/hub/spaces/0C8ckhZk/search?access_token=AN4BOGrRT_2XHOsEFHCG3QA&mode=viz`
const types = ["BIKE LANE", "BUFFERED BIKE LANE", "SHARED-LANE", "PROTECTED BIKE LANE", "OFF-STREET TRAIL", "ACCESS PATH", "NEIGHBORHOOD GREENWAY"]

async function init() {
   const tangram = Tangram.leafletLayer({ scene: 'scene.yaml' });

   const center = [41.81350459907969, -87.7451178431511];

   const map = L.map('map', {
      center: center,
      zoom: 8,
      layers: [tangram],
      zoomControl: false
   });
   map.attributionControl.addAttribution(
      '<a href="https://github.com/tangrams/tangram">Tangram</a> ' +
      '| <a href="https://here.xyz">HERE XYZ</a> ' +
      '| <a href="https://www.openstreetmap.org/">OSM</a> ' +
      '| <a href="loading.io">Loading.io</a>'
   );

   const [routes, neighborhoods] = await Promise.all([
      fetch(routesUrl).then(x => x.json()),
      fetch(neighborhoodsUrl).then(x => x.json())
   ])

   let newLinesAsFeatureCollection = routes;
   let newLinesForCalcDistance = routes.features;

   const bikemap = L.geoJSON(routes, {
      style: function(feature) {
            const bikeroute = feature.properties.bikeroute;
            let color;
            if (bikeroute === 'OFF-STREET TRAIL') {
               color = '#2B7DB4';
            } else if (bikeroute === 'ACCESS PATH') {
               color = '#1A9850';
            } else if (bikeroute === 'PROTECTED BIKE LANE') {
               color = '#91CF60';
            } else if (bikeroute === 'BUFFERED BIKE LANE') {
               color = '#D9EF8B';
            } else if (bikeroute === 'BIKE LANE') {
               color = '#FFD150';
            } else if (bikeroute === 'NEIGHBORHOOD GREENWAY') {
               color = '#FC8D59';
            } else if (bikeroute === 'SHARED-LANE') {
               color = '#D72F27';
            }
            
         return { stroke: true, color: color, weight: 2}
      }
   });
   
   bikemap.addTo(map);

   L.geoJSON(neighborhoods, {
      style: { color: '#7B7B7B', weight: 2, dashArray: [2, 5], lineCap: 'butt', fillOpacity: 0}
   }).addTo(map);

   L.geoJSON(neighborhoods, {
      style: { color: '#484848', weight: 0, opacity: 0},
      onEachFeature: (feature, layer) => {
         layer.on({ click: handleFeatureClick })
         layer.on('mouseover', t => {
            t.target.setStyle({ 'fillColor': 'rgba(250,250,250,.5)'});
         });
         layer.on('mouseout', t => {
            t.target.setStyle({ 'fillColor': ''});
         });
      }
   }).addTo(map);


   async function resetMap() {
      fetch(routesUrl).then(x => x.json()).then(routes => {
         newLinesAsFeatureCollection = routes;
         newLinesForCalcDistance = routes.features;

         bikemap.clearLayers();
         bikemap.addData(routes);

         assignTotals(
            calculateDistance(routes.features)
         );
      })

      document.getElementById('clear').style.visibility = 'hidden';
      document.getElementById('neighborhood').innerText = 'City of Chicago';
   }

   document.getElementById('clear').onclick = () => resetMap();

   document.getElementById('clip').onchange = () => console.log(this);

   map.flyTo(center, 11, {
      animate: true,
      duration: 0.5
   })

   document.getElementById('loading').style.opacity = '0';

   assignTotals(
      calculateDistance(routes.features)
   );

   function assignTotals(n) {
      const keys = Object.keys(n).sort((a, b) => n[b] - n[a]).filter(item => item !== 'total');
      keys.unshift('total');
      const max = Object.keys(n).reduce((a, b) => n[a] > n[b] ? a : b);

      if (n.total === 0) {
         document.getElementById('total-bar').style.color = 'white';
         document.getElementById('total-text').style.color = '#C7C7C7';
      } else {
         document.getElementById('total-bar').style.color = 'black';
         document.getElementById('total-text').style.color = '#434343';
      }
      for (let i = 0; i < keys.length; i++) {
         document.getElementById(`${keys[i]}-bar`).style.width = (n[keys[i]] / n[max]) * 100 + '%';
         document.getElementById(`${keys[i]}`).style.top = (i * 40) + 'px';
         document.getElementById(`${keys[i]}-text`).innerText = '(' + (Math.round(n[keys[i]] * 100) / 100) + ' miles)';

         if (n[keys[i]] === 0) {
            document.getElementById(`${keys[i]}-bar`).style.width = '0%';
            document.getElementById(`${keys[i]}-text`).innerText = '(0 miles)';
         }
      }
   }

   function handleFeatureClick(evt) {
      
      document.getElementById('neighborhood').innerText = 'Neighborhood: ' + evt.target.feature.properties.pri_neigh;
      document.getElementById('loading').style.opacity = '1';

      const polyGeo = evt.target.feature;

      document.getElementById('loading').style.opacity = '0';

      let cutDistance = 0;
      const temp = [];

      routes.features.forEach(line => {
         const points = turf.points(line.geometry.coordinates[0]);
         const within = turf.pointsWithinPolygon(points, polyGeo);

         if (within.features.length > 0) {
            within.features.forEach(m => m.properties = line.properties);
            temp.push(within);
         }
      })

      newLinesForCalcDistance = temp.map(u => {
         return {
            "type": "Feature",
            "properties": u.features[0].properties,
            "geometry": {
               "type": "LineString",
               "coordinates": [u.features.map(f => f.geometry.coordinates)]
            }
         }
      });

      newLinesAsFeatureCollection = {
         type: 'FeatureCollection',
         features: temp.map(u => {
            return {
               "type": "Feature",
               "properties": u.features[0].properties,
               "geometry": {
                  "type": "LineString",
                  "coordinates": u.features.map(f => f.geometry.coordinates)
               }
            }
         })
      };

      
      if (document.getElementById('clip').checked){
         bikemap.clearLayers();
         bikemap.addData(newLinesAsFeatureCollection);
      }
      document.getElementById('clear').style.visibility = 'visible';

      assignTotals(
         calculateDistance(newLinesForCalcDistance)
      )
   }

   function calculateDistance(features) {
      const distances = {};
      types.forEach(q => distances[q] = 0);
      distances['total'] = 0;

      for (let z = 0; z < features.length; z++) {
         const feature = features[z];
         const geometry = feature.geometry.coordinates[0];
         const t = feature.properties.bikeroute;
         for (let i = 0; i < geometry.length - 1; i++) {
            const e = turf.distance(
               turf.point(geometry[i]),
               turf.point(geometry[i + 1]), {
                  units: 'miles'
               }
            )
            distances[t] += e
            distances['total'] += e
         }
      }
      return distances;
   }

   function bikeMapHandler(item) {
      const laneType = item.id;

      bikemap.clearLayers();
      bikemap.addData(laneType == 'total' ? newLinesAsFeatureCollection : {
         'type': 'FeatureCollection',
         'features': newLinesAsFeatureCollection.features.filter(feature => {
            return feature.properties.bikeroute == laneType
         })
      });
   }

   const bikeMaps = document.querySelectorAll('.row');
   bikeMaps.forEach(item => {
      item.onclick = () => {
         bikeMapHandler(item);
      }
   })
}
init();
