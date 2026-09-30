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

const vehicleContainer =
    document.getElementById("vehicleContainer");

const vehicleSearch =
    document.getElementById("vehicleSearch");

const searchBtn =
    document.getElementById("searchBtn");


// ========================================
// LOAD ALL VEHICLES
// ========================================

async function loadVehicles() {

    try {

        vehicleContainer.innerHTML =
            "<p class='loading'>Loading vehicles...</p>";


        const response = await fetch(
            "http://localhost:5000/api/vehicles"
        );


        const result = await response.json();


        if (!result.success) {

            vehicleContainer.innerHTML =
                "<p>Unable to load vehicles.</p>";

            return;

        }


        displayVehicles(result.data);


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
// DISPLAY VEHICLES
// ========================================

function displayVehicles(vehicles) {

    if (vehicles.length === 0) {

        vehicleContainer.innerHTML =
            "<p>No vehicles found.</p>";

        return;

    }


    let html = "";


    vehicles.forEach(vehicle => {

        html += `

            <div class="vehicle-card">

                <h3>
                    🚗 ${vehicle.vehicle_number}
                </h3>

                <p>
                    <strong>Vehicle ID:</strong>
                    ${vehicle.vehicle_id}
                </p>

                <p>
                    <strong>Owner:</strong>
                    ${vehicle.user_name}
                </p>

                <p>
                    <strong>Email:</strong>
                    ${vehicle.email}
                </p>

                <p>
                    <strong>Vehicle Type:</strong>
                    ${vehicle.vehicle_type}
                </p>

                <p>
                    <strong>Model:</strong>
                    ${vehicle.model || "N/A"}
                </p>

                <button
                    onclick="editVehicle(${vehicle.vehicle_id})">
                    ✏️ Edit
                </button>

                <button
                    onclick="deleteVehicle(${vehicle.vehicle_id})">
                    🗑️ Delete
                </button>

            </div>

        `;

    });


    vehicleContainer.innerHTML =
        html;

}


// ========================================
// SEARCH VEHICLES
// ========================================

async function searchVehicles() {

    const search =
        vehicleSearch.value.trim().toLowerCase();


    if (!search) {

        loadVehicles();

        return;

    }


    try {

        vehicleContainer.innerHTML =
            "<p class='loading'>Searching...</p>";


        const response = await fetch(
            "http://localhost:5000/api/vehicles"
        );


        const result =
            await response.json();


        if (!result.success) {

            vehicleContainer.innerHTML =
                "<p>Unable to search vehicles.</p>";

            return;

        }


        const filteredVehicles =
            result.data.filter(vehicle =>

                vehicle.vehicle_number
                    .toLowerCase()
                    .includes(search)

                ||

                vehicle.vehicle_type
                    .toLowerCase()
                    .includes(search)

                ||

                (vehicle.model &&
                    vehicle.model
                        .toLowerCase()
                        .includes(search))

                ||

                vehicle.user_name
                    .toLowerCase()
                    .includes(search)

            );


        displayVehicles(filteredVehicles);


    } catch (error) {

        console.error(
            "SEARCH VEHICLES ERROR:",
            error
        );


        vehicleContainer.innerHTML =
            "<p>Unable to connect to server.</p>";

    }

}


// ========================================
// EDIT VEHICLE
// ========================================

async function editVehicle(vehicleId) {

    const vehicleNumber =
        prompt("Enter new vehicle number:");

    if (vehicleNumber === null) {
        return;
    }


    const model =
        prompt("Enter new vehicle model:");

    if (model === null) {
        return;
    }


    const vehicleType =
        prompt(
            "Enter vehicle type: CAR, BIKE, SUV or EV"
        );

    if (vehicleType === null) {
        return;
    }


    const type =
        vehicleType.trim().toUpperCase();


    const validTypes = [
        "CAR",
        "BIKE",
        "SUV",
        "EV"
    ];


    if (!validTypes.includes(type)) {

        alert(
            "Invalid vehicle type.\n\nUse: CAR, BIKE, SUV or EV"
        );

        return;

    }


    try {

        const response = await fetch(
            `http://localhost:5000/api/vehicles/${vehicleId}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    vehicle_number:
                        vehicleNumber.trim(),

                    vehicle_type:
                        type,

                    model:
                        model.trim()
                })
            }
        );


        const result =
            await response.json();


        if (result.success) {

            alert(
                "Vehicle updated successfully!"
            );

            loadVehicles();

        } else {

            alert(
                result.message ||
                "Unable to update vehicle."
            );

        }


    } catch (error) {

        console.error(
            "EDIT VEHICLE ERROR:",
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

            loadVehicles();

        } else {

            alert(
                result.message ||
                "Unable to delete vehicle."
            );

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
// SEARCH BUTTON
// ========================================

searchBtn.addEventListener(
    "click",
    function () {

        searchVehicles();

    }
);


// ========================================
// ENTER KEY SEARCH
// ========================================

vehicleSearch.addEventListener(
    "keypress",
    function (event) {

        if (event.key === "Enter") {

            searchVehicles();

        }

    }
);


// ========================================
// BACK TO ADMIN DASHBOARD
// ========================================

document.getElementById("backBtn")
    .addEventListener(
        "click",
        function () {

            window.location.href =
                "admin.html";

        }
    );


// ========================================
// LOGOUT
// ========================================

document.getElementById("logoutBtn")
    .addEventListener(
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