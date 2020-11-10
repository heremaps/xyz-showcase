import {DataProviderApi} from "../DataProviderApi"
import * as logger from "winston"
import {get} from "../../storage/HttpUtil"
import {Event, RequestedTags} from "../../interfaces/LambdaEvents"
import {WfsURL} from "../../interfaces/WfsURL";
import {
    emptyStatisticsResponse,
    ErrorResponse,
    FeatureCollection,
    SuccessResponse,
    XyzResponse
} from "../../interfaces/XyzResponse";
import {Parser, processors} from "xml2js";
import {Feature} from "geojson";
import proj4, {WGS84} from "proj4";

const geomPool = ["Point", "LineString", "Polygon", "MultiPoint", "MultiLineString", "MultiPolygon"];

export class WfsDataProvider implements DataProviderApi {

    async parseGeometryObject(geometryObject, geomOfFeature) {
        for (let a of Object.keys(geometryObject)) {
            if (geomPool.includes(a)) {
                geomOfFeature.type = a;
                for (let b of Object.keys(geometryObject[a])) {
                    if (b === "polygonMember" || b === "linestringMember") {
                        for (let c of Object.keys(geometryObject[a][b])) {
                            if (geomPool.includes(c)) {
                                let spaceSplit = geometryObject[a][b][c]["outerBoundaryIs"]["LinearRing"]["coordinates"].split(" ");
                                for (let coordPair of spaceSplit) {
                                    let splitted = coordPair.split(",");
                                    geomOfFeature.coordinates.push([parseFloat(splitted[1]), parseFloat(splitted[0])]);
                                }
                            }
                        }
                    } else if (b === "coordinates" || b === "posList") {
                        let spaceSplit = (geometryObject[a][b]._).split(" ");
                        for (let i = 0; i < spaceSplit.length; i+=2) {
                            geomOfFeature.coordinates.push([parseFloat(spaceSplit[i+1]), parseFloat(spaceSplit[i])]);
                        }
                    }
                }
            }
        }
        return geomOfFeature;
    }

    parseXML2JSON(streamId, response) {
        let res = "";
        let xmlParser = new Parser({
            explicitArray : false,
            mergeAttrs: true,
            tagNameProcessors : [processors.stripPrefix]
        });
        xmlParser.parseString(response, (err, result) => {
            if (err) {
                throw new ErrorResponse(streamId, 400, err.message);
            }
            res = result;
        });
        return res;
    }

    reprojectGeom(geomObj, projDef) {
        switch (geomObj.type) {
            case "Point":
                geomObj.coordinates = proj4(projDef,WGS84,geomObj.coordinates);
                break;
            case "LineString":
            case "MultiPoint":
                for (let first of geomObj.coordinates) {
                    proj4(projDef,WGS84,first);
                }
                break;
            case "Polygon":
            case "MultiLineString":
                for (let first of geomObj.coordinates) {
                    for (let sec of first) {
                        proj4(projDef,WGS84,sec);
                    }
                }
                break;
            case "MultiPolygon":
                for (let first of geomObj.coordinates) {
                    for (let sec of first) {
                        for (let third of sec) {
                            proj4(projDef,WGS84,third);
                        }
                    }
                }
                break;
        }
        return geomObj;
    }

    //check if feature tags match event tags
    async filterFeaturesByTags(eventTags: RequestedTags, taggedFeatures: [Feature]) {
        let featPool = [];
        for (let taggedFeature of taggedFeatures) {
            let tagsOfFeature = taggedFeature.properties["@ns:com:here:xyz"].tags;
            if (eventTags.length === 1) { //one tag or one AND clause
                //one tag
                if (eventTags.length === 1) {
                    let matchedTags = tagsOfFeature.filter(f => eventTags.includes(f.toLowerCase()));
                    if (matchedTags.length > 0) {
                        return featPool.push(taggedFeature);
                    }
                    //AND clause
                } else if (eventTags.length > 1) {
                    //Concat test
                    eventTags.push(eventTags.join(" "));
                    let matchedTags = tagsOfFeature.filter(f => eventTags.includes(f.toLowerCase()));
                    if (tagsOfFeature.length >= matchedTags.length && matchedTags.length > 0) {
                        return featPool.push(taggedFeature);
                    }
                }
                //OR Clause
            } else if (eventTags.length > 1) {
                let orClauseTags = [];
                for (let feat of eventTags) {
                    orClauseTags.push(feat[0]);
                }
                let matchedTags = tagsOfFeature.filter(f => orClauseTags.includes(f.toLowerCase()));
                if (matchedTags.length === 1) {
                    return featPool.push(taggedFeature);
                }
            }
        }
        return featPool;
    }

