const aws = require("aws-sdk"),
    zlib = require("zlib"),
    s3 = new aws.S3(),
    RelocatedEvent = require("./RelocatedEvent"),
    MAX_RESPONSE_SIZE = 1 * 1024 * 1024, //Compress and relocate responses larger than 1MB
    S3_PATH = "tmp/";

class RelocatingResponseWriter {

  constructor(relocationBucket) {
    this.relocationBucket = relocationBucket;
  }

  /**
   * In case the response for XYZ Hub is too large it's relocated to S3 by doing the following:
   *  - serialize the response object to a string
   *  - compress the data
   *  - upload the binary content to S3
   *
   * @param {XyzResponse} response The response potentially being too large
   * @return {Promise<RelocatedEvent|XyzResponse>} The RelocatedEvent having been relocated if it was too large or the original response
   */
  async writeResponse(response) {
    let responseBytes = Buffer.from(JSON.stringify(response));
    if (responseBytes.length > MAX_RESPONSE_SIZE) {
      //Gzip the payload
      try {
        responseBytes = zlib.gzipSync(responseBytes);
      }
      catch (e) {
        console.error("Error when trying to compress the relocated response payload:", e);
        throw e;
      }
      let s3Key = S3_PATH + this.uuid(),
          uri = "s3://" + this.relocationBucket + "/" + s3Key;
      //Upload the compressed payload to S3
      try {
        await this.uploadToS3(s3Key, responseBytes);
      }
      catch (e) {
        console.error("Error when trying to upload the relocated response payload to S3:", e);
        throw e;
      }
      response = new RelocatedEvent(response.streamId, uri);
    }
    return response;
  }

  async uploadToS3(key, body) {
    await s3.putObject({
      Bucket: this.relocationBucket,
      Key: key,
      Body: body,
      Metadata: {
        "Content-Length": body.length.toString()
      }
    }).promise();
  }

  uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

}

module.exports = RelocatingResponseWriter;
