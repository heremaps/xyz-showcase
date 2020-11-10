const ErrorResponse = require("./ErrorResponse"),
  XyzError = require("./XyzError");

class ErrorResponseException extends Error {

  /**
   *
   * @param {string|Error} messageOrCause
   * @param {XyzError} code = XyzError.EXCEPTION
   * @param {string} streamId = null
   */
  constructor(messageOrCause, code = XyzError.EXCEPTION, streamId = null) {
    if (messageOrCause instanceof Error)
      messageOrCause = messageOrCause.message;
    super(messageOrCause);
    this.errorResponse = new ErrorResponse(streamId, code, messageOrCause);
  }

}

module.exports = ErrorResponseException;