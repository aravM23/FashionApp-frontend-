# Real Shopping API Integration Guide

## Current Status
✅ **Working**: App uses realistic mock shopping data with real brand names
🔄 **Ready for**: Real API integration with SerpAPI (Google Shopping)

## Quick Setup for Real Shopping Data (Optional)

### Option 1: SerpAPI (Recommended - Easiest)

**Why SerpAPI?**
- 100 free searches/month
- Real Google Shopping results
- Simple REST API
- No complex authentication

**Setup Steps:**

1. **Get Free API Key**
   - Go to: https://serpapi.com/
   - Sign up for free account
   - Copy your API key from dashboard

2. **Add to .env file**
   ```env
   SERPAPI_KEY=your_serpapi_key_here
   ```

3. **Restart Flask Server**
   ```bash
   # Stop current server
   pkill -f "python.*app.py"
   
   # Start new server
   cd /Users/aravmathur/Desktop/fashion/Fashion-Sense
   ./.venv/bin/python app.py
   ```

4. **Test It**
   - Navigate to AI-Suggest section
   - Upload moodboard
   - See REAL products from Google Shopping!

### What You Get With SerpAPI:
- ✅ Real product names from actual retailers
- ✅ Real prices
- ✅ Direct product links
- ✅ Product images
- ✅ Store/brand names (H&M, Zara, etc.)
- ✅ Availability status

### Example API Response:
```json
{
  "shopping_results": [
    {
      "title": "Oversized Knit Sweater",
      "price": "$45.99",
      "source": "Zara",
      "link": "https://www.zara.com/...",
      "thumbnail": "https://...",
      "snippet": "Cozy oversized sweater in neutral tones"
    }
  ]
}
```

## Option 2: Keep Using Mock Data (Current)

**Advantages:**
- No API key needed
- Instant results
- No rate limits
- Already working perfectly
- Realistic brand names and prices

**What It Does:**
- Generates realistic products based on:
  - Selected price range
  - Context (class, work, casual)
  - Real brand names by tier
  - Dynamic pricing within range

## How It Works Now (Without API)

### Smart Product Generation:
```python
# Budget Tier ($10-$30)
Brands: H&M, Uniqlo, Forever 21, Old Navy, Target

# Moderate Tier ($30-$80)
Brands: Zara, Mango, COS, & Other Stories, Everlane, Gap

# Premium Tier ($80-$150)
Brands: Reiss, All Saints, Theory, Club Monaco

# Luxury Tier ($150+)
Brands: Acne Studios, A.P.C., Vince, Rag & Bone
```

### Context-Aware Products:
- **"8:30 AM class"** → Hoodies, joggers, sneakers, backpacks
- **"Work/Office"** → Blazers, trousers, blouses, loafers
- **"Casual"** → Sweaters, jeans, jackets, t-shirts

## Comparison

| Feature | Mock Data (Current) | SerpAPI (Real) |
|---------|---------------------|----------------|
| Cost | Free | 100 searches/month free |
| Setup Time | 0 min (working now) | 5 min |
| Real Products | ❌ | ✅ |
| Real Prices | Simulated | ✅ Real |
| Product Links | Brand homepages | ✅ Direct product pages |
| Images | Not included | ✅ Product thumbnails |
| Brands | Real names, simulated | ✅ Real retailers |
| Speed | Instant | ~1-2 seconds |

## When to Use Each

### Use Mock Data If:
- Just testing/developing
- Want instant results
- Don't want to manage API keys
- Building proof of concept
- Prefer no external dependencies

### Use SerpAPI If:
- Want real shopping experience
- Need actual product links
- Want product images
- Building for production
- Want real-time pricing

## Code Structure

The app is designed to automatically:
1. Try to use SerpAPI if key exists
2. Fall back to mock data if:
   - No API key provided
   - API request fails
   - Rate limit reached

**No code changes needed** - just add the API key to `.env`!

## Testing

### Test Mock Data (Current):
```bash
# Already working - just use the app
```

### Test Real API:
```bash
# 1. Add SERPAPI_KEY to .env
# 2. Restart server
# 3. Upload moodboard
# 4. Check console logs for "Using real API" message
```

## Troubleshooting

### API Not Working?
```bash
# Check if key is loaded
cd /Users/aravmathur/Desktop/fashion/Fashion-Sense
./.venv/bin/python -c "import os; from dotenv import load_dotenv; load_dotenv(); print(os.getenv('SERPAPI_KEY'))"
```

### Still Using Mock Data?
- Check `.env` file has `SERPAPI_KEY=...`
- Restart Flask server
- Check `server.log` for errors

## Alternative APIs (Not Implemented)

### RapidAPI Shopping
- Cost: Varies by endpoint
- More complex setup
- Multiple API choices

### Shopify/WooCommerce
- Requires merchant account
- More setup complexity
- Better for specific stores

### Amazon Product API
- Requires affiliate account
- Strict terms of service
- Complex authentication

## Recommendation

**For Development**: Use current mock data (no setup needed)

**For Production**: Add SerpAPI key (5 min setup, 100 free searches/month)

**For Scale**: Consider paid API tier or multiple API sources

## Support

Questions? Check:
1. Server logs: `tail -f server.log`
2. Browser console for errors
3. SerpAPI docs: https://serpapi.com/google-shopping-api
