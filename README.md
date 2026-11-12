# NutriLabel - Coimbatore Restaurant Nutrition Facts & Calorie Estimator

> **"Know your nutrition before Swiggy or Zomato arrives."**  
> Bold, honest, packaged-food-style nutrition facts, portion scaling, modifier adjustments, and healthier same-restaurant swaps designed for the consumer food culture in Coimbatore.

---

## 🍽️ The Problem & Our Rules

Standard nutrition trackers fail when applied to Indian restaurant deliveries: they show single artificial numbers (e.g., "Biryani = 450 kcal"), ignoring the vast variance caused by cook oil, tawa seasoning, and gravies.

NutriLabel solves this with **11 strict architectural rules**:
1. **Never show one exact number**: Always show a realistic range (`low – high`) with an explicit confidence level badge (`High (Weighed)`, `Medium (IFCT/Recipe)`, `Low (Estimate)`).
2. **Never invent nutrition data**: Missing micronutrients stay `null` (never substituted with fake zeros). Sample dishes display a `"Sample Data"` badge until lab-tested or weighed.
3. **Portions as pieces/sizes first**: Serving sizes start as real-world restaurant portions (e.g. `2 Parottas (Set)`, `Regular Bowl`, `Quarter Plate`); gram slider is available as an advanced tool.
4. **Hidden calories matter most**: Supports preparation modifiers (`Less oil on tawa`, `Extra salna`, `Without mayo`).
5. **Goal modes with honest verdicts**: Goal modes (`Weight loss`, `Muscle gain`, `Low carb`) evaluate the *high estimate* to avoid accidental overeating, categorizing items as `Good`, `Okay`, or `Heavy`.
6. **Unit flexibility**: Toggle between `kcal / kJ` and `g / oz`, persisted across sessions in `localStorage`.
7. **Mandatory legal disclaimer**: Displayed prominently: *"Estimates only, not medical advice. Actual values vary based on preparation and portion size."*
8. **Mobile first**: Designed for touchscreens with full keyboard accessibility and touch targets ($\ge 44\text{px}$).
9. **Zero credential leaks**: All secrets and admin keys reside in server environment variables only.
10. **Industrial label brand identity**: Thick borders, heavy 8px rule under calories, condensed typography, and strict contrast adherence in both **Day (paper)** and **Night (dark)** modes. Text on yellow is always black.
11. **Plain rules over fragile AI**: Deterministic math for estimations and portion swap recommendations.

---

## 📂 Monorepo Structure

```text
FoodCalaryTracking/
├── client/                     # Vite + React 18 + Tailwind CSS frontend
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── BottomNav.jsx       # Fixed mobile dock navigation
│   │   │   ├── ErrorBoundary.jsx   # React runtime error boundary
│   │   │   ├── Footer.jsx          # Global disclaimer footer
│   │   │   ├── NutritionLabel.jsx  # Packaged-food nutrition label (8px heavy bar)
│   │   │   └── RollingNumber.jsx   # Animated rolling counter
│   │   ├── context/
│   │   │   └── AppContext.jsx      # Global state, theme, language, & daily budget
│   │   ├── locales/                # Multi-language translation dictionaries
│   │   │   ├── en.json (English)
│   │   │   ├── ta.json (தமிழ் - Tamil)
│   │   │   ├── hi.json (हिन्दी - Hindi)
│   │   │   ├── es.json (Español - Spanish)
│   │   │   └── ar.json (العربية - Arabic with RTL)
│   │   ├── screens/                # Mobile application views
│   │   │   ├── HomeScreen.jsx          # Debounced search & popular dishes grid
│   │   │   ├── DishResultScreen.jsx    # Portion selector, modifiers, & label
│   │   │   ├── DailyBudgetScreen.jsx   # Editable calorie & protein targets
│   │   │   ├── SettingsScreen.jsx      # Theme, language, units, and admin link
│   │   │   ├── LanguagePickerScreen.jsx# Native names & script switching
│   │   │   ├── AdminScreen.jsx         # CRUD, weighed calculator, sample audits
│   │   │   └── NotFoundScreen.jsx      # Friendly 404 screen
│   │   ├── utils/
│   │   │   └── fontLoader.js       # Dynamic font loader for non-Latin scripts
│   │   ├── design-system.css       # Semantic tokens for Day and Night modes
│   │   ├── i18n.js                 # i18next configuration & detector
│   │   ├── index.css               # Tailwind directives & nutrition label styling
│   │   └── App.jsx                 # Routes & layout container
│   ├── index.html              # HTML shell with meta tags & anti-flash script
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vercel.json             # Vercel deployment rewrites & security headers
│   └── vite.config.js          # Vite config with backend proxy
│
├── server/                     # Express.js + Mongoose REST API backend
│   ├── src/
│   │   ├── models/
│   │   │   └── Dish.js             # Mongoose schema with text indexes & macro ranges
│   │   ├── routes/
│   │   │   ├── dishRoutes.js       # Search, fetch, estimate, & alternative swaps
│   │   │   └── adminRoutes.js      # Password-protected CRUD, weighed checks, CSV
│   │   ├── scripts/
│   │   │   └── seed.js             # Seeds 12 Coimbatore dishes across 3 restaurants
│   │   ├── utils/
│   │   │   ├── estimateNutrition.js# Range estimation, portion multiplier, deltas
│   │   │   └── rules.js            # Verdict logic & portion step-down rules
│   │   └── index.js            # Express app, CORS, rate limiter, & route mounting
│   ├── test/                   # Automated Node.js test suite
│   │   ├── admin.test.js           # Auth & weighed dish validation tests
│   │   ├── apiEndpoints.test.js    # Search & swap integration tests
│   │   ├── estimateNutrition.test.js# Mathematical range & limit tests
│   │   ├── rateLimit.test.js       # Rate limiter configuration tests
│   │   └── rules.test.js           # Verdict thresholds & portion swap tests
│   ├── .env.example            # Backend environment template
│   └── package.json
│
├── render.yaml                 # Render Blueprint configuration for server
├── package.json                # Root package.json running concurrently
└── README.md                   # Project documentation
```

