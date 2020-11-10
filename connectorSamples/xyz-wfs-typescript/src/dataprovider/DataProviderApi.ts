import {
    DeleteFeaturesByTagEvent,
    GetFeaturesByBBoxEvent,
    GetFeaturesByGeometryEvent,
    GetFeaturesByIdEvent,
    GetStatisticsEvent,
    IterateFeaturesEvent,
    ModifyFeaturesEvent,
    ModifySpaceEvent,
    SearchForFeaturesEvent
} from "../interfaces/LambdaEvents";
import {XyzResponse} from "../interfaces/XyzResponse";

export interface DataProviderApi {

    getFeaturesById(event: GetFeaturesByIdEvent) :Promise<XyzResponse>
    getFeaturesByBBox(event: GetFeaturesByBBoxEvent) :Promise<XyzResponse>
    getFeaturesByGeometry(event: GetFeaturesByGeometryEvent) :Promise<XyzResponse>
    searchForFeatures(event: SearchForFeaturesEvent) :Promise<XyzResponse>
    iterateFeatures(event: IterateFeaturesEvent) :Promise<XyzResponse>
    modifyFeatures(event: ModifyFeaturesEvent) :Promise<XyzResponse>
    modifySpace(event: ModifySpaceEvent) :Promise<XyzResponse>
    getStatistics(event: GetStatisticsEvent) :Promise<XyzResponse>
    deleteFeatures(event: DeleteFeaturesByTagEvent) :Promise<XyzResponse>
}
