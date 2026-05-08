const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

const db = require('../config/db');
const { isAdmin } = require('../middleware/auth');

router.get('/dashboard', isAdmin, (req, res) => {
    db.query(
        "SELECT * FROM users WHERE role='teacher'",
        (err, teachers) => {
            db.query(
                "SELECT * FROM users WHERE role='student'",
                (err, students) => {
                    res.render('admin/dashboard', {
                        user: req.session.user,
                        teachers,
                        students
                    });
                }
            );
        }
    );
});

router.post('/add-teacher', isAdmin, async (req, res) => {
    const { name, email, password } = req.body;

    const hashed = await bcrypt.hash(password, 10);

    db.query(
        `
        INSERT INTO users
        (name,email,password,role)
        VALUES (?, ?, ?, 'teacher')
        `,
        [name, email, hashed],
        () => {
            res.redirect('/admin/dashboard');
        }
    );
});

router.post('/delete-teacher/:id', isAdmin, (req, res) => {
    db.query(
        "DELETE FROM users WHERE id=? AND role='teacher'",
        [req.params.id],
        () => {
            res.redirect('/admin/dashboard');
        }
    );
});

module.exports = router;