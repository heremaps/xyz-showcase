const XyzResponse = require("./XyzResponse");

class HealthStatus extends XyzResponse {

	constructor() {
		super();
		this.status = "OK";
	}
}

module.exports = HealthStatus;