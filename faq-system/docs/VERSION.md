# VERSION.md — Changelog

All notable features and changes in the Vicharanashala FAQ Management System.

---

## v1.0 — Initial Release

### Authentication & Authorization
- **User registration** — username, email, password (bcrypt hashed); role defaults to `user`
- **User login** — email + password validation; returns JWT token on success
- **JWT middleware** — `verifyToken` protects routes; `401` if token missing or invalid
- **Admin middleware** — `verifyAdmin` checks `role === "admin"`; `403` if unauthorized
- **Role-based redirects** — AdminPage protected; non-admins redirected to `/`

### FAQ System
- **Browse FAQs** — HomePage lists trending (top 10 by upvotes) and recently added (last 10)
- **Search FAQs** — keyword search via `$regex` on question and answer fields, case-insensitive
- **Category browsing** — 13 internship-specific categories; clicking a category navigates to DiscussionPage filtered by that category
- **Upvote FAQs** — authenticated users can upvote; one vote per user tracked by `votedBy` array
- **Create FAQ manually** — admin can hand-craft FAQs with question, answer, and category
- **Delete FAQ** — admin can delete any FAQ
- **FAQ status** — each FAQ has a `status` field: `pending` (default on user submit) or `approved` (admin-created or admin-approved)

### Discussion Forum
- **Create discussion** — authenticated users can post a new question with title, description, and category
- **List discussions** — filter by category, sort by Recent / Most Upvoted / Unanswered
- **Search discussions** — keyword search on title and description
- **Answer discussions** — any authenticated user can submit an answer; first answer changes status `unanswered → pending`
- **Comment on discussions** — any authenticated user can add comments
- **Upvote / Downvote** — one vote per user; toggles between upvote/downvote; `votedBy` array prevents double voting
- **Status workflow** — `unanswered` → `pending` (on first answer) → `answered` → `approved` (moved to FAQ)
- **Admin verified answers** — admin can mark an answer as `isVerified`; shown with a green badge in the UI

### Admin Panel (5 Sections)
- **Analytics dashboard** — total FAQs, total users, most active category, most upvoted question
- **Announcements** — create and view announcements shown on HomePage
- **Discussion Moderation** — view all discussions with category/status filters; "Verify & Approve" opens a modal showing answers sorted by upvotes; approve one as FAQ (deletes discussion); reject (deletes discussion); hard delete
- **FAQ Management** — view all FAQs with status badges; approve or delete individual FAQs
- **Create FAQ Manually** — admin form with question, answer, category dropdown

### Modal Workflow (Verify & Approve)
- Single "Verify & Approve" button opens a modal
- Answers displayed in descending order by upvote count
- Each answer card shows: rank, upvotes, verified badge, author username, content
- "Approve as FAQ" button on each card → creates FAQ with the discussion's title and the selected answer's content → deletes the discussion
- "Cancel" closes modal; clicking backdrop also closes

### Announcements
- **Public banner** — HomePage displays up to 2 most recent announcements in an amber banner
- **Admin CRUD** — admin can create and delete announcements

### Data Models
- **User** — username, email, passwordHash, role (`user` | `admin`)
- **Faq** — question, answer, category (enum of 13), upvotes, status, createdAt, createdByAdmin (ref)
- **Discussion** — title, description, category, author (ref), status, upvotes, downvotes, votedBy[], answers[], comments[]
- **Answer (subdocument)** — author (ref), content, isVerified, upvotes, createdAt
- **Comment (subdocument)** — author (ref), content, createdAt
- **Announcement** — title, content, createdAt

### File & Folder Structure
```
faq-system/
├── backend/
│   ├── .env, server.js, models/, routes/, middleware/, seed.js, scrape-faq.js
├── frontend/
│   ├── src/
│   │   ├── App.jsx, main.jsx, api/axios.js, context/AuthContext.jsx
│   │   ├── components/ (Navbar, StatusBadge, ProtectedRoute)
│   │   └── pages/ (Home, Login, Register, Discussion, Admin)
│   └── index.html, vite.config.js, tailwind.config.js
└── docs/
    ├── README.md, CONTEXT.md, VERSION.md
```

### Tech Stack
- **Frontend:** React 18, Vite, React Router v6, Tailwind CSS, Axios
- **Backend:** Node.js, Express.js
- **Database:** MongoDB + Mongoose
- **Auth:** JWT + bcrypt
- **Scraping:** Axios + Cheerio

### Default Test Accounts
| Role   | Email            | Password  |
|--------|------------------|-----------|
| Admin  | admin@faq.com    | admin123  |
| User   | student1@faq.com  | test123   |
| User   | student2@faq.com  | test123   |