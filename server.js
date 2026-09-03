const express = require('express');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const db = require('./db/database');
const { setUserLocals } = require('./middleware/auth');

const authRoutes = require('./routes/auth');
const postsRoutes = require('./routes/posts');
const socialRoutes = require('./routes/social');
const profileRoutes = require('./routes/profile');

const app = express();
const PORT = process.env.PORT || 3000;

// View Engine Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Middleware for parsing requests
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session Middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'codealpha_secret_key_2026',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    }
}));

// Set template local variables (currentUser, etc.)
app.use(setUserLocals);

// Mount Routes
app.use('/', authRoutes);
app.use('/', postsRoutes);
app.use('/', socialRoutes);
app.use('/', profileRoutes);

// 404 Handler
app.use((req, res) => {
    res.status(404).render('index', { 
        posts: [], 
        feedType: 'all', 
        suggestedUsers: [],
        errorMsg: '404 - Page Not Found' 
    });
});

app.listen(PORT, () => {
    console.log(`===================================================`);
    console.log(`🚀 CodeAlpha Social Media Platform is running!`);
    console.log(`🌐 Server active on http://localhost:${PORT}`);
    console.log(`===================================================`);
});
