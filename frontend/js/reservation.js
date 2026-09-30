const user = JSON.parse(localStorage.getItem("user"));


// Check login
if (!user) {
    window.location.href = "index.html";
}


// Display user information
document.getElementById("userName").textContent = user.name;
document.getElementById("userRole").textContent = user.role;


const vehicleSelect = document.getElementById("vehicleSelect");
const slotSelect = document.getElementById("slotSelect");
const reservationForm = document.getElementById("reservationForm");
const reservationMessage = document.getElementById("reservationMessage");
const reservationContainer = document.getElementById("reservationContainer");


// ========================================
// LOAD USER VEHICLES
// ========================================
async function loadVehicles() {

    try {

        const response = await fetch(
            `http://localhost:5000/api/vehicles/user/${user.user_id}`
        );

        const result = await response.json();

        if (result.success) {

            vehicleSelect.innerHTML = `
                <option value="">
                    Select your vehicle
                </option>
            `;

            result.data.forEach(vehicle => {

                vehicleSelect.innerHTML += `
                    <option value="${vehicle.vehicle_id}">
                        ${vehicle.vehicle_number}
                        - ${vehicle.vehicle_type}
                    </option>
                `;

            });

        }

    } catch (error) {

        console.error("VEHICLE ERROR:", error);

    }
}


// ========================================
// LOAD AVAILABLE PARKING SLOTS
// ========================================
async function loadSlots() {

    try {

        const response = await fetch(
            "http://localhost:5000/api/parking/slots"
        );

        const result = await response.json();

        if (result.success) {

            slotSelect.innerHTML = `
                <option value="">
                    Select available slot
                </option>
            `;

            result.data
                .filter(slot => slot.status === "AVAILABLE")
                .forEach(slot => {

                    slotSelect.innerHTML += `
                        <option value="${slot.slot_id}">
                            ${slot.slot_number}
                            - ${slot.slot_type}
                            - ${slot.lot_name}
                            - Floor ${slot.floor_number}
                        </option>
                    `;

                });

        }

    } catch (error) {

        console.error("SLOT ERROR:", error);

    }
}


// ========================================
// CREATE RESERVATION
// ========================================
reservationForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const vehicleId =
            vehicleSelect.value;

        const slotId =
            slotSelect.value;

        const startTime =
            document.getElementById("startTime").value;

        const endTime =
            document.getElementById("endTime").value;


        if (!vehicleId || !slotId || !startTime || !endTime) {

            reservationMessage.textContent =
                "Please fill all fields.";

            return;
        }


        if (new Date(endTime) <= new Date(startTime)) {

            reservationMessage.textContent =
                "End time must be after start time.";

            return;
        }


        reservationMessage.textContent =
            "Creating reservation...";


        try {

            const response = await fetch(
                "http://localhost:5000/api/reservations",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({

                        user_id: user.user_id,

                        vehicle_id: Number(vehicleId),

                        slot_id: Number(slotId),

                        start_time: startTime,

                        end_time: endTime

                    })
                }
            );


            const result = await response.json();


            if (result.success) {

                reservationMessage.textContent =
                    "Reservation created successfully!";

                reservationForm.reset();

                await loadSlots();

                await loadReservations();

            } else {

                reservationMessage.textContent =
                    result.message;

            }

        } catch (error) {

            console.error(
                "RESERVATION ERROR:",
                error
            );

            reservationMessage.textContent =
                "Unable to connect to server.";

        }

    }
);


// ========================================
// LOAD MY RESERVATIONS
// ========================================
async function loadReservations() {

    try {

        const response = await fetch(
            `http://localhost:5000/api/reservations/user/${user.user_id}`
        );

        const result = await response.json();


        if (!result.success) {

            reservationContainer.innerHTML =
                "<p>Unable to load reservations.</p>";

            return;
        }


        if (result.data.length === 0) {

            reservationContainer.innerHTML =
                "<p>No reservations found.</p>";

            return;
        }


        let html = "";


        result.data.forEach(reservation => {

            html += `
                <div class="reservation-card">

                    <h3>
                        🅿️ Slot ${reservation.slot_number}
                    </h3>

                    <p>
                        <strong>Vehicle:</strong>
                        ${reservation.vehicle_number}
                    </p>

                    <p>
                        <strong>Type:</strong>
                        ${reservation.vehicle_type}
                    </p>

                    <p>
                        <strong>Parking:</strong>
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
                        <span class="reservation-status ${reservation.status.toLowerCase()}">
                            ${reservation.status}
                        </span>
                    </p>

                    ${
                        reservation.status !== "CANCELLED"
                        ? `
                            <button
                                class="cancel-btn"
                                onclick="cancelReservation(${reservation.reservation_id})">
                                Cancel Reservation
                            </button>
                          `
                        : ""
                    }

                </div>
            `;

        });


        reservationContainer.innerHTML = html;


    } catch (error) {

        console.error(
            "GET RESERVATIONS ERROR:",
            error
        );

        reservationContainer.innerHTML =
            "<p>Unable to connect to server.</p>";
    }
}


// ========================================
// CANCEL RESERVATION
// ========================================
async function cancelReservation(reservationId) {

    const confirmCancel =
        confirm(
            "Are you sure you want to cancel this reservation?"
        );


    if (!confirmCancel) {
        return;
    }


    try {

        const response = await fetch(
            `http://localhost:5000/api/reservations/${reservationId}/cancel`,
            {
                method: "PUT"
            }
        );


        const result = await response.json();


        if (result.success) {

            alert(
                "Reservation cancelled successfully!"
            );

            await loadReservations();

            await loadSlots();

        } else {

            alert(result.message);

        }


    } catch (error) {

        console.error(
            "CANCEL ERROR:",
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
function formatDate(dateString) {

    const date = new Date(dateString);

    return date.toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short"
    });
}


// ========================================
// DASHBOARD BUTTON
// ========================================
document.getElementById("backBtn").addEventListener(
    "click",
    function () {

        window.location.href = "dashboard.html";

    }
);


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
// LOAD DATA
// ========================================
loadVehicles();
loadSlots();
loadReservations();