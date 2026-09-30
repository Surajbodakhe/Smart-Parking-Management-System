const user = JSON.parse(localStorage.getItem("user"));

if (!user) {
    window.location.href = "index.html";
}

document.getElementById("userName").textContent = user.name;
document.getElementById("userRole").textContent = user.role;


// ========================================
// ELEMENTS
// ========================================

const vehicleSearch =
    document.getElementById("vehicleSearch");

const searchVehicleBtn =
    document.getElementById("searchVehicleBtn");

const searchMessage =
    document.getElementById("searchMessage");

const vehicleResultContainer =
    document.getElementById("vehicleResultContainer");

const revenueContainer =
    document.getElementById("revenueContainer");

const paymentReportContainer =
    document.getElementById("paymentReportContainer");


// ========================================
// VEHICLE SEARCH
// ========================================

async function searchVehicles() {

    const searchText =
        vehicleSearch.value.trim();

    if (!searchText) {

        searchMessage.textContent =
            "Please enter something to search.";

        vehicleResultContainer.innerHTML =
            "<p>No search entered.</p>";

        return;
    }

    searchMessage.textContent =
        "Searching...";

    try {

        const response = await fetch(
            `http://localhost:5000/api/reports/vehicles/search?search=${encodeURIComponent(searchText)}`
        );

        const result =
            await response.json();

        if (!result.success) {

            searchMessage.textContent =
                result.message;

            return;
        }

        searchMessage.textContent =
            `${result.data.length} vehicle(s) found.`;

        if (result.data.length === 0) {

            vehicleResultContainer.innerHTML =
                "<p>No vehicles found.</p>";

            return;
        }

        let html = "";

        result.data.forEach(vehicle => {

            html += `
                <div class="reservation-card">

                    <h3>
                        🚗 ${vehicle.vehicle_number}
                    </h3>

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

                </div>
            `;
        });

        vehicleResultContainer.innerHTML = html;

    } catch (error) {

        console.error(
            "VEHICLE SEARCH ERROR:",
            error
        );

        searchMessage.textContent =
            "Unable to connect to server.";

    }
}


// Search button
searchVehicleBtn.addEventListener(
    "click",
    searchVehicles
);


// Search using Enter key
vehicleSearch.addEventListener(
    "keypress",
    function (event) {

        if (event.key === "Enter") {
            searchVehicles();
        }

    }
);


// ========================================
// REVENUE REPORT
// ========================================

async function loadRevenueReport() {

    try {

        const response = await fetch(
            "http://localhost:5000/api/reports/revenue"
        );

        const result =
            await response.json();

        if (!result.success) {

            revenueContainer.innerHTML =
                "<p>Unable to load revenue report.</p>";

            return;
        }

        if (result.data.length === 0) {

            revenueContainer.innerHTML =
                "<p>No revenue records found.</p>";

            return;
        }

        let html = `
            <div class="report-table-container">

                <table class="report-table">

                    <thead>

                        <tr>
                            <th>Date</th>
                            <th>Total Payments</th>
                            <th>Total Revenue</th>
                        </tr>

                    </thead>

                    <tbody>
        `;

        result.data.forEach(row => {

            html += `
                <tr>

                    <td>
                        ${formatDate(row.payment_date)}
                    </td>

                    <td>
                        ${row.total_payments}
                    </td>

                    <td>
                        ₹${row.total_revenue}
                    </td>

                </tr>
            `;

        });

        html += `
                    </tbody>

                </table>

            </div>
        `;

        revenueContainer.innerHTML =
            html;

    } catch (error) {

        console.error(
            "REVENUE ERROR:",
            error
        );

        revenueContainer.innerHTML =
            "<p>Unable to connect to server.</p>";

    }
}


// ========================================
// PAYMENT REPORT
// ========================================

async function loadPaymentReport() {

    try {

        const response = await fetch(
            "http://localhost:5000/api/reports/payments"
        );

        const result =
            await response.json();

        if (!result.success) {

            paymentReportContainer.innerHTML =
                "<p>Unable to load payment report.</p>";

            return;
        }

        if (result.data.length === 0) {

            paymentReportContainer.innerHTML =
                "<p>No payment records found.</p>";

            return;
        }

        let html = `
            <div class="report-table-container">

                <table class="report-table">

                    <thead>

                        <tr>
                            <th>Payment ID</th>
                            <th>Session ID</th>
                            <th>Vehicle</th>
                            <th>Type</th>
                            <th>Amount</th>
                            <th>Method</th>
                            <th>Status</th>
                            <th>Date</th>
                        </tr>

                    </thead>

                    <tbody>
        `;

        result.data.forEach(payment => {

            html += `
                <tr>

                    <td>
                        ${payment.payment_id}
                    </td>

                    <td>
                        ${payment.session_id}
                    </td>

                    <td>
                        ${payment.vehicle_number}
                    </td>

                    <td>
                        ${payment.vehicle_type}
                    </td>

                    <td>
                        ₹${payment.amount}
                    </td>

                    <td>
                        ${payment.payment_method}
                    </td>

                    <td>
                        ${payment.payment_status}
                    </td>

                    <td>
                        ${formatDate(
                            payment.payment_date
                        )}
                    </td>

                </tr>
            `;

        });

        html += `
                    </tbody>

                </table>

            </div>
        `;

        paymentReportContainer.innerHTML =
            html;

    } catch (error) {

        console.error(
            "PAYMENT REPORT ERROR:",
            error
        );

        paymentReportContainer.innerHTML =
            "<p>Unable to connect to server.</p>";

    }
}


// ========================================
// DATE FORMAT
// ========================================

function formatDate(dateString) {

    const date =
        new Date(dateString);

    return date.toLocaleString(
        "en-IN",
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    );
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

loadRevenueReport();

loadPaymentReport();