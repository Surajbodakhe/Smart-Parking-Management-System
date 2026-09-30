const express = require("express");
const router = express.Router();

const db = require("../db");


// ========================================
// GET ALL PARKING SLOTS
// ========================================

router.get("/slots", async (req, res) => {

    try {

        const [slots] = await db.query(`
            SELECT
                ps.slot_id,
                pl.lot_name,
                pl.location,
                pf.floor_number,
                ps.slot_number,
                ps.slot_type,
                ps.status
            FROM parking_slots ps
            JOIN parking_floors pf
                ON ps.floor_id = pf.floor_id
            JOIN parking_lots pl
                ON pf.lot_id = pl.lot_id
            ORDER BY
                pl.lot_id,
                pf.floor_number,
                ps.slot_number
        `);


        res.json({
            success: true,
            data: slots
        });


    } catch (error) {

        console.error(
            "GET PARKING SLOTS ERROR:",
            error.message
        );


        res.status(500).json({
            success: false,
            message: "Unable to fetch parking slots",
            error: error.message
        });

    }

});


// ========================================
// UPDATE PARKING SLOT STATUS
// ========================================

router.put("/slots/:id", async (req, res) => {

    try {

        const slotId = req.params.id;

        const { status } = req.body;


        // Allowed statuses
        const validStatuses = [
            "AVAILABLE",
            "OCCUPIED",
            "RESERVED",
            "MAINTENANCE"
        ];


        // Validate status
        if (!status || !validStatuses.includes(status)) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid status. Use AVAILABLE, OCCUPIED, RESERVED or MAINTENANCE."

            });

        }


        // Check slot exists
        const [slots] = await db.query(
            `
            SELECT slot_id
            FROM parking_slots
            WHERE slot_id = ?
            `,
            [slotId]
        );


        if (slots.length === 0) {

            return res.status(404).json({

                success: false,

                message: "Parking slot not found"

            });

        }


        // Update status
        const [result] = await db.query(
            `
            UPDATE parking_slots
            SET status = ?
            WHERE slot_id = ?
            `,
            [
                status,
                slotId
            ]
        );


        if (result.affectedRows === 0) {

            return res.status(400).json({

                success: false,

                message: "Unable to update parking slot"

            });

        }


        res.json({

            success: true,

            message:
                "Parking slot status updated successfully"

        });


    } catch (error) {

        console.error(
            "UPDATE PARKING SLOT ERROR:",
            error.message
        );


        res.status(500).json({

            success: false,

            message:
                "Unable to update parking slot",

            error: error.message

        });

    }

});


module.exports = router;