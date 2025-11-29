from flask import Flask, render_template, redirect, request, jsonify, session
import os
from dotenv import load_dotenv, dotenv_values 
from supabase import create_client, Client
from datetime import datetime
import base64
import requests
import random
import secrets

load_dotenv()

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = int(os.getenv("MAX_UPLOAD_SIZE_MB", 10)) * 1024 * 1024  # Max upload size
app.secret_key = os.getenv("SECRET_KEY", secrets.token_hex(32))

# variables for the supabaseClient
url: str = os.getenv("SUPABASE_URL")
# allow using the anon key as a fallback if a service key isn't provided
key: str = os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_ANON_KEY")

if not url or not key:
    raise ValueError("Missing environment variables SUPABASE_URL and SUPABASE_KEY/SUPABASE_ANON_KEY")

supabase: Client = create_client(url, key)

def fetch_real_shopping_items(search_query, price_min, price_max, limit=6):
    """
    Fetch real shopping items using Google Shopping (simplified approach)
    Falls back to realistic mock data if API is not available
    """
    try:
        # Try to use SerpAPI for Google Shopping if key is available
        serpapi_key = os.getenv('SERPAPI_KEY')
        
        if serpapi_key:
            # Real API call to SerpAPI
            url = "https://serpapi.com/search"
            params = {
                'api_key': serpapi_key,
                'engine': 'google_shopping',
                'q': search_query,
                'min_price': price_min,
                'max_price': price_max,
                'num': limit
            }
            
            response = requests.get(url, params=params, timeout=5)
            if response.status_code == 200:
                data = response.json()
                items = []
                
                for result in data.get('shopping_results', [])[:limit]:
                    items.append({
                        'name': result.get('title', 'Product'),
                        'brand': result.get('source', 'Online Store'),
                        'price': result.get('price', '$0'),
                        'description': result.get('snippet', 'Quality product'),
                        'url': result.get('link', '#'),
                        'image': result.get('thumbnail', ''),
                        'available': True
                    })
                
                if items:
                    return items
        
        # Fallback to realistic mock data
        return generate_realistic_mock_items(search_query, price_min, price_max, limit)
        
    except Exception as e:
        print(f"Error fetching shopping items: {str(e)}")
        return generate_realistic_mock_items(search_query, price_min, price_max, limit)

def generate_realistic_mock_items(search_query, price_min, price_max, limit=6):
    """
    Generate realistic shopping items based on query
    """
    # Real brand mappings
    brands_by_price = {
        'budget': ['H&M', 'Uniqlo', 'Forever 21', 'Old Navy', 'Target'],
        'moderate': ['Zara', 'Mango', 'COS', '& Other Stories', 'Everlane', 'Gap'],
        'premium': ['Reiss', 'All Saints', 'Theory', 'Club Monaco', 'Massimo Dutti'],
        'luxury': ['Acne Studios', 'A.P.C.', 'Vince', 'Rag & Bone', 'Equipment']
    }
    
    # Determine price tier
    if price_max <= 30:
        tier = 'budget'
    elif price_max <= 80:
        tier = 'moderate'
    elif price_max <= 150:
        tier = 'premium'
    else:
        tier = 'luxury'
    
    brands = brands_by_price[tier]
    
    # Product templates
    products = {
        'hoodie': ['Relaxed Fit Hoodie', 'Oversized Pullover Hoodie', 'Classic Cotton Hoodie'],
        'sweater': ['Knit Sweater', 'Oversized Knit Sweater', 'Cable Knit Pullover'],
        'jeans': ['High-Waisted Jeans', 'Straight Leg Denim', 'Slim Fit Jeans'],
        'jacket': ['Denim Jacket', 'Bomber Jacket', 'Utility Jacket'],
        'tshirt': ['Organic Cotton Tee', 'Essential T-Shirt', 'Crew Neck Tee'],
        'sneakers': ['Canvas Sneakers', 'Leather Sneakers', 'Running Shoes'],
        'bag': ['Canvas Tote', 'Crossbody Bag', 'Structured Bag'],
        'blazer': ['Tailored Blazer', 'Oversized Blazer', 'Double-Breasted Blazer']
    }
    
    # Detect product type from query
    query_lower = search_query.lower()
    product_type = 'tshirt'  # default
    for ptype in products.keys():
        if ptype in query_lower:
            product_type = ptype
            break
    
    items = []
    product_names = products.get(product_type, products['tshirt'])
    
    for i in range(min(limit, len(product_names))):
        brand = random.choice(brands)
        price = round(random.uniform(price_min, price_max), 2)
        
        items.append({
            'name': product_names[i],
            'brand': brand,
            'price': f'${price}',
            'description': f'Quality {product_type} from {brand}',
            'url': f'https://www.{brand.lower().replace(" ", "").replace("&", "and")}.com',
            'available': random.choice([True, True, True, False])
        })
    
    # Fill remaining slots with varied items
    all_types = list(products.keys())
    while len(items) < limit:
        ptype = random.choice(all_types)
        pname = random.choice(products[ptype])
        brand = random.choice(brands)
        price = round(random.uniform(price_min, price_max), 2)
        
        items.append({
            'name': pname,
            'brand': brand,
            'price': f'${price}',
            'description': f'Versatile {ptype} perfect for any occasion',
            'url': f'https://www.{brand.lower().replace(" ", "").replace("&", "and")}.com',
            'available': random.choice([True, True, True, False])
        })
    
    return items

