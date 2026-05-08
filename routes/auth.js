const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

const db = require('../config/db');
const { isGuest } = require('../middleware/auth');


// HOME
router.get('/', isGuest, (req, res) => {
    res.render('home');
});


// STUDENT LOGIN PAGE
router.get('/student-login', isGuest, (req, res) => {
    res.render('login', {
        role: 'Student',
        action: '/student-login',
        error: null
    });
});


// TEACHER LOGIN PAGE
router.get('/teacher-login', isGuest, (req, res) => {
    res.render('login', {
        role: 'Teacher',
        action: '/teacher-login',
        error: null
    });
});


// ADMIN LOGIN PAGE
router.get('/admin-login', isGuest, (req, res) => {
    res.render('login', {
        role: 'Admin',
        action: '/admin-login',
        error: null
    });
});


// STUDENT SIGNUP PAGE
router.get('/signup', isGuest, (req, res) => {
    res.render('signup', {
        error: null
    });
});


// STUDENT SIGNUP
router.post('/signup', async (req, res) => {
    const { name, email, password, registration_no } = req.body;

    db.query(
        "SELECT * FROM users WHERE email=?",
        [email],
        async (err, existing) => {

            if (err) {
                return res.render('signup', {
                    error: 'Database error'
                });
            }

            if (existing.length > 0) {
                return res.render('signup', {
                    error: 'Email already exists'
                });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            db.query(
                `
                INSERT INTO users
                (name, email, password, role, registration_no)
                VALUES (?, ?, ?, 'student', ?)
                `,
                [name, email, hashedPassword, registration_no],
                (err) => {
                    if (err) {
                        return res.render('signup', {
                            error: 'Signup failed'
                        });
                    }

                    res.redirect('/student-login');
                }
            );
        }
    );
});


// STUDENT LOGIN
router.post('/student-login', (req, res) => {
    const { email, password } = req.body;

    db.query(
        "SELECT * FROM users WHERE email=? AND role='student'",
        [email],
        async (err, result) => {

            if (err) {
                return res.render('login', {
                    role: 'Student',
                    action: '/student-login',
                    error: 'Database error'
                });
            }

            if (result.length === 0) {
                return res.render('login', {
                    role: 'Student',
                    action: '/student-login',
                    error: 'Invalid email or password'
                });
            }

            const match = await bcrypt.compare(password, result[0].password);

            if (!match) {
                return res.render('login', {
                    role: 'Student',
                    action: '/student-login',
                    error: 'Invalid email or password'
                });
            }

            req.session.user = result[0];
            res.redirect('/student/dashboard');
        }
    );
});


// TEACHER LOGIN
router.post('/teacher-login', (req, res) => {
    const { email, password } = req.body;

    db.query(
        "SELECT * FROM users WHERE email=? AND role='teacher'",
        [email],
        async (err, result) => {

            if (err) {
                return res.render('login', {
                    role: 'Teacher',
                    action: '/teacher-login',
                    error: 'Database error'
                });
            }

            if (result.length === 0) {
                return res.render('login', {
                    role: 'Teacher',
                    action: '/teacher-login',
                    error: 'Invalid email or password'
                });
            }

            const match = await bcrypt.compare(password, result[0].password);

            if (!match) {
                return res.render('login', {
                    role: 'Teacher',
                    action: '/teacher-login',
                    error: 'Invalid email or password'
                });
            }

            req.session.user = result[0];
            res.redirect('/teacher/dashboard');
        }
    );
});


// ADMIN LOGIN
router.post('/admin-login', (req, res) => {
    const { email, password } = req.body;

    db.query(
        "SELECT * FROM users WHERE email=? AND role='admin'",
        [email],
        async (err, result) => {

            if (err) {
                return res.render('login', {
                    role: 'Admin',
                    action: '/admin-login',
                    error: 'Database error'
                });
            }

            if (result.length === 0) {
                return res.render('login', {
                    role: 'Admin',
                    action: '/admin-login',
                    error: 'Invalid email or password'
                });
            }

            const match = await bcrypt.compare(password, result[0].password);

            if (!match) {
                return res.render('login', {
                    role: 'Admin',
                    action: '/admin-login',
                    error: 'Invalid email or password'
                });
            }

            req.session.user = result[0];
            res.redirect('/admin/dashboard');
        }
    );
});


// LOGOUT
router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

module.exports = router;