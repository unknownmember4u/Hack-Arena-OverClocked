<p align="center">
  <a href="https://github.com/unknownmember4u/Hack-Arena-OverClocked"><img src="https://img.shields.io/github/repo-size/unknownmember4u/Hack-Arena-OverClocked?style=for-the-badge" alt="repo size"></a>
  <a href="https://github.com/unknownmember4u/Hack-Arena-OverClocked/graphs/contributors"><img src="https://img.shields.io/github/contributors/unknownmember4u/Hack-Arena-OverClocked?style=for-the-badge" alt="contributors"></a>
  <a href="https://github.com/unknownmember4u/Hack-Arena-OverClocked/issues"><img src="https://img.shields.io/github/issues/unknownmember4u/Hack-Arena-OverClocked?style=for-the-badge" alt="issues"></a>
  <img src="https://img.shields.io/badge/status-active-brightgreen?style=for-the-badge" alt="status">
</p>

---

## 🚀 About YatraSathi

**YatraSathi** is a commute-centric, AI-powered real estate platform built for Nagpur, India. It helps users find properties optimized for their daily commute, enables property owners to list and manage their properties, and gives admins full control over the platform — all backed by Firebase and rendered on an interactive 3D Mapbox map.

---

## 🧑‍💻 Features

### 🗺️ Interactive 3D Map Explorer
- **Mapbox GL JS** with 3D buildings, sky atmosphere, pitch/bearing for a premium immersive feel
- **Property markers** — circular image pins with amber price badges (`₹Xk`)
- **Click-to-explore popups** — 300px cards with image, rent highlight, 2-column details grid, amenity chips
- **Commute zone visualization** — radius circle drawn around user's location based on transport mode
- **Route drawing** — click "Navigate" on a recommendation card to draw a driving route
- **Google Maps integration** — one-click redirect to Google Maps directions

### 🔍 Smart Property Search
- **Feasibility scoring engine** — ranks properties by commute time, transport cost, rent-to-budget ratio, amenity score, and rating
- **Top 3 Recommendations** — gold/silver/bronze ranked cards in the sidebar with live score bars
- **Dynamic filters** — Gender (Male/Female/All), Property Type (Flat/PG/House), Listing Type (Rent/Buy)
- **Accommodation preferences** — boost score based on proximity to hospitals, supermarkets, schools
- **Budget filter** — max rent slider

### 🏠 Property Owner Dashboard (`/owner-dashboard`)
- **Add Property form** — all fields matching the data schema: title, type, BHK, rent, address, area, gender preference, available date, transport modes, in-unit & shared amenities
- **Mapbox location picker** — click anywhere on a mini-map to set lat/lng
- **Image uploads** — property photo + property ownership papers → Firebase Storage
- **Submit for approval** — creates a pending request in Firestore `propertyRequests`
- **My Submissions** — expandable list showing status badges (Pending / Approved / Denied)

### 🛡️ Admin Dashboard (`/admin-dashboard`)
- **Pending Requests tab** — expandable cards showing all submitted fields + uploaded images (property photo & ownership papers)
- **Approve** → copies property to Firestore `properties` collection → immediately appears on map
- **Deny** → marks request as denied
- **Live Properties tab** — grid of all approved properties with "Remove" button → deletes from Firestore → disappears from map live

### 👤 User Authentication & Roles
- **Firebase Auth** — email/password registration and login
- **Role-based access** — `user` (Home Seeker), `owner` (Property Owner), `admin` (Platform Admin)
- **Firestore user profiles** — name, age, email, role stored in `users` collection
- **Auth guards** — unauthenticated users redirected to `/login`
- **Role-based routing** — users → map, owners → owner dashboard, admins → admin dashboard

### 🧭 Global Navigation
- **Sticky glassmorphic navbar** with blur backdrop on every page
- **Role-based links** — Map Explorer (all users), Owner Panel (owners), Admin Panel (admins), About
- **User display** — name + role badge (`USER`/`OWNER`/`ADMIN`)
- **Mobile responsive** — hamburger menu with slide-down links

### 🔥 Firebase Backend
- **Firestore** — real-time property data (replaces static JSON), user profiles, property requests
- **Firebase Storage** — property images & ownership papers
- **Real-time listener** — map updates live when properties are added/removed in Firestore
- **Seed page** (`/seed`) — one-click browser-based migration of `property.json` to Firestore

### 📍 Live Location
- **Hardcoded demo location** — Tulsiram Gaikwad Patil College, Nagpur (20.9603, 79.0149)
- One-click "Use Live Location" button places marker and centers map

### 🤖 AI Assist (`/ai-assist`)
- Ollama-powered local LLM chat for property recommendations

