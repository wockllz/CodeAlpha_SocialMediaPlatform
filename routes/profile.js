const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { requireAuth } = require('../middleware/auth');

// GET Own Profile redirect
router.get('/profile', requireAuth, (req, res) => {
    return res.redirect(`/profile/${req.session.user.username}`);
});

// GET View User Profile by Username
router.get('/profile/:username', (req, res) => {
    const username = req.params.username;
    const currentUserId = req.session.user ? req.session.user.id : null;

    try {
        const profileUser = db.prepare('SELECT id, username, email, bio, avatar_url, created_at FROM users WHERE username = ?').get(username);

        if (!profileUser) {
            return res.status(404).send('User not found');
        }

        const isOwnProfile = currentUserId === profileUser.id;

        // Follow stats
        const followersCount = db.prepare('SELECT COUNT(*) AS count FROM follows WHERE following_id = ?').get(profileUser.id).count;
        const followingCount = db.prepare('SELECT COUNT(*) AS count FROM follows WHERE follower_id = ?').get(profileUser.id).count;
        const postsCount = db.prepare('SELECT COUNT(*) AS count FROM posts WHERE user_id = ?').get(profileUser.id).count;

        // Check if current user follows profile user
        let isFollowing = false;
        if (currentUserId && !isOwnProfile) {
            const follow = db.prepare('SELECT id FROM follows WHERE follower_id = ? AND following_id = ?').get(currentUserId, profileUser.id);
            isFollowing = !!follow;
        }

        // Fetch user posts
        const posts = db.prepare(`
            SELECT 
                p.*,
                u.username,
                u.avatar_url,
                (SELECT COUNT(*) FROM likes WHERE post_id = p.id) AS like_count,
                (SELECT COUNT(*) FROM comments WHERE post_id = p.id) AS comment_count,
                (SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = ?) AS is_liked
            FROM posts p
            JOIN users u ON p.user_id = u.id
            WHERE p.user_id = ?
            ORDER BY p.created_at DESC
        `).all(currentUserId || 0, profileUser.id);

        // Fetch comments for posts
        const getComments = db.prepare(`
            SELECT c.*, u.username, u.avatar_url
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.post_id = ?
            ORDER BY c.created_at ASC
        `);

        posts.forEach(post => {
            post.comments = getComments.all(post.id);
        });

        res.render('profile', {
            profileUser,
            isOwnProfile,
            followersCount,
            followingCount,
            postsCount,
            isFollowing,
            posts,
            error: null,
            success: null
        });
    } catch (err) {
        console.error('Profile view error:', err);
        res.status(500).send('Error loading profile');
    }
});

// POST Edit Profile
router.post('/profile/edit', requireAuth, (req, res) => {
    const userId = req.session.user.id;
    const { bio, avatar_url, email } = req.body;

    try {
        const cleanBio = bio ? bio.trim() : '';
        const cleanAvatar = avatar_url ? avatar_url.trim() : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
        const cleanEmail = email ? email.trim().toLowerCase() : req.session.user.email;

        // Check email uniqueness if changed
        if (cleanEmail !== req.session.user.email) {
            const existingEmail = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(cleanEmail, userId);
            if (existingEmail) {
                return res.redirect(`/profile/${req.session.user.username}?error=Email+already+in+use`);
            }
        }

        db.prepare(`
            UPDATE users 
            SET bio = ?, avatar_url = ?, email = ?
            WHERE id = ?
        `).run(cleanBio, cleanAvatar, cleanEmail, userId);

        // Update session state
        req.session.user.bio = cleanBio;
        req.session.user.avatar_url = cleanAvatar;
        req.session.user.email = cleanEmail;

        res.redirect(`/profile/${req.session.user.username}`);
    } catch (err) {
        console.error('Edit profile error:', err);
        res.redirect(`/profile/${req.session.user.username}`);
    }
});

module.exports = router;
