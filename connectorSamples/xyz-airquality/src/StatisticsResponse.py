class StatisticsResponse:
    def __init__(self, bboxValue, byteSizeValue, countValue, geometryTypes, propertiesArray):
        self.type = "StatisticsResponse"
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

