# VERSION.md — Changelog

All notable features and changes in the Vicharanashala FAQ Management System.

---

## v1.1 — Current Release

### Pages & Navigation
- **11 pages**: HomePage, LoginPage, RegisterPage, DiscussionPage, AllFaqsPage, FaqPage, BadgesPage, LeaderboardPage, NotificationsPage, UserProfilePage, AdminPage
- **AppLayout** — shared layout with Navbar + Sidebar on all pages
- **Command Palette** — `Ctrl+K` spotlight search across discussions and FAQs
- **Protected routes** — `/notifications`, `/profile` require login; `/admin` requires admin role
- **Dark/light theme toggle** via ThemeContext

---

### Authentication & Authorization
- **User registration** — username, email, password (bcrypt hashed); role defaults to `user`
- **User login** — email + password validation; returns JWT token on success
- **JWT middleware** — `verifyToken` protects routes; `401` if token missing or invalid
- **Admin middleware** — `verifyAdmin` checks `role === "admin"`; `403` if unauthorized
- **Role-based redirects** — AdminPage protected; non-admins redirected to `/`
- **AuthContext** — manages `currentUser`, `isAdmin`, `login()`, `logout()`; persists token in localStorage; axios interceptor auto-attaches `Authorization: Bearer <token>`

---

### FAQ System
- **Browse FAQs** — HomePage lists trending (top 10 by upvotes) and recently added (last 10)
- **AllFaqsPage** — full paginated listing with search and category filtering
- **FaqPage** — single FAQ view with full answer, upvotes, and related discussions
- **Search FAQs** — keyword search via `$regex` on question and answer fields, case-insensitive
- **Category bubble cloud** — centered glassmorphism cluster of category bubbles with spring hover animations (1.07× scale), ResizeObserver responsive reflow, bubble radii 36–90px
- **Category browsing** — clicking a category navigates to DiscussionPage filtered by that category
- **Upvote FAQs** — authenticated users can upvote; one vote per user tracked by `votedBy` array
- **Create FAQ manually** — admin can hand-craft FAQs with question, answer, and category
- **Delete FAQ** — admin can delete any FAQ
- **Approve FAQ** — admin can approve a pending FAQ

---

### Discussion Forum
- **Create discussion** — authenticated users can post a new question with title, description, category, and up to 5 attached images
- **Image uploads** — drag-and-drop + click-to-upload; JPG, PNG, WEBP, GIF; max 5 images, 5MB each; frontend + backend validation; lightbox expansion on click
- **List discussions** — filter by category, sort by Recent / Most Upvoted / Unanswered
- **Search discussions** — keyword search on title and description
- **Expand/collapse** — accordion-style card expansion revealing full details, images, answers, and comments
- **Answer discussions** — any authenticated user can submit an answer
- **Comment on discussions** — any authenticated user can add comments
- **Upvote / Downvote** — one vote per user; toggles between upvote/downvote; `votedBy` array prevents double voting
- **Status workflow** — `unanswered` → `pending` (on first answer) → `answered` → `approved` (moved to FAQ) or `rejected`
- **Admin verified answers** — admin can mark an answer as `isVerified`; shown with a green badge

### Spellchecker
- **Pure client-side** — no API calls; embedded ~14,000-word English dictionary
- **Levenshtein distance** ≤ 2 fuzzy matching for typo detection
- **Real-time inline wavy red underlines** on misspelled words
- **Clickable suggestion popups** with autocomplete-style dropdown in the Ask a Question modal

---

### Badge System
- **8 badges** across 4 tiers: Bronze (First Question, First Answer), Silver (Verified Contributor, Helping Hand), Gold (Problem Solver, Popular Voice), Platinum (Community Champion, Top Contributor)
- **Backend badge engine** — `utils/badgeEngine.js` evaluates badge awards based on user stats
- **Badge check endpoint** — `POST /api/badges/check/:userId` triggers award evaluation
- **Badge display** — `BadgeDisplay.jsx` shows badge tier, icon, name, description; `UserBadgeChip.jsx` shows earned badges on user profiles
- **BadgesPage** — public gallery of all badges with tier grouping
- **UserProfilePage** — displays all earned badges and statistics

---

### Leaderboard
- **Top users** ranked by points (badges × tier weights)
- **Live rank display** with delta indicators

---

### Notifications
- **In-app notifications** for new answers, badge awards, and discussion updates
- **Mark as read** and **clear all** functionality
- **Badge count** in navbar

---

### Admin Panel (6 Sections)
1. **Analytics dashboard** — total FAQs, total users, most active category, most upvoted question
2. **Announcements** — create and view announcements shown on HomePage
3. **Discussion Moderation** — view all discussions with category/status filters; "Verify & Approve" opens a modal showing answers sorted by upvotes; approve one as FAQ (deletes discussion); reject (deletes discussion); hard delete
4. **FAQ Management** — view all FAQs with status badges; approve or delete individual FAQs
5. **Create FAQ Manually** — admin form with question, answer, category dropdown
6. **Badge Analytics** — per-badge award counts

---

### Modal Workflow (Verify & Approve)
- Single "Verify & Approve" button opens a modal
- Answers displayed in descending order by upvote count
- Each answer card shows: rank, upvotes, verified badge, author username, content
- "Approve as FAQ" button on each card → creates FAQ with discussion title + answer content → deletes the discussion
- "Cancel" closes modal; clicking backdrop also closes

---

### Announcements
- **Public banner** — HomePage displays up to 2 most recent announcements in an amber banner
- **Admin CRUD** — admin can create and delete announcements

---

### Data Models
| Model          | Description                                                      |
|----------------|------------------------------------------------------------------|
| User           | username, email, passwordHash, role (`user` \| `admin`)         |
| UserProfile    | user (ref), bio, avatar, badge[], stats (questions, answers, upvotes) |
| Faq            | question, answer, category, upvotes, views, status, createdAt    |
| Discussion     | title, description, category, author (ref), status, upvotes, downvotes, votedBy[], images[], answers[], comments[] |
| Category       | name, description, icon, color                                   |
| Badge          | name, description, icon, tier, criteria                          |
| Announcement   | title, content, createdAt                                        |
| Notification   | user (ref), type, message, read, createdAt                       |

---

### Tech Stack
| Layer       | Technology                                            |
|-------------|-------------------------------------------------------|
| Frontend    | React 19.2.6, Vite 6, React Router v7.15.1, Tailwind CSS, Axios |
| Backend     | Node.js, Express.js                                   |
| Database    | MongoDB + Mongoose                                    |
| Auth        | JWT + bcrypt                                          |
| Spellcheck  | Custom embedded dictionary + Levenshtein distance     |

---

### Default Test Accounts
| Role   | Email            | Password  |
|--------|------------------|-----------|
| Admin  | admin@faq.com    | admin123  |
| User   | student1@faq.com  | test123   |
| User   | student2@faq.com  | test123   |