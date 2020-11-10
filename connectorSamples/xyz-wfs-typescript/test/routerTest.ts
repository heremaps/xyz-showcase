import "mocha";
import * as chai from "chai";
import chaiAsPromised from "chai-as-promised";
import * as healthCheckEvent from "./testdata/geospace_events/HealthCheckEvent.json";
import * as healthCheckEventNoParams from "./testdata/geospace_events/HealthCheckEventNoParams.json";
import * as getFeaturesByIdEvent from "./testdata/geospace_events/GetFeaturesByIdEvent.json";
import * as getStatisticsEvent from "./testdata/geospace_events/GetStatisticsEvent.json";
import * as getFeaturesByBBoxEvent from "./testdata/geospace_events/GetFeaturesByBBoxEvent.json";
import * as getFeaturesByTileEvent from "./testdata/geospace_events/GetFeaturesByTileEvent.json";
import * as iterateFeaturesEvent from "./testdata/geospace_events/IterateFeaturesEvent.json";
import * as searchForFeaturesEvent from "./testdata/geospace_events/SearchForFeaturesEvent.json";
import * as getFeaturesByGeometryEvent from "./testdata/geospace_events/GetFeaturesByGeometryEvent.json";
import * as manyEvents from "./testdata/sampleWFS.json";
import * as router from "../src/router";
import {RelocationEvent} from "../src/interfaces/RelocationEvent";
import * as zlib from 'zlib';
import * as AWS from "aws-sdk";
import {GetObjectOutput, GetObjectRequest} from "aws-sdk/clients/s3";
import {
    GetFeaturesByBBoxEvent,
    GetFeaturesByGeometryEvent,
    GetStatisticsEvent,
    LambdaEvent
} from "../src/interfaces/LambdaEvents";
import {FeatureCollection, StatisticsResponse} from "../src/interfaces/XyzResponse";


process.env.S3_BUCKET = 'someBucket';
process.env.LOG_LEVEL = 'debug';
chai.use(chaiAsPromised);

let errorObject :Error;
let response :FeatureCollection;
function responseHandler(err, featureCollection) {
    errorObject = err;
    response = featureCollection;
}

async function responseProcessor(featureCollection) {
    try {
        if (featureCollection.hasOwnProperty('type') && featureCollection.type === 'RelocatedEvent') {
            console.log('Test received RelocatedEvent');
            const relocation = featureCollection as RelocationEvent;

            const s3service = new AWS.S3();
            const params :GetObjectRequest = {
                Bucket: process.env.S3_BUCKET,
                Key: 'tmp/' + relocation.location
            };
            await s3service.getObject(params).promise().then((response :GetObjectOutput) => {
                console.log("Downloaded result from ", params.Bucket + "/" + params.Key);
                return response.Body
            }).then((body :Uint8Array) => {
                console.log("unzipping");
                featureCollection = zlib.gunzipSync(new Buffer(body)).toString('binary');
            }).catch(err => {
                console.error("An error occurred", err);
            });

            if (typeof featureCollection == 'string' && featureCollection.length > 0) {
                console.log(featureCollection.substr(0, 500) + ' [...]');
            } else {
                console.log('Missing featureCollection')
            }
            response = JSON.parse(featureCollection);
        }
        else {
            if ( featureCollection && featureCollection.hasOwnProperty('features') && featureCollection.features.length > 0) {
                console.log(JSON.stringify(featureCollection).substr(0, 500) + ' [...]');
            } else if (featureCollection && featureCollection.type === "StatisticsResponse") {
                console.log(JSON.stringify(featureCollection));
            } else {
                console.log('Empty or undefined featureCollection')
            }
            response = featureCollection;
        }
    }
    catch (ex) {
        console.log(`Exception ${ex}`);
    }
}

