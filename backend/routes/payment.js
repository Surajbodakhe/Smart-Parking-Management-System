const express = require("express");
const router = express.Router();

const db = require("../db");


// ========================================
// CALCULATE PARKING FEE
// ========================================
router.get("/fee/:sessionId", async (req, res) => {
    try {

        const sessionId = req.params.sessionId;

        const [result] = await db.query(
            "CALL CalculateParkingFee(?)",
            [sessionId]
        );

        // Stored procedure result
        const feeData = result[0];

        if (!feeData || feeData.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Parking fee information not found"
            });
        }

        res.json({
            success: true,
            data: feeData[0]
        });

    } catch (error) {

        console.error(
            "CALCULATE FEE ERROR:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Unable to calculate parking fee",
            error: error.message
        });
    }
});


// ========================================
// GET ALL PAYMENTS
// ========================================
router.get("/", async (req, res) => {
    try {

        const [payments] = await db.query(`
            SELECT
                p.payment_id,
                p.session_id,
                v.vehicle_number,
                p.amount,
                p.payment_method,
                p.payment_status,
                p.payment_date
            FROM payments p

            JOIN parking_sessions ps
                ON p.session_id = ps.session_id

            JOIN vehicles v
                ON ps.vehicle_id = v.vehicle_id

            ORDER BY p.payment_id DESC
        `);

        res.json({
            success: true,
            data: payments
        });

    } catch (error) {

        console.error(
            "GET PAYMENTS ERROR:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Unable to fetch payments",
            error: error.message
        });
    }
});


// ========================================
// CREATE PAYMENT
// ========================================
router.post("/", async (req, res) => {
    try {

        const {
            session_id,
            amount,
            payment_method
        } = req.body;


        if (
            !session_id ||
            amount === undefined ||
            !payment_method
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "session_id, amount and payment_method are required"
            });
        }


        // Check session
        const [sessions] = await db.query(`
            SELECT session_id, session_status
            FROM parking_sessions
            WHERE session_id = ?
        `, [session_id]);


        if (sessions.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Parking session not found"
            });
        }


        // Payment
        const [result] = await db.query(`
            INSERT INTO payments
            (
                session_id,
                amount,
                payment_method,
                payment_status,
                payment_date
            )
            VALUES (?, ?, ?, 'SUCCESS', NOW())
        `, [
            session_id,
            amount,
            payment_method
        ]);


        res.status(201).json({
            success: true,
            message: "Payment recorded successfully",
            payment_id: result.insertId
        });


    } catch (error) {

        console.error(
            "CREATE PAYMENT ERROR:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Unable to record payment",
            error: error.message
        });
    }
});


module.exports = router;