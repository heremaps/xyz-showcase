const XyzResponse = require("./XyzResponse"),
	ErrorResponse = require("./ErrorResponse"),
	HealthStatus = require("./HealthStatus"),
	RelocatedEventReader = require("./RelocatedEventReader"),
	RelocatingResponseWriter = require("./RelocatingResponseWriter"),
	XyzError = require("./XyzError"),
	ErrorResponseException = require("./ErrorResponseException"),
	EVENT_TYPES_TO_METHODS = {
		HealthCheckEvent: "HealthCheck",
		GetStatisticsEvent: "GetStatistics",
		CountFeaturesEvent: "CountFeatures",
		GetFeaturesByIdEvent: "GetFeaturesById",
		GetFeaturesByBBoxEvent: "GetFeaturesByBBox",
		GetFeaturesByTileEvent: "GetFeaturesByTile",
		IterateFeaturesEvent: "IterateFeatures",
		SearchForFeaturesEvent: "SearchForFeatures",
		DeleteFeaturesByTagEvent: "DeleteFeaturesByTag",
		LoadFeaturesEvent: "LoadFeatures",
		ModifyFeaturesEvent: "ModifyFeatures",
		ModifySpaceEvent: "ModifySpace",
		GetFeaturesByGeometryEvent: "GetFeaturesByGeometry"
	};


class StorageEventHandler {

	constructor(relocationS3Bucket) {
		this.streamId = null;
		this.eventReader = new RelocatedEventReader(relocationS3Bucket);
		this.responseWriter = new RelocatingResponseWriter(relocationS3Bucket);
	}

	/**
	 *
	 * @param {Event} event
	 * @return {Promise<XyzResponse>}
	 */
	async handleEvent(event) {
		try {
			event = await this.eventReader.readEvent(event);
			this.streamId = event.streamId;
			let ifNoneMatch = event.ifNoneMatch;

			if (!(event.type in EVENT_TYPES_TO_METHODS)) {
				console.error("Unsupported event type: " + event.type);
				return this.processUnimplementedEventType(event);
			}

			await this.initialize(event);

			let response = await this.processEvent(event);
			if (response == null)
				throw new Error("Response is null");

			return this.responseWriter.writeResponse(response);
		}
		catch(e) {
			console.error(e);
			if (e instanceof ErrorResponseException) {
				e.errorResponse.streamId = e.errorResponse.streamId || this.streamId;
				return e.errorResponse;
			}
			else
				return new ErrorResponse(this.streamId, XyzError.EXCEPTION, "Error while handling storage event: " + e.message || e);
		}
	}

	async processEvent(event) {
		try {
			return await this[StorageEventHandler.toProcessingMethodName(event.type)](event);
		}
		catch(e) {
			console.error(e);
			if (e instanceof ErrorResponseException) {
				e.errorResponse.streamId = e.errorResponse.streamId || this.streamId;
				return e.errorResponse;
			}
			else
				return new ErrorResponse(this.streamId, XyzError.EXCEPTION, "Error while processing storage event: " + e.message || e);
		}
	}

	async processUnimplementedEventType(event) {
		return new ErrorResponse(this.streamId, XyzError.NOT_IMPLEMENTED, event.type + " is not supported by the storage" +
			" connector.");
	}

	async processHealthCheck(event) {
		await this._wait(event.minResponseTime);
		return new HealthStatus();
	}
	async processGetStatistics(event) { return this.processUnimplementedEventType(event); }
	async processGetFeaturesById(event) { return this.processUnimplementedEventType(event); }
	async processGetFeaturesByBBox(event) { return this.processUnimplementedEventType(event); }
	async processGetFeaturesByTile(event) { return this.processUnimplementedEventType(event); }
	async processIterateFeatures(event) { return this.processUnimplementedEventType(event); }
	async processSearchForFeatures(event) { return this.processUnimplementedEventType(event); }
	async processDeleteFeaturesByTag(event) { return this.processUnimplementedEventType(event); }
	async processLoadFeatures(event) { return this.processUnimplementedEventType(event); }
	async processModifyFeatures(event) { return this.processUnimplementedEventType(event); }
	async processModifySpace(event) { return this.processUnimplementedEventType(event); }
	async processGetFeaturesByGeometry(event) { return this.processUnimplementedEventType(event); }
	/**
	 * @deprecated
	 */
	async processCountFeatures(event) { return this.processUnimplementedEventType(event); }

	/**
	 * Can be used to initially setup the event handler. Will be called for each incoming event and may be overridden in sub-classes.
	 *
	 * @param event the event.
	 * @return void
	 * @throws Exception an exception if any error occurred (will return an error).
	 */
	async initialize(event) {}

	async _wait(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	static toProcessingMethodName(eventType) {
		return "process" + EVENT_TYPES_TO_METHODS[eventType];
	}

}

module.exports = StorageEventHandler;
