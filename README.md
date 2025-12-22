# 🚀 SkillForged - AI-Powered Learning Roadmaps

> **Created by:** Lalit Kumar Jangid  
> **Repository:** [github.com/lalitkumarjangid/Skillforged](https://github.com/lalitkumarjangid/Skillforged)  
> **Other Project:** [cresca.xyz](https://cresca.xyz) - Professional growth platform

---

## 🎯 Project Overview

SkillForged is an AI-powered learning roadmap generator that creates personalized, structured learning paths tailored to your goals, skill level, and schedule. Instead of endless scrolling through generic courses, SkillForged generates a week-by-week curriculum designed specifically for you.

### Key Problem Solved
- **Unstructured Learning:** No clear path → Personalized AI-generated roadmaps
- **Time Wasted:** Generic courses → Goal-oriented curriculums
- **No Progress Tracking:** Lost momentum → Real-time dashboard with progress visualization
- **Stuck on Topics:** No help → Instant AI explanations powered by multiple AI providers

---

## ✨ Core Features

### 1. **AI-Generated Personalized Roadmaps**
- Analyzes your learning goal, skill level, and available time
- Generates a structured week-by-week curriculum
- Adapts to your pace and learning style
- Powered by multi-provider AI (Google Gemini, OpenRouter)

### 2. **Goal-Oriented Learning Paths**
- Define your end goal (e.g., "Learn React in 3 months")
- AI maps out the exact path to get there
- Real-world milestones and learning outcomes
- Curated resources for each topic

### 3. **Progress Tracking & Visualization**
- Check off completed modules
- Beautiful dashboard with progress charts
- Track learning history
- Visualize your journey

### 4. **AI-Powered Explanations**
- Get stuck? Ask for instant explanations
- AI tutor powered by Google Gemini
- Fallback to OpenRouter free models if needed
- Personalized based on your learning context

### 5. **Resource Aggregation**
- Auto-curated articles, videos, exercises
- Integrated from:
  - YouTube (tutorials & courses)
  - Medium (in-depth articles)
  - GeeksforGeeks (technical tutorials)
  - Dev.to (community content)
  - Official documentation

### 6. **Interactive UI with Advanced Animations**
- ResizableNavbar with smooth navigation
- DitherShader visual effects
- Responsive design for all devices
- Dark mode optimized

---

## 🏗️ Tech Stack

### Frontend
- **Next.js 16.1.0** - React framework with Turbopack
- **React 19.2.3** - Latest React with automatic batching
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Motion (Aceternity)** - Advanced animation library

### UI Components
- **shadcn/ui** - High-quality components
- **Aceternity UI** - Premium design components
  - ResizableNavbar - Adaptive navigation
  - DitherShader - Visual effects
- **Radix UI** - Accessible primitives
- **Lucide Icons** - Beautiful icon library

### Backend
- **Next.js API Routes** - Serverless functions
- **MongoDB** - Document database
- **Mongoose** - MongoDB ODM
- **Redis/Upstash** - Caching & sessions

### AI & NLP
- **Google Generative AI (Gemini)** - Primary AI provider
- **OpenRouter API** - Free/open-source model fallback
- **Cheerio** - Web scraping for resources

### Authentication & Security
- **NextAuth.js v5** - Authentication framework
- **Google OAuth 2.0** - Social login
- **bcryptjs** - Password hashing
- **JWT** - Secure tokens

### Development Tools
- **ESLint** - Code linting
- **Turbopack** - Fast bundler
- **PostCSS** - CSS processing

---

## 📦 Project Structure

```
skillforged/
├── src/
│   ├── app/                          # Next.js app directory
│   │   ├── api/auth/                 # Authentication routes
│   │   ├── auth/                     # Auth pages (signin, register)
│   │   ├── (protected)/              # Protected routes group
│   │   │   ├── dashboard/            # Main dashboard
│   │   │   ├── roadmap/[id]/         # Roadmap details
│   │   │   └── settings/             # User settings
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Homepage
│   │   └── not-found.tsx             # Custom 404 page
│   │
│   ├── client/                       # Client-side code
│   │   ├── components/
│   │   │   ├── aceternity/           # Premium UI components
│   │   │   │   ├── resizable-navbar.tsx
│   │   │   │   └── dither-shader.tsx
│   │   │   ├── layout/               # Layout components
│   │   │   ├── feature/              # Feature components
│   │   │   ├── magicui/              # Magic UI components
│   │   │   └── ui/                   # Base UI components
│   │   └── index.ts
│   │
│   ├── server/                       # Server-side code
│   │   ├── auth.ts                   # NextAuth config
│   │   ├── db.ts                     # Database connection
│   │   ├── redis.ts                  # Redis client
│   │   ├── actions/                  # Server actions
│   │   │   ├── ai-actions.ts         # AI operations
│   │   │   ├── db-actions.ts         # Database operations
│   │   │   ├── auth-actions.ts       # Auth operations
│   │   │   └── generation-actions.ts # Roadmap generation
│   │   ├── ai/                       # AI configuration
│   │   │   └── model-router.ts       # Multi-AI provider logic
│   │   ├── models/                   # Database models
│   │   │   ├── User.ts
│   │   │   └── Roadmap.ts
│   │   └── scrapers/                 # Web scrapers
│   │       └── resource-scraper.ts   # Resource aggregation
│   │
│   ├── lib/                          # Utilities
│   │   ├── types.ts                  # TypeScript types
│   │   └── utils.ts                  # Helper functions
│   │
│   ├── hooks/                        # React hooks
│   ├── components/                   # Shared components
│   ├── globals.css                   # Global styles
│   └── middleware.ts                 # NextAuth middleware
│
├── public/                           # Static assets
├── next.config.ts                    # Next.js configuration
├── tsconfig.json                     # TypeScript config
├── tailwind.config.ts                # Tailwind configuration
├── postcss.config.mjs                # PostCSS config
│
├── vercel.json                       # Vercel deployment config
├── .vercelignore                     # Files to ignore in deploy
├── .env.example                      # Environment template
├── .env.production                   # Production env template
├── VERCEL_DEPLOYMENT.md              # Detailed deployment guide
├── DEPLOYMENT_CHECKLIST.md           # Pre-deployment checklist
├── QUICK_DEPLOY.md                   # Quick start deploy guide
├── ARCHITECTURE.md                   # System architecture
├── PROJECT_STATUS.md                 # Project status
├── MULTI_AI_SETUP.md                 # Multi-AI setup guide
├── RESOURCE_ENHANCEMENT.md           # Resource features
├── package.json                      # Dependencies
└── README.md                         # This file
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MongoDB Atlas account (free tier available)
- Google API key for Gemini AI
- (Optional) Upstash Redis account

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/lalitkumarjangid/Skillforged.git
cd Skillforged
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` with:
```env
# Database
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/skillforged

# Redis (optional, for caching)
REDIS_URL=rediss://default:password@endpoint.upstash.io:6379

# AI APIs
GEMINI_API_KEY=your_gemini_api_key
OPENROUTER_API_KEY=your_openrouter_api_key

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# NextAuth
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=http://localhost:3000
```

4. **Start development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔧 Development Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Type checking
npm run type-check
```

---

## 🌐 Deployment

### Deploy to Vercel (Recommended)

The project is fully optimized for Vercel deployment.

1. **Push to GitHub**
```bash
git add .
git commit -m "Deploy to Vercel"
git push origin main
```

2. **Connect to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Vercel auto-detects Next.js settings
   - Add environment variables
   - Click Deploy

3. **Environment Variables in Vercel**
   Add all variables from `.env.example` to Vercel Dashboard → Settings → Environment Variables

**For detailed deployment instructions, see:**
- [QUICK_DEPLOY.md](./QUICK_DEPLOY.md) - 30-second guide
- [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - Step-by-step checklist
- [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) - Comprehensive guide

---

## 🤖 AI Providers Configuration

### Google Gemini (Primary)
- **Purpose:** Generate roadmap structure and explanations
- **Models:** gemini-2.5-flash-lite, gemini-2.5-flash
- **Setup:** [Google AI Studio](https://makersuite.google.com/app/apikey)

### OpenRouter (Fallback)
- **Purpose:** Free/open-source model fallback
- **Models:** openai/gpt-oss-20b:free, mistralai/mistral-7b
- **Setup:** [OpenRouter.ai](https://openrouter.ai/keys)
- **Benefit:** Free tier available, multiple models

### Resource Scraping
- **No API keys needed** - Direct web scraping from:
  - YouTube
  - Medium
  - GeeksforGeeks
  - Dev.to
  - Official documentation

---

## 📊 Key Features Breakdown

### 1. Roadmap Generation
- User inputs: Goal, skill level, time per week
- AI generates: Structured curriculum
- Output: Week-by-week breakdown with topics

### 2. Resource Aggregation
- Automatic scraping of relevant resources
- Categorized by: Articles, Videos, Tutorials, Exercises
- Quality scored and ranked

### 3. Progress Tracking
- Module completion tracking
- Visual progress charts
- Learning history
- Achievement badges

### 4. AI Explanations
- Context-aware explanations
- Multiple provider fallback
- Cached for performance
- Personalized based on user history

### 5. User Profiles
- Skill level tracking
- Learning preferences
- Progress history
- Saved roadmaps

---

## 🎨 UI/UX Features

### Homepage
- ResizableNavbar with smooth interactions
- DitherShader visual effects
- StripedPattern backgrounds
- Responsive hero section
- Feature showcase
- Testimonials section
- CTA buttons with animations

### Dashboard
- Clean, modern interface
- Dark mode optimized
- Mobile responsive
- Real-time updates
- Progress visualizations

### 404 Page
- Custom error page
- ResizableNavbar integration
- Navigation links to main sections
- Brand-consistent design

---

## 🔐 Security Features

- **NextAuth.js** - Secure authentication
- **HTTPS only** - Enforced on production
- **Password hashing** - bcryptjs encryption
- **CSRF protection** - Built-in with NextAuth
- **Security headers** - X-Frame-Options, X-Content-Type-Options
- **Environment variables** - Never exposed client-side
- **API route protection** - Middleware-based auth checks

---

## 📈 Performance Optimizations

- **Next.js Image Optimization** - Automatic format conversion
- **Code splitting** - Per-route bundles
- **Turbopack** - 5-10x faster builds
- **Redis caching** - Database query caching
- **Static generation** - Pre-rendered pages
- **Compression** - Gzip compression enabled
- **CDN delivery** - Vercel Edge Network

---

## 🧪 Testing & Quality

- **TypeScript** - Full type safety
- **ESLint** - Code quality checks
- **Tailwind CSS** - Consistent styling
- **Responsive design** - Mobile-first approach
- **Browser compatibility** - Modern browsers supported

---

## 📚 Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System design & architecture
- **[PROJECT_STATUS.md](./PROJECT_STATUS.md)** - Current project status
- **[VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)** - Deployment guide
- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Pre-deployment checklist
- **[QUICK_DEPLOY.md](./QUICK_DEPLOY.md)** - Quick deployment guide
- **[MULTI_AI_SETUP.md](./MULTI_AI_SETUP.md)** - Multi-AI provider setup
- **[RESOURCE_ENHANCEMENT.md](./RESOURCE_ENHANCEMENT.md)** - Resource features

---

## 🤝 Contributing

Contributions are welcome! Please feel free to:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the MIT License.

---

## 👨‍💻 Creator

**Lalit Kumar Jangid**

- GitHub: [@lalitkumarjangid](https://github.com/lalitkumarjangid)
- Portfolio: [cresca.xyz](https://cresca.xyz)
- Repository: [github.com/lalitkumarjangid/Skillforged](https://github.com/lalitkumarjangid/Skillforged)

---

## 🙋 Support & Questions

If you have any questions or need help:
1. Check the documentation files
2. Open a GitHub Issue
3. Review existing issues for solutions

---

## 📊 Project Statistics

- **Framework:** Next.js 16.1.0
- **Language:** TypeScript
- **Database:** MongoDB + Redis
- **Deployment:** Vercel
- **AI Providers:** Google Gemini, OpenRouter
- **UI Components:** 50+ components
- **Total Dependencies:** 40+
- **Lines of Code:** 10,000+

---

## 🎯 Roadmap

### Current Features ✅
- AI roadmap generation
- Resource aggregation
- Progress tracking
- Authentication
- Dashboard UI
- ResizableNavbar integration
- DitherShader visual effects
- Custom 404 page
- Vercel deployment ready

### Upcoming Features 🔄
- Mobile app (React Native)
- Team collaboration features
- Advanced analytics
- Peer learning community
- API for third-party integrations
- WebSocket real-time updates
- Advanced caching strategies

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org) - React framework
- [Vercel](https://vercel.com) - Hosting & deployment
- [MongoDB](https://www.mongodb.com) - Database
- [Google Gemini](https://gemini.google.com) - AI provider
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [shadcn/ui](https://ui.shadcn.com) - UI components
- [Aceternity UI](https://aceternity.com) - Premium components
- [NextAuth.js](https://next-auth.js.org) - Authentication

---

**Last Updated:** December 23, 2025

**Happy Learning! 🚀**
