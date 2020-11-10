import json
import os
from event_handler import handle_event

with open(os.path.abspath('tests.json')) as json_file:
    data = json.load(json_file)
    for x in data:
        event = x.get("event")
        print(event)
        res = handle_event(event, 0)
        print(res)
