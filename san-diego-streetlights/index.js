
var map;
var tangram;

function handleFeatureClick(evt) {
    let text = '';
    if (evt.feature) {
        let props = evt.feature.properties;
        text += '<p><b>Streetlight on ' + props.street + '</b><br/>'
        text += '(' + props.coords + ')</p>';
        text += '<p>Asset ID: ' + props.assetUid + '</p>';
        // text += '<p><a href="https://docs.cityiq.io/Default.htm#01-Parking%20API/Using%20the%20Parking%20API.htm%3FTocPath%3DParking%2520Planning%2520API%7C_____1" target="_new">Parking API</a> | <a href="https://docs.cityiq.io/Default.htm#02-Pedestrian%20API/Pedestrian%20Planning.htm#_Toc535927984%3FTocPath%3DPedestrian%2520Planning%2520API%7C_____0" target="_new">Pedestrian API</a> | <a href="https://docs.cityiq.io/Default.htm#04-Environmental%20API/Environmental%20API.htm%3FTocPath%3DEnvironmental%2520Planning%2520API%7C_____1" target="_new">Environment API</a></p>';
        // TODO: parkingUri, pedestrianUri, trafficUri, mediaUri
    }

    document.getElementById('overlay-details').innerHTML = text;
}

function main(lat, lon, zoom) {
    map = L.map('map', {
        zoomControl: false
    });

    tangram = Tangram.leafletLayer({
        scene: 'scene.yaml',
        events: {
            click: handleFeatureClick
        }
    });
    tangram.addTo(map);

    map.attributionControl.addAttribution('<a href="https://github.com/tangrams/tangram">Tangram</a> | <a href="https://here.xyz">HERE XYZ</a> | <a href="https://www.openstreetmap.org/">OSM</a>');
    map.setView([lat, lon], zoom);

    L.control.zoom({
        position: 'bottomright'
    }).addTo(map);
}

// San Diego Downtown
main(32.714, -117.170, 15);

