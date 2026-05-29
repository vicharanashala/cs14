# CONTEXT.md — Architecture & Design Decisions

## Architecture Diagram (Text)

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                         │
│                                                                  │
│  ┌─────────────┐   ┌──────────────┐   ┌───────────────────────┐ │
│  │ HomePage   │   │ Discussion   │   │ AdminPage             │ │
│  │ (browse/   │   │ Page         │   │ (admin only)           │ │
│  │  search)   │   │ (forum)      │   │                       │ │
│  └─────┬──────┘   └──────┬───────┘   └───────────┬───────────┘ │
│        │                  │                      │              │
│  ┌─────▼──────────────────▼──────────────────────▼───────────┐  │
│  │                    React Router (App.jsx)                   │  │
│  │   /  /login  /register  /discussions  /admin  (protected)  │  │
│  └────────────────────────────────────────────────────────────┘  │
│                              │                                    │
│                    ┌─────────▼──────────┐                        │
│                    │   axios (api.js)    │                        │
│                    │  baseURL: :5000     │                        │
│                    │  JWT interceptor    │                        │
│                    └─────────┬──────────┘                        │
└───────────────────────────────│───────────────────────────────────┘
                                │ HTTP / JSON
┌───────────────────────────────▼───────────────────────────────────┐
│                       SERVER (Express :5000)                       │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │                   Route Middleware                         │    │
│  │   verifyToken ────────────────────────────────────────────  │    │
│  │   verifyAdmin ────────────────────────────────────────────  │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌──────────────┐  ┌─────────────┐  ┌─────────────────────┐    │
│  │ authRoutes   │  │ faqRoutes   │  │ discussionRoutes   │    │
│  │ POST /register│  │ GET /faqs   │  │ GET /discussions    │    │
│  │ POST /login  │  │ GET /:id    │  │ POST /              │    │
│  └──────────────┘  │ POST /      │  │ POST /:id/answers   │    │
│                    │ DELETE /:id │  │ PATCH /:id/upvote   │    │
│  ┌──────────────┐  └─────────────┘  └─────────────────────┘    │
│  │adminRoutes   │  ┌─────────────┐  ┌─────────────────────┐    │
│  │ GET /analytics│  │announcement│  │ (discussion cont.)  │    │
│  │ GET /discussions│ │ Routes     │  │ PATCH /:id/downvote│    │
│  │ PATCH /approve│  │ GET /      │  │ POST /:id/comments │    │
│  │ PATCH /reject │  │ POST /     │  └─────────────────────┘    │
│  └──────────────┘  └─────────────┘                             │
└────────────────────────────┬────────────────────────────────────┘
                             │ Mongoose
                    ┌────────▼─────────┐
                    │    MongoDB       │
                    │                  │
                    │  • users         │
                    │  • faqs          │
                    │  • discussions   │
                    │  • announcements │
                    └──────────────────┘
```

---

## Three Main Pages

### 1. HomePage (`/`) — Public FAQ Browser
Serves as the landing page. Anyone (logged in or not) can:
- Read pinned announcements at the top
- Search FAQs by keyword (live search via `GET /api/faqs?search=`)
- Browse FAQs by category (clicking a category navigates to DiscussionPage with that category pre-filtered)
- View trending FAQs (top 10 by upvotes) and recently added FAQs
- Navigate to Discussions or login/register

**Auth role:** Public. No token required.

---

### 2. DiscussionPage (`/discussions`) — Community Forum
A full discussion forum where users:
- Browse all discussions, filterable by category and sortable (Recent / Most Upvoted / Unanswered)
- Search discussions by keyword
- Ask new questions (requires login)
- Submit answers to any discussion
- Submit comments on any discussion
- Upvote or downvote discussions (one vote per user, tracked via `votedBy`)

**Auth role:** Requires login for asking questions, submitting answers/comments, and voting. Public for browsing.

---

### 3. AdminPage (`/admin`) — Admin Control Panel
Restricted to users with `role: "admin"`. Has 5 sections:

1. **Analytics** — Total FAQs, total users, most active category, most upvoted question
2. **Announcements** — Create and view system-wide announcements (shown on HomePage)
3. **Discussion Moderation** — View all discussions, filter by category/status; "Verify & Approve" opens a modal to review answers sorted by upvotes and approve one as an FAQ (deletes the discussion); Reject or Delete removes a discussion
4. **FAQ Management** — View all FAQs (approved/pending/rejected); approve or delete individual FAQs
5. **Create FAQ Manually** — Admin can hand-craft an FAQ with a question, answer, and category

**Auth role:** Admin only. Non-admin users redirected to `/`.

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
│   │   ├── User.js                  # Mongoose schema: username, email, passwordHash, role
│   │   ├── Faq.js                   # Mongoose schema: question, answer, category, upvotes, status
│   │   ├── Discussion.js            # Mongoose schema: title, description, category, author, status, answers[], comments[]
│   │   └── Announcement.js          # Mongoose schema: title, content, createdAt
│   ├── routes/
│   │   ├── authRoutes.js            # POST /register, POST /login
│   │   ├── faqRoutes.js             # CRUD /faqs, GET /trending, /recent, PATCH /:id/upvote, PATCH /:id/approve
│   │   ├── discussionRoutes.js      # CRUD /discussions, POST/PATCH answers/comments, vote endpoints
│   │   ├── adminRoutes.js           # GET /admin/analytics, /admin/discussions, approve/reject/verify routes
│   │   └── announcementRoutes.js    # GET/POST/DELETE /announcements
│   ├── middleware/
│   │   └── auth.js                  # verifyToken (JWT), verifyAdmin (role check)
│   ├── seed.js                      # One-time DB seeder: creates default users + sample data
│   ├── scrape-faq.js                # One-time scraper: fetches FAQs from samagama.in, dedupes, inserts
│   └── package.json
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── src/
│       ├── main.jsx                  # React root; renders App inside React.StrictMode
│       ├── App.jsx                  # Router: / /login /register /discussions /admin
│       ├── App.css
│       ├── index.css
│       ├── api/
│       │   └── axios.js             # Axios instance; baseURL:5000; request interceptor adds JWT
│       ├── context/
│       │   └── AuthContext.jsx      # currentUser, isAdmin, login(), logout(); persists token in localStorage
│       ├── components/
│       │   ├── Navbar.jsx           # Top nav bar; shows "Admin Panel" link only for admins
│       │   ├── StatusBadge.jsx      # Reusable status badge (unanswered/pending/answered/approved/rejected)
│       │   └── ProtectedRoute.jsx   # Redirects to /login if not authenticated; redirects to / if not admin
│       └── pages/
│           ├── HomePage.jsx         # Public FAQ landing page
│           ├── LoginPage.jsx        # Login form
│           ├── RegisterPage.jsx     # Registration form
│           ├── DiscussionPage.jsx   # Community forum
│           └── AdminPage.jsx        # Admin control panel
│
└── docs/
    ├── README.md                    # Setup instructions, API reference, tech stack
    ├── CONTEXT.md                   # This file
    └── VERSION.md                   # Changelog / feature list
```