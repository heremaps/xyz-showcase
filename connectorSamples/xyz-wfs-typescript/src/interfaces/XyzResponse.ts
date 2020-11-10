import {Feature} from "geojson";

export class XyzResponse {
    type: string;
    features?: Feature[];
    errorMessage?: string;
    constructor() {
        this.type = this.constructor.name
    }
}

export class SuccessResponse extends XyzResponse{
    status: string;
    constructor() {
        super();
        this.status = "OK";
    }
}

export class ErrorResponse extends XyzResponse {
    streamId: string;
    error: number;
    errorMessage: string;
    constructor(streamId, code, message) {
        super();
        this.streamId = streamId;
        this.error = code;
        this.errorMessage = message;
    }
}

export class HealthResponse extends SuccessResponse {
    constructor(status) {
        super();
        this.status = status;
        this.type = "HealthStatus";
    }
}

export class FeatureCollection extends XyzResponse{
    type: string = "FeatureCollection";
    features?: any[];
    etag?: string;
    handle?: any;

    constructor(features = []) {
        super();
        this.features = features;
    }
}

export interface StatisticValue {
    value: number | string | string[] | number[] | object[]
    estimated?: boolean
    searchable?: string
}

export interface TagValue {
    value: object[],
    estimated?: boolean
}

export interface GeometryValue {
    value: string[],
    estimated: boolean
}

export class StatisticsResponse extends FeatureCollection {
    type: string;
    count: StatisticValue;
    byteSize: StatisticValue;
    bbox: StatisticValue;
    geometryTypes: GeometryValue;
    properties: StatisticValue;
    tags: TagValue;
}

export const emptyStatisticsResponse :StatisticsResponse = {
    type: "StatisticsResponse",
    count: {
        "value": 0,
        "estimated": true
    },
    byteSize: {
        "value": 0,
        "estimated": true
    },
    bbox: {
        "value": [],
        "estimated": true
    },
    geometryTypes: {
        "value": [],
        "estimated": true
    },
    properties: {
        "value": [],
        "estimated": true,
        "searchable": "PARTIAL"
    },
    tags: {
        "value": []
    }
};
