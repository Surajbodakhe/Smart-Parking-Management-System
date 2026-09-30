// ========================================
// GET LOGGED-IN USER
// ========================================

const user = JSON.parse(localStorage.getItem("user"));


// ========================================
// LOGIN CHECK
// ========================================

if (!user) {
    window.location.href = "index.html";
}


// ========================================
// ADMIN CHECK
// ========================================

if (user.role !== "ADMIN") {

    alert("Access denied! Admin only.");

    window.location.href = "dashboard.html";
}


// ========================================
// DISPLAY ADMIN INFORMATION
// ========================================

document.getElementById("userName").textContent = user.name;
document.getElementById("userRole").textContent = user.role;
document.getElementById("welcomeName").textContent = user.name;


// ========================================
// LOGOUT
// ========================================

document.getElementById("logoutBtn").addEventListener(
    "click",
    function () {

        localStorage.removeItem("user");

        window.location.href = "index.html";
    }
);


// ========================================
// USERS
// ========================================

document.getElementById("viewUsersBtn").addEventListener(
    "click",
    function () {

        window.location.href = "users.html";
    }
);


// ========================================
// ADMIN VEHICLES
// ========================================

document.getElementById("viewVehiclesBtn").addEventListener(
    "click",
    function () {

        window.location.href = "admin-vehicles.html";
    }
);


// ========================================
// ADMIN PARKING SLOTS
// ========================================

document.getElementById("viewSlotsBtn").addEventListener(
    "click",
    function () {

        window.location.href = "admin-parking.html";
    }
);


// ========================================
// ADMIN RESERVATIONS
// ========================================

document.getElementById("viewReservationsBtn").addEventListener(
    "click",
    function () {

        window.location.href = "admin-reservations.html";
    }
);


// ========================================
// ADMIN PAYMENTS
// ========================================

document.getElementById("viewPaymentsBtn").addEventListener(
    "click",
    function () {

        window.location.href = "admin-payments.html";
    }
);


// ========================================
// REPORTS
// ========================================

document.getElementById("viewReportsBtn").addEventListener(
    "click",
    function () {

        window.location.href = "reports.html";
    }
);
