import flask
from flask import Flask
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from geopy.geocoders import Nominatim
from geopy import distance
import googlemaps
app = Flask(__name__)


uri = "mongodb+srv://haydenpog:MmHYWnwQTcz9fdGT@database.7cz9j.mongodb.net/?retryWrites=true&w=majority&appName=fairfare"

client = MongoClient(uri, server_api=ServerApi('1'))
db = client['fairfare']
collection = db['mock_transportation_data']

#for x in collection.find():
#  print(type(x))

# call our apis for rideshare
def estimates(startlocation, endlocation):
    collectionDict = {}
    for x in collection.find({}, {"_id": 0, "options": 1}):
        collectionDict = x
    outputDict = collectionDict.copy()

    # this will be after we call our apis for these.
    for brand in collectionDict['options'][2]:
        if brand['type'] == 'lyft':
            #outputDict['options'][2][]
            brand['cost'] = 0.0
        elif brand['type'] == 'uber':
            brand['cost'] = 0.0
        elif brand['type'] == 'taxi':
            brand['cost'] = 0.0



    for brand in collectionDict['options'][3]:
       brand['cost'] = brand['rate'] * get_bike_time(startlocation, endlocation)
    return collectionDict


def get_bike_time(originAdress, destinationAdress):
    gmaps = googlemaps.Client(key="AIzaSyAy9dvgQ1Nc69_cfLeGWCu8sR_vWC_QrUc")
    directions = gmaps.directions(originAdress, destinationAdress, mode="bicycling")

    if directions:
        duration_seconds = directions[0]["legs"][0]["duration"]["value"]  # Get time in seconds
        duration_minutes = duration_seconds // 60  # Convert to minutes
        return duration_minutes
    else:
        return "No route found"

# coordinate code:
def coordinatesFromAddress(location):
    geolocator = Nominatim(user_agent="geo_locator")
    location = geolocator.geocode(location)
    if location:
        return [location.latitude, location.longitude]
    else:
        return None

def addressFromCoordinates(location):
    geolocator = Nominatim(user_agent="geo_locator")
    location = geolocator.reverse((location), exactly_one=True)
    return location.address if location else None
# end coordinate code



def transportOptions(distance):
    if(distance >= 10):
        return "car"
    elif (distance <= 10):
        return "light"


# for our mock data, will remove car when estimating is done.
def cheapestOption(mode):
    collectionDict = {}
    for x in collection.find({}, {"_id": 0, "options": 1}):
        collectionDict = x

    if(mode == "car"):
        cheapest = {'type': 'failed', 'cost': 1000}
        for type in collectionDict['options'][2]:
            if (type['cost'] <= cheapest['cost']):
                cheapest = type
        return cheapest

    if(mode == "light"):
        cheapest = {'type': 'failed', 'rate': 1000}
        for type in collectionDict['options'][3]:
            if (type['rate'] <= cheapest['rate']):
                cheapest = type
        return cheapest




#to connect to our front end, dont worry about this for a bit
@app.route("/find/startlong=<startLong>startlat=<startLat>destinationlat=<destinationlat>destinationlong=<destinationLong>")
def findPage(startLong, startLat, destinationLat, destinationLong):
    return flask.render_template("find.html")

@app.route('/')
def index():
    return flask.render_template("index.html")

#end of front end
if __name__ == '__main__':
    print(cheapestOption("light"))
    print("\n" + get_bike_time("", "Enloe Magnet High School, 128 Clarendon Crescent, Raleigh, NC 27610"))
    app.run()
