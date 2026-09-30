CREATE DATABASE IF NOT EXISTS smart_parking;

USE smart_parking;

-- =========================================
-- 1. USERS TABLE
-- =========================================

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(15) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'USER') DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =========================================
-- 2. VEHICLES TABLE
-- =========================================

CREATE TABLE vehicles (
    vehicle_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    vehicle_number VARCHAR(20) NOT NULL UNIQUE,
    vehicle_type ENUM('CAR', 'BIKE', 'SUV', 'EV') NOT NULL,
    model VARCHAR(100),

    CONSTRAINT fk_vehicle_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);


-- =========================================
-- 3. PARKING LOTS TABLE
-- =========================================

CREATE TABLE parking_lots (
    lot_id INT AUTO_INCREMENT PRIMARY KEY,
    lot_name VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    total_slots INT NOT NULL,

    CONSTRAINT chk_total_slots
        CHECK (total_slots > 0)
);


-- =========================================
-- 4. PARKING FLOORS TABLE
-- =========================================

CREATE TABLE parking_floors (
    floor_id INT AUTO_INCREMENT PRIMARY KEY,
    lot_id INT NOT NULL,
    floor_number INT NOT NULL,

    CONSTRAINT fk_floor_lot
        FOREIGN KEY (lot_id)
        REFERENCES parking_lots(lot_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT uq_floor
        UNIQUE (lot_id, floor_number)
);


-- =========================================
-- 5. PARKING SLOTS TABLE
-- =========================================

CREATE TABLE parking_slots (
    slot_id INT AUTO_INCREMENT PRIMARY KEY,
    floor_id INT NOT NULL,
    slot_number VARCHAR(20) NOT NULL,
    slot_type ENUM('CAR', 'BIKE', 'EV', 'DISABLED') NOT NULL,
    status ENUM('AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE')
           DEFAULT 'AVAILABLE',

    CONSTRAINT fk_slot_floor
        FOREIGN KEY (floor_id)
        REFERENCES parking_floors(floor_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT uq_slot
        UNIQUE (floor_id, slot_number)
);


-- =========================================
-- 6. RESERVATIONS TABLE
-- =========================================

CREATE TABLE reservations (
    reservation_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    vehicle_id INT NOT NULL,
    slot_id INT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    status ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED')
           DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_reservation_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_reservation_vehicle
        FOREIGN KEY (vehicle_id)
        REFERENCES vehicles(vehicle_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_reservation_slot
        FOREIGN KEY (slot_id)
        REFERENCES parking_slots(slot_id)
        ON DELETE CASCADE,

    CONSTRAINT chk_reservation_time
        CHECK (end_time > start_time)
);


-- =========================================
-- 7. PARKING SESSIONS TABLE
-- =========================================

CREATE TABLE parking_sessions (
    session_id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id INT NOT NULL,
    slot_id INT NOT NULL,
    entry_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    exit_time DATETIME NULL,
    session_status ENUM('ACTIVE', 'COMPLETED')
                   DEFAULT 'ACTIVE',

    CONSTRAINT fk_session_vehicle
        FOREIGN KEY (vehicle_id)
        REFERENCES vehicles(vehicle_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_session_slot
        FOREIGN KEY (slot_id)
        REFERENCES parking_slots(slot_id)
        ON DELETE CASCADE
);


-- =========================================
-- 8. PRICING TABLE
-- =========================================

CREATE TABLE pricing (
    pricing_id INT AUTO_INCREMENT PRIMARY KEY,
    lot_id INT NOT NULL,
    vehicle_type ENUM('CAR', 'BIKE', 'SUV', 'EV') NOT NULL,
    hourly_rate DECIMAL(10,2) NOT NULL,
    effective_from DATE NOT NULL,

    CONSTRAINT fk_pricing_lot
        FOREIGN KEY (lot_id)
        REFERENCES parking_lots(lot_id)
        ON DELETE CASCADE,

    CONSTRAINT chk_hourly_rate
        CHECK (hourly_rate > 0),

    CONSTRAINT uq_pricing
        UNIQUE (lot_id, vehicle_type, effective_from)
);


-- =========================================
-- 9. PAYMENTS TABLE
-- =========================================

CREATE TABLE payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('CASH', 'UPI', 'CARD') NOT NULL,
    payment_status ENUM('PENDING', 'SUCCESS', 'FAILED')
                    DEFAULT 'PENDING',
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_payment_session
        FOREIGN KEY (session_id)
        REFERENCES parking_sessions(session_id)
        ON DELETE CASCADE,

    CONSTRAINT chk_payment_amount
        CHECK (amount >= 0)
);


-- =========================================
-- 10. FEEDBACK TABLE
-- =========================================

CREATE TABLE feedback (
    feedback_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    session_id INT NOT NULL,
    rating INT NOT NULL,
    comment VARCHAR(500),
    feedback_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_feedback_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_feedback_session
        FOREIGN KEY (session_id)
        REFERENCES parking_sessions(session_id)
        ON DELETE CASCADE,

    CONSTRAINT chk_rating
        CHECK (rating BETWEEN 1 AND 5)
);