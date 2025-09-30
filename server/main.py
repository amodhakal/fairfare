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
    return send_from_directory(app.static_folder, 'index.html')  # type: ignore

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

def update_url(drop, pickup):
    drop_lat = drop[0]
    drop_lon = drop[1]
    pickup_lat = pickup[0]
    pickup_lon = pickup[1]
    url = (
        f'STARThttps://m.uber.com/go/product-selection?drop%5B0%5D={{'
        f'"source":"SEARCH","latitude":{drop_lat},"longitude":{drop_lon},"provider":"uber_places"'
        f'}}&pickup={{"source":"SEARCH","latitude":{pickup_lat},"longitude":{pickup_lon},"provider":"here_places"}}END'
    )
    return url

def compute_rating(transport_type, dist_miles, cost):
    # constant factor (tweak as necessary)

    if transport_type in ["scooter"]:
        raw_rating = 5 - (cost ** 3  * dist_miles * 0.012)
    else:
        raw_rating = ( 1 /(cost / 4.2))  * dist_miles

    discrete_rating = round(max(0, min(5, raw_rating)))
    return discrete_rating

def estimates(startlocation, endlocation):
    # Retrieve transportation options from the DB.
    collectionDict = {}
    for x in collection.find({}, {"_id": 0, "options": 1}):
        collectionDict = x
    outputDict = collectionDict.copy()

    # Calculate the distance (in miles) between start and destination.
    pickup_coords = coordinatesFromAddress(startlocation)
    drop_coords = coordinatesFromAddress(endlocation)
    if pickup_coords and drop_coords:
        dist_miles = distance.distance(pickup_coords, drop_coords).miles
    else:
        dist_miles = 0

    # Get driving time (in minutes) for rideshare cost calculations.
    cartime = get_bike_time(startlocation, endlocation, "driving")
    
    # Update rideshare (driving) options (assumed to be in options[0]).
    for index, brand in enumerate(collectionDict['options'][0]):
        # If the option is from Uber, update its URL.
        if brand['type'] == 'uber':
            outputDict['options'][0][index]['link'] = update_url(
                coordinatesFromAddress(startlocation),
                coordinatesFromAddress(endlocation)
            )

        cost = round(brand['rate'] * cartime, 2) + 2
        min = 6.52 if brand['type'] != 'taxi' else 7.23
        if brand['type'] == 'lyft':
            min *= 0.95
        outputDict['options'][0][index]['cost'] = max(cost, min)
        outputDict['options'][0][index]['rating'] = compute_rating("driving", dist_miles, cost)

    # Get bicycling time (in minutes) for micromobility cost calculations.
    biketime = get_bike_time(startlocation, endlocation)  # default mode is "bicycling"
    for index, brand in enumerate(collectionDict['options'][1]):
        cost = round(brand['rate'] * biketime, 2) + 4
        outputDict['options'][1][index]['cost'] = cost
        outputDict['options'][1][index]['rating'] = compute_rating("scooter", dist_miles, cost)

    return outputDict

def get_bike_time(originAddress, destinationAddress, mode="bicycling"):
    gmaps = googlemaps.Client(key="AIzaSyAy9dvgQ1Nc69_cfLeGWCu8sR_vWC_QrUc")
    directions = gmaps.directions(originAddress, destinationAddress, mode=mode)  # type: ignore

    if directions:
        duration_seconds = directions[0]["legs"][0]["duration"]["value"]  # Get time in seconds
        duration_minutes = duration_seconds // 60  # Convert to minutes
        return duration_minutes
    else:
        return "No route found"

def coordinatesFromAddress(location):
    geolocator = Nominatim(user_agent="geo_locator")
    location_obj = geolocator.geocode(location)
    if location_obj:
        return [location_obj.latitude, location_obj.longitude] # type: ignore
    else:
        return None

def addressFromCoordinates(location):
    geolocator = Nominatim(user_agent="geo_locator")
    location_obj = geolocator.reverse(location, exactly_one=True)
    return location_obj.address if location_obj else None # type: ignore

def transportOptions(distance):
    if distance >= 10:
        return "car"
    elif distance <= 10:
        return "light"

@app.route("/api/find/<startaddress>/<destinationaddress>")
def findPage(startaddress, destinationaddress):
    if startaddress == "Hunt Library":
        startaddress = "James B. Hunt Jr. Library"
    if destinationaddress == "Hunt Library":
        destinationaddress = "James B. Hunt Jr. Library"
    # Note: The order of parameters is preserved from your original code.
    return estimates(destinationaddress, startaddress)

@app.route("/api/status")
def return_status():
    return "Success"

if __name__ == '__main__':
    app.run(port=8080)
