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

document.getElementById("userName").textContent =
    user.name;

document.getElementById("userRole").textContent =
    user.role;


// ========================================
// ELEMENTS
// ========================================

const reservationContainer =
    document.getElementById("reservationContainer");

const statusFilter =
    document.getElementById("statusFilter");

const filterBtn =
    document.getElementById("filterBtn");


// ========================================
// LOAD ALL RESERVATIONS
// ========================================

async function loadReservations() {

    try {

        reservationContainer.innerHTML =
            "<p class='loading'>Loading reservations...</p>";


        const response = await fetch(
            "http://localhost:5000/api/reservations"
        );


        const result = await response.json();


        if (!result.success) {

            reservationContainer.innerHTML =
                "<p>Unable to load reservations.</p>";

            return;

        }


        displayReservations(result.data);

    } catch (error) {

        console.error(
            "LOAD RESERVATIONS ERROR:",
            error
        );


        reservationContainer.innerHTML =
            "<p>Unable to connect to server.</p>";

    }

}


// ========================================
// DISPLAY RESERVATIONS
// ========================================

function displayReservations(reservations) {

    const selectedStatus =
        statusFilter.value;


    let filteredReservations =
        reservations;


    if (selectedStatus !== "ALL") {

        filteredReservations =
            reservations.filter(
                reservation =>
                    reservation.status === selectedStatus
            );

    }


    if (filteredReservations.length === 0) {

        reservationContainer.innerHTML =
            "<p>No reservations found.</p>";

        return;

    }


    let html = "";


    filteredReservations.forEach(
        reservation => {

            html += `

                <div class="reservation-card">

                    <h3>
                        📅 Reservation #${reservation.reservation_id}
                    </h3>

                    <p>
                        <strong>User:</strong>
                        ${reservation.user_name}
                    </p>

                    <p>
                        <strong>Vehicle:</strong>
                        ${reservation.vehicle_number}
                    </p>

                    <p>
                        <strong>Vehicle Type:</strong>
                        ${reservation.vehicle_type}
                    </p>

                    <p>
                        <strong>Parking Slot:</strong>
                        ${reservation.slot_number}
                    </p>

                    <p>
                        <strong>Parking Lot:</strong>
                        ${reservation.lot_name}
                    </p>

                    <p>
                        <strong>Start:</strong>
                        ${formatDate(reservation.start_time)}
                    </p>

                    <p>
                        <strong>End:</strong>
                        ${formatDate(reservation.end_time)}
                    </p>

                    <p>
                        <strong>Status:</strong>
                        ${reservation.status}
                    </p>

                    ${
                        reservation.status === "PENDING"
                        ? `

                            <button
                                onclick="confirmReservation(
                                    ${reservation.reservation_id}
                                )">

                                ✅ Confirm

                            </button>

                            <button
                                onclick="cancelReservation(
                                    ${reservation.reservation_id}
                                )">

                                ❌ Cancel

                            </button>

                        `
                        : ""
                    }

                </div>

            `;

        }
    );


    reservationContainer.innerHTML =
        html;

}


// ========================================
// CONFIRM RESERVATION
// ========================================

async function confirmReservation(
    reservationId
) {

    const confirmAction =
        confirm(
            "Confirm this reservation?"
        );


    if (!confirmAction) {

        return;

    }


    try {

        const response = await fetch(

            `http://localhost:5000/api/reservations/${reservationId}/confirm`,

            {
                method: "PUT"
            }

        );


        const result =
            await response.json();


        if (result.success) {

            alert(
                "Reservation confirmed successfully!"
            );

            await loadReservations();

        } else {

            alert(result.message);

        }


    } catch (error) {

        console.error(
            "CONFIRM RESERVATION ERROR:",
            error
        );


        alert(
            "Unable to connect to server."
        );

    }

}


// ========================================
// CANCEL RESERVATION
// ========================================

async function cancelReservation(
    reservationId
) {

    const confirmAction =
        confirm(
            "Are you sure you want to cancel this reservation?"
        );


    if (!confirmAction) {

        return;

    }


    try {

        const response = await fetch(

            `http://localhost:5000/api/reservations/${reservationId}/cancel`,

            {
                method: "PUT"
            }

        );


        const result =
            await response.json();


        if (result.success) {

            alert(
                "Reservation cancelled successfully!"
            );

            await loadReservations();

        } else {

            alert(result.message);

        }


    } catch (error) {

        console.error(
            "CANCEL RESERVATION ERROR:",
            error
        );


        alert(
            "Unable to connect to server."
        );

    }

}


// ========================================
// FORMAT DATE
// ========================================

function formatDate(dateValue) {

    if (!dateValue) {

        return "N/A";

    }


    const date =
        new Date(dateValue);


    return date.toLocaleString();

}


// ========================================
// FILTER BUTTON
// ========================================

filterBtn.addEventListener(
    "click",
    function () {

        loadReservations();

    }
);


// ========================================
// BACK TO ADMIN DASHBOARD
// ========================================

document.getElementById(
    "backBtn"
).addEventListener(
    "click",
    function () {

        window.location.href =
            "admin.html";

    }
);


// ========================================
// LOGOUT
// ========================================

document.getElementById(
    "logoutBtn"
).addEventListener(
    "click",
    function () {

        localStorage.removeItem("user");

        window.location.href =
            "index.html";

    }
);


// ========================================
// INITIAL LOAD
// ========================================

loadReservations();