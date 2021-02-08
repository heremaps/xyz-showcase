import React, {Component} from 'react';
import {render} from 'react-dom';
import {connect} from 'react-redux';
import AutoSizer from "react-virtualized/dist/commonjs/AutoSizer";
import KeplerGl from "kepler.gl";
import {addDataToMap} from 'kepler.gl/actions';
import {processGeojson} from 'kepler.gl/processors';


const apiKey = 'wuhhFoo3HHQ8Bxw68fCZe8iA_J9v4dBnRhSbkAlMup4';
const catalogArn = 'hrn:here:data::olp-here:dh-showcase-dc-transit';
const layerId = 'dc-transit';
const dctransitURL = `https://interactive.data.api.platform.here.com/interactive/v1/catalogs/${catalogArn}/layers/${layerId}/search?apiKey=${apiKey}`;
const token = 'pk.eyJ1IjoieGhhaWZlbmciLCJhIjoiY2trcHh1eXJrMGhldTJ1cDhqdHZ2NXZoZyJ9.oM1XeaXJpeDhGeVc_v0bqA';


class App extends Component {
    async componentDidMount() {
        const [transits] = await Promise.all([
            fetch(dctransitURL).then(x => x.json()),
        ])

        this.props.dispatch(
            addDataToMap({
                datasets: {
                    info: {
                        label: 'Transit 2030 D.C. Washington',
                        id: 'iml_showcase'
                    },
                    data: processGeojson(transits)
                },
                option: {
                    centerMap: true,
                    readOnly: true
                },
                info: {
                    title: 'IML Showcase',
                    description: 'This is IML Showcase with Kepler GL'
                }
            })
        );
    }

    render(){
        return (
            <div style={{position: "absolute", width: "100%", height: "100%"}}>
                <AutoSizer>
                    {({height, width}) => (
                        <KeplerGl
                            mapboxApiAccessToken={token}
                            id="map"
                            width={width}
                            height={height}
                            getState={state => state}
                        />
                    )}
                </AutoSizer>
            </div>
        );
    }
}

const mapStateToProps = state => state;
const dispatchToProps = dispatch => ({dispatch});

export default connect(mapStateToProps, dispatchToProps)(App);