const express = require("express");
const router = express.Router();

const db = require("../db");


// ==========================================
// GET ALL VEHICLES
// ==========================================

router.get("/", async (req, res) => {

    try {

        const [vehicles] = await db.query(`
            SELECT
                v.vehicle_id,
                v.user_id,
                u.name AS user_name,
                v.vehicle_number,
                v.vehicle_type,
                v.model
            FROM vehicles v
            JOIN users u
                ON v.user_id = u.user_id
            ORDER BY v.vehicle_id DESC
        `);

        res.json({
            success: true,
            data: vehicles
        });

    } catch (error) {

        console.error("GET VEHICLES ERROR:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to fetch vehicles"
        });
    }
});


// ==========================================
// GET VEHICLES OF ONE USER
// ==========================================

router.get("/user/:userId", async (req, res) => {

    try {

        const userId = req.params.userId;

        const [vehicles] = await db.query(
            `SELECT *
             FROM vehicles
             WHERE user_id = ?
             ORDER BY vehicle_id DESC`,
            [userId]
        );

        res.json({
            success: true,
            data: vehicles
        });

    } catch (error) {

        console.error("GET USER VEHICLES ERROR:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to fetch user vehicles"
        });
    }
});


// ==========================================
// ADD VEHICLE
// ==========================================

router.post("/", async (req, res) => {

    try {

        const {
            user_id,
            vehicle_number,
            vehicle_type,
            model
        } = req.body;


        if (!user_id || !vehicle_number || !vehicle_type) {

            return res.status(400).json({
                success: false,
                message: "user_id, vehicle_number and vehicle_type are required"
            });
        }


        const [result] = await db.query(
            `INSERT INTO vehicles
            (user_id, vehicle_number, vehicle_type, model)
            VALUES (?, ?, ?, ?)`,
            [
                user_id,
                vehicle_number,
                vehicle_type,
                model || null
            ]
        );


        res.status(201).json({
            success: true,
            message: "Vehicle added successfully",
            vehicle_id: result.insertId
        });

    } catch (error) {

        console.error("ADD VEHICLE ERROR:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to add vehicle",
            error: error.message
        });
    }
});


// ==========================================
// UPDATE VEHICLE
// ==========================================

router.put("/:id", async (req, res) => {

    try {

        const vehicleId = req.params.id;

        const {
            vehicle_number,
            vehicle_type,
            model
        } = req.body;


        if (!vehicle_number || !vehicle_type) {

            return res.status(400).json({
                success: false,
                message: "vehicle_number and vehicle_type are required"
            });
        }


        const [result] = await db.query(
            `UPDATE vehicles
             SET vehicle_number = ?,
                 vehicle_type = ?,
                 model = ?
             WHERE vehicle_id = ?`,
            [
                vehicle_number,
                vehicle_type,
                model || null,
                vehicleId
            ]
        );


        if (result.affectedRows === 0) {

            return res.status(404).json({
                success: false,
                message: "Vehicle not found"
            });
        }


        res.json({
            success: true,
            message: "Vehicle updated successfully"
        });

    } catch (error) {

        console.error("UPDATE VEHICLE ERROR:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to update vehicle",
            error: error.message
        });
    }
});


// ==========================================
// DELETE VEHICLE
// ==========================================

router.delete("/:id", async (req, res) => {

    try {

        const vehicleId = req.params.id;

        const [result] = await db.query(
            `DELETE FROM vehicles
             WHERE vehicle_id = ?`,
            [vehicleId]
        );


        if (result.affectedRows === 0) {

            return res.status(404).json({
                success: false,
                message: "Vehicle not found"
            });
        }


        res.json({
            success: true,
            message: "Vehicle deleted successfully"
        });

    } catch (error) {

        console.error("DELETE VEHICLE ERROR:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to delete vehicle",
            error: error.message
        });
    }
});


module.exports = router;