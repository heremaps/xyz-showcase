XYZ Air Quality
-----------------------------------------

This costum connector for DataHub requests free air quality data from OpenAQ (https://openaq.org; Documentation: https://docs.openaq.org/, License: CC-By 4.0).
The data covers 93 countries with more than 12 thousand locations and provides these parameters:

| Parameter | Description |
| ------------ | --------- |
| BC | Black Carbon |
| CO | Carbon Monoxide |
| NO2 | Nitrogen Dioxide |
| O3 | Ozone |
| PM10 | Atmospheric Particles smaller than 10 µm |
| PM2.5 | Atmospheric Particles smaller than 2.5 µm |
| SO2 | Sulfur Dioxide |

### Implemented Methods
- getFeaturesByBBox
- getFeaturesByTile
- getFeaturesByGeometry
- iterateFeatures
- getStatistics
- modifySpace

### GetFeaturesByBBoxEvent
#### Request
```
{
  "type": "GetFeaturesByBBoxEvent",     //The type of the event.
  "space": "foo",                       //The space for which the event was sent.
  "params": {},                         //Parameters for the storage provider, as defined in the space configuration.
  "bbox": [                             //The bounding box:
    9.0,                                //Minimal longitude in decimal degree.
    50.2,                               //Minimal latitude in decimal degree.
    9.8,                                //Maximal longitude in decimal degree.
    50.5                                //Maximal latitude in decimal degree.
  ],
  "limit": 1000                        //The maximal amount of features to be returned.
}
```

#### Response
```
{
    "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature", 
                "geometry": {
                    "type": "Point", 
                    "coordinates": [9.399441, 50.16443]
                }, 
                "properties": {
                    "o3": 61.17, 
                    "unit": "\u00b5g/m\u00b3", 
                    "date": "2020-06-18T00:00:00.000Z", 
                    "country": "DE", 
                    "location": "DEHE026", 
                    "city": "Hessen", 
                    "@ns:com:here:xyz": {
                        "space": "foo", 
                        "updatedAt": 1592474854077, 
                        "tags": ["DEHE026", "DE", "Hessen"]
                    }
                }
            },
            //more features
        ]
}
```

### GetFeaturesByTileEvent
#### Request
#### Response

    
### GetFeaturesByGeometryEvent
#### Request
#### Response

### GetStatisticsEvent
#### Request
```
{
  "type": "GetStatisticsEvent",     // The type of the event.
  "space": "foo",                   // The space for which the event was sent.
  "params": {}
}
```
#### Response
```
{
    "type": "StatisticsResponse", 
    "bbox": {
        "value": [-180.0, -90.0, 180.0, 90.0], 
        "estimated": false
    }, 
    "byteSize": {
        "value": 100, 
        "estimated": false
    }, 
    "count": {
        "value": 100, 
        "estimated": false
    }, 
    "geometryTypes": {
        "value": ["Point"], 
        "estimated": false
    }, 
    "properties": {
        "value": [
            {   
                "key": "bc", 
                "count": 100, 
                "searchable": false
            }, 
            {
                "key": "co", 
                "count": 100, 
                "searchable": false
            }, 
            {
                "key": "no2", 
                "count": 100, 
                "searchable": false
            }, 
            {
                "key": "o3", 
                "count": 100, 
                "searchable": false
            }, 
            {
                "key": "pm10", 
                "count": 100, 
                "searchable": false
            }, 
            {
                "key": "pm25", 
                "count": 100, 
                "searchable": false
            }, 
            {
                "key": "so2", 
                "count": 100, 
                "searchable": false
            }, 
            {
                "key": "city", 
                "count": 100, 
                "searchable": false
            }, 
            {
                "key": "location", 
                "count": 100, 
                "searchable": false
            }, 
            {
                "key": "country", 
                "count": 100, 
                "searchable": false
            }, 
            {
                "key": "unit", 
                "count": 100, 
                "searchable": false
            }, 
            {
                "key": "date", 
                "count": 100, 
                "searchable": false
            }
        ], 
    "estimated": false, 
    "searchable": "PARTIAL"
    }, 
    "tags": {
        "value": [], 
        "estimated": false
    }
}

```

### IterateFeaturesEvent
#### Request
```
{
  "type": "IterateFeaturesEvent",     // The type of the event.
  "space": "foo",                     // The space for which the event was sent.
  "params": {},                       // Parameters for the storage provider, as defined in the space configuration.
  "tags": null,                       // Return features with any tag (same for []).
  "limit": 500,                       // The maximal amount of features to be returned.
  "handle": null,                     // The handle, only needed for a continuation request.
}
```
#### Response
```
{
    "type": "FeatureCollection", 
        "features": [
           {
                "type": "Feature", 
                "geometry": {
                    "type": "Point", 
                    "coordinates": [-72.061125987766, -45.57996447948]
                }, 
                "properties": {
                    "pm25": 81, 
                    "unit": "\u00b5g/m\u00b3", 
                    "date": "2028-08-05T20:00:00.000Z", 
                    "country": "CL", 
                    "location": "Coyhaique", 
                    "city": "Coyhaique", 
                    "@ns:com:here:xyz": {
                        "space": "foo", 
                        "updatedAt": 1592483209695, 
                        "tags": ["Coyhaique", "CL", "Coyhaique"]
                    }
                }
            },
            //more features
        ]
}
```

#####General Information:
- Maximum limit for returned features is 10.000

