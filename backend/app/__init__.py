from flask import Flask
from flask_cors import CORS
from flask_pymongo import PyMongo
import os
from dotenv import load_dotenv

mongo = PyMongo()

def create_app():
    load_dotenv()
    app = Flask(__name__)

    # Attach login string
    app.config["MONGO_URI"] = os.getenv("MONGO_URI")

    mongo.init_app(app)

    # Enable CORS
    CORS(app)

    # This is necessary to avoid waiting loop for files/libraries to be loaded
    from .api import db_api_bp
    app.register_blueprint(db_api_bp)