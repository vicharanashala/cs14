# CONTEXT.md — Architecture & Design Decisions

## Architecture Diagram (Text)

```
┌──────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                           │
│                                                                   │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐  │
│  │ HomePage   │  │ Discussion   │  │ AdminPage              │  │
│  │ (browse/   │  │ Page         │  │ (admin only)           │  │
│  │  search)   │  │ (forum)      │  │                        │  │
│  └──────┬─────┘  └──────┬───────┘  └───────────┬────────────┘  │
│         │                │                     │                │
│  ┌──────▼────────────────▼─────────────────────▼────────────┐   │
│  │              React Router v7 (App.jsx)                    │   │
│  │  / /login /register /discussions /all-faqs /faq/:id       │   │
│  │  /badges /leaderboard /notifications /profile /admin      │   │
│  └────────────────────────┬───────────────────────────────────┘  │
│                           │                                       │
│                    ┌──────▼──────┐                                │
│                    │ axios.js    │                                │
│                    │ baseURL:5000│                                │
│                    │ JWT inter.  │                                │
│                    └──────┬──────┘                                │
└───────────────────────────┼───────────────────────────────────────┘
                            │ HTTP / JSON
┌───────────────────────────▼───────────────────────────────────────┐
│                     SERVER (Express :5000)                         │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │              Route Middleware                               │  │
│  │   verifyToken ─────────────────────────────────────────     │  │
│  │   verifyAdmin ─────────────────────────────────────────     │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────┐    │
│  │authRoutes    │  │faqRoutes     │  │ discussionRoutes   │    │
│  │POST /register│  │GET /faqs     │  │GET /discussions     │    │
│  │POST /login   │  │GET /trending │  │POST /               │    │
│  │GET /me       │  │GET /recent   │  │POST /:id/answers    │    │
│  └──────────────┘  │POST /        │  │POST /:id/comments   │    │
│                    │DELETE /:id   │  │PATCH /:id/upvote    │    │
│  ┌──────────────┐  │PATCH /:id/upvote│PATCH /:id/downvote│    │
│  │adminRoutes   │  └──────────────┘  └─────────────────────┘    │
│  │GET /analytics│  ┌──────────────┐  ┌─────────────────────┐    │
│  │GET /discussions│ │badgeRoutes  │  │ notificationRoutes│    │
│  │PATCH /approve│  │GET /         │  │GET /               │    │
│  │PATCH /reject │  │GET /user/:id │  │PATCH /:id/read     │    │
│  └──────────────┘  │POST /check/:id│ │DELETE /clear       │    │
│  ┌──────────────┐  └──────────────┘  └─────────────────────┘    │
│  │categoryRoutes│  ┌──────────────┐  ┌─────────────────────┐    │
│  │GET /         │  │userRoutes    │  │announcementRoutes  │    │
│  │POST /        │  │GET /leaderboard│GET /               │    │
│  └──────────────┘  │GET /:id      │  │POST /               │    │
│                    │PATCH /:id    │  │DELETE /:id          │    │
│                    └──────────────┘  └─────────────────────┘    │
└───────────────────────────┬───────────────────────────────────────┘
                            │ Mongoose
                   ┌────────▼──────────┐
                   │     MongoDB       │
                   │                   │
                   │  • users          │
                   │  • userprofiles   │
                   │  • faqs           │
                   │  • discussions    │
                   │  • categories     │
                   │  • badges         │
                   │  • announcements  │
                   │  • notifications  │
                   └───────────────────┘
```

---

## Pages

### HomePage (`/`) — Public FAQ Browser
- Read pinned announcements at the top
- Search FAQs by keyword (live search via `GET /api/faqs?search=`)
- Browse categories via interactive bubble cloud (centered cluster, glassmorphism, spring animations)
- View trending FAQs (top 10 by upvotes) and recently added FAQs
- Navigate to Discussions or login/register

### DiscussionPage (`/discussions`) — Community Forum
- Browse all discussions, filterable by category and sortable (Recent / Most Upvoted / Unanswered)
- Search discussions by keyword
- Ask new questions with title, description, category, and up to 5 image attachments
- Submit answers and comments on any discussion
- Upvote or downvote discussions (one vote per user)
- Accordion-style expansion for full detail view with lightbox image previews
- Spellchecker with real-time wavy red underlines and suggestion dropdown

### AllFaqsPage (`/all-faqs`) — Full FAQ Listing
- Complete paginated listing of all approved FAQs
- Search by keyword
- Filter by category

### FaqPage (`/faq/:id`) — Single FAQ View
- Full FAQ question and answer
- Upvote button
- Related discussions

