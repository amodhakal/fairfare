import os
import logging
from dotenv import load_dotenv
from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import googlemaps
import requests

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__, static_folder='static', static_url_path='')
cors = CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173", "allow_headers": ["Content-Type"]}})
app.config['CORS_HEADERS'] = 'Content-Type'

# --- Configuration from environment variables ---
GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")
MONGO_USERNAME = os.getenv("MONGO_USERNAME")
MONGO_PASSWORD = os.getenv("MONGO_PASSWORD")
MONGO_CLUSTER = os.getenv("MONGO_CLUSTER", "database.7cz9j.mongodb.net")
MONGO_APP_NAME = os.getenv("MONGO_APP_NAME", "fairfare")

if not GOOGLE_MAPS_API_KEY:
    logger.warning("GOOGLE_MAPS_API_KEY not set in environment")
if not MONGO_USERNAME or not MONGO_PASSWORD:
    logger.warning("MONGO_USERNAME or MONGO_PASSWORD not set in environment")

gmaps = googlemaps.Client(key=GOOGLE_MAPS_API_KEY) if GOOGLE_MAPS_API_KEY else None

# --- MongoDB connection ---
uri = f"mongodb+srv://{MONGO_USERNAME}:{MONGO_PASSWORD}@{MONGO_CLUSTER}/?retryWrites=true&w=majority&appName={MONGO_APP_NAME}"
try:
    client = MongoClient(uri, server_api=ServerApi('1'))
    client.admin.command('ping')
    logger.info("Connected to MongoDB")
except Exception as e:
    logger.error(f"Failed to connect to MongoDB: {e}")
    client = None

db = client['fairfare'] if client else None
collection = db['mock_transportation_data'] if db else None

# --- Rating Algorithm (P1) ---
def compute_rating(transport_type, dist_miles, cost, duration_minutes=0):
    """
    Compute a rating from 1-5 based on multiple factors:
    - Time efficiency: shorter trips score higher
    - Cost efficiency: lower cost per mile scores higher
    - CO2 impact: lower-emission modes score higher
    - Comfort: inherent comfort factor by transport type
    """
    if dist_miles <= 0 or cost <= 0:
        return 1

    cost_per_mile = cost / dist_miles

    # CO2 estimates (lbs CO2 per mile) - approximate values
    co2_factors = {
        "driving": 0.89,
        "uber": 0.89,
        "lyft": 0.89,
        "taxi": 0.89,
        "scooter": 0.0,
        "bike": 0.0,
        "walking": 0.0,
        "bus": 0.30,
        "train": 0.15,
    }
    co2_per_mile = co2_factors.get(transport_type, 0.5)

    # Comfort scores (1-10 scale)
    comfort_scores = {
        "driving": 7,
        "uber": 8,
        "lyft": 8,
        "taxi": 7,
        "scooter": 4,
        "bike": 5,
        "walking": 3,
        "bus": 5,
        "train": 7,
    }
    comfort = comfort_scores.get(transport_type, 5)

    # Time efficiency: assume 30mph average for driving as baseline
    baseline_time = dist_miles / 30 * 60  # minutes
    if duration_minutes > 0:
        time_ratio = baseline_time / duration_minutes
    else:
        time_ratio = 1.0
    time_score = min(10, max(1, time_ratio * 5))

    # Cost score: lower cost per mile is better
    # $2/mile is baseline, cheaper is better
    cost_score = min(10, max(1, (2.0 / cost_per_mile) * 5)) if cost_per_mile > 0 else 5

    # CO2 score: zero emission is best
    co2_score = max(1, 10 - (co2_per_mile * 10))

    # Weighted composite
    weights = {
        "time": 0.25,
        "cost": 0.30,
        "co2": 0.20,
        "comfort": 0.25,
    }

    raw_rating = (
        weights["time"] * time_score +
        weights["cost"] * cost_score +
        weights["co2"] * co2_score +
        weights["comfort"] * comfort
    )

    # Scale to 1-5 range
    rating = round(max(1, min(5, raw_rating / 2)))
    return rating


# --- Geocoding with Google Maps API (P1) ---
def coordinates_from_address(location):
    """Geocode an address using Google Maps Geocoding API."""
    if not gmaps:
        logger.error("Google Maps client not initialized")
        return None
    try:
        result = gmaps.geocode(location)
        if result:
            loc = result[0]['geometry']['location']
            return [loc['lat'], loc['lng']]
        logger.warning(f"No geocoding result for: {location}")
        return None
    except Exception as e:
        logger.error(f"Geocoding failed for '{location}': {e}")
        return None


