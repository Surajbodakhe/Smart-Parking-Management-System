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

const paymentContainer =
    document.getElementById("paymentContainer");

const totalRevenue =
    document.getElementById("totalRevenue");

const totalPayments =
    document.getElementById("totalPayments");

const successfulPayments =
    document.getElementById("successfulPayments");

const failedPayments =
    document.getElementById("failedPayments");


// ========================================
// LOAD PAYMENTS
// ========================================

async function loadPayments() {

    try {

        paymentContainer.innerHTML =
            "<p class='loading'>Loading payments...</p>";


        const response = await fetch(
            "http://localhost:5000/api/reports/payments"
        );


        const result =
            await response.json();


        if (!result.success) {

            paymentContainer.innerHTML =
                "<p>Unable to load payments.</p>";

            return;

        }


        const payments = result.data;


        calculateSummary(payments);

        displayPayments(payments);


    } catch (error) {

        console.error(
            "LOAD PAYMENTS ERROR:",
            error
        );


        paymentContainer.innerHTML =
            "<p>Unable to connect to server.</p>";

    }

}


// ========================================
// CALCULATE PAYMENT SUMMARY
// ========================================

function calculateSummary(payments) {

    let revenue = 0;

    let successful = 0;

    let failed = 0;


    payments.forEach(payment => {

        const amount =
            Number(payment.amount) || 0;


        if (payment.payment_status === "SUCCESS") {

            revenue += amount;

            successful++;

        }


        if (payment.payment_status === "FAILED") {

            failed++;

        }

    });


    totalRevenue.textContent =
        "₹" + revenue.toFixed(2);

    totalPayments.textContent =
        payments.length;

    successfulPayments.textContent =
        successful;

    failedPayments.textContent =
        failed;

}


// ========================================
// DISPLAY PAYMENTS
// ========================================

function displayPayments(payments) {

    if (payments.length === 0) {

        paymentContainer.innerHTML =
            "<p>No payments found.</p>";

        return;

    }


    let html = "";


    payments.forEach(payment => {

        html += `

            <div class="vehicle-card">

                <h3>
                    💳 Payment #${payment.payment_id}
                </h3>

                <p>
                    <strong>Session ID:</strong>
                    ${payment.session_id}
                </p>

                <p>
                    <strong>Vehicle:</strong>
                    ${payment.vehicle_number}
                </p>

                <p>
                    <strong>Vehicle Type:</strong>
                    ${payment.vehicle_type}
                </p>

                <p>
                    <strong>Amount:</strong>
                    ₹${Number(payment.amount).toFixed(2)}
                </p>

                <p>
                    <strong>Payment Method:</strong>
                    ${payment.payment_method}
                </p>

                <p>
                    <strong>Status:</strong>
                    ${payment.payment_status}
                </p>

                <p>
                    <strong>Payment Date:</strong>
                    ${formatDate(payment.payment_date)}
                </p>

            </div>

        `;

    });


    paymentContainer.innerHTML =
        html;

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

loadPayments();