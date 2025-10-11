const express = require('express')
const cors = require('cors')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { v4: uuidv4 } = require('uuid')
const Jimp = require('jimp')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'capsule-wardrobe-secret-key'

const app = express()
app.use(cors())
app.use(express.json())

const UPLOAD_DIR = path.join(__dirname, 'uploads')
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR)

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR)
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`)
  }
})
const upload = multer({ storage })

// Simple JSON persistence (avoids native builds)
const DATA_DIR = path.join(__dirname, 'data')
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR)
const MOODS_FILE = path.join(DATA_DIR, 'moodboards.json')
const UPLOADS_FILE = path.join(DATA_DIR, 'uploads.json')
function readJson(file){ try{ return JSON.parse(fs.readFileSync(file,'utf8')||'null') || [] }catch(e){ return [] } }
function writeJson(file, obj){ fs.writeFileSync(file, JSON.stringify(obj, null, 2), 'utf8') }

// ensure files
if (!fs.existsSync(MOODS_FILE)) writeJson(MOODS_FILE, [])
if (!fs.existsSync(UPLOADS_FILE)) writeJson(UPLOADS_FILE, [])

const CAPSULES_FILE = path.join(DATA_DIR, 'capsules.json')
const CLICKS_FILE = path.join(DATA_DIR, 'affiliate_clicks.json')
const USERS_FILE = path.join(DATA_DIR, 'users.json')
const ANALYTICS_FILE = path.join(DATA_DIR, 'analytics.json')
if (!fs.existsSync(CAPSULES_FILE)) writeJson(CAPSULES_FILE, [])
if (!fs.existsSync(CLICKS_FILE)) writeJson(CLICKS_FILE, [])
if (!fs.existsSync(USERS_FILE)) writeJson(USERS_FILE, [])
if (!fs.existsSync(ANALYTICS_FILE)) writeJson(ANALYTICS_FILE, { totalUsers: 0, totalClicks: 0, totalCapsules: 0, dailyStats: {} })

// Auth middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'Access token required' })
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' })
    req.user = user
    next()
  })
}

// Optional auth - continues without user if no token
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (token) {
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (!err) req.user = user
    })
  }
  next()
}

app.use('/', express.static(path.join(__dirname, 'public')))

// Auth endpoints
app.post('/api/signup', async (req, res) => {
  const { email, password, displayName } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' })
  
  const users = readJson(USERS_FILE)
  if (users.find(u => u.email === email)) return res.status(400).json({ error: 'Email already exists' })
  
  const passwordHash = await bcrypt.hash(password, 10)
  const user = {
    id: uuidv4(),
    email,
    passwordHash,
    displayName: displayName || email.split('@')[0],
    sizes: {},
    palette: [],
    ethicsPrefs: [],
    createdAt: Date.now()
  }
  
  users.push(user)
  writeJson(USERS_FILE, users)
  
  const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' })
  res.json({ userId: user.id, email: user.email, displayName: user.displayName, token })
})

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' })
  
  const users = readJson(USERS_FILE)
  const user = users.find(u => u.email === email)
  if (!user) return res.status(401).json({ error: 'Invalid credentials' })
  
  const validPassword = await bcrypt.compare(password, user.passwordHash)
  if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' })
  
  const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' })
  res.json({ userId: user.id, email: user.email, displayName: user.displayName, token })
})

app.get('/api/profile', authenticateToken, (req, res) => {
  const users = readJson(USERS_FILE)
  const user = users.find(u => u.id === req.user.userId)
  if (!user) return res.status(404).json({ error: 'User not found' })
  
  const { passwordHash, ...profile } = user
  res.json(profile)
})

// Upload image for moodboard or existing wardrobe
app.post('/api/upload', optionalAuth, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' })
  const id = uuidv4()
  const filepath = path.join(UPLOAD_DIR, req.file.filename)
  // extract a small palette using Jimp: sample few pixels
  try{
    const image = await Jimp.read(filepath)
    // resize small to speed up
    image.resize(64, Jimp.AUTO)
    const colors = {}
    for (let x=0;x<image.bitmap.width;x+=4){
      for (let y=0;y<image.bitmap.height;y+=4){
        const hex = image.getPixelColor(x,y)
        const hexStr = '#' + (hex >>> 0).toString(16).padStart(8,'0').slice(0,6)
        colors[hexStr] = (colors[hexStr]||0)+1
      }
    }
    const palette = Object.entries(colors).sort((a,b)=>b[1]-a[1]).slice(0,6).map(r=>r[0])

    const uploads = readJson(UPLOADS_FILE)
    uploads.unshift({ id, filename: req.file.filename, path: `/uploads/${req.file.filename}`, originalname: req.file.originalname, tags: (req.body.tags||''), palette, createdAt: Date.now() })
    writeJson(UPLOADS_FILE, uploads)
    res.json({ id, filename: req.file.filename, path: `/uploads/${req.file.filename}`, originalname: req.file.originalname, tags: (req.body.tags||''), palette })
  }catch(err){
    console.error('palette error',err)
    res.status(500).json({ error: 'failed to process image' })
  }
})

// Create moodboard
app.post('/api/moodboards', optionalAuth, (req, res) => {
  const id = uuidv4()
  const userId = req.user?.userId || 'anonymous'
  const title = req.body.title || 'Untitled'
  const description = req.body.description || ''
  const images = req.body.images || []
  const price_min = (req.body.priceRange && req.body.priceRange.min) || 0
  const price_max = (req.body.priceRange && req.body.priceRange.max) || 1000
  const ethics = req.body.ethics || []
  const createdAt = Date.now()
  const moods = readJson(MOODS_FILE)
  const mb = { id, userId, title, description, images, priceRange:{min:price_min,max:price_max}, ethics, createdAt }
  moods.unshift(mb)
  writeJson(MOODS_FILE, moods)
  res.json(mb)
})

// Get moodboard
app.get('/api/moodboards/:id', (req, res) => {
  const moods = readJson(MOODS_FILE)
  const row = moods.find(m=>m.id===req.params.id)
  if (!row) return res.status(404).json({ error: 'Not found' })
  res.json(row)
})

app.get('/api/moodboards', optionalAuth, (req, res) => {
  const userId = req.user?.userId || req.query.userId || 'anonymous'
  const rows = readJson(MOODS_FILE)
    .filter(m => m.userId === userId)
    .slice(0,50)
    .map(m=>({ id:m.id, title:m.title, description:m.description, createdAt:m.createdAt }))
  res.json(rows)
})

// Real fashion retailer products database
const mockProducts = [
  // H&M Products
  { id:'hm1', title:'H&M Oversized Blazer', price:49.99, tags:['blazer','oversized','casual','navy','hm','affordable'], shop:'H&M', 
    image:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop',
    affiliateUrl:'https://www2.hm.com/en_us/productpage.0000000000000000.html?ref=capsule', ethicsFlags:['conscious'], category:'outerwear', color:'navy',
    description:'Relaxed-fit blazer in woven fabric with notched lapels and front buttons.' },
  { id:'hm2', title:'H&M Ribbed Tank Top', price:9.99, tags:['tank','basic','ribbed','white','casual','hm'], shop:'H&M',
    image:'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=300&h=400&fit=crop',
    affiliateUrl:'https://www2.hm.com/en_us/productpage.0000000000000001.html?ref=capsule', ethicsFlags:['organic-cotton'], category:'tops', color:'white',
    description:'Fitted tank top in soft ribbed jersey made from organic cotton.' },
  { id:'hm3', title:'H&M Wide Trousers', price:29.99, tags:['trousers','wide','relaxed','beige','casual','hm'], shop:'H&M',
    image:'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=300&h=400&fit=crop',
    affiliateUrl:'https://www2.hm.com/en_us/productpage.0000000000000002.html?ref=capsule', ethicsFlags:[], category:'bottoms', color:'beige',
    description:'Wide-leg trousers in woven fabric with an elasticated waistband.' },
  
  // Zara Products  
  { id:'zara1', title:'Zara Structured Navy Blazer', price:89.90, tags:['blazer','structured','navy','formal','work','zara','premium'], shop:'Zara',
    image:'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=300&h=400&fit=crop',
    affiliateUrl:'https://www.zara.com/us/en/structured-blazer-p00000000.html?ref=capsule', ethicsFlags:[], category:'outerwear', color:'navy',
    description:'Structured blazer with peak lapels, chest pocket, and front button fastening.' },
  { id:'zara2', title:'Zara Knit Sweater', price:39.90, tags:['sweater','knit','soft','beige','casual','zara'], shop:'Zara',
    image:'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=300&h=400&fit=crop',
    affiliateUrl:'https://www.zara.com/us/en/knit-sweater-p00000001.html?ref=capsule', ethicsFlags:[], category:'tops', color:'beige',
    description:'Round neck sweater in soft knit fabric with dropped shoulders.' },
  { id:'zara3', title:'Zara High Waist Trousers', price:49.90, tags:['trousers','high-waist','tailored','black','work','zara'], shop:'Zara',
    image:'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=300&h=400&fit=crop',
    affiliateUrl:'https://www.zara.com/us/en/high-waist-trousers-p00000002.html?ref=capsule', ethicsFlags:[], category:'bottoms', color:'black',
    description:'High-waist trousers with pressed creases and zip fly.' },
  { id:'zara5', title:'Zara Midi Dress', price:59.90, tags:['dress','midi','elegant','black','formal','zara'], shop:'Zara',
    image:'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=300&h=400&fit=crop',
    affiliateUrl:'https://www.zara.com/us/en/midi-dress-p00000004.html?ref=capsule', ethicsFlags:[], category:'dresses', color:'black',
    description:'Midi dress with V-neck and three-quarter sleeves.' },

  // Uniqlo Products
  { id:'uniqlo1', title:'Uniqlo Heattech Crew Neck Long Sleeve T-Shirt', price:14.90, tags:['shirt','heattech','basic','white','uniqlo','tech'], shop:'Uniqlo',
    image:'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=400&fit=crop',
    affiliateUrl:'https://www.uniqlo.com/us/en/heattech-crew-neck-long-sleeve-t-shirt?ref=capsule', ethicsFlags:[], category:'tops', color:'white',
    description:'HEATTECH crew neck long sleeve T-shirt with moisture-wicking technology.' },
  { id:'uniqlo2', title:'Uniqlo Smart Ankle Pants', price:39.90, tags:['pants','smart','ankle','navy','work','uniqlo','wrinkle-free'], shop:'Uniqlo',
    image:'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=300&h=400&fit=crop',
    affiliateUrl:'https://www.uniqlo.com/us/en/smart-ankle-pants?ref=capsule', ethicsFlags:[], category:'bottoms', color:'navy',
    description:'Wrinkle-resistant ankle pants with stretch fabric for comfort.' },
  { id:'uniqlo3', title:'Uniqlo Cashmere Crew Neck Sweater', price:79.90, tags:['sweater','cashmere','luxury','gray','uniqlo','premium'], shop:'Uniqlo',
    image:'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=300&h=400&fit=crop',
    affiliateUrl:'https://www.uniqlo.com/us/en/cashmere-crew-neck-sweater?ref=capsule', ethicsFlags:[], category:'tops', color:'gray',
    description:'100% cashmere crew neck sweater with a soft, luxurious feel.' },

  // & Other Stories Products
  { id:'stories1', title:'& Other Stories Oversized Wool Coat', price:179, tags:['coat','wool','oversized','camel','outerwear','stories','luxury'], shop:'& Other Stories',
    image:'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=300&h=400&fit=crop',
    affiliateUrl:'https://www.stories.com/en_usd/oversized-wool-coat.html?ref=capsule', ethicsFlags:['wool'], category:'outerwear', color:'camel',
    description:'Oversized double-breasted wool coat with wide lapels.' },
  { id:'stories2', title:'& Other Stories Leather Ankle Boots', price:129, tags:['boots','ankle','leather','black','shoes','stories'], shop:'& Other Stories',
    image:'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=300&h=400&fit=crop',
    affiliateUrl:'https://www.stories.com/en_usd/leather-ankle-boots.html?ref=capsule', ethicsFlags:[], category:'shoes', color:'black',
    description:'Pointed toe ankle boots in smooth leather with block heel.' },

  // COS Products
  { id:'cos1', title:'COS Relaxed Blazer', price:150, tags:['blazer','relaxed','minimal','black','cos','minimal','luxury'], shop:'COS',
    image:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop',
    affiliateUrl:'https://www.cosstores.com/en_usd/relaxed-blazer.html?ref=capsule', ethicsFlags:[], category:'outerwear', color:'black',
    description:'Relaxed-fit blazer with clean lines and minimal detailing.' },
  { id:'cos2', title:'COS Wide-Leg Trousers', price:79, tags:['trousers','wide-leg','minimal','gray','cos','relaxed'], shop:'COS',
    image:'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=300&h=400&fit=crop',
    affiliateUrl:'https://www.cosstores.com/en_usd/wide-leg-trousers.html?ref=capsule', ethicsFlags:[], category:'bottoms', color:'gray',
    description:'Wide-leg trousers in a relaxed fit with pressed creases.' },

  // Massimo Dutti Products
  { id:'massimo1', title:'Massimo Dutti Wool Blazer', price:195, tags:['blazer','wool','luxury','navy','massimo','premium','formal'], shop:'Massimo Dutti',
    image:'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=300&h=400&fit=crop',
    affiliateUrl:'https://www.massimodutti.com/us/wool-blazer?ref=capsule', ethicsFlags:['wool'], category:'outerwear', color:'navy',
    description:'Tailored wool blazer with peak lapels and working buttonholes.' },

  // Everlane Products  
  { id:'everlane1', title:'Everlane The Organic Cotton Long-Sleeve Crew', price:28, tags:['shirt','organic','crew','white','everlane','sustainable','basic'], shop:'Everlane',
    image:'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=400&fit=crop',
    affiliateUrl:'https://www.everlane.com/organic-cotton-long-sleeve-crew?ref=capsule', ethicsFlags:['organic-cotton','sustainable'], category:'tops', color:'white',
    description:'Classic crew neck made from 100% organic cotton.' },
  { id:'everlane2', title:'Everlane The Way-High Drape Pant', price:88, tags:['pants','high-waist','drape','black','everlane','sustainable'], shop:'Everlane',
    image:'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=300&h=400&fit=crop',
    affiliateUrl:'https://www.everlane.com/way-high-drape-pant?ref=capsule', ethicsFlags:['sustainable'], category:'bottoms', color:'black',
    description:'High-waisted pants with a fluid drape and tapered leg.' }
]

app.get('/api/products', (req, res) => {
  // Enhanced search with intelligent matching
  const q = (req.query.q||'').toLowerCase()
  const minPrice = req.query.min ? Number(req.query.min) : 0
  const maxPrice = req.query.max ? Number(req.query.max) : 999999
  const ethicsFilter = req.query.ethics ? req.query.ethics.split(',') : []
  
  let list = mockProducts
  
  if (q) {
    // Split query into words for better matching
    const queryWords = q.split(/\s+/).filter(word => word.length > 0)
    
    list = list.filter(p => {
      const searchText = `${p.title} ${p.tags.join(' ')} ${p.category} ${p.color}`.toLowerCase()
      
      // Check if any query word matches
      return queryWords.some(word => {
        // Direct match in search text
        if (searchText.includes(word)) return true
        
        // Fuzzy matching for common variations
        if (word === 'blazer' && searchText.includes('blazer')) return true
        if (word === 'navy' && (searchText.includes('navy') || searchText.includes('blue'))) return true
        if (word === 'blue' && (searchText.includes('blue') || searchText.includes('navy'))) return true
        if (word === 'jacket' && searchText.includes('blazer')) return true
        if (word === 'coat' && searchText.includes('blazer')) return true
        
        return false
      })
    })
    
    // Sort by relevance (exact title matches first)
    list.sort((a, b) => {
      const aTitle = a.title.toLowerCase()
      const bTitle = b.title.toLowerCase()
      const aExact = queryWords.some(word => aTitle.includes(word)) ? 1 : 0
      const bExact = queryWords.some(word => bTitle.includes(word)) ? 1 : 0
      return bExact - aExact
    })
  }
  
  list = list.filter(p => p.price >= minPrice && p.price <= maxPrice)
  if (ethicsFilter.length) list = list.filter(p => ethicsFilter.some(e => (p.ethicsFlags||[]).includes(e)))
  
  res.json(list)
})

// Capsule management
app.post('/api/capsules', optionalAuth, (req, res) => {
  const id = uuidv4()
  const userId = req.user?.userId || req.body.userId || 'anonymous'
  const title = req.body.title || 'My Capsule'
  const productIds = req.body.productIds || []
  const createdAt = Date.now()
  
  const capsules = readJson(CAPSULES_FILE)
  const capsule = { id, userId, title, productIds, createdAt }
  capsules.unshift(capsule)
  writeJson(CAPSULES_FILE, capsules)
  
  // Update analytics
  const analytics = readJson(ANALYTICS_FILE)
  analytics.totalCapsules++
  writeJson(ANALYTICS_FILE, analytics)
  
  res.json(capsule)
})

app.get('/api/capsules', optionalAuth, (req, res) => {
  const userId = req.user?.userId || req.query.userId || 'anonymous'
  const capsules = readJson(CAPSULES_FILE).filter(c => c.userId === userId)
  res.json(capsules)
})

app.post('/api/capsules/:id/add-product', (req, res) => {
  const capsules = readJson(CAPSULES_FILE)
  const capsule = capsules.find(c => c.id === req.params.id)
  if (!capsule) return res.status(404).json({ error: 'Capsule not found' })
  
  const productId = req.body.productId
  if (!productId) return res.status(400).json({ error: 'Product ID required' })
  if (capsule.productIds.includes(productId)) return res.status(400).json({ error: 'Product already in capsule' })
  
  capsule.productIds.push(productId)
  writeJson(CAPSULES_FILE, capsules)
  res.json(capsule)
})

// Affiliate click tracking
app.post('/api/affiliate-click', optionalAuth, (req, res) => {
  const { productId } = req.body
  const userId = req.user?.userId || req.body.userId || 'anonymous'
  if (!productId) return res.status(400).json({ error: 'Product ID required' })
  
  const product = mockProducts.find(p => p.id === productId)
  if (!product) return res.status(404).json({ error: 'Product not found' })
  
  const clicks = readJson(CLICKS_FILE)
  clicks.push({ productId, userId, timestamp: Date.now(), affiliateUrl: product.affiliateUrl })
  writeJson(CLICKS_FILE, clicks)
  
  // Update analytics
  const analytics = readJson(ANALYTICS_FILE)
  analytics.totalClicks++
  const today = new Date().toISOString().split('T')[0]
  if (!analytics.dailyStats[today]) analytics.dailyStats[today] = { clicks: 0, capsules: 0 }
  analytics.dailyStats[today].clicks++
  writeJson(ANALYTICS_FILE, analytics)
  
  res.json({ success: true, redirectUrl: product.affiliateUrl })
})

// Product matching endpoint
app.post('/api/products/match', optionalAuth, (req, res) => {
  const { piece, moodboardId } = req.body
  if (!piece) return res.status(400).json({ error: 'Piece data required' })
  
  // Simple attribute matching
  let matchedProducts = mockProducts
  
  // Match by style
  if (piece.style) {
    matchedProducts = matchedProducts.filter(p => 
      p.tags.includes(piece.style) || 
      p.title.toLowerCase().includes(piece.style.toLowerCase())
    )
  }
  
  // Match by color
  if (piece.color) {
    matchedProducts = matchedProducts.filter(p => 
      p.title.toLowerCase().includes(piece.color.toLowerCase())
    )
  }
  
  // Match by price range
  if (piece.price) {
    const priceRange = piece.price * 0.3 // 30% tolerance
    matchedProducts = matchedProducts.filter(p => 
      Math.abs(p.price - piece.price) <= priceRange
    )
  }
  
  // Score and sort by relevance
  const scored = matchedProducts.map(p => ({
    ...p,
    score: calculateRelevanceScore(p, piece)
  })).sort((a, b) => b.score - a.score)
  
  res.json(scored.slice(0, 6)) // Return top 6 matches
})

function calculateRelevanceScore(product, piece) {
  let score = 0
  
  // Style match
  if (piece.style && product.tags.includes(piece.style)) score += 10
  if (piece.style && product.title.toLowerCase().includes(piece.style.toLowerCase())) score += 5
  
  // Color match
  if (piece.color && product.title.toLowerCase().includes(piece.color.toLowerCase())) score += 8
  
  // Ethics match
  if (piece.ethicsScore > 0.7 && product.ethicsFlags.length > 0) score += 5
  
  // Price proximity (inverse of difference)
  if (piece.price) {
    const priceDiff = Math.abs(product.price - piece.price)
    score += Math.max(0, 10 - (priceDiff / 20))
  }
  
  return score
}

// Analytics dashboard
app.get('/api/analytics', authenticateToken, (req, res) => {
  const analytics = readJson(ANALYTICS_FILE)
  const clicks = readJson(CLICKS_FILE)
  const capsules = readJson(CAPSULES_FILE)
  const users = readJson(USERS_FILE)
  
  // Calculate conversion rate
  const totalClicks = clicks.length
  const totalCapsules = capsules.length
  const conversionRate = totalClicks > 0 ? (totalCapsules / totalClicks * 100).toFixed(2) : 0
  
  // Top products by clicks
  const productClicks = {}
  clicks.forEach(click => {
    productClicks[click.productId] = (productClicks[click.productId] || 0) + 1
  })
  const topProducts = Object.entries(productClicks)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([productId, clickCount]) => {
      const product = mockProducts.find(p => p.id === productId)
      return { product: product?.title || productId, clicks: clickCount }
    })
  
  res.json({
    totalUsers: users.length,
    totalClicks,
    totalCapsules,
    conversionRate: `${conversionRate}%`,
    topProducts,
    dailyStats: analytics.dailyStats
  })
})

// Generate capsule wardrobe (MVP heuristic)
app.post('/api/generate-capsule', (req, res) => {
  // inputs: moodboardId (optional), description, priceRange, ethics
  const { moodboardId, description, priceRange, ethics, numPieces } = req.body
  const basePalette = ['black','white','navy','beige','olive']
  const styles = ['casual','minimal','elegant','boho','sporty']

  // simple heuristic: extract keywords from description and moodboard tags
  let keywords = []
  if (description) keywords = description.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)
  if (moodboardId && moodboards[moodboardId]) {
    moodboards[moodboardId].images.forEach(img => {
      if (img.tags) keywords.push(...img.tags)
    })
  }

  // dedupe
  keywords = Array.from(new Set(keywords)).slice(0, 10)

  const pieces = []
  const target = numPieces || 12
  for (let i = 0; i < target; i++) {
    const id = uuidv4()
    const color = basePalette[i % basePalette.length]
    const style = styles[i % styles.length]
    const price = Math.round((Math.random() * ((priceRange?.max || 200) - (priceRange?.min || 20))) + (priceRange?.min || 20))
    const label = `${style} ${i < 3 ? 'top' : i < 6 ? 'bottom' : i < 9 ? 'outerwear' : 'accessory'}`
    const ethicsScore = ethics && ethics.length ? ethics.includes('recycled') ? 0.9 : 0.5 : 0.3
    pieces.push({ id, label, color, style, price, ethicsScore, matches: keywords.slice(0,2) })
  }

  res.json({ generatedAt: Date.now(), pieces, keywords })
})

// Mock trend analysis endpoint (uses sample metadata to produce scores)
app.post('/api/trend-analysis', (req, res) => {
  const { keywords } = req.body
  // fake scoring: term length + random
  const scores = (keywords || []).map(k => ({ term: k, score: Math.min(1, (k.length / 10) + Math.random() * 0.4) }))
  const top = scores.sort((a,b)=>b.score-a.score).slice(0,5)
  res.json({ analyzedAt: Date.now(), top, raw: scores })
})

// Serve uploads
app.use('/uploads', express.static(UPLOAD_DIR))

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
