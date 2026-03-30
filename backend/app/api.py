"""this exists to be the db api sheet"""
from flask import Blueprint, jsonify
from . import mongo

db_api_bp = Blueprint('api', __name__)

@db_api_bp.route('/api/status', methods=['GET'])
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