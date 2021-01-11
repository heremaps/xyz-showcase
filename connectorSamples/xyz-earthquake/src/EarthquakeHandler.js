const ErrorResponse = require("./storage/ErrorResponse"),
    StorageEventHandler = require("./storage/StorageEventHandler"),
    FeatureCollection = require("./storage/FeatureCollection"),
    SuccessResponse = require("./storage/SuccessResponse"),
    StatisticsResponse = require("./storage/StatisticsResponse"),
    {URL, URLSearchParams} = require("url"),
    https = require("https"),
    http = require("http"),
    baseURL = "https://earthquake.usgs.gov/fdsnws/event/1/",
    winston = require("winston"),
    logger = winston.createLogger({
    level: 'debug',
    format: winston.format.json(),
    defaultMeta: { service: 'user-service' }
});

class EarthquakeHandler extends StorageEventHandler {

    /**
     *
     * @param {String} relocationS3Bucket
     */
    constructor(relocationS3Bucket) {
        super(relocationS3Bucket);
    }

    async getRequest(url, headers) {
        let urlObj = url instanceof URL ? url : new URL(url);
        let options = {
            hostname: urlObj.hostname,
            path: urlObj.pathname + urlObj.search,
            method: 'GET',
            headers: headers
        }
        return new Promise(function(resolve, reject) {
            let req = (urlObj.protocol === "https:" ? https : http).request(options, res => {
                // on bad status, reject
                if (res.statusCode < 200 || res.statusCode >= 300) {
                    return reject(new Error('statusCode=' + res.statusCode));
                }
                let body = "";
                res.on('data', function(chunk) {
                    body += chunk;
                });
                res.on('end', function() {
                    resolve(body);
                });
            });
            req.on('error', function(err) {
                reject(err);
            });
            req.end();
        });
    }

    async get(url, headers) {
        return this.getRequest(url, headers).then( function (body) {
            return body;
        })
    }

    async transformResponse(event, response) {
        if (event.type === "GetFeaturesByIdEvent") {
            if (response.type === "Feature") {
                response = new FeatureCollection([response]);
            }
        }
        let featArray = [];
        //standard transformation
        for (let it of response.features) {
            it.geometry.coordinates[2] ? it.properties.depth = it.geometry.coordinates[2] &&
                it.geometry.coordinates.pop() : logger.debug("No depth provided!");
            it.properties.magnitude = it.properties.mag;
            it.properties.significance = it.properties.sig;
            it.properties.date = new Date(it.properties.time);
            delete it.properties.mag;
            delete it.properties.sig;
            it.properties["@ns:com:here:xyz"] = {
                "space": event.space,
                "tags": [],
                "updatedAt": parseInt(it.properties.updated)
            };
            delete it.properties.updated;
            featArray.push(it);
        }
        let selectedFeatArray = [];
        if (event.selection && event.selection.length > 0) {
            for (let feat of featArray) {
                Object.keys(feat.properties).forEach((it) => event.selection.includes(it) ||
                    delete feat.properties[it]);
                selectedFeatArray.push(feat);
            }
            return new FeatureCollection(selectedFeatArray);
        } else {
            return new FeatureCollection(featArray);
        }
    }

    async requestHandler(event, requestUrl) {
        let resp = "";
        try {
            resp = await this.get(requestUrl, {});
            logger.debug("Earthquake API response: ", resp);
        } catch (e) {
            logger.debug("Could not request from USGS Earthquake API.");
            throw new ErrorResponse(event.streamId, 400, e.message);
        }
        if (resp !== "") {
            return await this.transformResponse(event, JSON.parse(resp));
        } else {
            logger.debug("Empty response from USGS Earthquake API.");
            return new FeatureCollection();
        }
    }

    async processGetFeaturesByBBox(event) {
        if (event.limit) {
            if (event.limit > 20000) {
                event.limit = 20000;
            }
        }
        const params = new URLSearchParams({
            minlatitude: event.bbox[1],
            minlongitude: event.bbox[0],
            maxlatitude: event.bbox[3],
            maxlongitude: event.bbox[2],
            limit: event.limit,
            format: "geojson"
        });
        let url = new URL(baseURL + "query");
        url.search = params;
        return this.requestHandler(event, url);
    }

    async processGetFeaturesById(event) {
        let url = new URL(baseURL + "query");
        let results = [];
        if (event.ids) {
            for (let it of event.ids) {
                url.search = new URLSearchParams({
                    eventid: it, //for example us600050vv
                    format: "geojson"
                });
                let resp = await this.requestHandler(event,url);
                resp.features.forEach(it => results.push(it));
            }
            return new FeatureCollection(results);
        } else {
            return new ErrorResponse(event.streamId, 400, "No feature ids provided.");
        }
    }

    async processGetFeaturesByTile(event) {
        return this.processGetFeaturesByBBox(event);
    }

    async processIterateFeatures(event) {
        if (event.limit) {
            if (event.limit > 20000) {
                event.limit = 20000;
            }
        }
        //sample bbox
        event.bbox =
            [
                -180.0,
                -90.0,
                180.0,
                90.0
            ];
        return this.processGetFeaturesByBBox(event);
    }

