import flask
from flask import Flask
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

#app = Flask(__name__)


uri = "mongodb+srv://haydenpog:MmHYWnwQTcz9fdGT@database.7cz9j.mongodb.net/?retryWrites=true&w=majority&appName=fairfare"

# Create a new client and connect to the server
client = MongoClient(uri, server_api=ServerApi('1'))

try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(e)
'''
def findNearestAirport(location):
    return "RDU"

def coordinatesFromAddress(location):
    lat = 0.0
    long = 0.0
    return [lat, long]

def addressFromCoordinates(location):
    return "1 Place Rd"


@app.route("/find/startlong=<startLong>startlat=<startLat>destinationlat=<destinationlat>destinationlong=<destinationLong>")
def findPage(startLong, startLat, destinationLat, destinationLong):
    return flask.render_template("find.html")

@app.route('/')
def index():
    return flask.render_template("index.html")


if __name__ == '__main__':
    app.run()
'''