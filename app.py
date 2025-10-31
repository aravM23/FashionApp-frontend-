from flask import Flask, render_template, redirect, request
import os
from dotenv import load_dotenv, dotenv_values 
from supabase import create_client, Client

load_dotenv()

app = Flask(__name__)

# variables for the supabaseClient
url: str = os.getenv("SUPABASE_URL")
# allow using the anon key as a fallback if a service key isn't provided
key: str = os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_ANON_KEY")

if not url or not key:
    raise ValueError("Missing environment variables SUPABASE_URL and SUPABASE_KEY/SUPABASE_ANON_KEY")

supabase: Client = create_client(url, key)

@app.route('/')
def index():
    return render_template('index.html')

# used for debugging - run with `python app.py`
if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    host = "0.0.0.0"
    debug = os.getenv("FLASK_DEBUG", "True").lower() in ("1", "true", "yes")
    app.run(host=host, port=port, debug=debug)