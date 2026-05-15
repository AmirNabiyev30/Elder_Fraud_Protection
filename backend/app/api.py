"""this exists to be the db api sheet"""
import json
from datetime import datetime

from bson import json_util
from flask import Blueprint, jsonify, g, request

from . import mongo
from .AI import analyze_text
from .auth import require_auth

db_api_bp = Blueprint('api', __name__)
APP_DB_NAME = "elder-fraud"


def _get_collection(name):
    return mongo.cx[APP_DB_NAME][name]


def _serialize_document(document):
    return json.loads(json_util.dumps(document))


def _build_scan_stats(scans):
    counts = {"phishing": 0, "spam": 0, "legitimate": 0}
    for scan in scans:
        label = scan.get("pred_label")
        if label in counts:
            counts[label] += 1

    total_scans = len(scans)
    high_risk_count = counts["phishing"] + counts["spam"]
    latest_scan = scans[0] if scans else None

    return {
        "total_scans": total_scans,
        "high_risk_scans": high_risk_count,
        "counts_by_label": counts,
        "latest_scan_at": latest_scan.get("timestamp") if latest_scan else None,
        "latest_scan_label": latest_scan.get("pred_label") if latest_scan else None,
    }

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


@db_api_bp.route('/auth/context', methods=['GET'])
def get_auth_context():
    auth_user = getattr(g, "auth_user", None)
    auth_error = getattr(g, "auth_error", None)
    is_authenticated = getattr(g, "is_authenticated", False)

    return jsonify({
        "is_authenticated": is_authenticated,
        "auth_user": auth_user,
        "auth_error": auth_error
    }), 200

@db_api_bp.route('/users/sync', methods=['POST'])
@require_auth
def sync_user():
    try:
        data = request.get_json() or {}
        full_name = data.get("fullName")
        email = data.get("email")
        phone = data.get("phone")

        if not email:
            return jsonify({
                "error": "email is required"
            }), 400

        user_id = g.auth_user["user_id"]
        now = datetime.now()
        collection = _get_collection("users")
        set_fields = {
            "clerk_user_id": user_id,
            "session_id": g.auth_user.get("session_id"),
            "issuer": g.auth_user.get("issuer"),
            "email": email,
            "updated_at": now,
        }

        if full_name:
            set_fields["full_name"] = full_name
        if phone:
            set_fields["phone"] = phone

        collection.update_one(
            {"clerk_user_id": user_id},
            {
                "$set": set_fields,
                "$setOnInsert": {
                    "created_at": now,
                },
            },
            upsert=True,
        )

        saved_user = collection.find_one(
            {"clerk_user_id": user_id},
            {"_id": 0},
        )

        return jsonify({
            "message": "User synced successfully",
            "user": saved_user,
        }), 200
    except Exception as e:
        return jsonify({"error": "User sync failed", "details": str(e)}), 500


@db_api_bp.route('/users/me', methods=['GET'])
@require_auth
def get_current_user():
    try:
        user_id = g.auth_user["user_id"]
        user = _get_collection("users").find_one(
            {"clerk_user_id": user_id},
            {"_id": 0},
        )
        return jsonify({"user": user}), 200
    except Exception as e:
        return jsonify({"error": "Unable to load current user", "details": str(e)}), 500


@db_api_bp.route('/scans/recent', methods=['GET'])
@require_auth
def get_recent_scans():
    try:
        user_id = g.auth_user["user_id"]
        limit = request.args.get("limit", default=10, type=int)
        safe_limit = max(1, min(limit, 25))
        cursor = _get_collection("scans").find(
            {"clerk_user_id": user_id},
            {"_id": 0},
        ).sort("timestamp", -1).limit(safe_limit)
        scans = _serialize_document(list(cursor))
        return jsonify({
            "scans": scans,
            "stats": _build_scan_stats(scans),
        }), 200
    except Exception as e:
        return jsonify({"error": "Unable to load recent scans", "details": str(e)}), 500

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
        if "error" in result:
            return jsonify(result), 503

        # Save best-effort scan history without making classification depend on Mongo availability.
        try:
            collection = _get_collection("scans")
            scan_document = {
                "text": text,
                "pred_label": result["pred_label"],
                "pred_score": result["pred_score"],
                "summary": result.get("summary"),
                "red_flags": result.get("red_flags", []),
                "next_steps": result.get("next_steps", []),
                "explanation": result.get("explanation"),
                "ai_used": result.get("ai_used", False),
                "ai_error": result.get("ai_error"),
                "timestamp": datetime.now(),
            }
            if getattr(g, "is_authenticated", False) and getattr(g, "auth_user", None):
                scan_document["clerk_user_id"] = g.auth_user["user_id"]

            collection.insert_one({
                **scan_document
            })
            result["saved_to_db"] = True
        except Exception as db_error:
            result["saved_to_db"] = False
            result["save_error"] = str(db_error)

        return jsonify(result), 200

    except Exception as e:
        return jsonify({"error": "Scan failed", "details": str(e)}), 500
