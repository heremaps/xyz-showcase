import {LambdaEvent} from "./LambdaEvents";

export class WfsURL {
    event: LambdaEvent;
    baseUrl: string;
    requestURL: string;
    version?: string;
    requestType: string;
    limit?: number;
    typeName: string;
    bbox?: [number, number, number, number];
    selection?: string[];

    constructor(event, requestType) {
        this.event = event;
        this.requestType = requestType;
        this.requestURL = this.composeURL();
    }

    //WFS 1.0.0 and 1.1.0 services use the OGC OpenGIS Filter Encoding Implementation Specification (FE) version 1.1.
    //WFS 2.0 uses version 2.0 of the filter specification. CQL???

    composeURL() {

        //TODO: save parameters in array and join only at the end to speed up performance

        let urlString: string = "";

        //check if request exists on wfs
        if (!requestTypes.includes(this.requestType.toLowerCase())) {
            throw new Error("Request type not available!");
        }

        //if baseUrl does not end with ? append it
        if (this.event.params.url.slice(-1) != "?") {
            urlString+=this.event.params.url+"?service=wfs&version="
        } else {
            urlString+= this.event.params.url+"service=wfs&version=";
        }

        //if no version is provided, use 2.0.0
        if (!this.event.params.version) {
            this.event.params.version = "2.0.0";
            urlString+= this.event.params.version+"&request="+this.requestType;
        } else {
            urlString+= this.event.params.version+"&request="+this.requestType;
        }

        //if limit is provided, append maxFeatures
        //version 2.0.0: count
        //< version 2.0.0: maxFeatures
        //TODO: CHECK Y limit not appended
        if (this.event.limit) {
            this.event.params.version === "2.0.0" ? urlString += "&count="+this.event.limit : urlString += "&maxFeatures="+this.event.limit;
        }

        //if handle is provided, append startIndex (handle * limit)
        if (this.event.handle) {urlString += "&startindex="+this.event.handle*this.event.limit}

        //if typeName is provided, add to WfsUrl
        //version 2.0.0: typeNames
        //< 2.0.0: typeName
        if (this.event.params.typeName) {
            this.event.params.version === "2.0.0" ? urlString += "&typeNames=" : urlString += "&typeName=";
            urlString += this.event.params.typeName;
        }

        //if srsName is provided, add to WfsURL
        if (this.event.params.WGS84) {urlString += "&srsname=EPSG:4326"}

        //if outputFormat is provided, add to WfsURL otherwise use json
        if (this.event.params.outputFormatJSON && this.requestType !== "DescribeFeatureType") {urlString += "&outputformat=application/json"}

        //if bbox is provided, append bboxString to WfsURL
        if (this.event.bbox) {
            if (this.event.params.WGS84) {
                urlString += "&bbox="+this.event.bbox[1].toString()+","+this.event.bbox[0].toString()+"," +
                    this.event.bbox[3].toString()+","+ this.event.bbox[2].toString()+",urn:ogc:def:crs:EPSG::4326"
            } else {
                    urlString += "&bbox="+this.event.bbox[0].toString()+","+this.event.bbox[1].toString()+"," +
                        this.event.bbox[2].toString()+","+ this.event.bbox[3].toString();
                }
        }

        //calculate meters to degrees since units are ignored and degrees are used for dwithin query
        if (this.event.lat && this.event.lon && this.event.radius) {
            //radius input to degrees
            let earth = 6378.137,  //radius of the earth in kilometer
                pi = Math.PI,
                m = (1 / ((2 * pi / 360) * earth)) / 1000;  //1 meter in degree
            let degRadius = this.event.radius * m;
            urlString += "&cql_filter=DWithin(the_geom,POINT("+this.event.lat.toString()+" "+this.event.lon.toString()+"),"+degRadius.toString()+",meters)";
        }

        //TODO: handle multiple conditions, AND | OR
        if (this.event.propertySearch) {
            let propertyString = "&cql_filter=";
            for (let it of this.event.propertySearch) {
                for (let es of it) {
                    propertyString+=es.key;
                    switch (es.operation) {
                        case "EQUALS":
                            propertyString+= "="+es.values;
                            break;
                        case "GREATER_THAN":
                            propertyString+= ">"+es.values;
                            break;
                        case "LESS_THAN":
                            propertyString+= "<"+es.values;
                            break;
                        case "NOT_EQUALS":
                            propertyString+= "!="+es.values;
                            break;
                        case "GREATER_THAN_OR_EQUALS":
                            propertyString+= ">="+es.values;
                            break;
                        case "LESS_THAN_OR_EQUALS":
                            propertyString+= "<="+es.values;
                            break;
                            }
                }
            }
            urlString+=propertyString;
        }

        if (this.event.ids) {
            urlString+="&featureId="+this.event.ids[0];
            if (this.event.ids.length > 1) {
                this.event.ids.shift();
                for (let it of this.event.ids) {
                    urlString += "," + it
                }
            }
        }

        if (this.event.selection) {
            urlString+="&propertyName=";
            this.event.selection.forEach( it => {
                if (it.slice(0,11) === "properties.") {
                    urlString+=it.slice(11)+","
                } else {
                    urlString += it + ",";
                }
            });
            urlString+="the_geom";
        }

        return urlString;
    };
}

let requestTypes = ["getfeature","getcapabilities", "describefeaturetype"],
    versionList = ["2.0.0","1.1.0","1.0.0"];
