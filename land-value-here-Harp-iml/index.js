const apikey = 'wuhhFoo3HHQ8Bxw68fCZe8iA_J9v4dBnRhSbkAlMup4';
const catalogHrn = 'hrn:here:data::olp-here:dh-showcase-brw-chemnitz';
const layerId = 'brw-chemnitz';
const canvas = document.getElementById('map');

window.map = new harp.MapView({
   canvas,
   theme: {
        extends: "https://unpkg.com/@here/harp-map-theme@latest/resources/berlin_tilezen_night_reduced.json",
        styles: {
            iml: [{
                    description: "geoJson property-based style",
                    technique: "extruded-polygon",
                    when: [
                        "all",
                        ["==", ["geometry-type"], "Polygon"],
                        ["<", ["to-number", ["get", "BRW"]], 50]
                    ],
                    color: "#0098BD",
                    transparent: false,
                    opacity: 1,
                    boundaryWalls: false,
                    constantHeight: true,
                    lineWidth: 1,
                    height: ["to-number", ["get", "BRW"]],
                    lineColor: "#508394",
                    emissive: "#0098BD",
                    emissiveIntensity: 0.45,
                    renderOrder: 1000
                }, {
                    description: "geoJson property-based style",
                    technique: "extruded-polygon",
                    when: [
                        "all",
                        ["==", ["geometry-type"], "Polygon"],
                        [">=", ["to-number", ["get", "BRW"]], 50],
                        ["<", ["to-number", ["get", "BRW"]], 120]
                    ],
                    color: "#48E3CD",
                    transparent: false,
                    opacity: 1,
                    boundaryWalls: false,
                    constantHeight: true,
                    lineWidth: 1,
                    height: ["to-number", ["get", "BRW"]],
                    lineColor: "#28D3AD",
                    emissive: "#48E3CD",
                    emissiveIntensity: 0.45,
                    renderOrder: 1000
                }, {
                    description: "geoJson property-based style",
                    technique: "extruded-polygon",
                    when: [
                        "all",
                        ["==", ["geometry-type"], "Polygon"],
                        [">=", ["to-number", ["get", "BRW"]], 100],
                        ["<", ["to-number", ["get", "BRW"]], 300]
                    ],
                    color: "#D7FEB4",
                    transparent: false,
                    opacity: 1,
                    boundaryWalls: false,
                    constantHeight: true,
                    lineWidth: 1,
                    height: ["to-number", ["get", "BRW"]],
                    lineColor: "#A7DE84",
                    emissive: "#D7FEB4",
                    emissiveIntensity: 0.45,
                    renderOrder: 1000
                }, {
                    description: "geoJson property-based style",
                    technique: "extruded-polygon",
                    when: [
                        "all",
                        ["==", ["geometry-type"], "Polygon"],
                        [">=", ["to-number", ["get", "BRW"]], 500],
                        ["<", ["to-number", ["get", "BRW"]], 900]
                    ],
                    color: "#FEEDB1",
                    transparent: false,
                    opacity: 1,
                    boundaryWalls: false,
                    constantHeight: true,
                    lineWidth: 1,
                    height: ["to-number", ["get", "BRW"]],
                    lineColor: "#EEDDA1",
                    emissive: "#FEEDB1",
                    emissiveIntensity: 0.45,
                    renderOrder: 1000
                }, {
                    description: "geoJson property-based style",
                    technique: "extruded-polygon",
                    when: [
                        "all",
                        ["==", ["geometry-type"], "Polygon"],
                        [">=", ["to-number", ["get", "BRW"]], 900],
                        ["<", ["to-number", ["get", "BRW"]], 1500]
                    ],
                    color: "#FEAD53",
                    transparent: false,
                    opacity: 1,
                    boundaryWalls: false,
                    constantHeight: true,
                    lineWidth: 1,
                    height: ["to-number", ["get", "BRW"]],
                    lineColor: "#BEAD43",
                    emissive: "#FEAD53",
                    emissiveIntensity: 0.45,
                    renderOrder: 8000
                }, {
                    description: "geoJson property-based style",
                    technique: "extruded-polygon",
                    when: [
                        "all",
                        ["==", ["geometry-type"], "Polygon"],
                        [">=", ["to-number", ["get", "BRW"]], 1500]
                    ],
                    color: "#D2364D",
                    transparent: false,
                    opacity: 1,
                    boundaryWalls: false,
                    constantHeight: true,
                    lineWidth: 1,
                    height: ["to-number", ["get", "BRW"]],
                    lineColor: "#E2364D",
                    emissive: "#D2364D",
                    emissiveIntensity: 0.45,
                    renderOrder: 8000
                }
            ]
        }
    }
});

// center the camera to DC 
map.lookAt({
  target: new harp.GeoCoordinates(50.833332, 12.916667),
  zoomLevel: 14,
  tilt: 40,
  bearing: 80
});

const mapControls = new harp.MapControls(map);
const ui = new harp.MapControlsUI(mapControls);
canvas.parentElement.appendChild(ui.domElement);

map.resize(window.innerWidth, window.innerHeight);
window.onresize = () => map.resize(window.innerWidth, window.innerHeight);

const hereCopyrightInfo = {
    id: "here.com",
    year: new Date().getFullYear(),
    label: "HERE",
    link: "https://legal.here.com/terms"
};
const dl_de = {
    id: "govdata.de",
    label: "DL-DE->BY-2.0",
    link: "https://www.govdata.de/dl-de/by-2-0"
};
const copyrights = [hereCopyrightInfo, dl_de];

var Year = 2011;
var urlParams = {apikey, 'p.Jahr': Year};
var dataSources = [];
function addDataSource() {
    const brw = new harp.VectorTileDataSource({
        baseUrl: `https://interactive.data.api.platform.here.com/interactive/v1/catalogs/${catalogHrn}/layers/${layerId}/tile/web`,
        styleSetName: "iml",
        copyrightInfo: copyrights,
        apiFormat: harp.APIFormat.XYZSpace,
        urlParams
    });

    map.addDataSource(brw);
    dataSources.push(brw);
 }
 addDataSource();


 harp.CopyrightElementHandler.install("copyrightNotice", map);

 const buttons =  document.querySelectorAll('#cell span');
 const playbutton =  document.querySelector('#cell div');
 buttons.forEach(function(e, idx){
    e.addEventListener('pointerup', function(e){
        clearInterval(interval);
        interval = 0;
        playbutton.querySelector('img').src = "./icons/play.svg";
        currentButton = this.getAttribute('value')%10;
    })
    e.addEventListener('click', function(e){
    buttons.forEach(b=>b.classList.remove("pressed"));
    this.classList.add("pressed");

    urlParams['p.Jahr'] = this.getAttribute('value');
    addDataSource();
    setTimeout(function(){
        map.removeDataSource(dataSources.shift())
    }, 1000)
    })
})
playbutton.addEventListener('click', function(e){
    if(interval) {
        playbutton.querySelector('img').src = "./icons/play.svg";
        clearInterval(interval);
        interval = 0;
    } else {
        playbutton.querySelector('img').src = "./icons/pause.svg";
        interval = play();
    }
})

var currentButton = 0;
function play(){
    return setInterval(function(){
        buttons[currentButton++%10].click();
    }, 1500)
}

var interval = play();


