const express = require("express");
const router = express.Router();

const db = require("../db");


// ========================================
// GET ALL PARKING SESSIONS
// ========================================
router.get("/", async (req, res) => {
    try {

        const [sessions] = await db.query(`
            SELECT
                ps.session_id,
                v.vehicle_number,
                v.vehicle_type,
                ps.slot_id,
                s.slot_number,
                pl.lot_name,
                ps.entry_time,
                ps.exit_time,
                ps.session_status
            FROM parking_sessions ps

            JOIN vehicles v
                ON ps.vehicle_id = v.vehicle_id

            JOIN parking_slots s
                ON ps.slot_id = s.slot_id

            JOIN parking_floors pf
                ON s.floor_id = pf.floor_id

            JOIN parking_lots pl
                ON pf.lot_id = pl.lot_id

            ORDER BY ps.session_id DESC
        `);

        res.json({
            success: true,
            data: sessions
        });

    } catch (error) {

        console.error(
            "GET SESSIONS ERROR:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Unable to fetch parking sessions",
            error: error.message
        });
    }
});


// ========================================
// GET ACTIVE SESSIONS
// ========================================
router.get("/active", async (req, res) => {
    try {

        const [sessions] = await db.query(`
            SELECT
                ps.session_id,
                v.vehicle_number,
                v.vehicle_type,
                s.slot_number,
                pl.lot_name,
                ps.entry_time,
                ps.session_status
            FROM parking_sessions ps

            JOIN vehicles v
                ON ps.vehicle_id = v.vehicle_id

            JOIN parking_slots s
                ON ps.slot_id = s.slot_id

            JOIN parking_floors pf
                ON s.floor_id = pf.floor_id

            JOIN parking_lots pl
                ON pf.lot_id = pl.lot_id

            WHERE ps.session_status = 'ACTIVE'

            ORDER BY ps.entry_time DESC
        `);

        res.json({
            success: true,
            data: sessions
        });

    } catch (error) {

        console.error(
            "GET ACTIVE SESSIONS ERROR:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Unable to fetch active sessions",
            error: error.message
        });
    }
});


// ========================================
// VEHICLE ENTRY
// ========================================
router.post("/entry", async (req, res) => {
    try {

        const {
            vehicle_id,
            slot_id
        } = req.body;


        // Check required fields
        if (!vehicle_id || !slot_id) {

            return res.status(400).json({
                success: false,
                message: "vehicle_id and slot_id are required"
            });
        }


        // Check slot
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


        if (slots[0].status !== "AVAILABLE") {

            return res.status(400).json({
                success: false,
                message: "Parking slot is not available"
            });
        }


        // Check whether vehicle already has active session
        const [activeSession] = await db.query(`
            SELECT session_id
            FROM parking_sessions
            WHERE vehicle_id = ?
            AND session_status = 'ACTIVE'
        `, [vehicle_id]);


        if (activeSession.length > 0) {

            return res.status(400).json({
                success: false,
                message: "Vehicle already has an active parking session"
            });
        }


        // Create parking session
        const [result] = await db.query(`
            INSERT INTO parking_sessions
            (
                vehicle_id,
                slot_id,
                entry_time,
                session_status
            )
            VALUES (?, ?, NOW(), 'ACTIVE')
        `, [
            vehicle_id,
            slot_id
        ]);


        res.status(201).json({
            success: true,
            message: "Vehicle entry recorded successfully",
            session_id: result.insertId
        });


    } catch (error) {

        console.error(
            "VEHICLE ENTRY ERROR:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Unable to record vehicle entry",
            error: error.message
        });
    }
});


// ========================================
// VEHICLE EXIT
// ========================================
router.put("/:id/exit", async (req, res) => {
    try {

        const sessionId = req.params.id;


        // Check active session
        const [sessions] = await db.query(`
            SELECT session_id
            FROM parking_sessions
            WHERE session_id = ?
            AND session_status = 'ACTIVE'
        `, [sessionId]);


        if (sessions.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Active parking session not found"
            });
        }


        // Record exit
        const [result] = await db.query(`
            UPDATE parking_sessions
            SET
                exit_time = NOW(),
                session_status = 'COMPLETED'
            WHERE session_id = ?
        `, [sessionId]);


        if (result.affectedRows === 0) {

            return res.status(400).json({
                success: false,
                message: "Unable to record vehicle exit"
            });
        }


        res.json({
            success: true,
            message: "Vehicle exit recorded successfully"
        });


    } catch (error) {

        console.error(
            "VEHICLE EXIT ERROR:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Unable to record vehicle exit",
            error: error.message
        });
    }
});


module.exports = router;