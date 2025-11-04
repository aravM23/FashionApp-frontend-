# Outfit Upload & AI Learning Feature

## Overview
The "Closet" page now includes an interactive outfit upload feature that allows users to take photos of what they're wearing and receive AI-powered style analysis and suggestions.

## Features

### 1. **Photo Upload Interface**
- Click-to-upload or camera capture on mobile devices
- Drag-and-drop support for desktop
- Image preview before analysis
- Real-time feedback and loading states

### 2. **AI Analysis** (Simulated - Ready for ML Integration)
- Style profile detection
- Color palette identification
- Occasion recommendations
- Personalized outfit suggestions

### 3. **Backend Integration**
- Flask API endpoint: `/api/upload-outfit`
- Supabase storage integration for image hosting
- Database storage for outfit metadata
- Ready for ML model integration

## Setup Instructions

### 1. Configure Supabase Storage

1. Go to your Supabase Dashboard → Storage
2. Create a bucket named `wardrobe-assets` (or use the name in your `.env`)
3. Set appropriate permissions (private by default for user privacy)
4. Configure file size limits (default: 10MB)

### 2. Create Database Table

Run the SQL script provided in `supabase_setup.sql`:

```bash
# Copy the contents of supabase_setup.sql
# Paste into Supabase SQL Editor
# Execute the script
```

This creates:
- `outfits` table for storing outfit data
- Indexes for performance
- Row Level Security (RLS) policies
- Storage policies

### 3. Environment Variables

Ensure your `.env` file contains:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_STORAGE_BUCKET=wardrobe-assets
MAX_UPLOAD_SIZE_MB=10
```

### 4. Test the Feature

1. Navigate to the Closet page (scroll right or click CLOSET in nav)
2. Click the upload area or camera icon
3. Select/capture an outfit photo
4. Click "Analyze My Outfit"
5. View AI-generated style insights

## API Documentation

### POST `/api/upload-outfit`

Upload an outfit image for AI analysis.

**Request:**
- Content-Type: `multipart/form-data`
- Body: `image` (file)

**Response:**
```json
{
  "success": true,
  "url": "https://...supabase.co/storage/.../outfit_image.jpg",
  "analysis": {
    "style_profile": "Casual Contemporary",
    "colors": ["Neutral tones", "Earth colors"],
    "occasion": ["Weekend outings", "Casual meetings"],
    "suggestions": [
      "Pair with darker denim for contrast",
      "Add a statement accessory",
      "Layer with a light jacket for versatility"
    ]
  },
  "message": "Outfit uploaded and analyzed successfully!"
}
```

## Integration with Machine Learning

### Current State (Simulated)
The current implementation returns mock AI analysis data. This is intentional to allow frontend development and testing.

### Future ML Integration

To integrate a real ML model:

1. **Image Analysis Service**: Replace the simulated analysis in `/api/upload-outfit` with calls to:
   - OpenAI Vision API
   - Google Cloud Vision API
   - Custom trained model (TensorFlow/PyTorch)
   - Hugging Face models

2. **Example Integration**:

```python
# In app.py, replace the simulated analysis with:

import openai  # or your ML service

@app.route('/api/upload-outfit', methods=['POST'])
def upload_outfit():
    # ... existing upload code ...
    
    # Call ML model
    analysis_result = analyze_outfit_with_ai(public_url)
    
    return jsonify({
        'success': True,
        'url': public_url,
        'analysis': analysis_result
    })

def analyze_outfit_with_ai(image_url):
    # Example with OpenAI Vision
    response = openai.ChatCompletion.create(
        model="gpt-4-vision-preview",
        messages=[{
            "role": "user",
            "content": [
                {"type": "text", "text": "Analyze this outfit and provide style insights..."},
                {"type": "image_url", "image_url": {"url": image_url}}
            ]
        }]
    )
    # Parse and return structured data
    return parse_ai_response(response)
```

3. **Learning from User Data**: Store outfit data in the database to:
   - Build user style profiles
   - Train custom recommendation models
   - Improve suggestion accuracy over time

## File Structure

```
Fashion-Sense/
├── app.py                    # Flask backend with upload endpoint
├── templates/
│   └── index.html           # Updated with upload UI
├── static/
│   ├── js/
│   │   └── main.js          # Upload and analysis logic
│   └── css/
│       └── style.css        # Styling (unchanged)
├── supabase_setup.sql       # Database schema
└── OUTFIT_UPLOAD_DOCS.md    # This file
```

## Security Considerations

1. **File Validation**: Only image files are accepted (MIME type checking)
2. **File Size Limits**: Configured via `MAX_UPLOAD_SIZE_MB` env variable
3. **Storage Security**: Files stored in private Supabase bucket
4. **RLS Policies**: Users can only access their own outfit data
5. **Input Sanitization**: Filenames are sanitized and timestamped

## User Privacy

- All outfit photos are private by default
- RLS policies ensure data isolation between users
- Option to delete uploaded outfits (implement deletion endpoint)
- No sharing without explicit user consent

## Next Steps

1. ✅ Basic upload and preview functionality
2. ✅ Backend API endpoint
3. ✅ Supabase storage integration
4. ✅ Mock AI analysis
5. 🔄 Integrate real ML model for style analysis
6. 🔄 Add user authentication
7. 🔄 Build outfit history/gallery view
8. 🔄 Implement outfit deletion
9. 🔄 Add outfit tagging and search
10. 🔄 Create personalized recommendation engine

## Testing

```bash
# Start the server
python app.py

# Visit http://localhost:3000
# Navigate to Closet page
# Upload a test image
# Verify API response in browser console
```

## Support

For issues or questions, check:
- Supabase logs for storage errors
- Flask server logs (`server.log`)
- Browser console for frontend errors
