const express = require("express");
const router = express.Router();

const db = require("../db");


// ========================================
// GET ALL RESERVATIONS
// ========================================
router.get("/", async (req, res) => {
    try {

        const [reservations] = await db.query(`
            SELECT
                r.reservation_id,
                u.name AS user_name,
                v.vehicle_number,
                v.vehicle_type,
                ps.slot_number,
                pl.lot_name,
                r.start_time,
                r.end_time,
                r.status,
                r.created_at
            FROM reservations r

            JOIN users u
                ON r.user_id = u.user_id

            JOIN vehicles v
                ON r.vehicle_id = v.vehicle_id

            JOIN parking_slots ps
                ON r.slot_id = ps.slot_id

            JOIN parking_floors pf
                ON ps.floor_id = pf.floor_id

            JOIN parking_lots pl
                ON pf.lot_id = pl.lot_id

            ORDER BY r.reservation_id DESC
        `);

        res.json({
            success: true,
            data: reservations
        });

    } catch (error) {

        console.error(
            "GET RESERVATIONS ERROR:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Unable to fetch reservations",
            error: error.message
        });
    }
});


// ========================================
// GET RESERVATIONS OF ONE USER
// ========================================
router.get("/user/:userId", async (req, res) => {
    try {

        const userId = req.params.userId;

        const [reservations] = await db.query(`
            SELECT
                r.reservation_id,
                v.vehicle_number,
                v.vehicle_type,
                ps.slot_number,
                pl.lot_name,
                r.start_time,
                r.end_time,
                r.status
            FROM reservations r

            JOIN vehicles v
                ON r.vehicle_id = v.vehicle_id

            JOIN parking_slots ps
                ON r.slot_id = ps.slot_id

            JOIN parking_floors pf
                ON ps.floor_id = pf.floor_id

            JOIN parking_lots pl
                ON pf.lot_id = pl.lot_id

            WHERE r.user_id = ?

            ORDER BY r.reservation_id DESC
        `, [userId]);

        res.json({
            success: true,
            data: reservations
        });

    } catch (error) {

        console.error(
            "GET USER RESERVATIONS ERROR:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Unable to fetch user reservations",
            error: error.message
        });
    }
});


// ========================================
// CREATE RESERVATION
// ========================================
router.post("/", async (req, res) => {
    try {

        const {
            user_id,
            vehicle_id,
            slot_id,
            start_time,
            end_time
        } = req.body;


        // Check required fields
        if (
            !user_id ||
            !vehicle_id ||
            !slot_id ||
            !start_time ||
            !end_time
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "user_id, vehicle_id, slot_id, start_time and end_time are required"
            });
        }


        // Check slot availability
        const [slots] = await db.query(`
            SELECT status
            FROM parking_slots
            WHERE slot_id = ?
        `, [slot_id]);


        if (slots.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Parking slot not found"
            });
        }


        if (
            slots[0].status !== "AVAILABLE" &&
            slots[0].status !== "RESERVED"
        ) {

            return res.status(400).json({
                success: false,
                message: "Parking slot is not available"
            });
        }


        // Create reservation
        const [result] = await db.query(`
            INSERT INTO reservations
            (
                user_id,
                vehicle_id,
                slot_id,
                start_time,
                end_time,
                status
            )
            VALUES (?, ?, ?, ?, ?, 'PENDING')
        `, [
            user_id,
            vehicle_id,
            slot_id,
            start_time,
            end_time
        ]);


        res.status(201).json({
            success: true,
            message: "Reservation created successfully",
            reservation_id: result.insertId
        });


    } catch (error) {

        console.error(
            "CREATE RESERVATION ERROR:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Unable to create reservation",
            error: error.message
        });
    }
});


// ========================================
// CONFIRM RESERVATION
// ========================================
router.put("/:id/confirm", async (req, res) => {

    try {

        const reservationId = req.params.id;


        // Check reservation
        const [reservations] = await db.query(`
            SELECT
                reservation_id,
                slot_id,
                status
            FROM reservations
            WHERE reservation_id = ?
        `, [reservationId]);


        if (reservations.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Reservation not found"
            });

        }


        const reservation = reservations[0];


        // Only PENDING reservation can be confirmed
        if (reservation.status !== "PENDING") {

            return res.status(400).json({
                success: false,
                message:
                    "Only pending reservations can be confirmed"
            });

        }


        // Check parking slot
        const [slots] = await db.query(`
            SELECT status
            FROM parking_slots
            WHERE slot_id = ?
        `, [reservation.slot_id]);


        if (slots.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Parking slot not found"
            });

        }


        // Update reservation
        await db.query(`
            UPDATE reservations
            SET status = 'CONFIRMED'
            WHERE reservation_id = ?
        `, [reservationId]);


        // Update parking slot
        await db.query(`
            UPDATE parking_slots
            SET status = 'RESERVED'
            WHERE slot_id = ?
        `, [reservation.slot_id]);


        res.json({

            success: true,

            message:
                "Reservation confirmed successfully"

        });


    } catch (error) {

        console.error(
            "CONFIRM RESERVATION ERROR:",
            error.message
        );


        res.status(500).json({

            success: false,

            message:
                "Unable to confirm reservation",

            error:
                error.message

        });

    }

});


// ========================================
// CANCEL RESERVATION
// ========================================
router.put("/:id/cancel", async (req, res) => {
    try {

        const reservationId = req.params.id;

        const [result] = await db.query(`
            UPDATE reservations
            SET status = 'CANCELLED'
            WHERE reservation_id = ?
        `, [reservationId]);


        if (result.affectedRows === 0) {

            return res.status(404).json({
                success: false,
                message: "Reservation not found"
            });
        }


        res.json({
            success: true,
            message: "Reservation cancelled successfully"
        });


    } catch (error) {

        console.error(
            "CANCEL RESERVATION ERROR:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Unable to cancel reservation",
            error: error.message
        });
    }
});


module.exports = router;