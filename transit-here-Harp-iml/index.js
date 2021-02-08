
const apikey = 'wuhhFoo3HHQ8Bxw68fCZe8iA_J9v4dBnRhSbkAlMup4';
const catalogArn = 'hrn:here:data::olp-here:dh-showcase-dc-transit';
const layerId = 'dc-transit';
const canvas = document.getElementById('map');
const map = new harp.MapView({
   canvas,
   theme: {
        extends: "https://unpkg.com/@here/harp-map-theme@latest/resources/berlin_tilezen_day_reduced.json",
        styles: {
            iml: [
                {
                    when: ["==", ["geometry-type"], "LineString"],
                    renderOrder: 1000,
                    technique: "solid-line",
                    color: "#D73060",
                    opacity: 1,
                    metricUnit: "Pixel",
                    lineWidth: 2,
                }
            ]
        }
    }
});

// center the camera to DC 
map.lookAt({
  target: new harp.GeoCoordinates(38.91725, -77.02271),
  zoomLevel: 12,
  tilt: 40,
});

const mapControls = new harp.MapControls(map);
const ui = new harp.MapControlsUI(mapControls);
canvas.parentElement.appendChild(ui.domElement);

map.resize(window.innerWidth, window.innerHeight);
window.onresize = () => map.resize(window.innerWidth, window.innerHeight);

const omvDataSource = new harp.VectorTileDataSource({
    baseUrl: "https://vector.hereapi.com/v2/vectortiles/base/mc",
    apiFormat: harp.APIFormat.XYZOMV,
    styleSetName: "tilezen",
    authenticationCode: apikey
});

map.addDataSource(omvDataSource);


function addDcTransit() {
    const dcTransit = new harp.VectorTileDataSource({
        baseUrl: `https://interactive.data.api.platform.here.com/interactive/v1/catalogs/${catalogArn}/layers/${layerId}/tile/web`,
        styleSetName: "iml",
        apiFormat: harp.APIFormat.XYZSpace,
        urlParams: {apikey}
    });
 
    map.addDataSource(dcTransit);
 }
 addDcTransit();