def address_from_coordinates(location):
    """Reverse geocode coordinates using Google Maps Geocoding API."""
    if not gmaps:
        logger.error("Google Maps client not initialized")
        return None
    try:
        result = gmaps.reverse_geocode(location)
        if result:
            return result[0]['formatted_address']
        return None
    except Exception as e:
        logger.error(f"Reverse geocoding failed for {location}: {e}")
        return None


# --- Route helpers ---
def get_travel_time(origin, destination, mode="bicycling"):
    """Get travel time in minutes using Google Maps Directions API."""
    if not gmaps:
        logger.error("Google Maps client not initialized")
        return 0
    try:
        directions = gmaps.directions(origin, destination, mode=mode)
        if directions:
            duration_seconds = directions[0]["legs"][0]["duration"]["value"]
            return duration_seconds // 60
        logger.warning(f"No route found for {origin} -> {destination} ({mode})")
        return 0
    except Exception as e:
        logger.error(f"Directions API failed: {e}")
        return 0


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


def estimates(startlocation, endlocation):
    """Calculate transportation estimates between two locations."""
    if not collection:
        return jsonify({"error": "Database not available"}), 500

    collection_dict = {}
    for x in collection.find({}, {"_id": 0, "options": 1}):
        collection_dict = x

    if not collection_dict or 'options' not in collection_dict:
        return jsonify({"error": "No transportation data available"}), 404

    output_dict = collection_dict.copy()

    pickup_coords = coordinates_from_address(startlocation)
    drop_coords = coordinates_from_address(endlocation)

    if not pickup_coords or not drop_coords:
        return jsonify({"error": "Could not geocode one or both locations"}), 400

    dist_miles = 0
    try:
        from geopy import distance
        dist_miles = distance.distance(pickup_coords, drop_coords).miles
    except Exception as e:
        logger.error(f"Distance calculation failed: {e}")
        return jsonify({"error": "Failed to calculate distance"}), 500

    # Rideshare (driving) options
    cartime = get_travel_time(startlocation, endlocation, "driving")
    if cartime == 0:
        logger.warning("Could not determine driving time, using estimate")
        cartime = int(dist_miles * 2)  # rough estimate: 30mph

    for index, brand in enumerate(collection_dict['options'][0]):
        if brand['type'] == 'uber':
            output_dict['options'][0][index]['link'] = update_url(
                pickup_coords,
                drop_coords
            )

        cost = round(brand['rate'] * cartime, 2) + 2
        min_cost = 6.52 if brand['type'] != 'taxi' else 7.23
        if brand['type'] == 'lyft':
            min_cost *= 0.95
        output_dict['options'][0][index]['cost'] = max(cost, min_cost)
        output_dict['options'][0][index]['rating'] = compute_rating(
            brand.get('type', 'driving'), dist_miles, cost, cartime
        )

    # Micromobility options
    biketime = get_travel_time(startlocation, endlocation, mode="bicycling")
    if biketime == 0:
        logger.warning("Could not determine biking time, using estimate")
        biketime = int(dist_miles * 4)  # rough estimate: 15mph

    for index, brand in enumerate(collection_dict['options'][1]):
        cost = round(brand['rate'] * biketime, 2) + 4
        output_dict['options'][1][index]['cost'] = cost
        output_dict['options'][1][index]['rating'] = compute_rating("scooter", dist_miles, cost, biketime)

    return output_dict


@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')  # type: ignore


@app.route("/api/find/<startaddress>/<destinationaddress>")
def find_page(startaddress, destinationaddress):
    try:
        if startaddress == "Hunt Library":
            startaddress = "James B. Hunt Jr. Library"
        if destinationaddress == "Hunt Library":
            destinationaddress = "James B. Hunt Jr. Library"
        return estimates(destinationaddress, startaddress)
    except Exception as e:
        logger.error(f"Error in find_page: {e}")
        return jsonify({"error": "Failed to find transportation options", "details": str(e)}), 500


@app.route("/api/status")
def return_status():
    return "Success"


if __name__ == '__main__':
    app.run(port=8080)
