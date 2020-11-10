export interface ConfigParams {
    readonly WGS84?: boolean;
    readonly srsName?: string;
    readonly "url" :string
    readonly "typeName" :string
    readonly "outputFormatJSON" :boolean
    "version"? :string
    readonly "password"? :string
    readonly "username"? :string
    readonly "token"? :string
    readonly "license"? :string
}

export interface HealthCheckEvent {
    readonly "type" :string;
    readonly "streamId":any;
    readonly "params"? :ConfigParams;
}

export type RequestedTags = (string | string[])[];

export interface propertySearchObject {
    readonly key: string;
    readonly operation: string;
    readonly values: string|number[];
}

export interface LambdaEvent extends HealthCheckEvent {
    readonly propertySearch?: [propertySearchObject[]];
    bbox? :number[];
    readonly "tags"? :RequestedTags;
    readonly "space" :string;
    readonly "url"? :string;
    readonly "selection"? :string[];
    readonly "limit"? :number;
    readonly "ids"? : string[];
    readonly "handle"? : number;
    readonly lat? :number
    readonly lon? :number
    readonly radius? :number
}

export interface LoadFeaturesEvent extends LambdaEvent {
    readonly "idsMap" :any;
}

export interface DeleteFeaturesByTagEvent extends LambdaEvent {
}

export interface GetFeaturesByIdEvent extends LambdaEvent {
    readonly "ids" : string[];
}

export interface SearchForFeaturesEvent extends LambdaEvent {
    readonly propertySearch :[propertySearchObject[]];
}

export interface GetFeaturesByGeometryEvent extends LambdaEvent {
    readonly lat :number
    readonly lon :number
    readonly radius :number
}

export interface IterateFeaturesEvent extends LambdaEvent {
}

export interface GetFeaturesByBBoxEvent extends LambdaEvent {
    bbox :number[];
    readonly "clip" :boolean;
    readonly "simplificationLevel" :number;
}

export interface GetFeaturesByTileEvent extends GetFeaturesByBBoxEvent {
    readonly "quadKey" :string;
    readonly "x" :number;
    readonly "y" :number;
    readonly "level" :number;
    readonly "buffer" :number;
}

export interface ModifyFeaturesEvent extends LambdaEvent {
    readonly "insertFeatures" :GeoJSON.Feature[];
    readonly "prefixId" :string;
    readonly "updateFeatures" :GeoJSON.Feature[];
    readonly "deleteFeatures" :any;
    readonly "transaction" :string;
}

export interface GetStatisticsEvent extends LambdaEvent {
}

export interface ModifySpaceEvent extends LambdaEvent {
}

export class Event implements LambdaEvent {
    type: string;
    streamId: string;
    space: string;
    bbox?: number[];
    params: ConfigParams;
    constructor(type, space, streamId, bbox?, config?) {
        this.type = type;
        this.space = space;
        this.streamId = streamId;
        this.bbox = bbox;
        this.params = config;
    }
}
