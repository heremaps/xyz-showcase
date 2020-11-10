import json
event_types_to_methods = {
    "HealthCheckEvent": "HealthCheck",
    "GetStatisticsEvent": "GetStatistics",
    "GetFeaturesByIdEvent": "GetFeaturesById",
    "GetFeaturesByBBoxEvent": "GetFeaturesByBBox",
    "GetFeaturesByTileEvent": "GetFeaturesByTile",
    "IterateFeaturesEvent": "IterateFeatures",
    "SearchForFeaturesEvent": "SearchForFeatures",
    "DeleteFeaturesByTagEvent": "DeleteFeaturesByTag",
    "LoadFeaturesEvent": "LoadFeatures",
    "ModifyFeaturesEvent": "ModifyFeatures",
    "ModifySpaceEvent": "ModifySpace",
    "GetFeaturesByGeometryEvent": "GetFeaturesByGeometry"
}


# handles events and distributes it to the corresponding process function
def handle_event(event, context):
    from airqualityHandler import airqualityHandler
    strEventType = event_types_to_methods.get(event["type"]).lower()
    method_to_call = getattr(airqualityHandler, strEventType)
    res = method_to_call(event)
    return json.dumps(res.__dict__)


if __name__ == '__main__':
    print("Nothing to do")