@app.route('/')
def index():
    return render_template('index.html')

# --- NEW ROUTE ADDED HERE ---
@app.route('/dashboard')
def dashboard():
    # In a real app, you'd add login protection here
    return render_template('dashboard.html')
# --- END NEW ROUTE ---

@app.route('/api/upload-outfit', methods=['POST'])
def upload_outfit():
    """
    Endpoint to upload outfit photos and store them for AI learning
    """
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Generate unique filename
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"outfit_{timestamp}_{file.filename}"
        
        # Upload to Supabase Storage
        bucket_name = os.getenv("SUPABASE_STORAGE_BUCKET", "wardrobe-assets")
        
        # Read file content
        file_content = file.read()
        
        # Upload to Supabase storage
        response = supabase.storage.from_(bucket_name).upload(
            path=f"outfits/{filename}",
            file=file_content,
            file_options={"content-type": file.content_type}
        )
        
        # Get public URL
        public_url = supabase.storage.from_(bucket_name).get_public_url(f"outfits/{filename}")
        
        # Store metadata in database (create a table 'outfits' in Supabase)
        outfit_data = {
            'filename': filename,
            'url': public_url,
            'uploaded_at': datetime.now().isoformat(),
            'analyzed': False
        }
        
        # Insert into database (you'll need to create this table in Supabase)
        # supabase.table('outfits').insert(outfit_data).execute()
        
        # Simulate AI analysis response
        analysis_result = {
            'style_profile': 'Casual Contemporary',
            'colors': ['Neutral tones', 'Earth colors'],
            'occasion': ['Weekend outings', 'Casual meetings'],
            'suggestions': [
                'Pair with darker denim for contrast',
                'Add a statement accessory',
                'Layer with a light jacket for versatility'
            ]
        }
        
        return jsonify({
            'success': True,
            'url': public_url,
            'analysis': analysis_result,
            'message': 'Outfit uploaded and analyzed successfully!'
        }), 200
        
    except Exception as e:
        print(f"Error uploading outfit: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/generate-capsule-outfit', methods=['POST'])
def generate_capsule_outfit():
    """
    Generate outfit suggestions from user's existing wardrobe based on description
    """
    try:
        data = request.json
        description = data.get('description', '')
        
        if not description:
            return jsonify({'error': 'Description is required'}), 400
        
        # Simulate AI-generated capsule wardrobe outfit
        # In production, this would analyze user's uploaded wardrobe and create combinations
        outfit = {
            'name': 'Curated Capsule Outfit',
            'pieces': [
                {
                    'item': 'Cream Knit Sweater',
                    'description': 'From your fall collection - pairs perfectly with everything'
                },
                {
                    'item': 'High-Waisted Denim',
                    'description': 'Your go-to jeans - versatile and comfortable'
                },
                {
                    'item': 'White Sneakers',
                    'description': 'Classic choice from your shoe rack'
                },
                {
                    'item': 'Crossbody Bag',
                    'description': 'Neutral tone bag that complements the outfit'
                }
            ],
            'tips': [
                'Layer with your leather jacket for cooler weather',
                'Swap sneakers for ankle boots for a dressier look',
                'Add a silk scarf for extra polish'
            ]
        }
        
        return jsonify({
            'success': True,
            'outfit': outfit,
            'message': 'Outfit created from your capsule wardrobe!'
        }), 200
        
    except Exception as e:
        print(f"Error generating outfit: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/learn-style-and-shop', methods=['POST'])
def learn_style_and_shop():
    """
    Learn user's style preferences from Pinterest moodboard and return shopping recommendations
    """
    try:
        context = request.form.get('context', '')
        price_range = request.form.get('price_range', 'moderate')
        
        if not context:
            return jsonify({'error': 'Context description is required'}), 400
        
        images = request.files.getlist('images')
        
        if not images:
            return jsonify({'error': 'At least one image is required'}), 400
        
        # Upload images to Supabase storage
        bucket_name = os.getenv("SUPABASE_STORAGE_BUCKET", "wardrobe-assets")
        uploaded_urls = []
        
        for image in images:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"moodboard_{timestamp}_{image.filename}"
            
            file_content = image.read()
            
            # Upload to Supabase
            supabase.storage.from_(bucket_name).upload(
                path=f"moodboards/{filename}",
                file=file_content,
                file_options={"content-type": image.content_type}
            )
            
            public_url = supabase.storage.from_(bucket_name).get_public_url(f"moodboards/{filename}")
            uploaded_urls.append(public_url)
        
        # Simulate AI style analysis
        style_profile = {
            'context': context,
            'aesthetics': ['Minimalist', 'Cozy', 'Neutral Tones', 'Layered'],
            'colors': ['#F5E6D3', '#C9B8A6', '#8B7355', '#4A4238'],
            'recommendations': [
                'Focus on neutral basics that can be mixed and matched',
                'Invest in quality layering pieces',
                'Choose comfortable fabrics like cotton and linen'
            ]
        }
        
        # Map price ranges
        price_ranges = {
            'budget': {'min': 10, 'max': 30},
            'moderate': {'min': 30, 'max': 80},
            'premium': {'min': 80, 'max': 150},
            'luxury': {'min': 150, 'max': 500}
        }
        
        selected_range = price_ranges.get(price_range, price_ranges['moderate'])
        
        # Determine search query based on context
        context_lower = context.lower()
        if 'class' in context_lower or 'school' in context_lower or 'study' in context_lower:
            search_queries = ['hoodie', 'joggers', 'sneakers', 'backpack', 'cardigan', 'sweatshirt']
        elif 'work' in context_lower or 'office' in context_lower or 'professional' in context_lower:
            search_queries = ['blazer', 'trousers', 'blouse', 'loafers', 'work bag', 'dress shirt']
        else:
            search_queries = ['sweater', 'jeans', 'jacket', 't-shirt', 'sneakers', 'casual bag']
        
        # Fetch real shopping items
        all_items = []
        for query in search_queries[:3]:  # Get items for 3 different product types
            items = fetch_real_shopping_items(
                query,
                selected_range['min'],
                selected_range['max'],
                limit=2
            )
            all_items.extend(items)
        
        # Limit to 6 items total
        shopping_items = all_items[:6]
        
        return jsonify({
            'success': True,
            'profile': style_profile,
            'shopping_items': shopping_items,
            'images_uploaded': len(uploaded_urls),
            'message': 'Style learned and shopping recommendations generated!'
        }), 200
        
    except Exception as e:
        print(f"Error learning style and shopping: {str(e)}")
        return jsonify({'error': str(e)}), 500

# used for debugging - run with `python app.py`

@app.route('/api/budget-shopping', methods=['POST'])
def budget_shopping():
    """
    Generate shopping recommendations based on budget and style preferences
    """
    try:
        data = request.json
        budget = data.get('budget', 0)
        description = data.get('description', '')
        
        if budget <= 0:
            return jsonify({'error': 'Valid budget is required'}), 400
        
        if not description:
            return jsonify({'error': 'Description is required'}), 400
        
        # Simulate AI-generated shopping recommendations
        # In production, this would integrate with shopping APIs or web scraping
        items = [
            {
                'name': 'Classic Cotton T-Shirt',
                'price': budget * 0.15,
                'description': 'Versatile basic that matches your style',
                'store': 'Everlane',
                'inBudget': True
            },
            {
                'name': 'Slim Fit Chinos',
                'price': budget * 0.35,
                'description': 'Perfect for casual to semi-formal occasions',
                'store': 'Uniqlo',
                'inBudget': True
            },
            {
                'name': 'Minimalist Watch',
                'price': budget * 0.25,
                'description': 'Timeless accessory to complete any look',
                'store': 'MVMT',
                'inBudget': True
            },
            {
                'name': 'Canvas Sneakers',
                'price': budget * 0.30,
                'description': 'Comfortable daily wear that fits your aesthetic',
                'store': 'Vans',
                'inBudget': budget * 0.30 <= budget * 0.35
            }
        ]
        
        return jsonify({
            'success': True,
            'items': items,
            'budget': budget,
            'message': 'Recommendations generated based on your budget!'
        }), 200
        
    except Exception as e:
        print(f"Error generating shopping recommendations: {str(e)}")
        return jsonify({'error': str(e)}), 500

# ==================== AUTHENTICATION ROUTES ====================

@app.route('/api/auth/signup', methods=['POST'])
def signup():
    """Handle user signup"""
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        full_name = data.get('full_name', '')
        
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        # Sign up with Supabase
        response = supabase.auth.sign_up({
            "email": email,
            "password": password,
            "options": {
                "data": {
                    "full_name": full_name
                }
            }
        })
        
        if response.user:
            session['user_id'] = response.user.id
            session['user_email'] = response.user.email
            session['user_name'] = full_name or email.split('@')[0]
            
            return jsonify({
                'success': True,
                'message': 'Account created successfully!',
                'user': {
                    'id': response.user.id,
                    'email': response.user.email,
                    'name': session['user_name']
                }
            }), 201
        else:
            return jsonify({'error': 'Signup failed'}), 400
            
    except Exception as e:
        print(f"Signup error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Handle user login"""
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        # Sign in with Supabase
        response = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })
        
        if response.user:
            session['user_id'] = response.user.id
            session['user_email'] = response.user.email
            # Get name from user metadata or use email prefix
            user_metadata = response.user.user_metadata or {}
            session['user_name'] = user_metadata.get('full_name') or email.split('@')[0]
            
            return jsonify({
                'success': True,
                'message': 'Logged in successfully!',
                'user': {
                    'id': response.user.id,
                    'email': response.user.email,
                    'name': session['user_name']
                }
            }), 200
        else:
            return jsonify({'error': 'Invalid credentials'}), 401
            
    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({'error': 'Invalid email or password'}), 401

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    """Handle user logout"""
    try:
        supabase.auth.sign_out()
        session.clear()
        return jsonify({'success': True, 'message': 'Logged out successfully'}), 200
    except Exception as e:
        print(f"Logout error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/user', methods=['GET'])
def get_current_user():
    """Get current logged-in user"""
    if 'user_id' in session:
        return jsonify({
            'authenticated': True,
            'user': {
                'id': session['user_id'],
                'email': session['user_email'],
                'name': session['user_name']
            }
        }), 200
    return jsonify({'authenticated': False}), 200


# ========== AI VIDEO GENERATION ENDPOINTS ==========

def generate_video_placeholder(video_type, duration=5):
    """
    Generate placeholder video data for AI video features.
    In production, this would integrate with AI video services like:
    - Runway ML
    - Pika Labs
    - HeyGen
    - Synthesia
    """
    video_templates = {
        'try-on': {
            'title': 'Virtual Try-On',
            'description': 'AI-generated try-on video showing how the garment looks in motion',
            'thumbnail': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
            'duration': duration
        },
        'styling-reel': {
            'title': 'Styling Reel',
            'description': 'Three ways to style this piece for different occasions',
            'thumbnail': 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400',
            'duration': 15
        },
        'runway': {
            'title': 'Your Personal Runway',
            'description': 'Weekly fashion show featuring your closet items',
            'thumbnail': 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400',
            'duration': 60
        }
    }
    
    template = video_templates.get(video_type, video_templates['try-on'])
    
    return {
        'video_id': f'{video_type}_{datetime.now().strftime("%Y%m%d_%H%M%S")}',
        'status': 'ready',
        'video_url': f'/static/videos/placeholder_{video_type}.mp4',
        'thumbnail_url': template['thumbnail'],
        'title': template['title'],
        'description': template['description'],
        'duration': template['duration'],
        'created_at': datetime.now().isoformat()
    }


@app.route('/api/video/generate-tryon', methods=['POST'])
def generate_tryon_video():
    """
    Generate a micro try-on video (5 seconds) showing the garment on an AI model
    with similar body type, styled with items from the user's closet.
    """
    try:
        data = request.get_json()
        
        product_id = data.get('product_id')
        product_name = data.get('product_name', 'Fashion Item')
        body_type = data.get('body_type', 'average')
        closet_items = data.get('closet_items', [])
        
        # In production, this would:
        # 1. Select AI model matching user's body type
        # 2. Generate outfit combining the new piece with closet items
        # 3. Create 5-second motion video using AI video generation
        
        video_data = generate_video_placeholder('try-on', 5)
        video_data.update({
            'product_name': product_name,
            'body_type': body_type,
            'paired_items': closet_items[:3] if closet_items else ['White sneakers', 'Blue jeans'],
            'styling_notes': f'Paired with classic pieces from your closet for a polished look.'
        })
        
        return jsonify({
            'success': True,
            'video': video_data
        }), 200
        
    except Exception as e:
        print(f"Try-on video error: {str(e)}")
        return jsonify({'error': 'Failed to generate try-on video'}), 500


@app.route('/api/video/generate-styling-reel', methods=['POST'])
def generate_styling_reel():
    """
    Generate a styling reel showing 3 different ways to wear an outfit.
    """
    try:
        data = request.get_json()
        
        outfit_id = data.get('outfit_id')
        outfit_items = data.get('outfit_items', [])
        style_preferences = data.get('style_preferences', ['casual', 'smart-casual', 'dressy'])
        
        # In production, this would generate a short video showing:
        # - Look 1: Casual daytime styling
        # - Look 2: Smart-casual work styling
        # - Look 3: Evening/dressy styling
        
        video_data = generate_video_placeholder('styling-reel', 15)
        
        styling_looks = [
            {
                'name': 'Day Casual',
                'description': 'Perfect for brunch or weekend errands',
                'accessories': ['Canvas sneakers', 'Leather tote', 'Sunglasses'],
                'timestamp': '0:00'
            },
            {
                'name': 'Work Ready',
                'description': 'Polished look for the office',
                'accessories': ['Loafers', 'Structured bag', 'Minimal jewelry'],
                'timestamp': '0:05'
            },
            {
                'name': 'Night Out',
                'description': 'Elevated for dinner or drinks',
                'accessories': ['Heeled boots', 'Clutch', 'Statement earrings'],
                'timestamp': '0:10'
            }
        ]
        
        video_data.update({
            'outfit_items': outfit_items,
            'looks': styling_looks,
            'total_looks': 3
        })
        
        return jsonify({
            'success': True,
            'video': video_data
        }), 200
        
    except Exception as e:
        print(f"Styling reel error: {str(e)}")
        return jsonify({'error': 'Failed to generate styling reel'}), 500


@app.route('/api/video/generate-runway', methods=['POST'])
def generate_runway_show():
    """
    Generate a weekly runway show using items from the user's closet.
    Creates a personalized fashion show featuring their wardrobe.
    """
    try:
        data = request.get_json()
        
        user_id = data.get('user_id') or session.get('user_id')
        closet_items = data.get('closet_items', [])
        theme = data.get('theme', 'Weekly Highlights')
        music_mood = data.get('music_mood', 'elegant')
        
        # In production, this would:
        # 1. Select 8-12 best outfit combinations from closet
        # 2. Generate AI models walking runway with each look
        # 3. Add professional lighting, music, transitions
        # 4. Create 60-90 second compilation
        
        video_data = generate_video_placeholder('runway', 60)
        
        # Sample runway looks
        runway_looks = [
            {'name': 'Opening Look', 'items': ['Tailored blazer', 'Wide-leg pants', 'Silk blouse']},
            {'name': 'Street Style', 'items': ['Denim jacket', 'Graphic tee', 'Sneakers']},
            {'name': 'Office Chic', 'items': ['Pencil skirt', 'Cashmere sweater', 'Loafers']},
            {'name': 'Weekend Ease', 'items': ['Linen shirt', 'Chinos', 'White sneakers']},
            {'name': 'Evening Glamour', 'items': ['Little black dress', 'Heels', 'Statement jewelry']},
            {'name': 'Finale Look', 'items': ['Signature coat', 'Tailored trousers', 'Ankle boots']}
        ]
        
        video_data.update({
            'theme': theme,
            'music_mood': music_mood,
            'total_looks': len(runway_looks),
            'looks': runway_looks,
            'week_of': datetime.now().strftime('%B %d, %Y'),
            'share_url': f'/runway/{video_data["video_id"]}'
        })
        
        return jsonify({
            'success': True,
            'video': video_data
        }), 200
        
    except Exception as e:
        print(f"Runway show error: {str(e)}")
        return jsonify({'error': 'Failed to generate runway show'}), 500


@app.route('/api/video/status/<video_id>', methods=['GET'])
def get_video_status(video_id):
    """
    Check the generation status of a video.
    """
    try:
        # In production, this would check actual video generation status
        # from the AI video service
        
        # Simulate processing states
        states = ['queued', 'processing', 'rendering', 'ready']
        
        return jsonify({
            'video_id': video_id,
            'status': 'ready',
            'progress': 100,
            'estimated_time': 0,
            'message': 'Your video is ready to view'
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get video status'}), 500


@app.route('/api/video/history', methods=['GET'])
def get_video_history():
    """
    Get user's generated video history.
    """
    try:
        user_id = session.get('user_id')
        video_type = request.args.get('type', 'all')
        
        # In production, fetch from database
        # For now, return sample history
        
        sample_videos = [
            {
                'video_id': 'tryon_001',
                'type': 'try-on',
                'title': 'Cashmere Sweater Try-On',
                'thumbnail': 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=300',
                'created_at': '2024-01-15T10:30:00',
                'duration': 5
            },
            {
                'video_id': 'reel_001',
                'type': 'styling-reel',
                'title': '3 Ways: Navy Blazer',
                'thumbnail': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
                'created_at': '2024-01-14T15:45:00',
                'duration': 15
            },
            {
                'video_id': 'runway_001',
                'type': 'runway',
                'title': 'Week 2 Runway Show',
                'thumbnail': 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=300',
                'created_at': '2024-01-12T09:00:00',
                'duration': 60
            }
        ]
        
        if video_type != 'all':
            sample_videos = [v for v in sample_videos if v['type'] == video_type]
        
        return jsonify({
            'success': True,
            'videos': sample_videos,
            'total': len(sample_videos)
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get video history'}), 500


# used for debugging - run with `python app.py`
if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    host = "0.0.0.0"
    debug = os.getenv("FLASK_DEBUG", "True").lower() in ("1", "true", "yes")
    app.run(host=host, port=port, debug=debug)