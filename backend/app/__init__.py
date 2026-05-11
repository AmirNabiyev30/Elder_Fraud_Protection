from flask import Flask
from flask_cors import CORS
from flask_pymongo import PyMongo
import os
from dotenv import load_dotenv
from .auth import load_auth_context

mongo = PyMongo()
DEFAULT_CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://elder-fraud-protection.vercel.app",
    "https://elder-fraud-protection.org"
]

def _get_allowed_origins():
    configured_origins = os.getenv("CORS_ALLOWED_ORIGINS")
    if configured_origins:
        return [origin.strip() for origin in configured_origins.split(",") if origin.strip()]
    return DEFAULT_CORS_ORIGINS

def create_app():
    load_dotenv()
    app = Flask(__name__)

    # Attach login string
    app.config["MONGO_URI"] = os.getenv("MONGO_URI")

    mongo.init_app(app)

    # Enable CORS
    CORS(
        app,
        resources={r"/api/*": {"origins": _get_allowed_origins()}},
        allow_headers=["Content-Type", "Authorization"],
    )

    @app.before_request
    def attach_auth_context():
        load_auth_context()

    # This is necessary to avoid waiting loop for files/libraries to be loaded
    # (Because we are using factory pattern)
    from .api import db_api_bp
    app.register_blueprint(db_api_bp, url_prefix='/api')

    return app