    async processGetStatistics(event) {
        let statsResp = new StatisticsResponse();
        statsResp.bbox = new StatisticsResponse.Value([
            -180.0,
            -90.0,
            180.0,
            90.0
        ], true);
        statsResp.count = new StatisticsResponse.Value(100, true);
        statsResp.byteSize = new StatisticsResponse.Value(100, true);
        statsResp.geometryTypes = new StatisticsResponse.Value(["Point"],false);
        statsResp.tags = new StatisticsResponse.Value([{
            "key": null,
            "count": 100
        }], true);
        let propValues = [];
        let keyArraySearchable = [
                    "magnitude", "significance",
                    "date","time",
                ];
        let keyArrayUnsearchable = [
            "title", "status", "tsunami", "net", "magType", "place", "tz", "felt", "code", "ids", "sources", "depth",
            "url", "detail", "cdi", "mmi", "alert","type", "types", "nst", "dmin", "rms", "gap", "products"
        ];
        for (let it of keyArraySearchable) {
                    propValues.push(new StatisticsResponse.Property(it,100,true));
        }
        for (let it of keyArrayUnsearchable) {
                    propValues.push(new StatisticsResponse.Property(it,100,false));
        }

        statsResp.properties = new StatisticsResponse.PropertiesValue(propValues, false, "PARTIAL");
        return statsResp;
    }

    async processSearchForFeatures(event) {
        if (event.limit>20000) {
            event.limit = 20000;
            logger.debug("Set limit to 20000 which is the maximum returned from the API.");
        }
        let urlParams = new URLSearchParams({
            limit: event.limit,
            format: "geojson"
        });
        let url = new URL(baseURL + "query");
        if (event.propertiesQuery) { //propertiesQuery exists
            if (event.propertiesQuery.length > 0) { //propertiesQuery is not empty
                for (let it of event.propertiesQuery) {
                    for (let innerProperties of it) {
                        switch(innerProperties.key){
                            case "magnitude": //minmagnitude maxmagnitude
                                switch (innerProperties.operation) {
                                    case "GREATER_THAN":
                                        urlParams.append("minmagnitude",innerProperties.values[0]);
                                        break;
                                    case "LESS_THAN":
                                        urlParams.append("maxmagnitude",innerProperties.values[0]);
                                        break;
                                    default:
                                        return new ErrorResponse(event.streamId,400,"Operation not supported.");
                                }
                                break;
                            case "time":
                            case "date": //ISO8601 Date/Time format
                                let date = innerProperties.values[0];
                                switch (innerProperties.operation) {
                                    case "GREATER_THAN":
                                        urlParams.append("starttime",date);
                                        break;
                                    case "LESS_THAN":
                                        urlParams.append("endtime",date);
                                        break;
                                    default:
                                        return new ErrorResponse(event.streamId,400,"Operation not supported.");
                                }
                                break;
                            case "significance": //minsig maxsig
                                switch (innerProperties.operation) {
                                    case "GREATER_THAN_OR_EQUALS":
                                        urlParams.append("minsig", innerProperties.values[0]);
                                        break;
                                    case "LESS_THAN_OR_EQUALS":
                                        urlParams.append("maxsig ", innerProperties.values[0]);
                                        break;
                                    default:
                                        return new ErrorResponse(event.streamId, 400, "Operation not supported.");
                                }
                                break;
                            case "depth": //mindepth maxdepth
                                switch (innerProperties.operation) {
                                    case "GREATER_THAN":
                                        urlParams.append("mindepth", innerProperties.values[0]);
                                        break;
                                    case "LOWER_THAN":
                                        urlParams.append("maxdepth", innerProperties.values[0]);
                                        break;
                                    default:
                                        return new ErrorResponse(event.streamId, 400, "Operation not supported");
                                }
                                break;
                            default:
                                return new ErrorResponse(event.streamId, 400, "No searchable key provided!");
                        }
                    }
                }
            }
        } else {
            return new ErrorResponse(event.streamId, 400, "No properties query was provided.");
        }
        url.search = urlParams;
        return this.requestHandler(event, url);
    }

    async processModifySpace(event) {
        return new SuccessResponse();
    }

    async processGetFeaturesByGeometry(event) {
        if (event.lat && event.lon) {
                let params = new URLSearchParams({
                    latitude: event.lat,
                    longitude: event.lon,
                    maxradiuskm: event.radius/1000,  //from meter to km
                    limit: event.limit,
                    format: "geojson"
                });
                let url = new URL(baseURL + "query");
                url.search = params;
                return await this.requestHandler(event, url);
            } else {
            return new ErrorResponse(event.streamId, 400, "No lat or lon provided!");
        }
    }

    async processModifyFeatures(event) {
        return super.processModifyFeatures();
    }

    async processLoadFeatures(event) {
        return super.processLoadFeatures();
    }

    async processDeleteFeaturesByTag(event) {
        return super.processDeleteFeaturesByTag();
    }
}

module.exports = EarthquakeHandler;