---

## 🛠️ Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017`) or MongoDB Atlas URI

---

## 🚀 Local Quickstart

### 1. Clone & Install Dependencies
```bash
# Clone the repository
git clone https://github.com/your-username/nutrilabel.git
cd nutrilabel

# Install root, server, and client dependencies
npm install
npm install --prefix server
npm install --prefix client
```

### 2. Configure Environment Variables
Copy the example environment file for the server:
```bash
cp server/.env.example server/.env
```

Ensure `server/.env` contains:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/nutrilabel
ADMIN_PASSWORD=change_this_to_a_secure_password
CLIENT_ORIGIN=http://localhost:5173
```

### 3. Seed Database
Populate MongoDB with 12 authentic Coimbatore dishes (*Kongu Kitchen*, *Annapoorna Grand*, *Kovai Express*):
```bash
npm run seed --prefix server
```

### 4. Run Both Client & Server
Start the frontend and backend concurrently in one terminal:
```bash
npm run dev
```

- **Client App**: [http://localhost:5173](http://localhost:5173)
- **Server Health**: [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **Admin Portal**: [http://localhost:5173/admin](http://localhost:5173/admin)

---

## 🧪 Testing

The server includes 35 comprehensive unit and integration tests across 11 test suites:

```bash
# Run server test suite
npm run test --prefix server

# Run client production build check
npm run build --prefix client
```

---

## 🔐 Environment Variables Reference

### Backend (`server/.env`)
| Variable | Required | Default | Description |
| :--- | :--- | :--- | :--- |
| `PORT` | Optional | `5000` | HTTP port for the Express server |
| `NODE_ENV` | Optional | `development` | Environment mode (`development`, `production`, `test`) |
| `MONGODB_URI` | Required | `mongodb://127.0.0.1:27017/nutrilabel` | MongoDB connection string (Local or Atlas) |
| `ADMIN_PASSWORD` | Required | `change_this_to_a_secure_password` | Master password checked via `x-admin-password` header |
| `CLIENT_ORIGIN` | Required | `http://localhost:5173` | Allowed frontend origin(s) for CORS (comma-separated in production) |

### Frontend (`client/.env`)
| Variable | Required | Default | Description |
| :--- | :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Optional | *(relative `/api`)* | Production backend URL when not using Vercel rewrites |

---

## 📡 API Reference

All endpoints under `/api` are rate-limited to **60 requests per minute per IP**.

### Public Endpoints
- `GET /api/health` — Health check endpoint (`{ ok: true }`).
- `GET /api/dishes?q=` — Case-insensitive search by name, alias, or restaurant (max 10 results).
- `GET /api/dishes/:id` — Fetch complete dish profile, portions, and modifiers by ID.
- `POST /api/estimate` — Calculate nutrition ranges based on portion, custom grams (20g–3000g), and selected modifiers:
  ```json
  {
    "dishId": "64f...",
    "portionKey": "regular",
    "quantity": 1,
    "customGrams": 350,
    "modifiers": ["less_oil", "extra_gravy"]
  }
  ```
- `GET /api/dishes/:id/alternatives` — Up to 3 lighter dishes from the same restaurant sorted by calories saved.

### Admin Endpoints (Requires `x-admin-password` Header)
- `GET /api/admin/verify` — Validate admin credentials.
- `GET /api/admin/dishes?q=&isSample=&restaurantName=` — Filterable dish list for audit.
- `POST /api/admin/dishes` — Create dish profile (automatically sets `confidenceLevel: "high"` and requires `restaurantName` + `weighedOn` when `source: "weighed"`).
- `PUT /api/admin/dishes/:id` — Edit an existing dish.
- `DELETE /api/admin/dishes/:id` — Remove a dish from the catalog.
- `GET /api/admin/export-csv` — Export the entire dish database as a `.csv` file.

---

## 🌍 Multi-Language & Night/Day Theming

- **Languages Supported**:
  - English (`en`)
  - தமிழ் - Tamil (`ta` - Coimbatore regional default)
  - हिन्दी - Hindi (`hi`)
  - Español - Spanish (`es`)
  - العربية - Arabic (`ar` - automatic `dir="rtl"` layout)
