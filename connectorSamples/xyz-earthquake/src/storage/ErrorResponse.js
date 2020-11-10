const XyzResponse = require("./XyzResponse");

class ErrorResponse extends XyzResponse {

	/**
	 *
	 * @param {string} streamId
	 * @param {XyzError} code
	 * @param {string} message
	 */
	constructor(streamId, code, message) {
		super();
		this.streamId = streamId;
		this.error = code;
		this.errorMessage = message;
	}
}

module.exports = ErrorResponse;