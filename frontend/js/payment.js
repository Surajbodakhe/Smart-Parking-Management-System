const user = JSON.parse(localStorage.getItem("user"));

if (!user) {
    window.location.href = "index.html";
}

document.getElementById("userName").textContent = user.name;
document.getElementById("userRole").textContent = user.role;

const sessionSelect = document.getElementById("sessionSelect");
const feeForm = document.getElementById("feeForm");
const feeMessage = document.getElementById("feeMessage");
const feeResult = document.getElementById("feeResult");

const paymentSection = document.getElementById("paymentSection");
const paymentForm = document.getElementById("paymentForm");
const paymentAmount = document.getElementById("paymentAmount");
const paymentMethod = document.getElementById("paymentMethod");
const paymentMessage = document.getElementById("paymentMessage");

const paymentContainer =
    document.getElementById("paymentContainer");

let selectedSessionId = null;


// ========================================
// LOAD COMPLETED SESSIONS
// ========================================
async function loadSessions() {
    try {

        const response = await fetch(
            "http://localhost:5000/api/sessions"
        );

        const result = await response.json();

        if (result.success) {

            sessionSelect.innerHTML = `
                <option value="">
                    Select completed session
                </option>
            `;

            result.data
                .filter(session =>
                    session.session_status === "COMPLETED"
                )
                .forEach(session => {

                    sessionSelect.innerHTML += `
                        <option value="${session.session_id}">
                            Session ${session.session_id}
                            - ${session.vehicle_number}
                            - Slot ${session.slot_number}
                        </option>
                    `;
                });
        }

    } catch (error) {

        console.error(
            "SESSION LOAD ERROR:",
            error
        );

        sessionSelect.innerHTML = `
            <option value="">
                Unable to load sessions
            </option>
        `;
    }
}


// ========================================
// CALCULATE FEE
// ========================================
feeForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        const sessionId = sessionSelect.value;

        if (!sessionId) {
            feeMessage.textContent =
                "Please select a parking session.";
            return;
        }

        feeMessage.textContent =
            "Calculating parking fee...";

        feeResult.innerHTML = "";

        paymentSection.style.display = "none";

        try {

            const response = await fetch(
                `http://localhost:5000/api/payments/fee/${sessionId}`
            );

            const result = await response.json();

            if (result.success) {

                const fee = result.data;

                selectedSessionId =
                    fee.session_id;

                feeMessage.textContent =
                    "Fee calculated successfully!";

                feeResult.innerHTML = `
                    <div class="reservation-card">

                        <h3>💰 Parking Fee Details</h3>

                        <p>
                            <strong>Vehicle:</strong>
                            ${fee.vehicle_number}
                        </p>

                        <p>
                            <strong>Vehicle Type:</strong>
                            ${fee.vehicle_type}
                        </p>

                        <p>
                            <strong>Parking Hours:</strong>
                            ${fee.parking_hours}
                        </p>

                        <p>
                            <strong>Hourly Rate:</strong>
                            ₹${fee.hourly_rate}
                        </p>

                        <h2>
                            Total Amount:
                            ₹${fee.total_amount}
                        </h2>

                    </div>
                `;

                // Set payment amount
                paymentAmount.value =
                    fee.total_amount;

                // Show payment section
                paymentSection.style.display =
                    "block";

            } else {

                feeMessage.textContent =
                    result.message;
            }

        } catch (error) {

            console.error(
                "FEE ERROR:",
                error
            );

            feeMessage.textContent =
                "Unable to connect to server.";
        }
    }
);


// ========================================
// MAKE PAYMENT
// ========================================
paymentForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        const amount =
            paymentAmount.value;

        const method =
            paymentMethod.value;

        if (!selectedSessionId ||
            !amount ||
            !method) {

            paymentMessage.textContent =
                "Please complete payment details.";

            return;
        }

        paymentMessage.textContent =
            "Processing payment...";

        try {

            const response = await fetch(
                "http://localhost:5000/api/payments",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        session_id:
                            selectedSessionId,

                        amount:
                            Number(amount),

                        payment_method:
                            method
                    })
                }
            );

            const result =
                await response.json();

            if (result.success) {

                paymentMessage.textContent =
                    "Payment successful!";

                paymentForm.reset();

                paymentAmount.value =
                    amount;

                await loadPayments();

            } else {

                paymentMessage.textContent =
                    result.message;
            }

        } catch (error) {

            console.error(
                "PAYMENT ERROR:",
                error
            );

            paymentMessage.textContent =
                "Unable to connect to server.";
        }
    }
);


// ========================================
// LOAD PAYMENT HISTORY
// ========================================
async function loadPayments() {

    try {

        const response = await fetch(
            "http://localhost:5000/api/payments"
        );

        const result =
            await response.json();

        if (!result.success) {

            paymentContainer.innerHTML =
                "<p>Unable to load payments.</p>";

            return;
        }

        if (result.data.length === 0) {

            paymentContainer.innerHTML =
                "<p>No payment records found.</p>";

            return;
        }

        let html = "";

        result.data.forEach(payment => {

            html += `
                <div class="reservation-card">

                    <h3>
                        💳 Payment #${payment.payment_id}
                    </h3>

                    <p>
                        <strong>Session:</strong>
                        ${payment.session_id}
                    </p>

                    <p>
                        <strong>Vehicle:</strong>
                        ${payment.vehicle_number}
                    </p>

                    <p>
                        <strong>Amount:</strong>
                        ₹${payment.amount}
                    </p>

                    <p>
                        <strong>Method:</strong>
                        ${payment.payment_method}
                    </p>

                    <p>
                        <strong>Status:</strong>
                        ${payment.payment_status}
                    </p>

                    <p>
                        <strong>Date:</strong>
                        ${formatDate(
                            payment.payment_date
                        )}
                    </p>

                </div>
            `;
        });

        paymentContainer.innerHTML = html;

    } catch (error) {

        console.error(
            "PAYMENT HISTORY ERROR:",
            error
        );

        paymentContainer.innerHTML =
            "<p>Unable to connect to server.</p>";
    }
}


// ========================================
// FORMAT DATE
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
loadSessions();
loadPayments();