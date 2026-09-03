const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db/database');

// GET Login page
router.get('/login', (req, res) => {
    if (req.session && req.session.user) {
        return res.redirect('/');
    }
    res.render('login', { error: null });
});

// POST Login
router.post('/login', (req, res) => {
    const { loginKey, password } = req.body;

    if (!loginKey || !password) {
        return res.render('login', { error: 'Please enter both username/email and password.' });
    }

    try {
        const user = db.prepare('SELECT * FROM users WHERE username = ? OR email = ?').get(loginKey.trim(), loginKey.trim().toLowerCase());

        if (!user) {
            return res.render('login', { error: 'Invalid username/email or password.' });
        }

        const isValidPassword = bcrypt.compareSync(password, user.password_hash);
        if (!isValidPassword) {
            return res.render('login', { error: 'Invalid username/email or password.' });
        }

        // Store user in session
        req.session.user = {
            id: user.id,
            username: user.username,
            email: user.email,
            bio: user.bio,
            avatar_url: user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
        };

        return res.redirect('/');
    } catch (err) {
        console.error('Login error:', err);
        return res.render('login', { error: 'An unexpected error occurred. Please try again.' });
    }
});

// GET Register page
router.get('/register', (req, res) => {
    if (req.session && req.session.user) {
        return res.redirect('/');
    }
    res.render('register', { error: null });
});

// POST Register
router.post('/register', (req, res) => {
    const { username, email, password, bio, avatar_url } = req.body;

    if (!username || !email || !password) {
        return res.render('register', { error: 'Username, email, and password are required.' });
    }

    const cleanUsername = username.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (cleanUsername.length < 3) {
        return res.render('register', { error: 'Username must be at least 3 characters long.' });
    }

    if (password.length < 6) {
        return res.render('register', { error: 'Password must be at least 6 characters long.' });
    }

    try {
        // Check existing user
        const existing = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(cleanUsername, cleanEmail);
        if (existing) {
            return res.render('register', { error: 'Username or Email is already registered.' });
        }

        const passwordHash = bcrypt.hashSync(password, 10);
        const defaultAvatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
        const finalAvatar = (avatar_url && avatar_url.trim()) ? avatar_url.trim() : defaultAvatar;
        const finalBio = (bio && bio.trim()) ? bio.trim() : 'Hello! I am using CodeAlpha Social.';

        const stmt = db.prepare(`
            INSERT INTO users (username, email, password_hash, bio, avatar_url)
            VALUES (?, ?, ?, ?, ?)
        `);

        const result = stmt.run(cleanUsername, cleanEmail, passwordHash, finalBio, finalAvatar);

        // Auto login after registration
        req.session.user = {
            id: result.lastInsertRowid,
            username: cleanUsername,
            email: cleanEmail,
            bio: finalBio,
            avatar_url: finalAvatar
        };

        return res.redirect('/');
    } catch (err) {
        console.error('Registration error:', err);
        return res.render('register', { error: 'Failed to create account. Please try again.' });
    }
});

// GET Logout
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/login');
    });
});

module.exports = router;