describe('ALL', function(){
    this.timeout(15000);

    it('HealthCheckEvent (predeploy)', async function(){
        const event :any = healthCheckEvent;
        await router.execute(event, undefined, responseHandler);
        console.log(JSON.stringify(response));
        chai.expect((response as any).status).equals("OK");
    });
    it('HealthCheckEventNoParams (predeploy)', async function(){
        await router.execute(healthCheckEventNoParams as any, undefined, responseHandler);
        console.log(JSON.stringify(response));
        chai.expect(response["status"]).equals("ERROR");
    });
    it('GetFeaturesByIdEvent', async function(){
        const event :any= getFeaturesByIdEvent;
        await router.execute(event,undefined, responseHandler);
        chai.expect(errorObject, 'Error not undefined').to.be.undefined;
        await responseProcessor(response);
        chai.expect(response, 'No featureCollection').to.exist;
        chai.expect(response.features, 'No features').to.exist;
    });
    it('GetFeaturesByBBoxEvent', async function(){
        const event :GetFeaturesByBBoxEvent= getFeaturesByBBoxEvent;
        await router.execute(event,undefined, responseHandler);
        await responseProcessor(response as FeatureCollection);
        chai.expect(response.type, "Undefined FeatureCollection").equals("FeatureCollection");
        for (let it of response.features) {
            chai.expect(it.properties["@ns:com:here:xyz"], "No here namespace in feature!").to.exist;
            chai.expect(it.geometry)
        }
        chai.expect(response.features.length <= event.limit, "Features length exceeds event.limit!").to.be.true;
    });
    it('GetFeaturesByGeometryEvent', async function(){
        const event :GetFeaturesByGeometryEvent= getFeaturesByGeometryEvent;
        await router.execute(event,undefined, responseHandler);
        await responseProcessor(response as FeatureCollection);
        chai.expect(response.type, "Undefined FeatureCollection").equals("FeatureCollection");
        chai.expect(response.features.length <= event.limit, "Features length exceeds event.limit!").to.be.true;
    });
    it('GetFeaturesByTileEvent', async function(){
        const event :any= getFeaturesByTileEvent;
        await router.execute(event,undefined, responseHandler);
        chai.expect(errorObject, 'Error not undefined').to.be.undefined;
        await responseProcessor(response);
        chai.expect(response.features.length > 0, 'Not an empty FC').to.be.true;
    });
    it('SearchForFeaturesEvent', async function(){
        const event :any= searchForFeaturesEvent;
        console.log(event);
        await router.execute(event,undefined, responseHandler);
        await responseProcessor(response as FeatureCollection);
        chai.expect(response.type, 'No FeatureCollection').equals("FeatureCollection");
    });
    it('IterateFeaturesEvent', async function(){
        const event :any= iterateFeaturesEvent;
        await router.execute(event,undefined, responseHandler);
        chai.expect(errorObject, 'Error not undefined').to.be.undefined;
        await responseProcessor(response);
        chai.expect(response, 'No featureCollection').to.exist;
        chai.expect(response.errorMessage, 'featureCollection.errorMessage not empty').to.be.undefined;
    });
    it('GetStatisticsEvent', async function(){
        const event :GetStatisticsEvent= getStatisticsEvent;
        await router.execute(event,undefined, responseHandler);
        await responseProcessor(response as StatisticsResponse);
        chai.expect(response.type, "Type is not StatisticsResponse!").equals("StatisticsResponse");
        chai.expect(response["count"], "Count is mandatory").to.exist;
        chai.expect(response["byteSize"], "ByteSite is mandatory!").to.exist;
        chai.expect(response["geometryTypes"].value.length > 0, "No geometryType provided!").to.be.true;
    });
    it('Test many', async function(){
        let eventTypes = [getStatisticsEvent, getFeaturesByBBoxEvent, getFeaturesByIdEvent, getFeaturesByTileEvent];
        for (let it = 0; it < manyEvents.length; it++) {
            for (let eT of eventTypes) {
                eT.params = manyEvents[it];
                if (eT.type === "GetFeaturesByIdEvent") {
                    eT["ids"] = [eT.params.typeName + ".1"];
                }
                await router.execute(eT as LambdaEvent,undefined, responseHandler);
                await responseProcessor(response);
                if (eT["limit"] && response.features) {
                    chai.expect(response.features.length <= eT["limit"], "More features than requested!").to.be.true;
                }
            }
        }
    });
});

