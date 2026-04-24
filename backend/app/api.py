"""this exists to be the db api sheet"""
from flask import Blueprint, jsonify, request
from . import mongo
from bson import json_util
import json
from .AI import analyze_text

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
    
@db_api_bp.route('/scan', methods=['POST'])
def scan_email():
    try:
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({"error": "No text provided"}), 400

        text = data['text']
        if not text.strip():
            return jsonify({"error": "Email text is empty"}), 400

        result = analyze_text(text)
        return jsonify(result), 200

    except Exception as e:
        return jsonify({"error": "Scan failed", "details": str(e)}), 500