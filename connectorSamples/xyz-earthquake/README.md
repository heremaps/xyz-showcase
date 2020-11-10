XYZ USGS Earthquake Connector
-----------------------------------------

![Example in Studio](sample.png)

A nodejs Hub Connector for the USGS Earthquake API (Source: https://earthquake.usgs.gov/fdsnws/event/1/)
* Request Earthquakes for the last 30 days (default)
* Search for Earthquakes with:
    * minimum or maximum magnitude
    * minimum or maximum significance
    * before or after a specific date

-----------------------------------------

#### Supported Events

* GetFeaturesByBBoxEvent
* GetFeaturesByTileEvent
* GetStatisticsEvent
* IterateFeaturesEvent
* ModifySpaceEvent
* SearchForFeaturesEvent
* GetFeaturesByGeometryEvent

### Test it

Change the event attributes at src/tests.json to test different events. 
Run the test script: 
```
node src/test.js
```
#### ModifySpaceEvent
Create a space that is using the USGS connector.
You only need this event if you are using [Data Hub online](https://xyz.here.com/) or [locally](https://github.com/heremaps/xyz-hub).
##### Request
```
{
  "type": "ModifySpaceEvent",                               //The type of the event.
  "space": "foo",                                           //The space for which the event was sent.
  "operation": "CREATE" | "UPDATE" | "DELETE",              //The operation which is about to be done.
  "params": {}
  "spaceDefinition": {                                      //The space definition of the affected space.
    "id": "foo",                                            //The unique identifier of the space.
    "title": "USGS API Test Space",                                     //A human readable title of the space.
    "description": "A space to test the USGS earthquake connector",          //A human readable description of the space and it's content.
    "shared": true | false,                                 //If set to true, every authenticated user can read the features in the space.
    "tags": ["SomeTag", ...],                               //The list of tags to describe this Space.
    "license": "Apache-2.0",                                //A valid SPDC license identifier; See: https://spdx.org/licenses/
    "storage": {                                            //The storage connector configuration.
        "id": "earthquake",                                 //The storage connector id that you, the Data Hub Team or other external contributors defined.
        "params": {
            ...
        }
    }
  }
}
```
##### Response
```
{
	"type": "SuccessResponse",
	"status": "OK"
}
```
#### GetFeaturesByIdEvent
##### Request
```
{
  "type": "GetFeaturesByIdEvent",
  "space": "foo",
  "ids": [
    "us600050vv"
  ]
}
```
##### Response
```
{
	"type": "FeatureCollection",
	"features": [
		{
			"type": "Feature",
			"properties": {
				"place": "107km SSW of Tugu Hilir, Indonesia",
				"time": 1564320766317,
				"tz": 420,
				"url": "https://earthquake.usgs.gov/earthquakes/eventpage/us600050vv",
				"felt": null,
				"cdi": null,
				"mmi": null,
				"alert": null,
				"status": "reviewed",
				"tsunami": 0,
				"net": "us",
				"code": "600050vv",
				"ids": ",us600050vv,",
				"sources": ",us,",
				"types": ",geoserve,origin,phase-data,",
				"nst": null,
				"dmin": 2.547,
				"rms": 0.83,
				"gap": 200,
				"magType": "mb",
				"type": "earthquake",
				"title": "M 4.3 - 107km SSW of Tugu Hilir, Indonesia",
				"products": {
					"geoserve": [
						{
							"indexid": "194178252",
							"indexTime": 1565025239630,
							"id": "urn:usgs-product:us:geoserve:us600050vv:1565025231040",
							"type": "geoserve",
							"code": "us600050vv",
							"source": "us",
							"updateTime": 1565025231040,
							"status": "UPDATE",
							"properties": {
								"eventsource": "us",
								"eventsourcecode": "600050vv",
								"location": "107km SSW of Tugu Hilir, Indonesia",
								"pdl-client-version": "Version 1.14.1 2018-04-26",
								"tsunamiFlag": "false",
								"utcOffset": "420"
							},
							"preferredWeight": 6,
							"contents": {
								"geoserve.json": {
									"contentType": "application/json",
									"lastModified": 1565025237000,
									"length": 7384,
									"url": "https://earthquake.usgs.gov/archive/product/geoserve/us600050vv/us/1565025231040/geoserve.json"
								}
							}
						}
					],
					"origin": [
						{
							"indexid": "198170272",
							"indexTime": 1570825415590,
							"id": "urn:usgs-product:us:origin:us600050vv:1570824765040",
							"type": "origin",
							"code": "us600050vv",
							"source": "us",
							"updateTime": 1570824765040,
							"status": "UPDATE",
							"properties": {
								"azimuthal-gap": "200",
								"depth": "35",
								"depth-type": "operator assigned",
								"error-ellipse-azimuth": "26",
								"error-ellipse-intermediate": "13200",
								"error-ellipse-major": "24600",
								"error-ellipse-minor": "2900",
								"error-ellipse-plunge": "0",
								"error-ellipse-rotation": "87",
								"evaluation-status": "reviewed",
								"event-type": "earthquake",
								"eventParametersPublicID": "quakeml:us.anss.org/eventparameters/600050vv/1570824832",
								"eventsource": "us",
								"eventsourcecode": "600050vv",
								"eventtime": "2019-07-28T13:32:46.317Z",
								"eventtime-error": "1.69",
								"horizontal-error": "11.9",
								"latitude": "-7.6811",
								"latitude-error": "0.1349",
								"longitude": "105.1944",
								"longitude-error": "0.0962",
								"magnitude": "4.3",
								"magnitude-error": "0.201",
								"magnitude-num-stations-used": "7",
								"magnitude-source": "us",
								"magnitude-type": "mb",
								"minimum-distance": "2.547",
								"num-phases-used": "14",
								"origin-source": "us",
								"pdl-client-version": "Version 2.1.1 2019-05-28",
								"quakeml-magnitude-publicid": "quakeml:us.anss.org/magnitude/600050vv/mb",
								"quakeml-origin-publicid": "quakeml:us.anss.org/origin/600050vv",
								"quakeml-publicid": "quakeml:us.anss.org/event/600050vv",
								"review-status": "reviewed",
								"standard-error": "0.83",
								"vertical-error": "1.9"
							},
							"preferredWeight": 156,
							"contents": {
								"contents.xml": {
									"contentType": "application/xml",
									"lastModified": 1570825415000,
									"length": 195,
									"url": "https://earthquake.usgs.gov/archive/product/origin/us600050vv/us/1570824765040/contents.xml"
								},
								"quakeml.xml": {
									"contentType": "application/xml",
									"lastModified": 1570824765000,
									"length": 3713,
									"url": "https://earthquake.usgs.gov/archive/product/origin/us600050vv/us/1570824765040/quakeml.xml"
								}
							}
						}
					],
					"phase-data": [
						{
							"indexid": "198170282",
							"indexTime": 1570825416033,
							"id": "urn:usgs-product:us:phase-data:us600050vv:1570824765040",
							"type": "phase-data",
							"code": "us600050vv",
							"source": "us",
							"updateTime": 1570824765040,
							"status": "UPDATE",
							"properties": {
								"azimuthal-gap": "200",
								"depth": "35",
								"depth-type": "operator assigned",
								"error-ellipse-azimuth": "26",
								"error-ellipse-intermediate": "13200",
								"error-ellipse-major": "24600",
								"error-ellipse-minor": "2900",
								"error-ellipse-plunge": "0",
								"error-ellipse-rotation": "87",
								"evaluation-status": "reviewed",
								"event-type": "earthquake",
								"eventParametersPublicID": "quakeml:us.anss.org/eventparameters/600050vv/1570824832",
								"eventsource": "us",
								"eventsourcecode": "600050vv",
								"eventtime": "2019-07-28T13:32:46.317Z",
								"eventtime-error": "1.69",
								"horizontal-error": "11.9",
								"latitude": "-7.6811",
								"latitude-error": "0.1349",
								"longitude": "105.1944",
								"longitude-error": "0.0962",
								"magnitude": "4.3",
								"magnitude-error": "0.201",
								"magnitude-num-stations-used": "7",
								"magnitude-source": "us",
								"magnitude-type": "mb",
								"minimum-distance": "2.547",
								"num-phases-used": "14",
								"origin-source": "us",
								"pdl-client-version": "Version 2.1.1 2019-05-28",
								"quakeml-magnitude-publicid": "quakeml:us.anss.org/magnitude/600050vv/mb",
								"quakeml-origin-publicid": "quakeml:us.anss.org/origin/600050vv",
								"quakeml-publicid": "quakeml:us.anss.org/event/600050vv",
								"review-status": "reviewed",
								"standard-error": "0.83",
								"vertical-error": "1.9"
							},
							"preferredWeight": 156,
							"contents": {
								"contents.xml": {
									"contentType": "application/xml",
									"lastModified": 1570825415000,
									"length": 195,
									"url": "https://earthquake.usgs.gov/archive/product/phase-data/us600050vv/us/1570824765040/contents.xml"
								},
								"quakeml.xml": {
									"contentType": "application/xml",
									"lastModified": 1570824765000,
									"length": 34949,
									"url": "https://earthquake.usgs.gov/archive/product/phase-data/us600050vv/us/1570824765040/quakeml.xml"
								}
							}
						}
					]
				},
				"depth": 35,
				"magnitude": 4.3,
				"significance": 284,
				"date": "2019-07-28T13:32:46.317Z",
				"@ns:com:here:xyz": {
					"space": "foo",
					"tags": [],
					"updatedAt": 1570824765040
				}
			},
			"geometry": {
				"type": "Point",
				"coordinates": [
					105.1944,
					-7.6811
				]
			},
			"id": "us600050vv"
		}
	]
}
```
#### GetFeaturesByBBoxEvent | GetFeaturesByTileEvent
Request features by bounding box or by tile.
##### Request
```
{
  "type": "GetFeaturesByTileEvent" || "GetFeaturesByBBoxEvent"
  "space": "foo",                       //The space for which the event was sent.
  "bbox": [                             //The bounding box of the tile:
    -67.5,                              //Minimal longitude in decimal degree.
    -67.5,                              //Minimal latitude in decimal degree.
    -45.087890625,                      //Maximal longitude in decimal degree.
    -45.087890625                       //Maximal latitude in decimal degree.
  ], 
  "limit": 1000,                        //The maximal amount of features to be returned.
  "quadkey": "0103"                     //The quadkey as used by Microsoft Bing.
}
```
##### Response
```
{
	"type": "FeatureCollection",
	"features": [
		{
			"type": "Feature",
			"properties": {
				"place": "Scotia Sea",
				"time": 1592418108087,
				"tz": -240,
				"url": "https://earthquake.usgs.gov/earthquakes/eventpage/us6000adn2",
				"detail": "https://earthquake.usgs.gov/fdsnws/event/1/query?eventid=us6000adn2&format=geojson",
				"felt": null,
				"cdi": null,
				"mmi": null,
				"alert": null,
				"status": "reviewed",
				"tsunami": 0,
				"net": "us",
				"code": "6000adn2",
				"ids": ",us6000adn2,",
				"sources": ",us,",
				"types": ",geoserve,origin,phase-data,",
				"nst": null,
				"dmin": 4.789,
				"rms": 0.96,
				"gap": 88,
				"magType": "mb",
				"type": "earthquake",
				"title": "M 4.5 - Scotia Sea",
				"depth": 10,
				"magnitude": 4.5,
				"significance": 312,
				"date": "2020-06-17T18:21:48.087Z",
				"@ns:com:here:xyz": {
					"space": "foo",
					"tags": [],
					"updatedAt": 1593611326040
				}
			},
			"geometry": {
				"type": "Point",
				"coordinates": [
					-58.8981,
					-56.43
				]
			},
			"id": "us6000adn2"
		},
        ...
    ]
}
```
#### IterateFeaturesEvent
Sample request on the whole dataset (e.g. for display in Studio)
##### Request
```
{
  "type": "IterateFeaturesEvent",     // The type of the event.
  "space": "foo",                     // The space for which the event was sent.
  "params": {},                       // Parameters for the storage provider, as defined in the space configuration.
  "tags": null,                       // Return features with any tag (same for []).
  "limit": 100,                       // The maximal amount of features to be returned.
  "handle": null,                     // The handle, only needed for a continuation request.
  "propertiesQuery": [[               // A properties query
    {
      "key":"properties.magnitude",
      "operation": "LESS_THAN",          // EQUALS,NOT_EQUALS,LESS_THAN,GREATER_THAN,LESS_THAN_OR_EQUALS,GREATER_THAN_OR_EQUALS
      "values": [6.0]
    }
  ]],
    "selection": ["magnitude"]
}
```
##### Response
```
{
	"type": "FeatureCollection",
	"features": [
		{
			"type": "Feature",
			"properties": {
				"magnitude": 4.4
			},
			"geometry": {
				"type": "Point",
				"coordinates": [
					106.122,
					-5.746
				]
			},
			"id": "us6000aavx"
		},
        ...
        ]
}
```
### GetStatisticsEvent
Request an overview of the space statistics.
For this connector the StatisticsResponse it is just a static representation of possible properties
##### Request
```
{
  "type": "GetStatisticsEvent",
  "space": "foo"
}
```
#### Response
```
{
	"type": "StatisticsResponse",
	"bbox": {
		"value": [
			-180,
			-90,
			180,
			90
		],
		"estimated": true
	},
	"byteSize": {
		"value": 100,
		"estimated": true
	},
	"count": {
		"value": 100,
		"estimated": true
	},
	"geometryTypes": {
		"value": [
			"Point"
		],
		"estimated": false
	},
	"properties": {
		"value": [
			{
				"key": "magnitude",
				"count": 100,
				"searchable": true
			},
			{
				"key": "significance",
				"count": 100,
				"searchable": true
			},
			{
				"key": "date",
				"count": 100,
				"searchable": true
			},
			{
				"key": "time",
				"count": 100,
				"searchable": true
			},
			{
				"key": "title",
				"count": 100,
				"searchable": false
			},
			{
				"key": "status",
				"count": 100,
				"searchable": false
			},
			{
				"key": "tsunami",
				"count": 100,
				"searchable": false
			},
			{
				"key": "net",
				"count": 100,
				"searchable": false
			},
			{
				"key": "magType",
				"count": 100,
				"searchable": false
			},
			{
				"key": "place",
				"count": 100,
				"searchable": false
			},
			{
				"key": "tz",
				"count": 100,
				"searchable": false
			},
			{
				"key": "felt",
				"count": 100,
				"searchable": false
			},
			{
				"key": "code",
				"count": 100,
				"searchable": false
			},
			{
				"key": "ids",
				"count": 100,
				"searchable": false
			},
			{
				"key": "sources",
				"count": 100,
				"searchable": false
			},
			{
				"key": "depth",
				"count": 100,
				"searchable": false
			},
			{
				"key": "url",
				"count": 100,
				"searchable": false
			},
			{
				"key": "detail",
				"count": 100,
				"searchable": false
			},
			{
				"key": "cdi",
				"count": 100,
				"searchable": false
			},
			{
				"key": "mmi",
				"count": 100,
				"searchable": false
			},
			{
				"key": "alert",
				"count": 100,
				"searchable": false
			},
			{
				"key": "types",
				"count": 100,
				"searchable": false
			},
			{
				"key": "nst",
				"count": 100,
				"searchable": false
			},
			{
				"key": "dmin",
				"count": 100,
				"searchable": false
			},
			{
				"key": "rms",
				"count": 100,
				"searchable": false
			},
			{
				"key": "gap",
				"count": 100,
				"searchable": false
			}
		],
		"estimated": false,
		"searchable": "PARTIAL"
	},
	"tags": {
		"value": [
			{
				"key": null,
				"count": 100
			}
		],
		"estimated": true
	}
}
```
### SearchForFeaturesEvent
Query for features meeting certain properties.
##### Request
```
{
    "type": "SearchForFeaturesEvent",
    "space": "foo",
    "params": {},
    "tags": null,
    "limit": 100,
    "handle": null,
    "propertiesQuery": [[
      {
        "key":"magnitude",
        "operation": "LESS_THAN",
        "values": [6]
      }
    ]]
}
```
##### Response
```
{
	"type": "FeatureCollection",
	"features": [
		{
			"type": "Feature",
			"properties": {
				"place": "24km WNW of Searles Valley, CA",
				"time": 1593693772980,
				"tz": null,
				"url": "https://earthquake.usgs.gov/earthquakes/eventpage/ci39276559",
				"detail": "https://earthquake.usgs.gov/fdsnws/event/1/query?eventid=ci39276559&format=geojson",
				"felt": null,
				"cdi": null,
				"mmi": null,
				"alert": null,
				"status": "automatic",
				"tsunami": 0,
				"net": "ci",
				"code": "39276559",
				"ids": ",ci39276559,",
				"sources": ",ci,",
				"types": ",nearby-cities,origin,phase-data,scitech-link,",
				"nst": 8,
				"dmin": 0.05814,
				"rms": 0.16,
				"gap": 125,
				"magType": "ml",
				"type": "earthquake",
				"title": "M 0.8 - 24km WNW of Searles Valley, CA",
				"depth": 10.18,
				"magnitude": 0.84,
				"significance": 11,
				"date": "2020-07-02T12:42:52.980Z",
				"@ns:com:here:xyz": {
					"space": "foo",
					"tags": [],
					"updatedAt": 1593693988281
				}
			},
			"geometry": {
				"type": "Point",
				"coordinates": [
					-117.637,
					35.8643333
				]
			},
			"id": "ci39276559"
		},
        ...
    ]
}
```
### GetFeaturesByGeometryEvent
Request features for a certain longitude, latitude and radius in meters. This connector only supports GET requests for this event.
##### Request
```
{
    "type" : "GetFeaturesByGeometryEvent",
    "space": "foo",
    "lat": -20.3,
    "lon": 169.6,
    "radius": 20000,
    "limit": 2000
}
```
##### Response
```
{
	"type": "FeatureCollection",
	"features": [
		{
			"type": "Feature",
			"properties": {
				"place": "Vanuatu",
				"time": 1593634651483,
				"tz": null,
				"url": "https://earthquake.usgs.gov/earthquakes/eventpage/us7000ag6m",
				"detail": "https://earthquake.usgs.gov/fdsnws/event/1/query?eventid=us7000ag6m&format=geojson",
				"felt": null,
				"cdi": null,
				"mmi": null,
				"alert": null,
				"status": "reviewed",
				"tsunami": 0,
				"net": "us",
				"code": "7000ag6m",
				"ids": ",us7000ag6m,",
				"sources": ",us,",
				"types": ",origin,phase-data,",
				"nst": null,
				"dmin": 1.968,
				"rms": 0.74,
				"gap": 126,m
				"magType": "mb",
				"type": "earthquake",
				"title": "M 4.5 - Vanuatu",
				"depth": 112.22,
				"magnitude": 4.5,
				"significance": 312,
				"date": "2020-07-01T20:17:31.483Z",
				"@ns:com:here:xyz": {
					"space": "foo",
					"tags": [],
					"updatedAt": 1593639693040
				}
			},
			"geometry": {
				"type": "Point",
				"coordinates": [
					169.7655,
					-20.3599
				]
			},
			"id": "us7000ag6m"
		}
	]
}
```

### Limits:

- The maximum number of returned features is 20.000
- GetFeaturesByGeometry only supports GET requests
- ModifyFeaturesEvent and LoadFeaturesEvent is not supported
