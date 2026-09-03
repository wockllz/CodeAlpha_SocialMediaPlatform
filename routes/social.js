const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { requireAuth } = require('../middleware/auth');

// POST Toggle Like on a Post
router.post('/posts/:id/like', requireAuth, (req, res) => {
    const postId = req.params.id;
    const userId = req.session.user.id;

    try {
        const post = db.prepare('SELECT id FROM posts WHERE id = ?').get(postId);
        if (!post) {
            if (req.xhr || req.headers.accept?.includes('json')) {
                return res.status(404).json({ error: 'Post not found' });
            }
            return res.status(404).send('Post not found');
        }

        const existingLike = db.prepare('SELECT id FROM likes WHERE post_id = ? AND user_id = ?').get(postId, userId);

        let liked = false;
        if (existingLike) {
            db.prepare('DELETE FROM likes WHERE id = ?').run(existingLike.id);
            liked = false;
        } else {
            db.prepare('INSERT INTO likes (post_id, user_id) VALUES (?, ?)').run(postId, userId);
            liked = true;
        }

        const countResult = db.prepare('SELECT COUNT(*) AS count FROM likes WHERE post_id = ?').get(postId);
        const likesCount = countResult ? countResult.count : 0;

        if (req.xhr || req.headers.accept?.includes('json')) {
            return res.json({ liked, likesCount });
        }

        return res.redirect(req.headers.referer || `/posts/${postId}`);
    } catch (err) {
        console.error('Like error:', err);
        if (req.xhr || req.headers.accept?.includes('json')) {
            return res.status(500).json({ error: 'Server error toggling like' });
        }
        res.redirect('/');
    }
});

// POST Toggle Follow/Unfollow a User
router.post('/users/:id/follow', requireAuth, (req, res) => {
    const targetUserId = parseInt(req.params.id, 10);
    const currentUserId = req.session.user.id;

    if (targetUserId === currentUserId) {
        if (req.xhr || req.headers.accept?.includes('json')) {
            return res.status(400).json({ error: 'You cannot follow yourself.' });
        }
        return res.redirect('back');
    }

    try {
        const targetUser = db.prepare('SELECT id FROM users WHERE id = ?').get(targetUserId);
        if (!targetUser) {
            if (req.xhr || req.headers.accept?.includes('json')) {
                return res.status(404).json({ error: 'User not found' });
            }
            return res.status(404).send('User not found');
        }

        const existingFollow = db.prepare('SELECT id FROM follows WHERE follower_id = ? AND following_id = ?').get(currentUserId, targetUserId);

        let isFollowing = false;
        if (existingFollow) {
            db.prepare('DELETE FROM follows WHERE id = ?').run(existingFollow.id);
            isFollowing = false;
        } else {
            db.prepare('INSERT INTO follows (follower_id, following_id) VALUES (?, ?)').run(currentUserId, targetUserId);
            isFollowing = true;
        }

        const followersCount = db.prepare('SELECT COUNT(*) AS count FROM follows WHERE following_id = ?').get(targetUserId).count;

        if (req.xhr || req.headers.accept?.includes('json')) {
            return res.json({ following: isFollowing, followersCount });
        }

        return res.redirect(req.headers.referer || `/profile/${targetUser.username}`);
    } catch (err) {
        console.error('Follow error:', err);
        if (req.xhr || req.headers.accept?.includes('json')) {
            return res.status(500).json({ error: 'Server error toggling follow' });
        }
        res.redirect('/');
    }
});

module.exports = router;
