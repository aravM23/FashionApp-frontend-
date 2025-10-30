from flask import Flask, render_template, redirect, request
import os
from dotenv import load_dotenv, dotenv_values 
from supabase import create_client, Client

load_dotenv()

app = Flask(__name__)

#variables for the supabaseClient
url : str = os.getenv("SUPABASE_URL")
key : str = os.getenv("SUPABASE_KEY")

if not url or not key:
    raise ValueError("Missing environment variables SUPABASE_URL or SUPABASE_KEY")

supabase : Client = create_client(url, key)

@app.route('/')
def index():
    return ""

# used for debugging TODO: delete later before production
if __name__ in "__main__":
    app.run(debug = True)