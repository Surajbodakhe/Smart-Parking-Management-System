// Get logged-in user
const user = JSON.parse(localStorage.getItem("user"));

// Check login
if (!user) {
    window.location.href = "index.html";
}


// Display user information
document.getElementById("userName").textContent = user.name;
document.getElementById("userRole").textContent = user.role;
document.getElementById("welcomeName").textContent = user.name;


// Load dashboard statistics
async function loadDashboardStats() {

    try {

        const response = await fetch(
            "http://localhost:5000/api/dashboard/stats"
        );

        const result = await response.json();

        if (result.success) {

            document.getElementById("totalSlots").textContent =
                result.data.totalSlots;

            document.getElementById("availableSlots").textContent =
                result.data.availableSlots;

            document.getElementById("occupiedSlots").textContent =
                result.data.occupiedSlots;

            document.getElementById("reservations").textContent =
                result.data.reservations;

        } else {

            console.error("Unable to load dashboard data");

        }

    } catch (error) {

        console.error("Dashboard Error:", error);

    }
}


// Logout
document.getElementById("logoutBtn").addEventListener("click", function () {

    localStorage.removeItem("user");

    window.location.href = "index.html";

});


// Load data when page opens
loadDashboardStats();

// View Parking Slots
document.getElementById("viewSlotsBtn").addEventListener(
    "click",
    function () {
        window.location.href = "parking.html";
    }
);

// View Reservations
document.getElementById("viewReservationsBtn").addEventListener(
    "click",
    function () {
        window.location.href = "reservation.html";
    }
);

document.getElementById("viewPaymentsBtn").addEventListener(
    "click",
    function () {
        window.location.href = "payment.html";
    }
);

document.getElementById("viewReportsBtn").addEventListener(
    "click",
    function () {
        window.location.href = "reports.html";
    }
);

// View Vehicles
document.getElementById("viewVehiclesBtn").addEventListener(
    "click",
    function () {
        window.location.href = "vehicles.html";
    }
);