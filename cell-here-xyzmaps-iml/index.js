//specify credentials
var ACCESS_TOKEN = "AFuLw_fHSwunbKRiCOuy9gA";
const apiKey = 'ec3PFUEkQV_xTVGwaFu10SFj5SNI98RDT35J9IriX1U';
const catalogHrn = 'hrn:here:data::olp-here:cell-towers';
const layerId = 'cell-towers';

var bgLayer = new here.xyz.maps.layers.MVTLayer({
    name: 'background layer',
    min: 1,
    max: 20,
    remote: {
        url: 'https://xyz.api.here.com/tiles/osmbase/512/all/{z}/{x}/{y}.mvt?access_token='+ACCESS_TOKEN
    },
    style: {
        backgroundColor: '#ECE0CA',
        strokeWidthZoomScale: (level) => level > 17 ? 1 : level > 14 ? .5 : level > 9 ? .25 : .1,

        styleGroups: {
            'landuse': [{zIndex: 0, type: 'Polygon', fill: '#ECE0CA'}],
            'pier': [{zIndex: 1, type: 'Polygon', fill: '#ECE0CA', stroke: '#c8b89d', strokeWidth: 2}],
            'park': [{zIndex: 1, type: 'Polygon', fill: '#c8dd97'}],
            'nature_reserve': [{zIndex: 1, type: 'Polygon', fill: '#dadeb0'}],
            'hospital': [{zIndex: 1, type: 'Polygon', fill: '#f3d3d3'}],
            'water': [{zIndex: 2, type: 'Polygon', fill: 'rgb(120,188,237)'}],
            'path': [{zIndex: 3, type: 'Line', stroke: '#c8b89d', strokeWidth: 2}],
            'tunnel': [{zIndex: 3, type: 'Line', stroke: '#ffffff', strokeWidth: 14, strokeDasharray: [4, 4]}],
            'ferry': [{zIndex: 4, type: 'Line', stroke: '#164ac8', strokeWidth: 1}],
            'highway': [{zIndex: 5, type: 'Line', stroke: '#ffffff', strokeWidth: 16}],
            'boundaries': [{zIndex: 6, type: 'Line', stroke: '#b3b1ad', strokeWidth: 2}],
            // 'buildings': [{zIndex: 7, type: 'Polygon', fill: 'rgb(155,175,196)'}],
            'roads': [
                {zIndex: 4, type: 'Line', stroke: '#ffffff', strokeWidth: 4},
                {zIndex: 6, type: 'Text', fill: '#222222',font: '12px sans-serif',strokeWidth:4,stroke:'white',text: (f)=>f.properties.name,repeat: 256,alignment: 'map',priority: 2
            }],
            'places': [{zLayer: 2,zIndex: 8,type: 'Text',text: (f) => f.properties.name,stroke: 'white',fill: 'black',font: "18px sans-serif",strokeWidth: 2,collide: false,alignment: 'viewport', priority: 1}]
        },

        assign: (feature, zoom) => {
            let props = feature.properties;
            let kind = props.kind;
            let layer = props.layer;
            let geom = feature.geometry.type;

            if (layer == 'landuse') {
                return kind;
            }

            if(props.kind_detail != "city" && props.kind_detail != "state") return;
            
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
// const standardValue = {
//     20: 10,
//     19: 10,
//     18: 15,
//     17: 15,
//     16: 20,
//     15: 40,
//     14: 70,
//     13: 100,
//     12: 300,
//     11: 1000,
//     10: 5000,
//     9: 5000,
//     8: 20000,
//     7: 50000,
//     6: 50000,
//     5: 100000,
//     4: 150000,
//     3: 150000,
//     2: 150000,
//     1: 150000
// }

var currentSampling = 'off';
var standards = {
    "LTE": true,
    "UMTS": true,
    "GSM": true,
    "CDMA": true
};
const samplingRatioMap = {
    "off": 1,
    "low": 8,
    "lowmed": 32,
    "med": 128,
    "medhigh": 1024,
    "high": 4096
};

const createCellLayer = (from, to, stds, sampling) => {
    stds = Object.keys(stds).join(',');
    const providers = [];
    for (; from < to; from++) {
        providers.push({
            min: from,
            max: from,
            provider: new here.xyz.maps.providers.IMLProvider({
                level: from-1>0?from-1:from,
                layer: 'cell-towers',
                catalog: 'hrn:here:data::olp-here:cell-towers',
                credentials: {apiKey},
                margin: 4,
                params: {
                    "mode": from < 17 ? "viz" : "false",
                    "selection": "p.aggregation",
                    "vizSampling": "low",
                    "p.radio": stds,
                    "clustering": "hexbin",
                    "clustering.relativeResolution": 1,
                    "clustering.sampling": sampling
                },
                editable: false
            })
         });    
    }
    return new here.xyz.maps.layers.TileLayer({
        min: 1,
        max: 20,
        name: 'MyLayer',
        providers: providers,
        tileSize: 256,
        margin: 0,
        style:{
            styleGroups: {
                // 1: [{zIndex: 2, type: 'Polygon', opacity: 0.9, fill: '#D2364D', extrude: (feature) => JSON.parse(feature.properties.aggregation).qty * 5 || 250}],
                // 2: [{zIndex: 2, type: 'Polygon', opacity: 0.8, fill: '#FEAD53', extrude: (feature) => JSON.parse(feature.properties.aggregation).qty * 5 || 250}],
                // 3: [{zIndex: 2, type: 'Polygon', opacity: 0.8, fill: '#FEEDB1', extrude: (feature) => JSON.parse(feature.properties.aggregation).qty * 5 || 250}],
                // 4: [{zIndex: 2, type: 'Polygon', opacity: 0.8, fill: '#48E3CD', extrude: (feature) => JSON.parse(feature.properties.aggregation).qty * 5 || 250}],
                // 5: [{zIndex: 2, type: 'Polygon', opacity: 0.8, fill: '#0098BD', extrude: (feature) => JSON.parse(feature.properties.aggregation).qty * 5 || 250}]
            
                cell: [{zIndex: 2, type: 'Polygon', opacity: 0.8, fill: '#0097BC', extrude: (feature) => feature.properties.aggregation.qty * 10 * samplingRatioMap[currentSampling] || 250}]
            },
    
            assign: function(feature, zoomlevel){
                return 'cell';
                // const qty = JSON.parse(feature.properties.aggregation).qty;
                // const zl = Math.floor(zoomlevel);
                // const v = Math.floor(standardValue[zl]/qty);
                // if(v < 1) return 1;
                // else if (v>5) return 5;
                // else return v;
            }
        }
    })
}

// function createCellLayer(from, to, stds, sampling) {
//     stds = Object.keys(stds).join(',');

//     return new here.xyz.maps.layers.MVTLayer({
//         name: 'cell Layer',
//         min: 2,
//         max: 20,
//         remote: {
//             url: `https://interactive.data.api.platform.here.com/interactive/v1/catalogs/${catalogHrn}/layers/${layerId}/tile/web/{z}_{x}_{y}.mvt?apiKey=${apiKey}&p.radio=${stds}&clip=false&clustering=hexbin&clustering.relativeResolution=1&clustering.sampling=${sampling}`

//         },
//         // customize layer style
//         style:{
//             styleGroups: {
//                 // 1: [{zIndex: 2, type: 'Polygon', opacity: 0.9, fill: '#D2364D', extrude: (feature) => JSON.parse(feature.properties.aggregation).qty * 5 || 250}],
//                 // 2: [{zIndex: 2, type: 'Polygon', opacity: 0.8, fill: '#FEAD53', extrude: (feature) => JSON.parse(feature.properties.aggregation).qty * 5 || 250}],
//                 // 3: [{zIndex: 2, type: 'Polygon', opacity: 0.8, fill: '#FEEDB1', extrude: (feature) => JSON.parse(feature.properties.aggregation).qty * 5 || 250}],
//                 // 4: [{zIndex: 2, type: 'Polygon', opacity: 0.8, fill: '#48E3CD', extrude: (feature) => JSON.parse(feature.properties.aggregation).qty * 5 || 250}],
//                 // 5: [{zIndex: 2, type: 'Polygon', opacity: 0.8, fill: '#0098BD', extrude: (feature) => JSON.parse(feature.properties.aggregation).qty * 5 || 250}]
            
//                 cell: [{zIndex: 2, type: 'Polygon', opacity: 0.8, fill: '#0097BC', extrude: (feature) => JSON.parse(feature.properties.aggregation).qty * 10 * samplingRatioMap[currentSampling] || 250}]
//             },
    
//             assign: function(feature, zoomlevel){
//                 return 'cell';
//                 // const qty = JSON.parse(feature.properties.aggregation).qty;
//                 // const zl = Math.floor(zoomlevel);
//                 // const v = Math.floor(standardValue[zl]/qty);
//                 // if(v < 1) return 1;
//                 // else if (v>5) return 5;
//                 // else return v;
//             }
//         }
//     });
// }

// setup the Map Display
window.display = new here.xyz.maps.Map( document.getElementById("map"), {
    zoomLevel : 11,
    center: { longitude: -74.00464203974603, latitude: 40.7099569313832 },
    behavior: {
        pitch: true,
        rotate: true
    },
    // set initial map pitch in degrees
    pitch: 30,
    // add layers to display
    layers: [bgLayer, createCellLayer(1, 20, standards, currentSampling)]
});

const standardsInputs = document.querySelectorAll("input");
const ratios = document.querySelectorAll(".sampling");

standardsInputs.forEach(standard => {
    standard.onchange = function(){
        if(this.checked)
            standards[this.value] = true;
        else
            delete standards[this.value];
            
        const cellLayer = createCellLayer(1, 20, standards, currentSampling);
        const cb = function(){
            const layers = display.getLayers();
            display.removeLayer(layers[1]);
            cellLayer.removeEventListener('viewportReady', cb);
        }
        cellLayer.addEventListener('viewportReady', cb)
        display.addLayer(cellLayer)
  }
})

ratios.forEach((e)=>{
    e.addEventListener('pointerup', function() {
        if(this.getAttribute('value') != currentSampling) {
            currentSampling = this.getAttribute('value');
            
            this.querySelector('input').checked = true

            const cellLayer = createCellLayer(1, 20, standards, currentSampling);
            const cb = function(){
                const layers = display.getLayers();
                display.removeLayer(layers[1]);
                cellLayer.removeEventListener('viewportReady', cb);
            }
            cellLayer.addEventListener('viewportReady', cb)
            display.addLayer(cellLayer)

        }
    })
})


window.onresize = function() {
    display.resize();
}
