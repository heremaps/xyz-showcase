import {
    ConfigParams,
    DeleteFeaturesByTagEvent,
    GetFeaturesByBBoxEvent,
    GetFeaturesByGeometryEvent,
    GetFeaturesByIdEvent,
    GetFeaturesByTileEvent,
    GetStatisticsEvent,
    HealthCheckEvent,
    IterateFeaturesEvent,
    LoadFeaturesEvent,
    ModifyFeaturesEvent,
    ModifySpaceEvent,
    SearchForFeaturesEvent
} from "./interfaces/LambdaEvents";
import {LambdaCallback} from "./interfaces/LambdaCallback";
import * as winston from "winston";
import {RelocationEvent} from "./interfaces/RelocationEvent";
import {DataProviderApi} from "./dataprovider/DataProviderApi";
import {WfsDataProvider} from "./dataprovider/wfs/WfsDataProvider";
import {PutObjectRequest} from "aws-sdk/clients/s3";
import * as zlib from "zlib";
import * as AWS from "aws-sdk";
import {ErrorResponse, FeatureCollection, HealthResponse, XyzResponse} from "./interfaces/XyzResponse";

const logger = winston;

interface EventCallbackResponse {
    error? :Error,
    result? :XyzResponse|RelocationEvent
}

export class Adapter {
    static NAMESPACE = "@ns:com:here:xyz";

    config: ConfigParams;
    dataProvider: DataProviderApi;

    constructor(event: HealthCheckEvent) {
        if (event.params) {
            this.config = event.params;
        }
        else {
            logger.warn('No params in event');
            this.config = {
                url: "",
                typeName: "",
                outputFormatJSON: true,
                version: ""
            };
        }

        this.dataProvider = new WfsDataProvider();
    }

    async healthCheck(event: HealthCheckEvent) {
            if(event.params) {
                return new HealthResponse("OK");
            } else {
                logger.debug("No event params provided!");
                return new HealthResponse("ERROR");
            }
    }

    async modifyFeatures(event :ModifyFeaturesEvent, eventCallback :LambdaCallback) {
        eventCallback(undefined, new ErrorResponse(event.streamId, 400, "Modify Features is not supported by this Connector."));
    }

    async queryFeaturesById(event :GetFeaturesByIdEvent, eventCallback :LambdaCallback) {
        logger.debug("requested get features by id");
        eventCallback(undefined, await this.dataProvider.getFeaturesById(event));
    }

    async queryFeaturesByBbox(event :GetFeaturesByBBoxEvent, eventCallback :LambdaCallback) {
        if(!event.bbox) {
            logger.debug('Missing mandatory "bbox" property in '+ event.type +".");
            eventCallback(undefined, new ErrorResponse(event.streamId, 500, "No bbox provided!"));
        } else {
            let result = await this.dataProvider.getFeaturesByBBox(event);
            if(result == undefined) {
                eventCallback(undefined, new ErrorResponse(event.streamId, 400, "Undefined response from WFS Connector."));
            } else {
                this.handleResponse(eventCallback, result);
            }
        }
    }

    async queryFeaturesByTile(event: GetFeaturesByTileEvent, eventCallback: LambdaCallback) {
        logger.debug("requested quadKey = " + event.quadKey);
        return await this.queryFeaturesByBbox(event, eventCallback);
    }

    async searchFeatures(event: SearchForFeaturesEvent, eventCallback: LambdaCallback) {
        logger.debug("requested search for features");
        eventCallback(undefined, await this.dataProvider.searchForFeatures(event));
    }

    async loadFeatures(event: LoadFeaturesEvent, eventCallback: LambdaCallback) {
        logger.debug("requested load features");
        eventCallback(undefined, new ErrorResponse(event.streamId, 400, "LoadFeatureEvent is not supported by this connector"));
    }

    async iterateFeatures(event: IterateFeaturesEvent, eventCallback: LambdaCallback) {
        logger.debug("requested handle = " + event.handle);
        eventCallback(undefined, await this.dataProvider.iterateFeatures(event));
    }

    async deleteFeaturesByTag(event: DeleteFeaturesByTagEvent, eventCallback: LambdaCallback) {
        logger.debug("requested delete features");
        eventCallback(undefined, new ErrorResponse(event.streamId, 400, "DeleteFeatures is not supported by this connector"));
    }

    async modifySpace(event: ModifySpaceEvent, eventCallback: LambdaCallback){
        logger.debug("requested modification of space " + JSON.stringify(event.space));
        let result = await this.dataProvider.modifySpace(event);
        if(result == undefined) result = new ErrorResponse(event.streamId, 400, "Undefined result for ModifySpaceEvent");
        eventCallback(undefined, result);
    }

    async handleResponse(eventCallback: LambdaCallback, featureCollection :FeatureCollection) {
        let result :FeatureCollection|RelocationEvent = featureCollection;
        let error :Error = undefined;
        const geoJsonStr = JSON.stringify(result);
        const geoJsonStrSizeMB = geoJsonStr.length / 1048576;
        logger.debug(`geoJson size is ${geoJsonStrSizeMB} MiB`);

        if(geoJsonStrSizeMB >= 6) {
            logger.debug('compressing');
            const gzipped = zlib.gzipSync(geoJsonStr);
            logger.debug(`compressed size is ${gzipped.length / 1048576} MiB`);

            if( process.env.S3_BUCKET ) {
                const s3service = new AWS.S3();
                const key = Math.random().toString(36).slice(2, 28);
                const params :PutObjectRequest = {
                    Bucket: process.env.S3_BUCKET,
                    Key: 'tmp/' + key,
                    Body: gzipped
                };
                let overflowUrl = undefined;
                await s3service.upload(params).promise().then((sendData) => {
                    logger.debug("Uploaded the file at", sendData.Location);
                    overflowUrl = sendData.Location;
                    result = {type: "RelocatedEvent", location: key};
                }).catch(err => {
                    logger.debug("An error occurred", err);
                });
            }
            else {
                const errMsg = "No 'S3_BUCKET' environment variable defined";
                logger.debug(errMsg);
                error = new Error(errMsg);
                result = undefined;
            }
        }
        eventCallback(error, result);
    }

    async getStatistics(event: GetStatisticsEvent, eventCallback: LambdaCallback) {
        logger.debug("Requested Statistics of Space " + JSON.stringify(event.space));
        this.handleResponse(eventCallback, await this.dataProvider.getStatistics(event));
    }

    async getFeaturesByGeometry(event: GetFeaturesByGeometryEvent, eventCallback: LambdaCallback) {
        logger.debug("Request Features by Geometry");
        this.handleResponse(eventCallback, await this.dataProvider.getFeaturesByGeometry(event));
    }

}
