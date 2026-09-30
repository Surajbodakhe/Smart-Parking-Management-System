const user = JSON.parse(localStorage.getItem("user"));

if (!user) {
    window.location.href = "index.html";
}

document.getElementById("userName").textContent = user.name;
document.getElementById("userRole").textContent = user.role;

const vehicleForm = document.getElementById("vehicleForm");
const vehicleContainer = document.getElementById("vehicleContainer");
const vehicleMessage = document.getElementById("vehicleMessage");


// ========================================
// LOAD MY VEHICLES
// ========================================

async function loadVehicles() {

    try {

        vehicleContainer.innerHTML =
            "<p class='loading'>Loading vehicles...</p>";

        const response = await fetch(
            `http://localhost:5000/api/vehicles/user/${user.user_id}`
        );

        const result = await response.json();

        if (!result.success) {
            vehicleContainer.innerHTML =
                "<p>Unable to load vehicles.</p>";
            return;
        }

        if (result.data.length === 0) {

            vehicleContainer.innerHTML =
                "<p>No vehicles found.</p>";

            return;
        }

        let html = "";

        result.data.forEach(vehicle => {

            html += `
                <div class="vehicle-card">

                    <h3>
                        🚗 ${vehicle.vehicle_number}
                    </h3>

                    <p>
                        <strong>Type:</strong>
                        ${vehicle.vehicle_type}
                    </p>

                    <p>
                        <strong>Model:</strong>
                        ${vehicle.model || "N/A"}
                    </p>

                    <button
                        onclick="editVehicle(
                            ${vehicle.vehicle_id},
                            '${vehicle.vehicle_number}',
                            '${vehicle.vehicle_type}',
                            '${vehicle.model || ""}'
                        )">
                        ✏️ Edit
                    </button>

                    <button
                        onclick="deleteVehicle(
                            ${vehicle.vehicle_id}
                        )">
                        🗑️ Delete
                    </button>

                </div>
            `;
        });

        vehicleContainer.innerHTML = html;

    } catch (error) {

        console.error(
            "LOAD VEHICLES ERROR:",
            error
        );

        vehicleContainer.innerHTML =
            "<p>Unable to connect to server.</p>";
    }
}


// ========================================
// ADD VEHICLE
// ========================================

vehicleForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        const vehicleNumber =
            document.getElementById("vehicleNumber").value
                .trim()
                .toUpperCase();

        const vehicleType =
            document.getElementById("vehicleType").value;

        const vehicleModel =
            document.getElementById("vehicleModel").value.trim();


        if (!vehicleNumber || !vehicleType) {

            vehicleMessage.textContent =
                "Please fill all required fields.";

            return;
        }


        vehicleMessage.textContent =
            "Adding vehicle...";


        try {

            const response = await fetch(
                "http://localhost:5000/api/vehicles",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        user_id:
                            user.user_id,

                        vehicle_number:
                            vehicleNumber,

                        vehicle_type:
                            vehicleType,

                        model:
                            vehicleModel || null
                    })
                }
            );


            const result =
                await response.json();


            if (result.success) {

                vehicleMessage.textContent =
                    "Vehicle added successfully!";

                vehicleForm.reset();

                await loadVehicles();

            } else {

                vehicleMessage.textContent =
                    result.message;
            }


        } catch (error) {

            console.error(
                "ADD VEHICLE ERROR:",
                error
            );

            vehicleMessage.textContent =
                "Unable to connect to server.";
        }
    }
);


// ========================================
// EDIT VEHICLE
// ========================================

async function editVehicle(
    vehicleId,
    oldNumber,
    oldType,
    oldModel
) {

    const newNumber =
        prompt(
            "Enter vehicle number:",
            oldNumber
        );

    if (newNumber === null) {
        return;
    }


    const newType =
        prompt(
            "Enter vehicle type (CAR / BIKE / SUV / EV):",
            oldType
        );

    if (newType === null) {
        return;
    }


    const newModel =
        prompt(
            "Enter vehicle model:",
            oldModel
        );

    if (newModel === null) {
        return;
    }


    try {

        const response = await fetch(
            `http://localhost:5000/api/vehicles/${vehicleId}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({

                    vehicle_number:
                        newNumber
                            .trim()
                            .toUpperCase(),

                    vehicle_type:
                        newType
                            .trim()
                            .toUpperCase(),

                    model:
                        newModel.trim()
                })
            }
        );


        const result =
            await response.json();


        if (result.success) {

            alert(
                "Vehicle updated successfully!"
            );

            await loadVehicles();

        } else {

            alert(result.message);
        }


    } catch (error) {

        console.error(
            "UPDATE VEHICLE ERROR:",
            error
        );

        alert(
            "Unable to connect to server."
        );
    }
}


// ========================================
// DELETE VEHICLE
// ========================================

async function deleteVehicle(vehicleId) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this vehicle?"
        );


    if (!confirmDelete) {
        return;
    }


    try {

        const response = await fetch(
            `http://localhost:5000/api/vehicles/${vehicleId}`,
            {
                method: "DELETE"
            }
        );


        const result =
            await response.json();


        if (result.success) {

            alert(
                "Vehicle deleted successfully!"
            );

            await loadVehicles();

        } else {

            alert(result.message);
        }


    } catch (error) {

        console.error(
            "DELETE VEHICLE ERROR:",
            error
        );

        alert(
            "Unable to connect to server."
        );
    }
}


// ========================================
// NAVIGATION
// ========================================

document.getElementById(
    "backBtn"
).addEventListener(
    "click",
    function () {

        window.location.href =
            "dashboard.html";
    }
);


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

loadVehicles();