    async requestHandler(event, url): Promise<XyzResponse>{
        let headers = {};
        if (event.params.username && event.params.password) {
            headers = {"Authorization": event.params.username+":"+event.params.password}
        } else if (event.params.token) {
            headers = {"Authorization": "Bearer "+event.params.token}
        }
        let req = "";
        try {
            req = await get(url, headers);
        } catch (err) {
            if (err.statusCode === 302) {
                req = await get(err.responseHeaders.location, headers);
            } else {
                throw new ErrorResponse(event.streamId, err.statusCode, err.message);
            }
        }
        if (req.slice(0,5) == "<?xml") {
            let parsed = await this.parseXML2JSON(event.streamId,req);
            if (parsed["FeatureCollection"]["numberReturned"] === "0") {
                return new FeatureCollection();
            } else {
                return await this.transformResponse(event, parsed);
            }
        } else {
            let parsed = JSON.parse(req);
            if (parsed.features.length === 0) {
                return new FeatureCollection();
            } else {
                return await this.transformResponse(event, JSON.parse(req));
            }
        }
    }

    async transformResponse(event, requestedFeatureCollection): Promise<XyzResponse> {
        let fC = new FeatureCollection();
        //if parsed from xml
        if (event.params.outputFormatJSON === false) {
            let feat = {
                "type":"Feature",
                "properties": {},
                "geometry": {
                    "type": "",
                    "coordinates": []
                }
            };
            let memberKey = "featureMember";
            if (requestedFeatureCollection.FeatureCollection.hasOwnProperty("member")) {
                memberKey = "member";
            }
            for (let it of requestedFeatureCollection.FeatureCollection[memberKey]) {
                let typeName = it.hasOwnProperty(event.params.typeName) ? event.params.typeName : event.params.typeName.split(":")[1];
                    for (let prop of Object.keys(it[typeName])) {
                        if (["the_geom", "shape", "geometrie", "geom"].includes(prop.toLowerCase())) {
                            //Do geometry parsing and extract geometryType
                             feat["geometry"] = await this.parseGeometryObject(it[typeName][prop], feat["geometry"]);
                        } else {
                            feat.properties[prop] = it[typeName][prop];
                        }
                    }
                fC.features.push(feat);
            }
            requestedFeatureCollection = fC;
        }
        if (requestedFeatureCollection.features.length > event.limit) {
            requestedFeatureCollection.features.splice(event.limit - requestedFeatureCollection.features.length);
        }
        let loopLen = requestedFeatureCollection.features.length;
        if (!event.params.WGS84) {
            let reqDef = await get("http://epsg.io/"+event.params.srsName.split(":")[1]+".prettywkt");
            while (loopLen--) {
                let currentFeat = requestedFeatureCollection.features[loopLen];
                currentFeat.geometry = this.reprojectGeom(currentFeat.geometry, reqDef);
                currentFeat.properties["@ns:com:here:xyz"] =
                    {
                        "tags": [event.params.typeName, requestedFeatureCollection.features[loopLen].geometry.type],
                        "updatedAt": new Date().getTime(),
                        "space": event.space
                    };
            }
        } else {
            while (loopLen--) {
                    requestedFeatureCollection.features[loopLen].properties["@ns:com:here:xyz"] =
                        {
                            "tags": [event.params.typeName, requestedFeatureCollection.features[loopLen].geometry.type],
                            "updatedAt": new Date().getTime(),
                            "space": event.space
                        };
            }
        }
        if (event.tags && (event.tags.length > 0)) {
            requestedFeatureCollection.features = this.filterFeaturesByTags(event.tags, requestedFeatureCollection.features)}
        for (let it in requestedFeatureCollection) {
            if ((it !== "features") && ( it !== "type")) {
                delete requestedFeatureCollection[it];
            }
        }
        if (event.handle) {
            requestedFeatureCollection.handle = event.handle;
        }
        return Promise.resolve(requestedFeatureCollection);
    }

    async getFeaturesById(event): Promise<XyzResponse> {
        logger.debug(`requesting features by ids`);
        let reqWFS = new WfsURL(event, "GetFeature");
        return Promise.resolve(await this.requestHandler(event, reqWFS.requestURL));
    }

