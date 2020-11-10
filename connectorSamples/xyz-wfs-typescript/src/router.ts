import {Adapter} from "./Adapter";
import {LambdaContext} from "./interfaces/LambdaContext";
import {
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

const logger = winston;


/**
 * This is the lambda handler function.
 *
 * @param {*} event
 * @param {*} context
 * @param {*} callback
 */
export async function execute(event: HealthCheckEvent, context: LambdaContext, callback: LambdaCallback) {
    if( context ) context.callbackWaitsForEmptyEventLoop = false;
    logger.level = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : 'info';
    logger.debug("event = " + event.type );
    logger.debug( JSON.stringify(event) );
    const adapter = new Adapter(event);
    if(adapter.dataProvider) {
        switch (event.type) {
            case "HealthCheckEvent":
                const result = await adapter.healthCheck(event);
                callback(undefined, result);
                break;
            case "GetStatisticsEvent":
                await adapter.getStatistics(event as GetStatisticsEvent, callback);
                break;
            case "GetFeaturesByIdEvent":
                await adapter.queryFeaturesById(event as GetFeaturesByIdEvent, callback);
                break;
            case "SearchForFeaturesEvent":
                await adapter.searchFeatures(event as SearchForFeaturesEvent, callback);
                break;
            case "IterateFeaturesEvent":
                await adapter.iterateFeatures(event as IterateFeaturesEvent, callback);
                break;
            case "GetFeaturesByBBoxEvent":
                 await adapter.queryFeaturesByBbox(event as GetFeaturesByBBoxEvent, callback);
                break;
            case "GetFeaturesByTileEvent":
                await adapter.queryFeaturesByTile(event as GetFeaturesByTileEvent, callback);
                break;
            case "LoadFeaturesEvent":
                await adapter.loadFeatures(event as LoadFeaturesEvent, callback);
                break;
            case "ModifyFeaturesEvent":
                await adapter.modifyFeatures(event as ModifyFeaturesEvent, callback);
                break;
            case "DeleteFeaturesByTagEvent":
                await adapter.deleteFeaturesByTag(event as DeleteFeaturesByTagEvent, callback);
                break;
            case "ModifySpaceEvent":
                await adapter.modifySpace(event as ModifySpaceEvent, callback);
                break;
            case "GetFeaturesByGeometryEvent":
                await adapter.getFeaturesByGeometry(event as GetFeaturesByGeometryEvent, callback);
                break;
            default:
                callback(new Error(`Unknown or unimplemented event type ${event.type}`));
        }
    }
    else callback(new Error("Configuration error"));
}
