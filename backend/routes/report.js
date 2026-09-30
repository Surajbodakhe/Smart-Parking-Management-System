const express = require("express");
const router = express.Router();

const db = require("../db");


// ========================================
// VEHICLE SEARCH
// ========================================
router.get("/vehicles/search", async (req, res) => {

    try {

        const search = req.query.search || "";

        const [vehicles] = await db.query(`
            SELECT
                v.vehicle_id,
                u.name AS user_name,
                u.email,
                v.vehicle_number,
                v.vehicle_type,
                v.model
            FROM vehicles v

            JOIN users u
                ON v.user_id = u.user_id

            WHERE
                v.vehicle_number LIKE ?
                OR v.vehicle_type LIKE ?
                OR v.model LIKE ?
                OR u.name LIKE ?

            ORDER BY v.vehicle_id DESC
        `, [
            `%${search}%`,
            `%${search}%`,
            `%${search}%`,
            `%${search}%`
        ]);

        res.json({
            success: true,
            data: vehicles
        });

    } catch (error) {

        console.error(
            "VEHICLE SEARCH ERROR:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Unable to search vehicles",
            error: error.message
        });
    }
});


// ========================================
// REVENUE REPORT
// ========================================
router.get("/revenue", async (req, res) => {

    try {

        const [report] = await db.query(`
            SELECT
                DATE(payment_date) AS payment_date,
                COUNT(payment_id) AS total_payments,
                SUM(amount) AS total_revenue
            FROM payments

            WHERE payment_status = 'SUCCESS'

            GROUP BY DATE(payment_date)

            ORDER BY payment_date DESC
        `);

        res.json({
            success: true,
            data: report
        });

    } catch (error) {

        console.error(
            "REVENUE REPORT ERROR:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Unable to generate revenue report",
            error: error.message
        });
    }
});


// ========================================
// PAYMENT REPORT
// ========================================
router.get("/payments", async (req, res) => {

    try {

        const [payments] = await db.query(`
            SELECT
                p.payment_id,
                p.session_id,
                v.vehicle_number,
                v.vehicle_type,
                p.amount,
                p.payment_method,
                p.payment_status,
                p.payment_date

            FROM payments p

            JOIN parking_sessions ps
                ON p.session_id = ps.session_id

            JOIN vehicles v
                ON ps.vehicle_id = v.vehicle_id

            ORDER BY p.payment_date DESC
        `);

        res.json({
            success: true,
            data: payments
        });

    } catch (error) {

        console.error(
            "PAYMENT REPORT ERROR:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Unable to generate payment report",
            error: error.message
        });
    }
});


module.exports = router;