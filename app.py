from flask import Flask, render_template, redirect, request, jsonify
import os
from dotenv import load_dotenv, dotenv_values 
from supabase import create_client, Client
from datetime import datetime
import base64
import requests
import random

load_dotenv()

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = int(os.getenv("MAX_UPLOAD_SIZE_MB", 10)) * 1024 * 1024  # Max upload size

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

# used for debugging - run with `python app.py`
if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    host = "0.0.0.0"
    debug = os.getenv("FLASK_DEBUG", "True").lower() in ("1", "true", "yes")
    app.run(host=host, port=port, debug=debug)