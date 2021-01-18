const tangram = Tangram.leafletLayer({
   scene: 'scene.yaml',
   events: {
      hover: handleHover
   }
})
const map = L.map('map', {
   center: [38.88790228978489, -77.0488089323044],
   zoom: 12,
   layers: [tangram],
   zoomControl: false
});
map.attributionControl.addAttribution('<a href="https://github.com/tangrams/tangram">Tangram</a> | <a href="https://here.xyz">HERE XYZ</a> | <a href="https://www.openstreetmap.org/">OSM</a>');

tangram.scene.subscribe({
   load: (scene) => {
      const checkboxes = document.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach((box) => {
         box.onclick = () => {
            if (box.id === 'street_car') {
               scene.config.layers[box.id].draw.lines.visible = box.checked ? true : false
            } else if (box.id === 'rapid_bus_transit') {
               scene.config.layers[box.id].draw['long-dashed-lines'].visible = box.checked ? true : false
            } else if (box.id === 'rapid_bus') {
               scene.config.layers[box.id].draw['short-dashed-lines'].visible = box.checked ? true : false
            }

            tangram.scene.rebuild();
         }
      })
   }
});

function handleHover(evt) {
   if (evt.feature) {
      let text = '';
      if (evt.feature.source_name === '_rapid_bus') {
         text = 'Rapid Bus';
      } else if (evt.feature.source_name === '_rapid_bus_transit') {
         text = 'Rapid Bus Transit'
      } else if (evt.feature.source_name === '_street_car') {
         text = 'Street Car';
      }
      const popup = L.popup({className: 'custom', closeButton: false})
         .setLatLng(evt.leaflet_event.latlng)
         .setContent(text)
         .openOn(map);
   } else {
      map.closePopup();
   }
}