- **Dynamic Font Loading**: Heavy language font files (Tamil, Devanagari, Arabic) load dynamically on demand to optimize initial mobile bundle performance.
- **Theme Modes**: System / Day / Night with zero flash on page load (pre-hydration theme detection script in `<head>`).
- **Accessibility & Contrast**: Complies with WCAG AA standards in both Day and Night modes with touch targets $\ge 44\text{px}$.

---

## 🚢 Production Deployment Guide

### 1. Database: MongoDB Atlas
1. Create a free M0 cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a database user and whitelist all IPs (`0.0.0.0/0`) or Render's outbound IPs.
3. Obtain your connection URI:
   ```text
   mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/nutrilabel?retryWrites=true&w=majority
   ```
4. Run the seed script targeting Atlas:
   ```bash
   MONGODB_URI="your-atlas-uri" npm run seed --prefix server
   ```

### 2. Backend: Render
1. Create a **Web Service** on [Render](https://render.com) pointing to this repository.
2. Configure settings:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
3. Add Environment Variables in the Render dashboard:
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
   - `MONGODB_URI`: *Your Atlas URI*
   - `ADMIN_PASSWORD`: *Your strong custom admin password*
   - `CLIENT_ORIGIN`: `https://nutrilabel.vercel.app` (your Vercel app domain)

### 3. Frontend: Vercel
1. Import the repository on [Vercel](https://vercel.com).
2. Configure settings:
   - **Root Directory**: `client`
   - **Framework Preset**: `Vite`
3. In `client/vercel.json`, update the `/api/(.*)` rewrite destination to your Render service URL:
   ```json
   {
     "source": "/api/(.*)",
     "destination": "https://your-render-service.onrender.com/api/$1"
   }
   ```
4. Deploy. Vercel automatically handles Single Page Application route rewrites and proxies `/api` requests without CORS issues.

---

## 📋 Post-Deployment Verification Checklist

After deploying to production, execute the following validation steps:

- [ ] **1. API Health & Reverse Proxy**:
  - Visit `https://your-client.vercel.app/api/health` — it should return `{"ok": true}`.
- [ ] **2. Rate Limiting Check**:
  - Open terminal and send rapid curl requests:
    ```bash
    for i in {1..65}; do curl -s -o /dev/null -w "%{http_code}\n" https://your-server.onrender.com/api/health; done
    ```
  - Verify that requests exceeding 60 per minute return HTTP `429 Too Many Requests` with a `RateLimit-Reset` header.
- [ ] **3. SPA Routing & Direct URL Refresh**:
  - Directly open a sub-route in browser: `https://your-client.vercel.app/dish/sample-1` and press `F5` / Refresh.
  - Verify it loads the dish without returning a Vercel 404.
- [ ] **4. Database Search & Alternatives**:
  - Type `"biryani"` into the search box; verify that results populate within 300ms from MongoDB Atlas.
  - Open *Parotta* from *Kongu Kitchen*; verify that the *"Better Choices at Kongu Kitchen"* card renders lighter alternatives with calorie savings.
- [ ] **5. Dynamic Calculation & Animation**:
  - Switch portion from *Small* to *Large*; check that the rolling counter animates the calorie range and the border fills toward your daily budget.
  - Select *"Less oil"* modifier; verify that calorie range immediately drops.
- [ ] **6. Daily Budget & Persistence**:
  - Tap `"+ Add to Today's Budget"`.
  - Navigate to the **Budget** tab; verify that totals display low and high bounds and remaining calories reflect the high estimate.
  - Close and reopen browser; verify that items persist in `localStorage`.
- [ ] **7. Day/Night Theme Persistence**:
  - Toggle theme to **Day (Light)**; hard-refresh the page (`Ctrl + F5` or `Cmd + Shift + R`).
  - Verify there is **zero flash** of the dark background before hydration.
- [ ] **8. Multi-Language & RTL Layout**:
  - Select **العربية (Arabic)**; verify that the layout mirrors to Right-to-Left (`dir="rtl"`) and Arabic typography loads correctly.
  - Switch to **தமிழ் (Tamil)**; verify localized dish and nutrient terms.
- [ ] **9. Admin Portal Security & Actions**:
  - Navigate to `/admin`.
  - Enter an incorrect password; verify access is denied with HTTP 401.
  - Enter the correct `ADMIN_PASSWORD`; verify the dish catalog displays.
  - Check *"Only Sample Data"*; verify that it filters to dishes needing lab data.
  - Click *"Export CSV"*; verify `nutrilabel-dishes.csv` downloads with proper headers.
  - Test the **Weighed Nutrition Calculator** by entering sample kitchen weights and confirming per-$100\text{g}$ preview math.
- [ ] **10. Legal & Mobile Responsiveness**:
  - Verify the disclaimer: *"Estimates only, not medical advice"* is legible in the footer and top banners.
  - Test on a physical smartphone or Chrome DevTools Mobile Viewport (iPhone 14 / Pixel 7); verify all touch buttons are easily tappable.

#   N u t r i L a b e l  
 