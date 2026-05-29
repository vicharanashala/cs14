# Vicharanashala Internship FAQ System — README

## Project Overview

A full-stack FAQ management system for the Vicharanashala IIT Ropar internship program. Users can browse and search approved FAQs, ask questions in discussion forums, and vote on answers. Administrators have a dedicated panel to moderate discussions, approve answers as FAQs, post announcements, and manage the FAQ database.

---

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18 + Vite + Tailwind CSS       |
| Backend   | Node.js + Express.js                |
| Database  | MongoDB (Mongoose ODM)             |
| Auth      | JWT (JSON Web Tokens) + bcrypt      |
| HTTP      | Axios                               |
| Parsing   | Cheerio (for scraping)              |

---

## Local Setup

### 1. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure environment

Create `backend/.env` with your values:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/faqDB
JWT_SECRET=your_jwt_secret_here
```

### 3. Seed the database

Creates default test accounts and sample data:

```bash
cd backend
node seed.js
```

### 4. Scrape FAQs (optional)

Fetches FAQs from `https://samagama.in/internship/faq` and inserts new ones into the database:

```bash
cd backend
node scrape-faq.js
```

### 5. Start the backend

```bash
cd backend
node server.js
# Runs on http://localhost:5000
```

### 6. Start the frontend

```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

---

## Default Test Accounts

| Role     | Email              | Password   |
|----------|--------------------|------------|
| Admin    | admin@faq.com      | admin123   |
| User     | student1@faq.com   | test123    |
| User     | student2@faq.com   | test123    |

---

## API Endpoints

### Authentication

| Method | Route                     | Auth Required | Description                              |
|--------|---------------------------|--------------|------------------------------------------|
| POST   | `/api/auth/register`       | No           | Register a new user account              |
| POST   | `/api/auth/login`          | No           | Login → returns JWT token                |

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
| POST   | `/api/discussions`                         | User         | Create a new discussion                 |
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

### Admin

| Method | Route                                         | Auth Required | Description                              |
|--------|-----------------------------------------------|--------------|------------------------------------------|
| GET    | `/api/admin/discussions`                      | Admin        | All discussions; supports `?category=`, `?status=` filters |
| GET    | `/api/admin/analytics`                        | Admin        | Dashboard stats (FAQ count, user count, top question) |
| PATCH  | `/api/admin/discussions/:id/verify-answer`   | Admin        | Mark an answer as verified               |
| PATCH  | `/api/admin/discussions/:id/approve`         | Admin        | Approve best answer → creates FAQ and deletes discussion |
| PATCH  | `/api/admin/discussions/:id/reject`           | Admin        | Reject/discard a discussion             |
| DELETE | `/api/admin/discussions/:id`                  | Admin        | Hard-delete a discussion                 |