//specify credentials
var ACCESS_TOKEN = "AFuLw_fHSwunbKRiCOuy9gA";
const apikey = 'wuhhFoo3HHQ8Bxw68fCZe8iA_J9v4dBnRhSbkAlMup4';
const catalogArn = 'hrn:here:data::olp-here:dh-showcase-dc-transit';
const layerId = 'dc-transit';

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
            'roads': [{zIndex: 4, type: 'Line', stroke: '#ffffff', strokeWidth: 4},{
                zIndex: 6, type: 'Text', fill: '#222222',
                font: '12px sans-serif',
                strokeWidth:4,
                stroke:'white',text: (f)=>f.properties.name,
                // Minimum distance in pixel between repeated text labels on line geometries.
                // Applies per tile only. Default is 256 pixel.
                repeat: 256,
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
                stroke: 'white',
                fill: 'black',
                font: "18px sans-serif",
                strokeWidth: 4,
                // set collide property to false to enable label collision detection [default]
                collide: false,
                // Alignment for Text. "viewport" aligns to the plane of the viewport/screen.
                alignment: 'viewport',
                // Text with a higher priority (lower value) will be drawn before lower priorities (higher value)
                // In case of "place label" and "road label" are colliding "place label" will be draw
                // because priority 1 is smaller than priority 2
                priority: 1,
            }]
        },

        assign: (feature, zoom) => {
            let props = feature.properties;
            let kind = props.kind;
            let layer = props.layer;
            let geom = feature.geometry.type;

            if (layer == 'landuse') {
                return kind;
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
var transitLayer = new here.xyz.maps.layers.MVTLayer({
    name: 'London Tree Layer',
    min: 2,
    max: 20,
    remote: {
        url: `https://interactive.data.api.platform.here.com/interactive/v1/catalogs/${catalogArn}/layers/${layerId}/tile/web/{z}_{x}_{y}.mvt?apiKey=${apikey}`
    },
    // customize layer style
    style:{
    	styleGroups: {
    		transit: [{zIndex:0, type:"Line", stroke:"#BE6B65", strokeWidth:2}]
    	},

    	assign: function(feature, zoomlevel){
    		return 'transit';
    	}
    }
});

// setup the Map Display
const display = new here.xyz.maps.Map( document.getElementById("map"), {
    zoomLevel : 12,
    center: { longitude: -76.97605, latitude: 38.90192},

    // add layers to display
    layers: [bgLayer, transitLayer]
});
