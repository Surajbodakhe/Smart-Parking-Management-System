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

const slotContainer =
    document.getElementById("slotContainer");

const slotSearch =
    document.getElementById("slotSearch");

const statusFilter =
    document.getElementById("statusFilter");

const searchBtn =
    document.getElementById("searchBtn");


// Store all slots
let allSlots = [];


// ========================================
// LOAD ALL PARKING SLOTS
// ========================================

async function loadSlots() {

    try {

        slotContainer.innerHTML =
            "<p class='loading'>Loading parking slots...</p>";


        const response = await fetch(
            "http://localhost:5000/api/parking/slots"
        );


        const result =
            await response.json();


        if (!result.success) {

            slotContainer.innerHTML =
                "<p>Unable to load parking slots.</p>";

            return;

        }


        allSlots = result.data;

        displaySlots(allSlots);


    } catch (error) {

        console.error(
            "LOAD PARKING SLOTS ERROR:",
            error
        );


        slotContainer.innerHTML =
            "<p>Unable to connect to server.</p>";

    }

}


// ========================================
// DISPLAY PARKING SLOTS
// ========================================

function displaySlots(slots) {

    if (slots.length === 0) {

        slotContainer.innerHTML =
            "<p>No parking slots found.</p>";

        return;

    }


    let html = "";


    slots.forEach(slot => {

        html += `

            <div class="vehicle-card">

                <h3>
                    🅿️ Slot ${slot.slot_number}
                </h3>

                <p>
                    <strong>Lot:</strong>
                    ${slot.lot_name}
                </p>

                <p>
                    <strong>Location:</strong>
                    ${slot.location}
                </p>

                <p>
                    <strong>Floor:</strong>
                    ${slot.floor_number}
                </p>

                <p>
                    <strong>Slot Type:</strong>
                    ${slot.slot_type}
                </p>

                <p>
                    <strong>Status:</strong>
                    ${slot.status}
                </p>

                <button
                    onclick="updateSlotStatus(
                        ${slot.slot_id},
                        '${slot.status}'
                    )">
                    ✏️ Update Status
                </button>

            </div>

        `;

    });


    slotContainer.innerHTML = html;

}


// ========================================
// SEARCH & FILTER
// ========================================

function filterSlots() {

    const search =
        slotSearch.value.trim().toUpperCase();

    const status =
        statusFilter.value;


    const filteredSlots =
        allSlots.filter(slot => {

            const matchesSearch =
                slot.slot_number
                    .toUpperCase()
                    .includes(search);


            const matchesStatus =
                status === "ALL" ||
                slot.status === status;


            return (
                matchesSearch &&
                matchesStatus
            );

        });


    displaySlots(filteredSlots);

}


// ========================================
// UPDATE SLOT STATUS
// ========================================

async function updateSlotStatus(
    slotId,
    currentStatus
) {

    const newStatus =
        prompt(
            "Enter new status:\nAVAILABLE / OCCUPIED / RESERVED / MAINTENANCE",
            currentStatus
        );


    if (newStatus === null) {
        return;
    }


    const status =
        newStatus.trim().toUpperCase();


    const validStatuses = [
        "AVAILABLE",
        "OCCUPIED",
        "RESERVED",
        "MAINTENANCE"
    ];


    if (!validStatuses.includes(status)) {

        alert(
            "Invalid status! Please enter AVAILABLE, OCCUPIED, RESERVED or MAINTENANCE."
        );

        return;

    }


    try {

        const response = await fetch(
            `http://localhost:5000/api/parking/slots/${slotId}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    status: status
                })
            }
        );


        const result =
            await response.json();


        if (result.success) {

            alert(
                "Parking slot status updated successfully!"
            );

            await loadSlots();

        } else {

            alert(result.message);

        }


    } catch (error) {

        console.error(
            "UPDATE SLOT ERROR:",
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

        filterSlots();

    }
);


// ========================================
// LIVE SEARCH
// ========================================

slotSearch.addEventListener(
    "input",
    function () {

        filterSlots();

    }
);


// ========================================
// STATUS FILTER
// ========================================

statusFilter.addEventListener(
    "change",
    function () {

        filterSlots();

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

loadSlots();