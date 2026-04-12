"""this exists to be the db api sheet"""
from flask import Blueprint, jsonify
from . import mongo
from bson import json_util
import json

db_api_bp = Blueprint('api', __name__)

@db_api_bp.route('/status', methods=['GET'])
def get_status():
    try:
        # mongo connection 
        mongo.cx.admin.command('ping')
        
        return jsonify({
            "status": "online",
            "database": "connected"
        }), 200
    except Exception as e:
        # If Atlas is down or IP isnt whitelisted
        return jsonify({
            "status": "offline",
            "error": "Couldn't connect to MongoDB Atlas"
        }), 500


@db_api_bp.route('/all_data', methods=['GET'])
def get_all_data():
    try:
        # Change as we make changes to the DB
        collection = mongo.cx['test']['test_collection']

        # get the data
        # limit how many documents we fetch
        cursor = collection.find().limit(10)

        # MongoDB uses BSON (Binary JSON) which is an extension of JSON
        data = json.loads(json_util.dumps(list(cursor)))

        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error" : "Access denied or collection missing", "details" : str(e)}), 403