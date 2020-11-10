/**
 * An enumeration of all possible error codes that can happen while processing a request. Be aware that the XYZ Hub itself will respond
 * already with an HTTP status code
 */
module.exports = {
	/**
	 * An unexpected error (not further specified) happened while processing the request. Details will be found in the
	 * {@link ErrorResponse#errorMessage()}.
	 *
	 * This can result in a 502 Bad Gateway.
	 */
	EXCEPTION: "Exception",

	/**
	 * An event that was sent to a remote function which is required to process the request failed, because it does not support this event.
	 * Details may be found in the {@link ErrorResponse#errorMessage()}.
	 *
	 * This will result in an 501 Not Implemented response.
	 */
	NOT_IMPLEMENTED: "NotImplemented",

	/**
	 * A conflict occurred when updating a feature.
	 *
	 * This will result in an 409 Conflict response.
	 */
	CONFLICT: "Conflict",

	/**
	 * Indicates an authorization error.
	 *
	 * This will result in an 403 Forbidden response.
	 */
	FORBIDDEN: "Forbidden",

	/**
	 * The connector cannot handle the request due to a processing limitation in an upstream service or a database.
	 *
	 * This will result in an 429 Too Many Requests response.
	 */
	TOO_MANY_REQUESTS: "TooManyRequests",

	/**
	 * A provided argument is invalid or missing.
	 *
	 * This will lead to a HTTP 400 Bad Request response.
	 */
	ILLEGAL_ARGUMENT: "IllegalArgument",

	/**
	 * Any service or remote function required to process the request was not reachable. Details about which remote function failed will be
	 * found in the {@link ErrorResponse#errorMessage()}.
	 *
	 * This will lead to a HTTP 502 Bad Gateway response.
	 */
	BAD_GATEWAY: "BadGateway",

	/**
	 * The request was aborted due to a timeout.
	 *
	 * This will lead to a HTTP 504 Gateway Timeout response.
	 */
	TIMEOUT: "Timeout"
}