const XyzResponse = require("./XyzResponse");

class StatisticsResponse extends XyzResponse {

	constructor() {
		super();
		this.bbox = new Value([0, 0, 0, 0]);
		this.byteSize = new Value(65536, true);
		this.count = new Value(0);
		this.geometryTypes = new Value([]);
		this.properties = new PropertiesValue([]);
		this.tags = new Value([]);
	}
}

class Value {

	constructor(value, estimated = false) {
		this.value = value;
		this.estimated = estimated;
	}
}

class PropertiesValue extends Value {

	constructor(value, estimated = false, searchable = "PARTIAL") {
		super(value, estimated);
		this.searchable = searchable;
	}
}

class PropertyInfo {

	constructor(key, count, searchable = false) {
		this.key = key;
		this.count = count;
		this.searchable = searchable;
	}
}

StatisticsResponse.Value = Value;
StatisticsResponse.PropertiesValue = PropertiesValue;
StatisticsResponse.Property = PropertyInfo;

module.exports = StatisticsResponse;