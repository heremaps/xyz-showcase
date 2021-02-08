const {DeckGL, MVTLayer} = deck;
const apikey = 'wuhhFoo3HHQ8Bxw68fCZe8iA_J9v4dBnRhSbkAlMup4';
const catalogArn = 'hrn:here:data::olp-here:dh-showcase-dc-transit';
const layerId = 'dc-transit';

new DeckGL({
  container: 'container',
  mapStyle: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  initialViewState: {
    longitude: -76.97605,
    latitude: 38.90192,
    zoom: 12
  },
  controller: true,
  layers: [
    new MVTLayer({
      data: `https://interactive.data.api.platform.here.com/interactive/v1/catalogs/${catalogArn}/layers/${layerId}/tile/web/{z}_{x}_{y}.mvt?apiKey=${apikey}`,
      minZoom: 0,
      maxZoom: 23,
      getLineColor: [53, 175, 109],
      getLineWidth: 2,
      lineWidthMinPixels: 2
    })
  ]
});