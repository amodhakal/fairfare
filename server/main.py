import flask
from flask import Flask, send_from_directory
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from geopy.geocoders import Nominatim
from geopy import distance
from flask_cors import CORS
import googlemaps

app = Flask(__name__, static_folder='static', static_url_path='')
cors = CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173", "allow_headers": ["Content-Type"]}})
app.config['CORS_HEADERS'] = 'Content-Type'

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html') # type: ignore


import os
from dotenv import load_dotenv

load_dotenv()
username = os.getenv("username")
password = os.getenv("password")

if username is None or password is None:
    print(".env file missing with username and password")

uri = f"mongodb+srv://{username}:{password}@database.7cz9j.mongodb.net/?retryWrites=true&w=majority&appName=fairfare"

client = MongoClient(uri, server_api=ServerApi('1'))
db = client['fairfare']
collection = db['mock_transportation_data']

#for x in collection.find():
#  print(type(x))
def update_url(drop,pickup):
    drop_lat = drop[0]
    drop_lon = drop[1]
    pickup_lat = pickup[0]
    pickup_lon = pickup[1]
    url = f'STARThttps://m.uber.com/go/product-selection?drop%5B0%5D={{"source":"SEARCH","latitude":{drop_lat},"longitude":{drop_lon},"provider":"uber_places"}}&pickup={{"source":"SEARCH","latitude":{pickup_lat},"longitude":{pickup_lon},"provider":"here_places"}}END'
    return url
# call our apis for rideshare
def estimates(startlocation, endlocation):
    collectionDict = {}
    for x in collection.find({}, {"_id": 0, "options": 1}):
        collectionDict = x
    outputDict = collectionDict.copy()

    # this will be after we call our apis for these.
    for index, brand in enumerate(collectionDict['options'][0]):
        if(brand['type'] == 'uber'):
            outputDict['options'][0][index]['link'] = update_url(coordinatesFromAddress(startlocation), coordinatesFromAddress(endlocation))
        outputDict['options'][0][index]['cost'] = 0.0
        # for future refence if an api fails return 0 so we know not to show it or to say its unavailable


    biketime = get_bike_time(startlocation, endlocation) # lets not do another request for each LOLL
    for index, brand in enumerate(collectionDict['options'][1]):
        outputDict['options'][1][index]['cost'] = round(brand['rate'] * biketime, 2) + 1 # unlock fee is usually $1 for all companies

    return outputDict


def get_bike_time(originAddress, destinationAddress):
    gmaps = googlemaps.Client(key="AIzaSyAy9dvgQ1Nc69_cfLeGWCu8sR_vWC_QrUc")
    directions = gmaps.directions(originAddress, destinationAddress, mode="bicycling") # type: ignore

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
        return [location.latitude, location.longitude] # type: ignore
    else:
        return None

def addressFromCoordinates(location):
    geolocator = Nominatim(user_agent="geo_locator")
    location = geolocator.reverse((location), exactly_one=True)
    return location.address if location else None # type: ignore
# end coordinate code



def transportOptions(distance):
    if(distance >= 10):
        return "car"
    elif (distance <= 10):
        return "light"


#to connect to our front end, dont worry about this for a bit
@app.route("/api/find/<startaddress>/<destinationaddress>")
def findPage(startaddress, destinationaddress):
    if startaddress == "Hunt Library":
        startaddress = "James B. Hunt Jr. Library"
    if destinationaddress == "Hunt Library":
        destinationaddress = "James B. Hunt Jr. Library"
    return estimates(startaddress,destinationaddress) #returns our db but filled out based on information given

@app.route("/api/status")
def return_status():
    return "Success"

#end of front end
if __name__ == '__main__':
    app.run(port=8080)
