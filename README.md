# Capsule Wardrobe — Full-Scale Moodboard Shopping Platform

A complete moodboard-driven shopping experience where users create mood boards, generate personalized capsule wardrobes, and discover/purchase products that match their style, ethics preferences, and budget.

## 🚀 Features Implemented

### Core Platform
- **User Authentication**: JWT-based signup/login with bcrypt password hashing
- **Moodboard Creation**: Upload images, extract color palettes, tag and organize
- **Capsule Generation**: AI-powered wardrobe suggestions based on mood, style, price, ethics
- **Product Discovery**: Advanced search with filters (price, ethics, style tags)
- **Shopping Integration**: Affiliate link tracking and "Add to Capsule" functionality
- **Analytics Dashboard**: Track clicks, conversions, user behavior, and top products

### Technical Features
- **Image Processing**: Automatic color palette extraction using Jimp
- **Product Matching**: Attribute-based matching algorithm with relevance scoring
- **Responsive UI**: Modern glassmorphism design with mobile support
- **Persistent Storage**: JSON-based data storage (production-ready for PostgreSQL)
- **Admin Panel**: Analytics dashboard and product management interface

## 🏃‍♀️ Quick Start

1. **Install dependencies**
```bash
cd capsule-wardrobe-app
npm install
```

2. **Start the server**
```bash
npm start
```

3. **Open the app**
- Main app: http://localhost:3000
- Admin dashboard: http://localhost:3000/admin.html

## 📊 API Endpoints

### Authentication
- `POST /api/signup` - Create user account
- `POST /api/login` - User login
- `GET /api/profile` - Get user profile (auth required)

### Moodboards & Capsules
- `POST /api/moodboards` - Create moodboard
- `GET /api/moodboards` - List user's moodboards
- `GET /api/moodboards/:id` - Get specific moodboard
- `POST /api/capsules` - Create capsule
- `GET /api/capsules` - List user's capsules
- `POST /api/capsules/:id/add-product` - Add product to capsule

### Products & Shopping
- `GET /api/products` - Search products (with filters)
- `POST /api/products/match` - Find products matching capsule pieces
- `POST /api/affiliate-click` - Track affiliate clicks
- `POST /api/upload` - Upload images with palette extraction

### Analytics
- `GET /api/analytics` - Get platform analytics (admin only)

## 💼 Business Model

### Affiliate Revenue (Current)
- Track clicks to retailer websites
- Earn commissions through affiliate partnerships
- Support for multiple affiliate networks (Amazon, Shopify, etc.)

### Direct Sales (Future)
- On-site checkout with Stripe integration
- Inventory management system
- Order fulfillment and shipping

## 🎯 Conversion Funnel

1. **Discovery**: User uploads moodboard images
2. **Personalization**: System extracts palette and generates capsule
3. **Matching**: Algorithm finds products matching style/budget/ethics
4. **Purchase**: User clicks affiliate links or buys directly
5. **Analytics**: Track conversion rates and optimize

## 🏗️ Architecture

```
Frontend (Static HTML/JS/CSS)
├── Authentication & User Management
├── Moodboard Creation & Management  
├── Capsule Generation Interface
├── Product Discovery & Search
└── Shopping Cart & Checkout Flow

Backend (Node.js + Express)
├── JWT Authentication
├── Image Processing (Jimp)
├── Product Matching Algorithm
├── Affiliate Click Tracking
└── Analytics & Reporting

Data Layer (JSON → PostgreSQL)
├── Users & Profiles
├── Moodboards & Capsules
├── Product Catalog
├── Click Tracking & Analytics
└── Affiliate Commission Data
```

## 🚀 Deployment Guide

### Development
```bash
npm run dev  # Uses nodemon for auto-restart
```

### Production

1. **Environment Variables**
```bash
export JWT_SECRET="your-secure-jwt-secret"
export NODE_ENV="production"
export PORT="3000"
```

2. **Database Migration** (when ready)
   - Replace JSON files with PostgreSQL
   - Use migrations in `/migrations` folder
   - Set DATABASE_URL environment variable

3. **Deploy Options**
   - **Heroku**: `git push heroku main`
   - **DigitalOcean App Platform**: Connect GitHub repo
   - **AWS/Vercel**: Use deployment configs in `/deploy` folder

4. **CDN & Assets**
   - Move images to AWS S3 or Cloudinary
   - Use CDN for static assets
   - Enable gzip compression

## 📈 Scaling Strategy

### Phase 1: MVP Validation (Current)
- [x] JSON file storage
- [x] Mock product catalog
- [x] Basic affiliate tracking
- [x] User authentication

### Phase 2: Production Scale (Next 4 weeks)
- [ ] PostgreSQL migration
- [ ] Real product feed integration
- [ ] Advanced matching (CLIP embeddings)
- [ ] Stripe payment processing
- [ ] Redis caching layer

### Phase 3: Growth Features (8-12 weeks)
- [ ] Social moodboard sharing
- [ ] Influencer affiliate program
- [ ] Mobile app (React Native)
- [ ] AI style recommendations
- [ ] Inventory management system

## 🔌 Product Feed Integration

### Supported Sources
- **Shopify Storefront API**: Real-time product sync
- **Amazon Associates**: Product advertising API
- **Commission Junction**: Affiliate network
- **Custom CSV/JSON**: Bulk product upload

### Integration Steps
1. Get API credentials from retailer/network
2. Configure feed connector in `/integrations`
3. Set up automated sync schedule
4. Map product attributes to internal schema

## 📊 Analytics & KPIs

### Revenue Metrics
- Affiliate click-through rate (CTR)
- Conversion rate (capsule → purchase)
- Average order value (AOV)
- Revenue per user (RPU)

### Engagement Metrics  
- Moodboards created per user
- Time spent in capsule builder
- Product discovery sessions
- Return user rate

### Operational Metrics
- Page load time
- API response time
- Error rate
- Database query performance

## 🛠️ Development Roadmap

### Immediate (This Week)
- [x] Complete authentication system
- [x] Product matching algorithm
- [x] Analytics dashboard
- [x] Admin interface

### Short Term (2-4 weeks)
- [ ] PostgreSQL migration
- [ ] Shopify API integration
- [ ] Advanced image analysis (CLIP)
- [ ] Payment processing (Stripe)
- [ ] Email notifications

### Medium Term (1-3 months)
- [ ] Mobile app development
- [ ] Social features (sharing, following)
- [ ] Influencer partnership program
- [ ] Advanced personalization ML
- [ ] International shipping

### Long Term (3-6 months)
- [ ] B2B retailer dashboard
- [ ] White-label solutions
- [ ] AR/VR try-on integration
- [ ] Sustainability scoring system
- [ ] Global marketplace expansion

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

MIT License - see LICENSE file for details

## 🔗 Links

- [Live Demo](http://localhost:3000) (development)
- [Admin Dashboard](http://localhost:3000/admin.html)
- [API Documentation](http://localhost:3000/api-docs) (coming soon)
- [Business Plan](./docs/business-plan.md) (coming soon)
