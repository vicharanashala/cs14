# 🌟 FAQ System

> **An AI-powered FAQ, discussion, and moderation platform built with the MERN Stack.**
>
> A centralized knowledge-sharing platform where students can ask questions, discover FAQs, receive AI assistance, and interact with the community while administrators moderate, verify, and manage content efficiently.

---

## 📚 Table of Contents

* ✨ Features
* 🏗️ System Architecture
* 🛠️ Tech Stack
* 📁 Project Structure
* 🚀 Getting Started
* 🌱 Database Seeding
* 🔑 Authentication
* 🖥️ Run Locally
* 📄 FAQs & Categories
* ➕ Query Management
* 🛠️ Admin Panel
* 🏆 Reputation System
* 🛡️ Audit Logging & Telemetry
* 🎨 Design Aesthetics
* 📸 Screenshots
* 🚀 Future Enhancements

---

# ✨ Features

## 🤖 AI-Powered Features

* AI-generated question title suggestions
* AI-generated description suggestions
* Duplicate question detection
* Similar FAQ recommendations
* Related query suggestions
* AI-generated answer suggestions for admins
* AI-powered FAQ recommendation engine
* Floating AI chatbot for instant assistance

---

## 📂 Smart Category Management

* Database-driven category system
* Dynamic category loading
* 13 predefined categories
* 1 "Other" category
* Admin-controlled category assignment
* Dynamic category cards
* Category size based on question count
* Frequency-based FAQ sorting

---

## 📄 Document & Image Uploads

Users can attach:

* Images
* Screenshots
* DOC files
* PDF files

This allows users to provide additional context while creating queries.

---

## 💬 Community Discussion System

* Ask questions
* Answer questions
* Comment on answers
* Reply to discussions
* Upvote questions
* Downvote questions
* Community-driven knowledge sharing

---

## 🏆 Reputation & Gamification

### Badges

Users earn badges based on:

* Activity
* Milestones
* Helpful contributions
* Accepted answers

Badges appear next to usernames.

### Classes & Leagues

Users progress through leagues based on admin-approved answers.

Benefits include:

* Increased reputation
* Community recognition
* Neon-highlighted usernames

---

## ⭐ FAQ Promotion System

If a student answer receives **10+ upvotes**:

* It becomes eligible for FAQ promotion
* A special ⭐ mark is displayed
* Community answers become official FAQs

---

## 🔍 Search & Discovery

* Search approved FAQs
* Search unresolved queries
* Search highlighting
* Trending FAQs
* Most searched questions
* Recently answered FAQs
* Category-wise browsing
* AI recommendations

---

## 🔐 Authentication & Security

* JWT Authentication
* bcrypt Password Hashing
* Protected Routes
* Role-Based Access Control
* Secure Session Management

---

## 📢 Announcement System

Administrators can:

* Create announcements
* Publish updates
* Broadcast important notices

Announcements are displayed across the platform.

---

# 🏗️ System Architecture

```text
Frontend (React + Vite)
         ↓
Backend (Node.js + Express)
         ↓
MongoDB Database
         ↓
AI Services Layer
         ↓
Admin Moderation Layer
```

### Workflow

1. User searches FAQs.
2. If no answer exists, user creates a query.
3. AI suggests improvements and detects duplicates.
4. Admin reviews and verifies content.
5. Approved answers become FAQs.
6. Audit logs track all activities.

---

# 🛠️ Tech Stack

| Layer       | Technologies                                         |
| ----------- | ---------------------------------------------------- |
| Frontend    | React, Vite, Tailwind CSS, React Router DOM, Axios   |
| Backend     | Node.js, Express.js                                  |
| Database    | MongoDB, Mongoose                                    |
| Security    | JWT, bcryptjs                                        |
| AI Features | Similarity Matching, Recommendations, AI Suggestions |

---

# 📁 Project Structure

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

# 🚀 Getting Started

## Prerequisites

Install:

* Node.js v18+
* npm
* MongoDB

---

## Clone Repository

```bash
git clone <https://github.com/vicharanashala/cs14>
cd faq-system
```

---

## Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```env
PORT=5000

MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/faqDB

