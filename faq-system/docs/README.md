# Vicharanashala Internship FAQ System — README

## Project Overview

A full-stack FAQ management and community discussion platform for the Vicharanashala IIT Ropar internship program. Users can browse and search approved FAQs, ask questions in discussion forums, earn badges, and vote on answers. Administrators moderate discussions, approve answers as FAQs, post announcements, and manage the entire FAQ database.

---

## Tech Stack

| Layer     | Technology                                      |
|-----------|-------------------------------------------------|
| Frontend  | React 19 + Vite 6 + Tailwind CSS + React Router v7 |
| Backend   | Node.js + Express.js                            |
| Database  | MongoDB (Mongoose ODM)                         |
| Auth      | JWT (jsonwebtoken) + bcrypt                    |
| HTTP      | Axios                                           |
| Spell     | Custom ~14,000-word English dictionary + Levenshtein distance |

---

## Local Setup

### 1. Install dependencies

```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 2. Configure environment

Create `backend/.env` with your values:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/faqDB
JWT_SECRET=your_jwt_secret_here
```

### 3. Seed the database

Creates default test accounts, sample data, and all badges:

```bash
cd backend
node seed.js
node seed-faq-data.js   # Seeds categories and FAQs
node seed-badges.js     # Seeds badge definitions
```

### 4. Start the backend

```bash
cd backend
node server.js
# Runs on http://localhost:5000
```

### 5. Start the frontend

```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

---

## Default Test Accounts

| Role   | Email              | Password   |
|--------|--------------------|------------|
| Admin  | admin@faq.com      | admin123   |
| User   | student1@faq.com   | test123    |
| User   | student2@faq.com   | test123    |

---

## Pages

| Route               | Page                    | Access         |
|---------------------|-------------------------|----------------|
| `/`                 | HomePage                | Public         |
| `/login`            | LoginPage               | Public         |
| `/register`         | RegisterPage            | Public         |
| `/discussions`      | DiscussionPage          | Public (write: login) |
| `/all-faqs`         | AllFaqsPage             | Public         |
| `/faq/:id`          | FaqPage                 | Public         |
| `/badges`           | BadgesPage              | Public         |
| `/leaderboard`      | LeaderboardPage         | Public         |
| `/notifications`    | NotificationsPage       | Authenticated  |
| `/profile`          | UserProfilePage         | Authenticated  |
| `/admin`            | AdminPage               | Admin only     |

---

## API Endpoints

### Authentication

| Method | Route                  | Auth Required | Description                       |
|--------|------------------------|--------------|-----------------------------------|
| POST   | `/api/auth/register`    | No           | Register a new user account       |
| POST   | `/api/auth/login`       | No           | Login → returns JWT token         |
| GET    | `/api/auth/me`          | Yes          | Get current user profile          |

### Categories

| Method | Route                  | Auth Required | Description                       |
|--------|------------------------|--------------|-----------------------------------|
| GET    | `/api/categories`       | No           | List all categories               |
| POST   | `/api/categories`       | Admin        | Create a new category             |

### FAQs

| Method | Route                               | Auth Required | Description                              |
|--------|-------------------------------------|--------------|------------------------------------------|
| GET    | `/api/faqs`                          | No           | List all approved FAQs; supports `?search=` query |
| GET    | `/api/faqs/trending`                 | No           | Top 10 FAQs sorted by upvotes            |
| GET    | `/api/faqs/recent`                   | No           | 10 most recently created FAQs            |
| GET    | `/api/faqs/:id`                      | No           | Get single FAQ by ID                     |
| POST   | `/api/faqs`                          | Admin        | Create a new FAQ                        |
| DELETE | `/api/faqs/:id`                      | Admin        | Delete an FAQ                           |
| PATCH  | `/api/faqs/:id/approve`              | Admin        | Set FAQ status to "approved"            |
| PATCH  | `/api/faqs/:id/upvote`               | User         | Upvote an FAQ                            |

### Discussions

| Method | Route                                      | Auth Required | Description                              |
|--------|--------------------------------------------|--------------|------------------------------------------|
| GET    | `/api/discussions`                         | No           | List discussions; supports `?category=`, `?search=`, `?sort=` |
| GET    | `/api/discussions/:id`                     | No           | Get single discussion with answers/comments |
| POST   | `/api/discussions`                         | User         | Create a new discussion (supports image uploads) |
| DELETE | `/api/discussions/:id`                     | User         | Delete own discussion                    |
| POST   | `/api/discussions/:id/answers`             | User         | Submit an answer to a discussion         |
| POST   | `/api/discussions/:id/comments`            | User         | Submit a comment on a discussion        |
| PATCH  | `/api/discussions/:id/upvote`              | User         | Upvote a discussion                     |
| PATCH  | `/api/discussions/:id/downvote`            | User         | Downvote a discussion                   |

### Announcements

| Method | Route                    | Auth Required | Description                         |
|--------|--------------------------|--------------|-------------------------------------|
| GET    | `/api/announcements`     | No           | List all announcements             |
| POST   | `/api/announcements`      | Admin        | Create an announcement              |
| DELETE | `/api/announcements/:id`  | Admin        | Delete an announcement             |

### Badges

| Method | Route                     | Auth Required | Description                       |
|--------|---------------------------|--------------|-----------------------------------|
| GET    | `/api/badges`              | No           | List all badge definitions        |
| GET    | `/api/badges/user/:userId` | Yes          | Get all badges earned by a user   |
| POST   | `/api/badges/check/:userId`| Yes          | Trigger badge award check for user |

### Users / Leaderboard

| Method | Route                     | Auth Required | Description                       |
|--------|---------------------------|--------------|-----------------------------------|
| GET    | `/api/users/leaderboard`   | No           | Top users by points              |
| GET    | `/api/users/:id`           | No           | Get user profile                 |
| PATCH  | `/api/users/:id`           | User         | Update own profile               |

### Notifications

| Method | Route                          | Auth Required | Description                       |
|--------|--------------------------------|--------------|-----------------------------------|
| GET    | `/api/notifications`            | Yes          | Get notifications for current user |
| PATCH  | `/api/notifications/:id/read`   | Yes          | Mark a notification as read       |
| DELETE | `/api/notifications/clear`      | Yes          | Clear all notifications           |

### Admin

| Method | Route                                         | Auth Required | Description                              |
|--------|-----------------------------------------------|--------------|------------------------------------------|
| GET    | `/api/admin/discussions`                      | Admin        | All discussions; supports `?category=`, `?status=` filters |
| GET    | `/api/admin/analytics`                        | Admin        | Dashboard stats (FAQ count, user count, top question) |
| PATCH  | `/api/admin/discussions/:id/verify-answer`   | Admin        | Mark an answer as verified               |
| PATCH  | `/api/admin/discussions/:id/approve`         | Admin        | Approve best answer → creates FAQ and deletes discussion |
| PATCH  | `/api/admin/discussions/:id/reject`           | Admin        | Reject/discard a discussion             |
| DELETE | `/api/admin/discussions/:id`                  | Admin        | Hard-delete a discussion                 |