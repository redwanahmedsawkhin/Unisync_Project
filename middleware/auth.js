function isLoggedIn(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/');
    }
}


function isAdmin(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/');
    }

    if (req.session.user.role !== 'admin') {
        return res.redirect('/');
    }

    next();
}


function isTeacher(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/');
    }

    if (req.session.user.role !== 'teacher') {
        return res.redirect('/');
    }

    next();
}


function isStudent(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/');
    }

    if (req.session.user.role !== 'student') {
        return res.redirect('/');
    }

    next();
}


// Prevent logged-in users from opening login/signup pages
function isGuest(req, res, next) {
    if (req.session.user) {
        const role = req.session.user.role;

        if (role === 'admin') {
            return res.redirect('/admin/dashboard');
        }

        if (role === 'teacher') {
            return res.redirect('/teacher/dashboard');
        }

        if (role === 'student') {
            return res.redirect('/student/dashboard');
        }
    }

    next();
}

module.exports = {
    isLoggedIn,
    isAdmin,
    isTeacher,
    isStudent,
    isGuest
};