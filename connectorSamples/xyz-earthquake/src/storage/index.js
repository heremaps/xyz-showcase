const YourEventHandler = require("../EarthquakeHandler"),
    S3_BUCKET = process.env.S3_BUCKET; //The event relocation bucket (owned by the XYZ Hub)

module.exports = {
    handler: function (event, context, callback) {
        let storageEventHandler = new YourEventHandler(S3_BUCKET);
        storageEventHandler.handleEvent(event)
            .then(
                response => {
                    callback(null, response);
                },
                error => {
                    callback(error);
                });
    }
};
