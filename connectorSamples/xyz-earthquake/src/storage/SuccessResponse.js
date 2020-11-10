const XyzResponse = require("./XyzResponse");

class SuccessResponse extends XyzResponse {

	constructor() {
		super();
		this.status = "OK";
	}
}

module.exports = SuccessResponse;