JWT_SECRET=your_secure_secret
```

---

## Frontend Setup

```bash
cd frontend
npm install
```

---

# 🌱 Database Seeding

Populate the database with:

* Categories
* Admin accounts
* Student accounts
* FAQs
* Discussions
* Announcements

```bash
cd backend
npm run seed
```

Reset and seed again:

```bash
node seed.js --force
```

---

# 🔑 Authentication

## Admin Account

```text
Email: admin@faq.com
Password: admin123
```

### Admin Access

* Moderation Queue
* Analytics Dashboard
* Category Management
* Audit Logs
* Announcements

---

## Student Account

```text
Email: student1@faq.com
Password: test123
```

### Student Access

* FAQ Browsing
* Query Submission
* Voting
* Discussions
* File Uploads

---

## Register New Account

Users can create accounts using:

```text
/register
```

Requirements:

* Username
* Email
* Password (minimum 6 characters)

---

# 🖥️ Run Locally

## Start Backend

```bash
cd backend
npm start
```

Expected Output:

```text
Server running on port 5000
MongoDB Connected
```

---

## Start Frontend

```bash
cd frontend
npm run dev
```

Open:

```text
http://localhost:5173
```

---

# 📄 FAQs & Categories

The homepage provides:

* Search bar
* 13 category cards
* Trending FAQs
* Most searched questions
* Recently answered FAQs
* AI recommendations
* Announcements
* Login system
* AI chatbot

Purpose:

Help users discover answers before creating new questions.

---

# ➕ Query Management

Users can:

* Search existing FAQs
* Search unresolved queries
* Browse categories
* Create queries
* Upload files
* Interact with discussions

### Query Form

* Question Title
* Question Description
* Category Selection
* Image Upload
* Document Upload

### AI Assistance

* Duplicate Detection
* Similar FAQ Suggestions
* Better Title Suggestions
* Better Description Suggestions

### Status Labels

* Answered
* Pending
* Unanswered

### Filters

* Most Upvoted
* Recent
* Unanswered

---

# 🛠️ Admin Panel

## Query Moderation

* View Queries
* Answer Questions
* Verify Answers
* Approve Answers
* Reject Answers
* Edit Content
* Delete Spam
* Merge Duplicates

---

## Category Management

* Create Categories
* Update Categories
* Assign Categories

---

## FAQ Management

* Manage Rankings
* Export FAQ Data
* Promote Community Answers

---

## User Management

* Handle Reports
* Manage Users
* Review Contributions

---

## Announcement Management

* Create Announcements
* Publish Notices
* Update Broadcasts

---

## Analytics Dashboard

Displays:

* Total FAQs
* Total Users
* Total Questions
* Total Answers
* Most Active Category
* Most Upvoted Question

---

# 🏆 Reputation System

### Badges

Awarded for:

* Activity
* Contributions
* Accepted Answers
* Community Engagement

### Leagues

Users move through classes based on:

* Accepted Answers
* Reputation Score
* Community Impact

### Benefits

* Enhanced Recognition
* Neon Username Effects
* Higher Community Visibility

---

# 🛡️ Audit Logging & Telemetry

### Audit Logs

Tracks:

* Logins
* Approvals
* Rejections
* Category Updates
* Announcements
* Content Deletions

### Telemetry Dashboard

Shows:

* CPU Usage
* RAM Usage
* API Latency
* System Health Metrics

---

# 🎨 Design Aesthetics

### Visual Style

* Glassmorphism UI
* Smooth Animations
* Responsive Layout
* Modern Dashboard Design
* Dark Mode
* Light Mode

### Typography

* Outfit Font (Headings)
* Inter Font (Body)

### User Experience

* Dynamic Category Cards
* Floating Chatbot
* Fast Navigation
* Clean Layout

---

# 📸 Screenshots

Add screenshots here:

```md
screenshots/
├── homepage.png
├── category-page.png
├── query-page.png
├── admin-dashboard.png
└── chatbot.png
```

---

# 🚀 Future Enhancements

* Real-time notifications
* Email alerts
* Mobile application
* Advanced analytics
* AI answer verification
* Leaderboards
* Community challenges

---

# 👨‍💻 Contributors

* Your Name
* Team Members

---

# 📜 License

This project is licensed under the MIT License.
