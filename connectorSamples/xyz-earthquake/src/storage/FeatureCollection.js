const XyzResponse = require("./XyzResponse");

class FeatureCollection extends XyzResponse {

	constructor(features = []) {
		super();
		this.features = features;
	}

  setEtag(etag) {
    this.etag = etag;
  }

  setHandle(handle) {
		this.handle = handle;
	}
}

module.exports = FeatureCollection;
