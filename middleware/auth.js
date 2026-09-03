// Authentication Middleware

function requireAuth(req, res, next) {
    if (!req.session || !req.session.user) {
        if (req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'))) {
            return res.status(401).json({ error: 'Please login to perform this action.' });
        }
        return res.redirect('/login');
    }
    next();
}

function setUserLocals(req, res, next) {
    res.locals.currentUser = (req.session && req.session.user) ? req.session.user : null;
    res.locals.path = req.path;
    next();
}

module.exports = {
    requireAuth,
    setUserLocals
};
