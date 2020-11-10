class Feature:
    def __init__(self, featureType):
        self.type = "Feature"
        self.geometry = {
            "type": featureType,
            "coordinates": []
        }
        self.properties = {
            "@ns:com:here:xyz": {
                "space": None,
                "updatedAt": None,
                "tags": []
            }
        }

