const express = require("express");
const cors = require("cors");
require("dotenv").config({ path: __dirname + "/.env" });

const db = require("./db");

const authRoutes = require("./routes/auth");
const dashboardRoutes = require("./routes/dashboard");
const vehicleRoutes = require("./routes/vehicle");
const parkingRoutes = require("./routes/parking");
const reservationRoutes = require("./routes/reservation");
const sessionRoutes = require("./routes/session");
const paymentRoutes = require("./routes/payment");
const reportRoutes = require("./routes/report");
const usersRoutes = require("./routes/users");

const app = express();


// ========================================
// MIDDLEWARE
// ========================================

app.use(cors());
app.use(express.json());


// ========================================
// ROUTES
// ========================================

// Login
app.use("/api", authRoutes);

// Dashboard
app.use("/api/dashboard", dashboardRoutes);

// Vehicles
app.use("/api/vehicles", vehicleRoutes);

// Parking
app.use("/api/parking", parkingRoutes);

// Reservations
app.use("/api/reservations", reservationRoutes);

// Parking Sessions
app.use("/api/sessions", sessionRoutes);

// Payments
app.use("/api/payments", paymentRoutes);

// Reports
app.use("/api/reports", reportRoutes);

// Users - Admin
app.use("/api/users", usersRoutes);


// ========================================
// HOME ROUTE
// ========================================

app.get("/", (req, res) => {

    res.json({
        success: true,
        message: "🚗 Smart Parking Management System API is running!"
    });

});


// ========================================
// DATABASE TEST
// ========================================

app.get("/api/test-db", async (req, res) => {

    try {

        const [rows] = await db.query(
            "SELECT 1 AS result"
        );

        res.json({
            success: true,
            message: "MySQL connection is working!",
            data: rows
        });

    } catch (error) {

        console.error(
            "DATABASE ERROR:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Database connection failed",
            error: error.message
        });

    }

});


// ========================================
// START SERVER
// ========================================

const PORT = 5000;

app.listen(PORT, () => {

    console.log("=================================");
    console.log(
        `🚗 Server running on http://localhost:${PORT}`
    );
    console.log("=================================");

});