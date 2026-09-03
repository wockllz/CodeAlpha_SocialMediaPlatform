const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { requireAuth } = require('../middleware/auth');

// GET Feed / Main Page
router.get('/', (req, res) => {
    const currentUserId = req.session.user ? req.session.user.id : null;
    const feedType = req.query.feed || 'all'; // 'all' or 'following'

    try {
        let postsQuery = '';
        let queryParams = [];

        if (feedType === 'following' && currentUserId) {
            postsQuery = `
                SELECT 
                    p.*,
                    u.username,
                    u.avatar_url,
                    (SELECT COUNT(*) FROM likes WHERE post_id = p.id) AS like_count,
                    (SELECT COUNT(*) FROM comments WHERE post_id = p.id) AS comment_count,
                    (SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = ?) AS is_liked
                FROM posts p
                JOIN users u ON p.user_id = u.id
                WHERE p.user_id IN (SELECT following_id FROM follows WHERE follower_id = ?) OR p.user_id = ?
                ORDER BY p.created_at DESC
            `;
            queryParams = [currentUserId, currentUserId, currentUserId];
        } else {
            postsQuery = `
                SELECT 
                    p.*,
                    u.username,
                    u.avatar_url,
                    (SELECT COUNT(*) FROM likes WHERE post_id = p.id) AS like_count,
                    (SELECT COUNT(*) FROM comments WHERE post_id = p.id) AS comment_count,
                    (SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = ?) AS is_liked
                FROM posts p
                JOIN users u ON p.user_id = u.id
                ORDER BY p.created_at DESC
            `;
            queryParams = [currentUserId || 0];
        }

        const posts = db.prepare(postsQuery).all(...queryParams);

        // Attach top comments to each post for inline preview
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

        // Get suggested users to follow
        let suggestedUsers = [];
        if (currentUserId) {
            suggestedUsers = db.prepare(`
                SELECT u.id, u.username, u.avatar_url, u.bio
                FROM users u
                WHERE u.id != ?
                AND u.id NOT IN (SELECT following_id FROM follows WHERE follower_id = ?)
                LIMIT 5
            `).all(currentUserId, currentUserId);
        }

        res.render('index', {
            posts,
            feedType,
            suggestedUsers
        });
    } catch (err) {
        console.error('Feed error:', err);
        res.status(500).send('Server Error loading feed');
    }
});

// POST Create Post
router.post('/posts', requireAuth, (req, res) => {
    const { content, image_url } = req.body;
    const userId = req.session.user.id;

    if (!content || !content.trim()) {
        return res.redirect('/');
    }

    try {
        const stmt = db.prepare(`
            INSERT INTO posts (user_id, content, image_url)
            VALUES (?, ?, ?)
        `);
        stmt.run(userId, content.trim(), image_url && image_url.trim() ? image_url.trim() : null);

        res.redirect('/');
    } catch (err) {
        console.error('Create post error:', err);
        res.redirect('/');
    }
});

// GET Single Post View
router.get('/posts/:id', (req, res) => {
    const postId = req.params.id;
    const currentUserId = req.session.user ? req.session.user.id : null;

    try {
        const post = db.prepare(`
            SELECT 
                p.*,
                u.username,
                u.avatar_url,
                (SELECT COUNT(*) FROM likes WHERE post_id = p.id) AS like_count,
                (SELECT COUNT(*) FROM comments WHERE post_id = p.id) AS comment_count,
                (SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = ?) AS is_liked
            FROM posts p
            JOIN users u ON p.user_id = u.id
            WHERE p.id = ?
        `).get(currentUserId || 0, postId);

        if (!post) {
            return res.status(404).send('Post not found');
        }

        const comments = db.prepare(`
            SELECT c.*, u.username, u.avatar_url
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.post_id = ?
            ORDER BY c.created_at ASC
        `).all(postId);

        post.comments = comments;

        res.render('post', { post });
    } catch (err) {
        console.error('Post detail error:', err);
        res.status(500).send('Error loading post');
    }
});

// POST Comment on Post
router.post('/posts/:id/comments', requireAuth, (req, res) => {
    const postId = req.params.id;
    const { content } = req.body;
    const userId = req.session.user.id;

    if (!content || !content.trim()) {
        return res.redirect(`/posts/${postId}`);
    }

    try {
        const stmt = db.prepare(`
            INSERT INTO comments (post_id, user_id, content)
            VALUES (?, ?, ?)
        `);
        stmt.run(postId, userId, content.trim());

        // Redirect back to source page
        const redirectUrl = req.headers.referer || `/posts/${postId}`;
        res.redirect(redirectUrl);
    } catch (err) {
        console.error('Add comment error:', err);
        res.redirect(`/posts/${postId}`);
    }
});

// POST Delete Post
router.post('/posts/:id/delete', requireAuth, (req, res) => {
    const postId = req.params.id;
    const userId = req.session.user.id;

    try {
        const post = db.prepare('SELECT user_id FROM posts WHERE id = ?').get(postId);
        if (!post) {
            return res.status(404).send('Post not found');
        }

        if (post.user_id !== userId) {
            return res.status(403).send('Unauthorized to delete this post');
        }

        db.prepare('DELETE FROM posts WHERE id = ?').run(postId);
        res.redirect(req.headers.referer || '/');
    } catch (err) {
        console.error('Delete post error:', err);
        res.redirect('/');
    }
});

// POST Delete Comment
router.post('/posts/:postId/comments/:commentId/delete', requireAuth, (req, res) => {
    const { postId, commentId } = req.params;
    const userId = req.session.user.id;

    try {
        const comment = db.prepare('SELECT c.user_id AS comment_author, p.user_id AS post_author FROM comments c JOIN posts p ON c.post_id = p.id WHERE c.id = ?').get(commentId);

        if (!comment) {
            return res.status(404).send('Comment not found');
        }

        if (comment.comment_author !== userId && comment.post_author !== userId) {
            return res.status(403).send('Unauthorized to delete this comment');
        }

        db.prepare('DELETE FROM comments WHERE id = ?').run(commentId);
        res.redirect(req.headers.referer || `/posts/${postId}`);
    } catch (err) {
        console.error('Delete comment error:', err);
        res.redirect(`/posts/${postId}`);
    }
});

module.exports = router;
