XYZ WFS Connector
-----------------------------------------

A data hub connector to read (for now) Web Feature Services (https://www.ogc.org/standards/wfs) up to WFS 2.0, written in Typescript.

-----------------------------------------

#### Supported Events
* ModifySpaceEvent
* GetFeaturesByBBoxEvent
* GetFeaturesByTileEvent
* GetFeaturesByIdEvent
* GetFeaturesByGeometryEvent
* GetStatisticsEvent
* SearchForFeaturesEvent
* IterateFeaturesEvent

### Test it

Change the event attributes at src/tests.json to test different events. 
Run the test script: 
```
npm test
```

#### ModifySpaceEvent
Create a space that is using the WFS connector.
You only need this event if you are using [Data Hub online](https://xyz.here.com/) or [locally](https://github.com/heremaps/xyz-hub).
##### Request
```
{
"type": "ModifySpaceEvent",                               //The type of the event.
"title": "Title of your WFS Space",
"description": "Your description",
  "operation": "CREATE" | "UPDATE" | "DELETE",              //The operation which is about to be done.

"storage": {
    "id": "wfs-typescript",
  	"params": {
    	"url": "WFSURL", 			//mandatory; WfsUrl as https://sgx.geodatenzentrum.de/wfs_kfz250? or https://geodata.tampere.fi/geoserver/wfs
    	"typeName": "TYPENAME", 	//mandatory; TypeName as kfz250 or maankaytto:KAYTTOTARKOITUSALUEET
		"outputFormatJSON": true, 	//mandatory; if set to true, the connector asks for "application/json" from the WFS 
									//			 if set to false the default response datatype is applied
		"WGS84": false,             //optional        
        "srsName": "EPSG:EPSGCODE"  //if WGS84 is set to false, this is mandatory. The connector reprojects from this EPSG Code to WGS84
		"version": "2.0.0" 			//optional
		"token": "YOURTOKEN"		//optional
		"username": "YOURUSERNAME"	//optional
		"password": "YOURPASSWORD" 	//optional
		"license": "WFSLICENSE"		//optional
		}
	}
}
```

#### GetFeaturesByBBox || GetFeaturesByTile
##### Request
GetFeaturesByTileEvents are passed to GetFeaturesByBBox
```
{
     "type": "GetFeaturesByBBoxEvent" || "GetFeaturesByTileEvent",     
     "space": "YOURSPACE",                      
  	 "params": {
            "url": "WFSURL", 			//mandatory
            "typeName": "TYPENAME", 	//mandatory
            "outputFormatJSON": true,	//mandatory
            "version": "2.0.0" 			//optional
            "token": "YOURTOKEN"		//optional
            "username": "YOURUSERNAME"	//optional
            "password": "YOURPASSWORD" 	//optional
            "license": "WFSLICENSE" 	//optional
 		},                        
     "bbox": [                            
          9.052734375,                    
          50.06419173665909,              
          9.140625,                       
          50.12057809796007               
     ],
    "quadkey": "0103"                     //The quadkey as used by Microsoft Bing; only for get by tile
    "limit": 1000,
    "selection": [properties.property1, properties.property2]
}
```

#### GetFeaturesById
##### Request
Most ids are put together like: typeName.Id (for Example: kfz250.1). To request this feature, you can simply request the id without the typeName → in this case "1" because the typeName is already provided in the space parameters.
```
{
    "type": "GetFeaturesIdEvent",
	"space": "YOURSPACE",                    
	"params": {
    	"url": "WFSURL", 			//mandatory
    	"typeName": "TYPENAME", 	//mandatory
		"outputFormatJSON": true,	//mandatory 
		"version": "2.0.0" 			//optional
		"token": "YOURTOKEN"		//optional
		"username": "YOURUSERNAME"	//optional
		"password": "YOURPASSWORD" 	//optional
  		},                        
	"ids": [                           
          "someTypeName.id1",
          "id2"     
	],
	"selection": [properties.property1, properties.property2]
}
```

#### GetFeaturesByGeometryEvent
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

#### GetStatistics
##### Request
```
{
  "type": "GetStatisticsEvent",
  "space": "YOURSPACE"
}
```
##### Response
```
{
    "type":"StatisticsResponse",
    "space": "YOURSPACE",
    "count":{"value":0,"estimated":true},
    "byteSize":{"value":0,"estimated":true},
    "bbox":{"value":[-180,-90,180,90],"estimated":true},
    "geometryTypes":{"value":["Point"],"estimated":true},
    "properties":{"value":[
        {"key":"property1","count":0,"searchable":true},
        {"key":"property2","count":0,"searchable":true},
        {"key":"propertyN","count":0,"searchable":true}],
        "estimated":true,"searchable":"PARTIAL"},
    "tags":{"value":[{"key":"typename","count":0}],"estimated":false}}
```

#### SearchForFeatures
##### Request
Return features that meet the properties query.
```
{
    "type": "SearchForFeaturesEvent",
	"space": "YOURSPACE",                    
	"params": {
    	"url": "WFSURL", 			//mandatory
    	"typeName": "TYPENAME", 	//mandatory
		"version": "2.0.0" 			//optional
		"token": "YOURTOKEN"		//optional
		"username": "YOURUSERNAME"	//optional
		"password": "YOURPASSWORD" 	//optional
  		},                        
	"selection": [properties.property1, properties.property2],
  	"tags": [                           
    	["tag1"]
  	],
  	"limit": 400,
  	"propertiesQuery": [[               
    	{
      	"key":"properties.property1",
      	"operation": "LOWER_THAN",	// EQUALS,NOT_EQUALS,LESS_THAN,GREATER_THAN,LESS_THAN_OR_EQUALS,GREATER_THAN_OR_EQUALS
      	"values": [50000]
    	}
  	]]
}
```

#### IterateFeatures
Iterate over the features in the space.
```
{
    "type": "IterateFeaturesEvent",
	"space": "YOURSPACE",                    
	"params": {
    	"url": "WFSURL", 			//mandatory
    	"typeName": "TYPENAME", 	//mandatory
		"outputFormatJSON": true,	//mandatory 
		"version": "2.0.0" 			//optional
		"token": "YOURTOKEN"		//optional
		"username": "YOURUSERNAME"	//optional
		"password": "YOURPASSWORD" 	//optional
  		},                        
  	"tags": [],
  	"limit": 100,
	"handle": null
}
```

 
