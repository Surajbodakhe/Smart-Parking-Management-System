const express = require("express");
const router = express.Router();

const db = require("../db");


// Dashboard Statistics API
router.get("/stats", async (req, res) => {

    try {

        // Total parking slots
        const [totalResult] = await db.query(
            "SELECT COUNT(*) AS totalSlots FROM parking_slots"
        );

        // Available slots
        const [availableResult] = await db.query(
            "SELECT COUNT(*) AS availableSlots FROM parking_slots WHERE status = 'AVAILABLE'"
        );

        // Occupied slots
        const [occupiedResult] = await db.query(
            "SELECT COUNT(*) AS occupiedSlots FROM parking_slots WHERE status = 'OCCUPIED'"
        );

        // Total reservations
        const [reservationResult] = await db.query(
            "SELECT COUNT(*) AS reservations FROM reservations"
        );


        res.json({
            success: true,

            data: {
                totalSlots: totalResult[0].totalSlots,
                availableSlots: availableResult[0].availableSlots,
                occupiedSlots: occupiedResult[0].occupiedSlots,
                reservations: reservationResult[0].reservations
            }
        });

    } catch (error) {

        console.error("DASHBOARD ERROR:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to load dashboard statistics",
            error: error.message
        });
    }
});


module.exports = router;