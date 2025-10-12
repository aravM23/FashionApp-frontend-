const express = require('express')
const cors = require('cors')
const path = require('path')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const app = express()
app.use(cors())
app.use(express.json())

const JWT_SECRET = process.env.JWT_SECRET || 'capsule-wardrobe-secret-key'

// In-memory storage for Vercel (replace with database in production)
let users = []
let products = [
  // H&M Products
  { id:'hm1', title:'H&M Oversized Blazer', price:49.99, tags:['blazer','oversized','casual','navy','hm','affordable'], shop:'H&M',
    image:'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=300&h=400&fit=crop',
    affiliateUrl:'https://www2.hm.com/en_us/productpage.0000000000000001.html?ref=capsule', ethicsFlags:[], category:'outerwear', color:'navy',
    description:'Relaxed-fit blazer in woven fabric with notched lapels.' },
  { id:'hm2', title:'H&M Cotton T-shirt', price:12.99, tags:['tshirt','cotton','basic','white','hm','casual'], shop:'H&M',
    image:'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=400&fit=crop',
    affiliateUrl:'https://www2.hm.com/en_us/productpage.0000000000000002.html?ref=capsule', ethicsFlags:[], category:'tops', color:'white',
    description:'Classic cotton T-shirt with a regular fit and crew neck.' },
  { id:'hm3', title:'H&M Wide Trousers', price:29.99, tags:['trousers','wide','relaxed','beige','casual','hm'], shop:'H&M',
    image:'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=300&h=400&fit=crop',
    affiliateUrl:'https://www2.hm.com/en_us/productpage.0000000000000002.html?ref=capsule', ethicsFlags:[], category:'bottoms', color:'beige',
    description:'Wide-leg trousers in woven fabric with an elasticated waistband.' },
  
  // Zara Products  
  { id:'zara1', title:'Zara Structured Navy Blazer', price:89.90, tags:['blazer','structured','navy','formal','work','zara','premium'], shop:'Zara',
    image:'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=300&h=400&fit=crop',
    affiliateUrl:'https://www.zara.com/us/en/structured-blazer-p00000001.html?ref=capsule', ethicsFlags:[], category:'outerwear', color:'navy',
    description:'Structured blazer with shoulder pads and lapel detail.' },
  { id:'zara2', title:'Zara Silk Blouse', price:45.90, tags:['blouse','silk','elegant','white','formal','zara'], shop:'Zara',
    image:'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=300&h=400&fit=crop',
    affiliateUrl:'https://www.zara.com/us/en/silk-blouse-p00000001.html?ref=capsule', ethicsFlags:[], category:'tops', color:'white',
    description:'Flowing blouse in 100% silk with a V-neck and button fastening.' },
  { id:'zara3', title:'Zara High-Waist Trousers', price:39.90, tags:['trousers','high-waist','formal','black','zara'], shop:'Zara',
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
    description:'Ultra-warm Heattech fabric with moisture-wicking technology.' },
  { id:'uniqlo2', title:'Uniqlo Ultra Light Down Jacket', price:59.90, tags:['jacket','down','lightweight','black','uniqlo','packable'], shop:'Uniqlo',
    image:'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=300&h=400&fit=crop',
    affiliateUrl:'https://www.uniqlo.com/us/en/ultra-light-down-jacket?ref=capsule', ethicsFlags:[], category:'outerwear', color:'black',
    description:'Packable down jacket with water-repellent finish.' },

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

// Serve static files
app.use(express.static(path.join(__dirname, '../public')))

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Fashion App API is running on Vercel', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
})

// Products endpoint
app.get('/api/products', (req, res) => {
  const q = (req.query.q||'').toLowerCase()
  let list = products
  
  if (q) {
    const queryWords = q.split(/\s+/).filter(word => word.length > 0)
    list = products.filter(p => {
      const searchText = `${p.title} ${p.shop} ${p.tags.join(' ')} ${p.category} ${p.color}`.toLowerCase()
      return queryWords.some(word => searchText.includes(word))
    })
  }
  
  res.json(list.slice(0, 20)) // Limit to 20 products
})

// Auth endpoints
app.post('/api/signup', async (req, res) => {
  const { email, password, displayName } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' })
  
  if (users.find(u => u.email === email)) return res.status(400).json({ error: 'Email already exists' })
  
  const hashedPassword = await bcrypt.hash(password, 10)
  const user = { id: Date.now().toString(), email, password: hashedPassword, displayName: displayName || email.split('@')[0], createdAt: new Date().toISOString() }
  users.push(user)
  
  const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' })
  res.json({ user: { id: user.id, email: user.email, displayName: user.displayName }, token })
})

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' })
  
  const user = users.find(u => u.email === email)
  if (!user || !await bcrypt.compare(password, user.password)) return res.status(401).json({ error: 'Invalid credentials' })
  
  const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' })
  res.json({ user: { id: user.id, email: user.email, displayName: user.displayName }, token })
})

// Fallback route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'))
})

module.exports = app