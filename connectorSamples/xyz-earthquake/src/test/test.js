let testDefinitions = require("./tests.json"),
    handler = require("../storage").handler;

testDefinitions.forEach(td => {
    //change off property in tests.json to control which tests should run
    if (!td.off) {
        handler(td.event, {}, function (err, result) {
            if (err) {
                console.error(err);
                process.exit(1);
            }
            console.log("Result for " + td.description + " :", JSON.stringify(result, null, "\t"));

            let validationResult = [];
            for (let k in td.expectedResult) {
                if (td.expectedResult[k] != result[k]) {
                    validationResult.push((k + ": " + td.expectedResult[k] + " != " + result[k]));
                }
            }

            if (validationResult.length > 0) {
                console.error("Validation Errors in " + td.description + " (StreamId: " + td.event.streamId + ")");
                for (let vr of validationResult) {
                    console.error(vr);
                }
                process.exit(2);
            }
        });
    }
});
