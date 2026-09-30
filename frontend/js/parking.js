
const parkingContainer = document.getElementById("parkingContainer");
const searchSlot = document.getElementById("searchSlot");
const statusFilter = document.getElementById("statusFilter");

let allSlots = [];


// Load parking slots from backend
async function loadParkingSlots() {
    try {
        parkingContainer.innerHTML = `
            <p class="loading">Loading parking slots...</p>
        `;

        const response = await fetch(
            "http://localhost:5000/api/parking/slots"
        );

        const result = await response.json();

        if (result.success) {
            allSlots = result.data;
            displaySlots(allSlots);
        } else {
            parkingContainer.innerHTML = `
                <p>Unable to load parking slots.</p>
            `;
        }

    } catch (error) {
        console.error("PARKING ERROR:", error);

        parkingContainer.innerHTML = `
            <p>Unable to connect to server.</p>
        `;
    }
}


// Display parking slots
function displaySlots(slots) {

    if (slots.length === 0) {
        parkingContainer.innerHTML = `
            <p class="loading">No parking slots found.</p>
        `;
        return;
    }

    // Group slots by parking lot
    const groupedSlots = {};

    slots.forEach(slot => {

        if (!groupedSlots[slot.lot_name]) {
            groupedSlots[slot.lot_name] = [];
        }

        groupedSlots[slot.lot_name].push(slot);
    });


    let html = "";


    Object.keys(groupedSlots).forEach(lotName => {

        html += `
            <div class="parking-lot">

                <h2>🅿️ ${lotName}</h2>

                <div class="slot-grid">
        `;


        groupedSlots[lotName].forEach(slot => {

            let statusClass = slot.status.toLowerCase();


            html += `
                <div class="slot-card ${statusClass}">

                    <h3>${slot.slot_number}</h3>

                    <p>
                        <strong>Type:</strong>
                        ${slot.slot_type}
                    </p>

                    <p>
                        <strong>Floor:</strong>
                        ${slot.floor_number}
                    </p>

                    <span class="slot-status">
                        ${slot.status}
                    </span>

                </div>
            `;
        });


        html += `
                </div>
            </div>
        `;
    });


    parkingContainer.innerHTML = html;
}


// Search and filter
function filterSlots() {

    const searchText =
        searchSlot.value.toLowerCase().trim();

    const selectedStatus =
        statusFilter.value;


    const filteredSlots = allSlots.filter(slot => {

        const matchesSearch =
            slot.slot_number
                .toLowerCase()
                .includes(searchText);


        const matchesStatus =
            selectedStatus === "ALL" ||
            slot.status === selectedStatus;


        return matchesSearch && matchesStatus;
    });


    displaySlots(filteredSlots);
}


// Search event
searchSlot.addEventListener("input", filterSlots);


// Status filter event
statusFilter.addEventListener("change", filterSlots);


// User information
const user = JSON.parse(
    localStorage.getItem("user")
);


if (!user) {

    window.location.href = "index.html";

} else {

    document.getElementById("userName").textContent =
        user.name;

    document.getElementById("userRole").textContent =
        user.role;
}


// Dashboard button
document.getElementById("backBtn").addEventListener(
    "click",
    function () {

        window.location.href = "dashboard.html";

    }
);


// Logout button
document.getElementById("logoutBtn").addEventListener(
    "click",
    function () {

        localStorage.removeItem("user");

        window.location.href = "index.html";

    }
);


// Load slots when page opens
loadParkingSlots();