const express = require('express');
const router = express.Router();

const db = require('../config/db');
const upload = require('../config/upload');
const { isTeacher } = require('../middleware/auth');


// DASHBOARD
router.get('/dashboard', isTeacher, (req, res) => {
    const search = req.query.search || '';

    db.query(
        `
        SELECT * FROM results
        WHERE student_name LIKE ?
        OR registration_no LIKE ?
        ORDER BY id DESC
        `,
        [`%${search}%`, `%${search}%`],
        (err, students) => {
            if (err) {
                return res.send('Database error');
            }

            res.render('teacher/dashboard', {
                user: req.session.user,
                students,
                search
            });
        }
    );
});


// ADD RESULT
router.post('/add-result', isTeacher, (req, res) => {
    upload.single('photo')(req, res, (uploadErr) => {

        if (uploadErr) {
            return res.send(uploadErr.message);
        }

        const {
            student_name,
            registration_no,
            semester,
            cgpa
        } = req.body;

        db.query(
            `
            SELECT * FROM results
            WHERE registration_no=? AND semester=?
            `,
            [registration_no, semester],
            (err, existing) => {

                if (err) {
                    return res.send('Database error');
                }

                const photo = req.file
                    ? req.file.filename
                    : existing.length > 0
                        ? existing[0].photo
                        : null;

                db.query(
                    `
                    INSERT INTO results
                    (student_name, registration_no, photo, semester, cgpa)
                    VALUES (?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE
                    student_name=VALUES(student_name),
                    cgpa=VALUES(cgpa),
                    photo=VALUES(photo)
                    `,
                    [
                        student_name,
                        registration_no,
                        photo,
                        semester,
                        cgpa
                    ],
                    (err) => {
                        if (err) {
                            return res.send('Database error');
                        }

                        res.redirect('/teacher/dashboard');
                    }
                );
            }
        );
    });
});


// DELETE
router.post('/delete-record/:id', isTeacher, (req, res) => {
    db.query(
        "DELETE FROM results WHERE id=?",
        [req.params.id],
        (err) => {
            if (err) {
                return res.send('Database error');
            }

            res.redirect('/teacher/dashboard');
        }
    );
});

module.exports = router;