### BadgesPage (`/badges`) — Badge Gallery
- All 8 badges displayed in tier groups (Bronze/Silver/Gold/Platinum)
- Each badge shows name, icon, tier, and description

### LeaderboardPage (`/leaderboard`) — User Rankings
- Top users ranked by badge points
- Live rank and delta indicators

### NotificationsPage (`/notifications`) — Notification Center
- All notifications for the logged-in user
- Mark as read and clear all functionality

### UserProfilePage (`/profile`) — User Profile
- Bio, avatar, earned badges, and activity statistics
- Questions asked, answers given, upvotes received

### AdminPage (`/admin`) — Admin Control Panel (Admin only)
1. **Analytics** — Total FAQs, total users, most active category, most upvoted question
2. **Announcements** — Create and view system-wide announcements
3. **Discussion Moderation** — View all discussions; verify, approve, reject, or delete
4. **FAQ Management** — View, approve, or delete all FAQs
5. **Badge Analytics** — Per-badge award counts
6. **Create FAQ Manually** — Hand-craft FAQs with question, answer, and category

---

## Auth Flow (JWT)

1. **Register** — Client sends `username`, `email`, `password` → server creates user with `bcrypt.hash(password)`, returns user object (no token).
2. **Login** — Client sends `email`, `password` → server verifies with `bcrypt.compare()`, returns `{ token, user: { id, username, email, role } }`.
3. **Token storage** — Client stores JWT in `localStorage` under key `"token"`.
4. **Token usage** — Every axios request includes `Authorization: Bearer <token>` header via a request interceptor.
5. **Token verification** — `verifyToken` middleware on protected routes decodes the JWT via `jwt.verify(token, SECRET)`, attaches `req.user`, and returns `401` if missing/invalid.
6. **Admin check** — `verifyAdmin` checks `req.user.role === "admin"`, returns `403` if not.

---

## Folder Structure

```
faq-system/
├── backend/
│   ├── .env                         # MongoDB URI, JWT secret, port (NOT committed)
│   ├── server.js                    # Express app entry; mounts all route prefixes
│   ├── models/
│   │   ├── User.js                  # username, email, passwordHash, role
│   │   ├── UserProfile.js           # user (ref), bio, avatar, badges[], stats
│   │   ├── Faq.js                   # question, answer, category, upvotes, views, status
│   │   ├── Discussion.js            # title, description, category, author, status,
│   │   │                           #   upvotes, downvotes, votedBy[], images[],
│   │   │                           #   answers[], comments[]
│   │   ├── Category.js              # name, description, icon, color
│   │   ├── Badge.js                 # name, description, icon, tier, criteria
│   │   ├── Announcement.js          # title, content, createdAt
│   │   └── Notification.js          # user (ref), type, message, read, createdAt
│   ├── routes/
│   │   ├── authRoutes.js            # POST /register, POST /login, GET /me
│   │   ├── faqRoutes.js             # CRUD /faqs, GET /trending, /recent,
│   │   │                           #   PATCH /:id/upvote, PATCH /:id/approve
│   │   ├── discussionRoutes.js      # CRUD /discussions, POST/PATCH answers/comments,
│   │   │                           #   vote endpoints, image upload (multer)
│   │   ├── categoryRoutes.js        # GET/POST /categories
│   │   ├── badgeRoutes.js           # GET /, GET /user/:id, POST /check/:id
│   │   ├── userRoutes.js            # GET /leaderboard, GET/PATCH /:id
│   │   ├── adminRoutes.js           # GET /analytics, /discussions, approve/reject/verify
│   │   ├── notificationRoutes.js    # GET /, PATCH /:id/read, DELETE /clear
│   │   └── announcementRoutes.js    # GET/POST/DELETE /announcements
│   ├── middleware/
│   │   └── auth.js                  # verifyToken (JWT), verifyAdmin (role check)
│   ├── utils/
│   │   └── badgeEngine.js           # Badge award logic based on user stats
│   ├── services/
│   │   └── queryImprover.js         # Query improvement for search
│   ├── uploads/                     # Uploaded images (gitignored)
│   ├── seed.js                      # Creates default test accounts
│   ├── seed-faq-data.js             # Seeds categories and FAQs
│   ├── seed-badges.js               # Seeds badge definitions
│   ├── cleanup-badges.js            # Cleanup script for duplicate badges
│   └── package.json
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── src/
│       ├── main.jsx                 # React root; renders App inside StrictMode
│       ├── App.jsx                  # Router: all page routes
│       ├── index.css                # Tailwind imports + CSS variables (dark/light theme)
│       ├── api/
│       │   └── axios.js             # Axios instance; baseURL :5000; JWT interceptor
│       ├── context/
│       │   ├── AuthContext.jsx      # currentUser, isAdmin, login(), logout()
│       │   ├── CategoryContext.jsx  # categories, icons, fetch from API
│       │   ├── NotificationContext.jsx # notifications, unread count
│       │   └── ThemeContext.jsx     # dark/light theme toggle
│       ├── components/
│       │   ├── AppLayout.jsx        # Navbar + Sidebar wrapper
│       │   ├── Navbar.jsx           # Top navigation; search, user menu, notifications
│       │   ├── Sidebar.jsx          # Left sidebar with nav links
│       │   ├── ProtectedRoute.jsx   # Redirects to /login if not authenticated
│       │   ├── StatusBadge.jsx      # Reusable status badge component
│       │   ├── Avatar.jsx           # User avatar with initials fallback
│       │   ├── Toast.jsx            # Toast notification system
│       │   ├── CommandPalette.jsx   # Ctrl+K spotlight search
│       │   ├── CategoryBubble.jsx   # Individual bubble in category cloud
│       │   ├── CategoryCard.jsx     # Category card for grid/list views
│       │   ├── BadgeDisplay.jsx     # Badge card with tier, icon, name, description
│       │   ├── UserBadgeChip.jsx    # Small badge chip for user profiles
│       │   ├── ImageUpload.jsx      # Drag-and-drop image upload with preview/lightbox
│       │   ├── GrammarCheckField.jsx # Textarea with spellcheck underline overlay
│       │   ├── useTypoCheck.js      # Hook: spellcheck logic, dictionary, suggestions
│       │   └── TypoOverlay.jsx      # Renders wavy underlines on misspelled words
│       └── pages/
│           ├── HomePage.jsx         # Public FAQ landing page
│           ├── AllFaqsPage.jsx      # Full FAQ listing with search/filter
│           ├── FaqPage.jsx          # Single FAQ view
│           ├── DiscussionPage.jsx   # Community forum (ask, answer, comment, vote)
│           ├── BadgesPage.jsx       # Public badge gallery
│           ├── LeaderboardPage.jsx  # User rankings
│           ├── NotificationsPage.jsx # Notification center
│           ├── UserProfilePage.jsx  # User profile with badges and stats
│           ├── LoginPage.jsx        # Login form
│           ├── RegisterPage.jsx     # Registration form
│           └── AdminPage.jsx        # Admin control panel
│
└── docs/
    ├── README.md                    # Setup instructions, API reference, tech stack
    ├── CONTEXT.md                   # This file
    └── VERSION.md                   # Changelog / feature list
```

