class XyzResponse:
    def __init__(self, responseType):
        self.type = responseType


class SuccessResponse(XyzResponse):
    def __init__(self, status):
        super().__init__("SuccessResponse")
        self.status = status


class ErrorResponse(XyzResponse):
    def __init__(self, streamId=None, error=None, errorMessage=None):
        super().__init__("ErrorResponse")
        self.error = error
        self.errorMessage = errorMessage
        self.streamId = streamId


class FeatureCollection(XyzResponse):
    def __init__(self, features, etag=None, handle=None):
        super().__init__("FeatureCollection")
        self.features = features
        if etag:
            self.etag = etag
        if handle:
            self.handle = handle


class StatisticsResponse(XyzResponse):
    def __init__(self, bboxValue, byteSizeValue, countValue, geometryTypes, propertiesArray):
        super().__init__("StatisticsResponse")
        self.bbox = {"value": bboxValue, "estimated": False}
        self.byteSize = {"value": byteSizeValue, "estimated": False}
        self.count = {"value": countValue, "estimated": False}
        self.geometryTypes = {"value": geometryTypes, "estimated": False}
        self.properties = {
            "value": propertiesArray,
            "estimated": False,
            "searchable": "PARTIAL"
        }
        self.tags = {
            "value": [],
            "estimated": False
        }

    def add_tags(self, key, count):
        self.tags["value"].append({
            "key": key,
            "count": count
        })
