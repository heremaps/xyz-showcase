import json
import time
import urllib3
from XyzResponse import ErrorResponse, SuccessResponse, StatisticsResponse, FeatureCollection
from math import sin, cos, sqrt, atan2, radians

base = 'https://api.openaq.org/v1/measurements'


class airqualityHandler:

    def handle_request(event, url):
        https = urllib3.PoolManager()
        try:
            req = https.request('GET', url=url)
        except (TimeoutError, Exception) as err:
            return ErrorResponse(event.streamId, error=500, errorMessage=err)
        finally:
            parsed = json.loads(req.data)
            return airqualityHandler.transform_response(event, parsed["results"])

    def transform_response(event, results):
        features = []
        for x in results:
            feature = {"type": "Feature", "geometry": {
                'type': 'Point',
                'coordinates': [x['coordinates']['longitude'], x['coordinates']['latitude']]
            }, "properties": {
                x['parameter']: x['value'],
                'unit': x['unit'],
                'date': x['date']['utc'],
                'country': x['country'],
                'location': x['location'],
                'city': x['city'],
                '@ns:com:here:xyz': {
                    'space': event["space"],
                    'updatedAt': int(round(time.time() * 1000)),
                    'tags': [x['location'], x['country'], x['city']]
                }
            }}
            features.append(feature)
        fC = FeatureCollection(features=features)
        return fC

    def getstatistics(event):
        keyArray = ['bc', 'co', 'no2', 'o3', 'pm10', 'pm25', 'so2', 'city',
                    'location', 'country', 'unit', 'date']
        propArray = []
        for key in keyArray:
            propArray.append({
                'key': key,
                'count': 100,
                'searchable': False
            })
        stats_resp = StatisticsResponse(bboxValue=[-180.0, -90.0, 180.0, 90.0], byteSizeValue=100, countValue=100,
                                        geometryTypes=['Point'], propertiesArray=propArray)
        return stats_resp

    def getfeaturesbyid(event):
        return 'Not Implemented'

    def getfeaturesbybbox(event):
        # calculate center point from bbox
        x1 = event['bbox'][0]
        x2 = event['bbox'][2]

        y1 = event['bbox'][1]
        y2 = event['bbox'][3]

        lat1 = radians(y1)
        lon1 = radians(x1)
        lat2 = radians(y2)
        lon2 = radians(x2)

        dlon = lon2 - lon1
        dlat = lat2 - lat1

        a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
        c = 2 * atan2(sqrt(a), sqrt(1 - a))

        distance = 6373.0 * c * 1000  # distance in meter
        radius = int(distance / 2)
        centerLon = (x1 + x2) / 2
        centerLat = (y1 + y2) / 2
        radius = 100000 if radius > 100000 else radius
        url = f'{base}?coordinates={centerLat},{centerLon}&has_geo=true&radius={radius}&limit={event["limit"]}'
        return airqualityHandler.handle_request(event, url)

    def getfeaturesbytile(event):
        if len(event['quadkey']) < 5:
            return FeatureCollection([])
        else:
            return airqualityHandler.getfeaturesbybbox(event)

    def iteratefeatures(event):
        url = f'{base}?has_geo=true&limit={event["limit"]}'
        return airqualityHandler.handle_request(event, url)

    def searchforfeatures(event):
        return 'Not Implemented'

    def deletefeaturesbytag(event):
        return 'Not Implemented'

    def modifyfeatures(event):
        return 'Not Implemented'

    def modifyspace(event):
        return SuccessResponse('OK')

    def getfeaturesbygeometry(event):
        if ('lat' or 'lon' or 'radius') not in event:
            return ErrorResponse(event['streamId'], 500, 'No lat, lon or radius provided!')
        url = f'{base}?has_geo=true&radius={event["radius"]}&coordinates={event["lat"]}{event["lon"]}&limit={event["limit"]}'
        return airqualityHandler.handle_request(event, url)
