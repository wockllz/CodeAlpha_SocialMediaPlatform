# CodeAlpha Social Media Platform

A complete full-stack Social Media application built for the **CodeAlpha Full Stack Development Internship (Task 2)** submission.

---

## 🚀 Features

1. **User Authentication & Passwords**
   - User Registration & Login using `bcryptjs` password hashing.
   - Session-based authentication stored with `express-session`.
   - Access control middleware protecting routes and API actions.

2. **User Profiles**
   - View own and other users' public profiles.
   - Profile information includes bio, avatar image, join date, follower count, following count, and post count.
   - Profile customization (update bio, email, and avatar image URL).

3. **Posts Management**
   - Create text posts with optional image attachments (via image URL).
   - View posts in a global feed or filtered feed ("Following").
   - Detailed single-post view (`/posts/:id`).
   - Users can delete their own posts.

4. **Comments System**
   - Users can post comments on any post in the feed or single-post view.
   - Inline preview of comments on feed cards.
   - Delete own comments or comments made on user's own posts.

5. **Like & Follow System**
   - Dynamic Like/Unlike toggle on posts with real-time counter updates via AJAX.
   - Dynamic Follow/Unfollow toggle between users with live follower counter updates.
   - Suggested users widget to discover active community members.

6. **SQLite Database**
   - File-based SQLite relational database powered by `better-sqlite3`.
   - Foreign key constraints with cascading deletes for clean referential integrity.
   - Includes full schema and seeding script.

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** SQLite (`better-sqlite3`)
- **Frontend View Engine:** EJS (Embedded JavaScript templates)
- **Styling & Icons:** Modern custom CSS, FontAwesome 6, Google Fonts (*Plus Jakarta Sans*)
- **Authentication:** `express-session`, `bcryptjs`

---

## 📁 Project Structure

```
CodeAlpha_SocialMediaPlatform/
├── package.json          # Dependencies and npm scripts
├── server.js             # Express application entry point
├── db/
│   ├── schema.sql        # Database table definitions
│   ├── database.js      # SQLite connection & initialization
│   └── seed.js          # Database sample data seeder
├── routes/
│   ├── auth.js          # Login, Register, Logout routes
│   ├── posts.js         # Feed, Post creation, Post details, Comments
│   ├── profile.js       # User profile view and profile edit
│   └── social.js        # Like and Follow actions
├── middleware/
│   └── auth.js          # Authentication guard middleware
├── views/
│   ├── partials/
│   │   ├── header.ejs   # Navigation bar & global layout head
│   │   └── footer.ejs   # Footer script references & close tags
│   ├── index.ejs        # Social feed homepage
│   ├── profile.ejs      # User profile view & edit modal
│   ├── login.ejs        # User login page
│   ├── register.ejs     # User registration page
│   └── post.ejs         # Single post detailed view with comments
├── public/
│   ├── css/
│   │   └── style.css    # Custom dark/light responsive design system
│   └── js/
│       └── main.js      # AJAX handlers for Likes, Follows, UI toggles
├── .gitignore            # Ignored files (node_modules, *.db)
└── README.md             # Project documentation
```

---

## 💻 How to Run the Application

### 1. Prerequisites
Ensure you have **Node.js** (v18+) and **npm** installed on your system.

### 2. Installation
Navigate into the project directory and install dependencies:
```bash
cd CodeAlpha_SocialMediaPlatform
npm install
```

### 3. Database Seeding
To populate the SQLite database with 3 sample users, posts, comments, likes, and follows:
```bash
npm run seed
```

### 4. Start the Application
Start the Node.js server:
```bash
npm start
```
The application will start running on **http://localhost:3000**.

---

## 🔑 Pre-Seeded Sample Accounts

You can log in immediately using any of these seeded credentials:

| Username | Email | Password |
| :--- | :--- | :--- |
| `alex_dev` | `alex@example.com` | `password123` |
| `sarah_design` | `sarah@example.com` | `password123` |
| `marcus_code` | `marcus@example.com` | `password123` |

---

## 📜 Task Submission Checklist

- [x] User profiles with avatar, bio, stats, and post history
- [x] Create, view, and delete own posts
- [x] Comment on posts
- [x] Toggle like on posts and follow/unfollow users
- [x] SQLite database for users, posts, comments, likes, followers
- [x] User registration & login with password hashing (`bcryptjs`)
- [x] EJS view engine with clean, responsive custom CSS UI
- [x] `.gitignore` file avoiding `node_modules` and database files

## Author

**Ntshuxeko Sambo** — CodeAlpha Full Stack Development Intern (Student ID: CA/DF1/260876)
