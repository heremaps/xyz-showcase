//specify credentials
var ACCESS_TOKEN = "AFuLw_fHSwunbKRiCOuy9gA";

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
var customLayer = new here.xyz.maps.layers.TileLayer({
    name: 'London Tree Layer',
    min: 12,
    max: 20,
    // Customized provider to provide features
    provider: new here.xyz.maps.providers.SpaceProvider({
        space: "ZWlEq0iJ",
        credentials: {
            access_token: ACCESS_TOKEN
        },
        level: 13
    }),

    // customize layer style
    style:{
    	styleGroups: {
    		Adler: [{zIndex:2, type:"Circle", fill:"#A80085", radius: 4}],
    		Apple: [{zIndex:2, type:"Circle", fill:"#FF5500", radius: 4}],
    		Ash: [{zIndex:2, type:"Circle", fill:"#00C5FF", radius: 4}],
    		Beech: [{zIndex:2, type:"Circle", fill:"#00FFC5", radius: 4}],
    		Birch: [{zIndex:2, type:"Circle", fill:"#A9FF00", radius: 4}],
    		'Black Locust': [{zIndex:2, type:"Circle", fill:"#E69900", radius: 4}],
    		Cherry: [{zIndex:2, type:"Rect", fill:"#FF0000", width: 8, stroke:"#FFFFFF"}],
    		Chestnut: [{zIndex:2, type:"Circle", fill:"#00C5FF", radius: 4}],
    		Cypress: [{zIndex:2, type:"Rect", fill:"#6678CE", width: 8, stroke:"#FFFFFF"}],
    		Elm: [{zIndex:2, type:"Circle", fill:"#747400", radius: 4, stroke:"#FFFFFF"}],
    		Hawthorn: [{zIndex:2, type:"Circle", fill:"#E69900", radius: 4}],
    		Hazel: [{zIndex:2, type:"Rect", fill:"#6FA800", width: 8}],
    		Hornbeam: [{zIndex:2, type:"Circle", fill:"#F57B7B", radius: 4}],
    		Lime: [{zIndex:2, type:"Circle", fill:"#A3FF74", radius: 4}],
    		Maple: [{zIndex:2, type:"Circle", fill:"#FFBEE8", radius: 4}],
    		Oak: [{zIndex:2, type:"Circle", fill:"#45886F", radius: 4, stroke:"#FFFFFF"}],
    		Other: [{zIndex:2, type:"Circle", fill:"#A86F00", radius: 4}],
    		Pear: [{zIndex:2, type:"Circle", fill:"#E84700", radius: 4}],
    		Pine: [{zIndex:2, type:"Circle", fill:"#A80000", radius: 4}],
    		Plane: [{zIndex:2, type:"Circle", fill:"#FF00C5", radius: 4}],
    		Poplar: [{zIndex:2, type:"Circle", fill:"#E074FF", radius: 4, stroke: "#FFFFFF"}],
    		Whitebeam: [{zIndex:2, type:"Circle", fill:"#00E6A9", radius: 4}],
    		Willow: [{zIndex:2, type:"Rect", fill:"#0085A8", width: 8}]
    	},

    	assign: function(feature, zoomlevel){
            let prop = feature.properties;
    		return prop.display_name;
    	}
    }
});

// setup the Map Display
const display = new here.xyz.maps.Map( document.getElementById("map"), {
        zoomLevel : 16,
        center: { longitude: -0.116865, latitude: 51.508082},

        // add layers to display
        layers: [bgLayer, customLayer]
    });

// setup the editor
const editor = new here.xyz.maps.editor.Editor( display, {
    featureSelectionByDefault: false
} );

// add custom layer to editor, make layers editable
editor.addLayer( customLayer );

editor.addObserver("history.current", ()=>{
    const current = editor.get("history.current");
    console.log('finish...', current);

    if(current>0) {
        submitButton.style.display = 'block';
    } else {
        submitButton.style.display = 'none';
    }
})

var deleteButton = document.querySelector("#delete");
var submitButton = document.querySelector("#submitchange");
var tree;

deleteButton.onclick = function(){
    if(tree) {
        tree.remove();
        setFeaturePanel();
        deleteButton.style.display = 'none';
    }
};

submitButton.onclick = function(){
    if(tree) {
        customLayer.setStyleGroup(tree);
    }
    tree = null;
    // submit changes
    editor.submit({
        onSuccess: ()=>{
            deleteButton.style.display = 'none';
            setFeaturePanel();
        }
    });
};

display.addEventListener('pointerup', function(event) {
    if(event.button == 0) {
        var feature = event.target;
        
        if(tree) {
            customLayer.setStyleGroup(tree);
        }

        if(feature && feature.geometry.type != "Polygon") {
            tree = feature;
            deleteButton.style.display = 'block';
            setFeaturePanel(feature)
        } else {
            deleteButton.style.display = 'none';
            setFeaturePanel();
        }
    }
});

editor.addEventListener('pointerenter', function(event) {
    document.body.style.cursor = "pointer";
    updateFeatureStyle(event.target);
});

editor.addEventListener('pointerleave', function(event) {
    document.body.style.cursor = "default";
    const feature = event.target;

    if(!tree || tree.id !== feature.id)
        customLayer.setStyleGroup(feature);
});

const auth = document.querySelector('.auth');
const easting = document.querySelector('.easting');
const northing = document.querySelector('.northing');
const icon = document.querySelector('#tree div span ul li svg');
const name = document.querySelector('#tree div span ul li a');
const types = document.querySelectorAll('#tree div span ul li');
const dropdown = document.querySelector('ul li ul');

types.forEach((type, idx)=>{
    if(idx) {
        type.addEventListener('click', (e)=>{
            const a = type.querySelector('a');
            const svg = type.querySelector('svg');
            name.innerHTML = a.innerHTML;
            icon.innerHTML = svg.innerHTML;

            var attr = {'display_name': name.innerHTML};
            if(tree) {
                tree.prop(attr);
                updateFeatureStyle(tree)
            }

            dropdown.classList.remove('open')
            dropdown.classList.add('closed');
        })
    }
    else {
        type.addEventListener('pointerover', (e)=>{
            dropdown.classList.remove('closed')
            dropdown.classList.add('open');
        });
    }
})
function updateFeatureStyle(feature){
    if(feature) {
        var style = customLayer.getStyleGroup(feature);
        var newStyle = Object.assign({}, style[0]);
        newStyle.zIndex++;
        newStyle.radius = 12;
        newStyle.width = 20;
        customLayer.setStyleGroup(feature, [newStyle]);
    } else {

    }
}
function setFeaturePanel(feature){
    if(feature){
        const prop = feature.properties;
        types.forEach((type, idx) =>{
            const a = type.querySelector('a');
            const svg = type.querySelector('svg');
    
            if(a.innerHTML == prop.display_name) {
                icon.innerHTML = svg.innerHTML;
            }
    
        })
        name.innerHTML = prop.display_name;
        auth.innerHTML = prop.borough;
        easting.innerHTML = prop.easting;
        northing.innerHTML = prop.northing;
    } else {
        icon.innerHTML = '<svg height="10" width="10"><circle cx="5" cy="5" r="5" fill="#EEEEEE" /></svg>';
        name.innerHTML = "Unselected";
        auth.innerHTML = "Unselected";
        easting.innerHTML = 0;
        northing.innerHTML = 0;
    }

}