---

## Key Design Decisions

### Image Upload
- Discussions support up to 5 image attachments (JPG, PNG, WEBP, GIF; max 5MB each)
- Frontend validates file type and size before upload; backend re-validates with Multer
- Images stored in `backend/uploads/`; served statically via `/discussions/uploads/`
- Clicking an image in the expanded discussion view opens a fullscreen lightbox (pointer-events-none overlay so clicks reach the img element)

### Spellchecker
- Pure client-side — no API calls, no network latency
- Embedded ~14,000-word English dictionary loaded once at mount
- Levenshtein distance ≤ 2 for fuzzy matching
- `useTypoCheck` hook returns `typoCheck.value` (marked-up HTML) and `typoCheck.suggestions` (map of word → array of suggestions)
- `GrammarCheckField` renders the textarea with an absolutely-positioned overlay div showing wavy red underlines
- Clicking an underlined word opens a suggestion dropdown below the word

### Badge System
- Badges are seeded once via `seed-badges.js` and stored in the `Badge` collection
- The badge engine (`utils/badgeEngine.js`) is pure logic — given user stats, it returns which badges should be awarded
- `POST /api/badges/check/:userId` runs the engine and saves newly earned badges to the user's `UserProfile`
- Badges are never revoked even if stats drop below threshold

### Category Bubble Cloud
- Categories are stored in the `Category` collection, not hardcoded
- `CategoryContext` fetches them from `GET /api/categories` at startup
- `CategoryBubble.jsx` uses a `PALETTE` map for deterministic HSL colors per category name
- Bubbles use `position: absolute` with pre-calculated positions; spring hover via CSS transitions (scale 1.07)
- `ResizeObserver` triggers re-layout when the container size changes

### Dark/Light Theme
- All colors use CSS custom properties: `rgb(var(--text-primary))`, `rgb(var(--bg-surface))`, etc.
- Toggling theme swaps a `data-theme="dark"|"light"` attribute on `<html>`
- Tailwind config uses arbitrary values `rgb(var(--xxx))` to read from these variables