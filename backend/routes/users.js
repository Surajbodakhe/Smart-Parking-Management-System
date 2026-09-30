const express = require("express");
const router = express.Router();

const db = require("../db");


// ========================================
// GET ALL USERS
// ========================================

router.get("/", async (req, res) => {

    try {

        const [users] = await db.query(`
            SELECT
                user_id,
                name,
                email,
                phone,
                role,
                created_at
            FROM users
            ORDER BY user_id DESC
        `);

        res.json({
            success: true,
            data: users
        });

    } catch (error) {

        console.error(
            "GET USERS ERROR:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Unable to fetch users",
            error: error.message
        });

    }

});


// ========================================
// SEARCH USERS
// ========================================

router.get("/search", async (req, res) => {

    try {

        const search = req.query.search || "";

        const [users] = await db.query(`
            SELECT
                user_id,
                name,
                email,
                phone,
                role,
                created_at
            FROM users
            WHERE
                name LIKE ?
                OR email LIKE ?
                OR phone LIKE ?
            ORDER BY user_id DESC
        `, [
            `%${search}%`,
            `%${search}%`,
            `%${search}%`
        ]);

        res.json({
            success: true,
            data: users
        });

    } catch (error) {

        console.error(
            "SEARCH USERS ERROR:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Unable to search users",
            error: error.message
        });

    }

});


// ========================================
// GET ONE USER
// ========================================

router.get("/:id", async (req, res) => {

    try {

        const userId = req.params.id;

        const [users] = await db.query(`
            SELECT
                user_id,
                name,
                email,
                phone,
                role,
                created_at
            FROM users
            WHERE user_id = ?
        `, [userId]);

        if (users.length === 0) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });

        }

        res.json({
            success: true,
            data: users[0]
        });

    } catch (error) {

        console.error(
            "GET USER ERROR:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Unable to fetch user",
            error: error.message
        });

    }

});


module.exports = router;