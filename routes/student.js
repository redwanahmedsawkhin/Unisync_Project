const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

const db = require('../config/db');
const { isStudent } = require('../middleware/auth');


// DASHBOARD
router.get('/dashboard', isStudent, (req, res) => {
    const regNo = req.session.user.registration_no;

    db.query(
        "SELECT * FROM results WHERE registration_no=?",
        [regNo],
        (err, results) => {
            if (err) {
                return res.send(err);
            }

            res.render('student/dashboard', {
                user: req.session.user,
                results,
                message: null,
                error: null
            });
        }
    );
});


// CHANGE PASSWORD
router.post('/change-password', isStudent, async (req, res) => {
    const {
        currentPassword,
        newPassword
    } = req.body;

    const userId = req.session.user.id;
    const regNo = req.session.user.registration_no;

    db.query(
        "SELECT * FROM users WHERE id=?",
        [userId],
        async (err, userData) => {

            if (err) {
                return res.send(err);
            }

            const match = await bcrypt.compare(
                currentPassword,
                userData[0].password
            );

            if (!match) {
                db.query(
                    "SELECT * FROM results WHERE registration_no=?",
                    [regNo],
                    (err, results) => {
                        res.render('student/dashboard', {
                            user: req.session.user,
                            results,
                            message: null,
                            error: 'Current password is incorrect'
                        });
                    }
                );
                return;
            }

            const hashed = await bcrypt.hash(newPassword, 10);

            db.query(
                "UPDATE users SET password=? WHERE id=?",
                [hashed, userId],
                () => {

                    db.query(
                        "SELECT * FROM results WHERE registration_no=?",
                        [regNo],
                        (err, results) => {
                            res.render('student/dashboard', {
                                user: req.session.user,
                                results,
                                message: 'Password changed successfully',
                                error: null
                            });
                        }
                    );

                }
            );
        }
    );
});

module.exports = router;