const db = require('./database');
const bcrypt = require('bcryptjs');

function seedDatabase() {
    console.log('Seeding database...');

    // Clear existing data
    db.prepare('DELETE FROM follows').run();
    db.prepare('DELETE FROM likes').run();
    db.prepare('DELETE FROM comments').run();
    db.prepare('DELETE FROM posts').run();
    db.prepare('DELETE FROM users').run();

    // Reset sqlite_sequence if exists
    try {
        db.prepare("DELETE FROM sqlite_sequence WHERE name IN ('users', 'posts', 'comments', 'likes', 'follows')").run();
    } catch (e) {
        // Table might not exist yet if fresh, ignore
    }

    // Passwords hash
    const hashedPassword = bcrypt.hashSync('password123', 10);

    // Insert Sample Users
    const insertUser = db.prepare(`
        INSERT INTO users (username, email, password_hash, bio, avatar_url)
        VALUES (?, ?, ?, ?, ?)
    `);

    const user1 = insertUser.run(
        'alex_dev',
        'alex@example.com',
        hashedPassword,
        'Full stack developer & open source enthusiast 🚀 Building cool projects with Express & Node.',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
    );

    const user2 = insertUser.run(
        'sarah_design',
        'sarah@example.com',
        hashedPassword,
        'UI/UX Designer & Frontend Craftsman 🎨 Loving clean typography and sleek interfaces.',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80'
    );

    const user3 = insertUser.run(
        'marcus_code',
        'marcus@example.com',
        hashedPassword,
        'Software Engineer, Coffee Lover, and Tech Writer ☕️ Exploring Node.js, SQLite, and modern web apps.',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'
    );

    const u1Id = user1.lastInsertRowid;
    const u2Id = user2.lastInsertRowid;
    const u3Id = user3.lastInsertRowid;

    // Insert Sample Posts
    const insertPost = db.prepare(`
        INSERT INTO posts (user_id, content, image_url, created_at)
        VALUES (?, ?, ?, DATETIME('now', ?))
    `);

    const post1 = insertPost.run(
        u1Id,
        'Just finished building my Full-Stack Social Media Platform for CodeAlpha internship! Express, SQLite, and EJS make such a clean stack. What do you all think? 🚀💻',
        'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
        '-2 hours'
    );

    const post2 = insertPost.run(
        u2Id,
        'Working on new glassmorphism and modern dark feed components today! Good UI design is about clarity, contrast, and visual hierarchy. ✨',
        'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
        '-5 hours'
    );

    const post3 = insertPost.run(
        u3Id,
        'Morning brew and diving deep into SQLite performance tuning and indexing. SQLite is insanely fast when used properly in Node.js apps! ☕️⚡️',
        'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
        '-1 day'
    );

    const post4 = insertPost.run(
        u1Id,
        'Great day for coding outside in the park! Sunshine and laptop sessions hit different. ☀️',
        'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
        '-2 days'
    );

    const p1Id = post1.lastInsertRowid;
    const p2Id = post2.lastInsertRowid;
    const p3Id = post3.lastInsertRowid;
    const p4Id = post4.lastInsertRowid;

    // Insert Comments
    const insertComment = db.prepare(`
        INSERT INTO comments (post_id, user_id, content, created_at)
        VALUES (?, ?, ?, DATETIME('now', ?))
    `);

    insertComment.run(p1Id, u2Id, 'This looks incredible Alex! Super clean UI and great features!', '-1 hour');
    insertComment.run(p1Id, u3Id, 'Great job on completing Task 2! The SQLite integration is super smooth.', '-30 minutes');
    insertComment.run(p2Id, u1Id, 'Love the design choices Sarah! Glassmorphism adds a sleek touch.', '-4 hours');
    insertComment.run(p3Id, u1Id, 'Couldn’t agree more Marcus. better-sqlite3 is lightning fast!', '-20 hours');

    // Insert Likes
    const insertLike = db.prepare(`
        INSERT INTO likes (post_id, user_id)
        VALUES (?, ?)
    `);

    insertLike.run(p1Id, u2Id);
    insertLike.run(p1Id, u3Id);
    insertLike.run(p2Id, u1Id);
    insertLike.run(p3Id, u1Id);
    insertLike.run(p3Id, u2Id);
    insertLike.run(p4Id, u2Id);

    // Insert Follows
    const insertFollow = db.prepare(`
        INSERT INTO follows (follower_id, following_id)
        VALUES (?, ?)
    `);

    // Alex follows Sarah & Marcus
    insertFollow.run(u1Id, u2Id);
    insertFollow.run(u1Id, u3Id);
    // Sarah follows Alex
    insertFollow.run(u2Id, u1Id);
    // Marcus follows Alex & Sarah
    insertFollow.run(u3Id, u1Id);
    insertFollow.run(u3Id, u2Id);

    console.log('Database seeded successfully!');
    console.log('Sample Users created:');
    console.log('1. alex_dev (alex@example.com / password123)');
    console.log('2. sarah_design (sarah@example.com / password123)');
    console.log('3. marcus_code (marcus@example.com / password123)');
}

if (require.main === module) {
    seedDatabase();
}

module.exports = seedDatabase;
