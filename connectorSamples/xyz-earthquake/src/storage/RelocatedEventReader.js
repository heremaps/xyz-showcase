const aws = require("aws-sdk"),
    zlib = require("zlib"),
    s3 = new aws.S3();

class RelocatedEventReader {

    constructor(relocationBucket) {
        this.relocationBucket = relocationBucket;
    }

    /**
     * In case the event from XYZ Hub has been relocated to S3 we do the following:
     *  - download the binary content from S3
     *  - decompress the data
     *  - parse it to the object event
     *
     * @param {Event} event The potentially relocated event
     * @param {function(e, Event)} callback
     * @return {Promise<Event>|null} Returns a promise in case no callback was specified, null otherwise
     */
    async readEvent(event, callback) {
        let p = new Promise((resolve, reject) => {
            if (event.type != "RelocatedEvent") {
                resolve(event);
            }
            else {
                s3.getObject({
                    Bucket: this.relocationBucket,
                    Key: "tmp/" + event.location
                }, function(error, response) {
                    if (error) {
                        console.error("Error when trying to fetch relocated event from XYZ Hub:", error);
                        reject(error);
                    }
                    else {
                        try {
                            let evt = JSON.parse(zlib.gunzipSync(response.Body));
                            resolve(evt);
                        }
                        catch(e) {
                            console.error("Error when trying to decompress / parse relocated event data from S3:", e);
                            reject(e);
                            return;
                        }
                    }
                });
            }
        });

        if (callback && typeof callback == "function") {
            p.then((value) => callback(null, value), (reason) => callback(reason));
            return null;
        }
        else
            return p;
    }
}

module.exports = RelocatedEventReader;