### 📄 Property Detail Modal
- Click any recommendation card → full-screen modal with:
  - Header image, rent highlight strip (amber gradient)
  - 3-column detail grid (Type, BHK, Gender, Rating, Available, For Sale)
  - Amenity chips (in-unit + shared), transport modes, nearby places with distances
  - Owner info with verification status

---

## 🛠️ Tech Stack

| Layer | Tech |
|---|---|
| Framework | <img src="https://img.shields.io/badge/-Next.js-000000?style=flat-square&logo=next.js&logoColor=fff"> Next.js 16 (App Router, Turbopack) |
| UI | <img src="https://img.shields.io/badge/-React-61DAFB?style=flat-square&logo=react&logoColor=000"> React 19 + TypeScript |
| Styling | <img src="https://img.shields.io/badge/-Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=fff"> Tailwind CSS 4 + Vanilla CSS |
| Auth & DB | <img src="https://img.shields.io/badge/-Firebase-FFCA28?style=flat-square&logo=firebase&logoColor=000"> Firebase Auth + Firestore + Storage |
| Maps | <img src="https://img.shields.io/badge/-Mapbox-4264FB?style=flat-square&logo=mapbox&logoColor=fff"> Mapbox GL JS (3D buildings, markers, popups, routes) |
| Icons | Lucide React |
| AI | Ollama (llama3.1:8b local LLM) |

---

## 📁 Project Structure

```
yatra-sathi/
├── Data/
│   └── property.json          # Property dataset (16 properties in Nagpur)
├── src/
│   ├── app/
│   │   ├── page.tsx           # Main map explorer (auth-guarded)
│   │   ├── login/page.tsx     # Sign In / Register (tabbed, role selection)
│   │   ├── landing/page.tsx   # Hero landing with CTAs
│   │   ├── owner-dashboard/   # Property submission + Mapbox picker
│   │   ├── admin-dashboard/   # Approve/deny requests + manage properties
│   │   ├── seed/page.tsx      # One-click Firestore seeder
│   │   ├── ai-assist/         # Ollama LLM chat
│   │   ├── about/             # About page
│   │   ├── providers.tsx      # AuthProvider + Navbar wrapper
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # All styles (1800+ lines)
│   ├── components/
│   │   ├── MapView.tsx        # Mapbox map + markers + popups + routes
│   │   ├── Navbar.tsx         # Global role-based navigation
│   │   ├── RecommendationPanel.tsx  # Top-3 ranked cards
│   │   ├── PropertyDetailModal.tsx  # Full-screen property overlay
│   │   └── UserProfileForm.tsx      # Search preferences form
│   ├── lib/
│   │   ├── firebase.ts        # Firebase singleton (app, auth, db, storage)
│   │   ├── firestoreService.ts # CRUD helpers + real-time + uploads
│   │   └── authContext.tsx     # Auth state + profile provider
│   ├── map/
│   │   ├── filterEngine.ts    # Property filtering logic
│   │   ├── feasibilityEngine.ts # Scoring algorithm
│   │   └── mapSetup.ts        # Map init + controls
│   ├── types/
│   │   ├── property.ts        # Property, Amenities, Filters types
│   │   └── user.ts            # UserProfile type
│   └── utils/
│       └── geo.ts             # Haversine distance + commute calculator
└── .env                       # NEXT_PUBLIC_MAPBOX_TOKEN
```

---

## 📦 Getting Started

```bash
# Clone the repo
git clone https://github.com/unknownmember4u/Hack-Arena-OverClocked.git
cd "Hack-Arena-OverClocked/Full Stack/yatra-sathi"

# Install dependencies
npm install

# Set up environment
echo "NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here" > .env

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → you'll be redirected to `/login`.

### Seed Firestore
1. Register an account at `/login`
2. Visit `/seed` and click **"Seed Now"** to upload all 16 properties to Firestore

### User Flows
| Role | Route | What you can do |
|---|---|---|
| **User** | `/` | Search properties on map, view recommendations, click for full details |
| **Owner** | `/owner-dashboard` | Submit properties with images + map location for admin approval |
| **Admin** | `/admin-dashboard` | Approve/deny property requests, remove live properties |

---

## 🔑 Firebase Config

The app uses these Firestore collections:

| Collection | Purpose |
|---|---|
| `users` | User profiles (name, age, email, role) |
| `properties` | Approved properties (shown on map) |
| `propertyRequests` | Pending owner submissions (approve/deny workflow) |
| `config` | Meta, feasibility weights, transport config |

---

## 🤝 Contributing

Contributions are what make the open source community such a fantastic place to learn and grow.  
If you want to add an awesome feature or fix a bug, please create a pull request!

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">
  <img src="https://readme-typing-svg.herokuapp.com/?lines=Thanks+for+visiting+YatraSathi!;Contribute,+Travel,+Explore!&center=true&size=20" />
</p>