    async getFeaturesByBBox(event): Promise<XyzResponse> {
        logger.debug(`requesting features by bbox`);
        let reqWFS;
        if (event.params.WGS84) {
            reqWFS = new WfsURL(event, "GetFeature");
        } else {
            try {
                let projDef = await get("http://epsg.io/" + event.params.srsName.split(":")[1] + ".prettywkt");
                let firstPair = (proj4(projDef, [event.bbox[0], event.bbox[1]]));
                let secPair = (proj4(projDef, [event.bbox[2], event.bbox[3]]));
                let newEvent = new Event(event.type, event.space, event.streamId, [firstPair[0], firstPair[1], secPair[0], secPair[1]], event.params);
                reqWFS = new WfsURL(newEvent, "GetFeature");
            } catch (err) {
                throw new ErrorResponse(event.streamId, 400, err.message);
            }
        }
        return Promise.resolve(await this.requestHandler(event, reqWFS.requestURL));
    }

    async searchForFeatures(event): Promise<XyzResponse> {
        logger.debug(`searching features`);
        let reqWFS = new WfsURL(event, "GetFeature");
        return Promise.resolve(await this.requestHandler(event, reqWFS.requestURL));
    }

    async iterateFeatures(event): Promise<XyzResponse> {
        logger.debug(`requesting feature iteration`);
        let reqWFS = new WfsURL(event, "GetFeature");
        return Promise.resolve(await this.requestHandler(event, reqWFS.requestURL));
    }

    async modifySpace(event): Promise<XyzResponse> {
        if (!event.params.typeName || !event.params.url || !event.params.outputFormatJSON) {
            return Promise.reject("No typeName, url or outputFormatJSON provided!");
        } else {
            return Promise.resolve(new SuccessResponse());
        }
    }

    async getStatistics(event): Promise<XyzResponse> {
        let capURL = new WfsURL(event, "DescribeFeatureType");
        let headers = {};
        if (event.params.username && event.params.password) {
            headers = {"Authorization": event.params.username+":"+event.params.password}
        } else if (event.params.token) {
            headers = {"Authorization": "Bearer "+event.params.token}
        }
        let req;
        try {
            req = await get(capURL.requestURL, headers);
        } catch(err) {
            if (err.statusCode === 302) {
                req = await get(err.responseHeaders.location, headers);
            } else {
                throw new ErrorResponse(event.streamId, err.statusCode, err.message);
            }
        }
        req.slice(0,5) === "<?xml" ? req = await this.parseXML2JSON(event.streamId, req) : req = JSON.parse(req);
        let statsResponse = emptyStatisticsResponse;
        let props = [];
        statsResponse.bbox = {value : [-180,-90,180,90], estimated: true};
        statsResponse.tags = {
            value: [{
                "key" : event.params.typeName,
                "count": 0
            }],
            "estimated": false
        };
        if (req["schema"]) {
            for (let it of req["schema"]["complexType"]["complexContent"]["extension"]["sequence"]["element"]) {
                if (it.name) {
                    props.push({
                        "key": it.name,
                        "count": 0,
                        "searchable": true
                    });
                }
            }
        } else {
            for (let it of req["featureTypes"][0].properties) {
                props.push({
                    "key": it.name,
                    "count": 0,
                    "searchable": true
                    });
            }
        }
        let newEvent = event;
        newEvent.limit = 1;
        let geomReq = new WfsURL(newEvent,"GetFeature");
        try {
            req = await get(geomReq.requestURL, headers);
        } catch(err) {
            if (err.statusCode === 302) {
                req = await get(err.responseHeaders.location, headers);
            } else {
                throw new ErrorResponse(event.streamId, err.statusCode, err.message);
            }
        }
        req.slice(0,5) === "<?xml" ? req = await this.parseXML2JSON(event.streamId, req) : req = JSON.parse(req);
        statsResponse.geometryTypes.value = [req.features[0].geometry.type];
        statsResponse.properties.value = props;
        return Promise.resolve(statsResponse);
    }

    async getFeaturesByGeometry(event): Promise<XyzResponse> {
        let reqWFS = new WfsURL(event, "GetFeature");
        return Promise.resolve(await this.requestHandler(event, reqWFS.requestURL));
    }

//Not implemented in WFS Connector

    async modifyFeatures(event): Promise<XyzResponse> {
        return Promise.resolve(new ErrorResponse(event.streamId, 400, "Put Features is not supported by this connector"));
    }

    deleteFeatures(event): Promise<XyzResponse> {
        return Promise.resolve(new ErrorResponse(event.streamId, 400, "Delete Features is not supported by this connector!"));
    }

}
