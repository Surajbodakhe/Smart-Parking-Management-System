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

const userContainer =
    document.getElementById("userContainer");

const userSearch =
    document.getElementById("userSearch");

const searchBtn =
    document.getElementById("searchBtn");


// ========================================
// LOAD ALL USERS
// ========================================

async function loadUsers() {

    try {

        userContainer.innerHTML =
            "<p class='loading'>Loading users...</p>";


        const response = await fetch(
            "http://localhost:5000/api/users"
        );


        const result =
            await response.json();


        if (!result.success) {

            userContainer.innerHTML =
                "<p>Unable to load users.</p>";

            return;

        }


        displayUsers(result.data);


    } catch (error) {

        console.error(
            "LOAD USERS ERROR:",
            error
        );


        userContainer.innerHTML =
            "<p>Unable to connect to server.</p>";

    }

}


// ========================================
// DISPLAY USERS
// ========================================

function displayUsers(users) {

    if (users.length === 0) {

        userContainer.innerHTML =
            "<p>No users found.</p>";

        return;

    }


    let html = "";


    users.forEach(userData => {

        html += `

            <div class="vehicle-card">

                <h3>
                    👤 ${userData.name}
                </h3>

                <p>
                    <strong>User ID:</strong>
                    ${userData.user_id}
                </p>

                <p>
                    <strong>Email:</strong>
                    ${userData.email}
                </p>

                <p>
                    <strong>Phone:</strong>
                    ${userData.phone}
                </p>

                <p>
                    <strong>Role:</strong>
                    ${userData.role}
                </p>

                <p>
                    <strong>Created:</strong>
                    ${formatDate(userData.created_at)}
                </p>

            </div>

        `;

    });


    userContainer.innerHTML = html;

}


// ========================================
// SEARCH USERS
// ========================================

async function searchUsers() {

    const search =
        userSearch.value.trim();


    if (!search) {

        loadUsers();

        return;

    }


    try {

        userContainer.innerHTML =
            "<p class='loading'>Searching...</p>";


        const response = await fetch(
            `http://localhost:5000/api/users/search?search=${encodeURIComponent(search)}`
        );


        const result =
            await response.json();


        if (!result.success) {

            userContainer.innerHTML =
                "<p>Unable to search users.</p>";

            return;

        }


        displayUsers(result.data);


    } catch (error) {

        console.error(
            "SEARCH USERS ERROR:",
            error
        );


        userContainer.innerHTML =
            "<p>Unable to connect to server.</p>";

    }

}


// ========================================
// FORMAT DATE
// ========================================

function formatDate(dateString) {

    if (!dateString) {

        return "N/A";

    }


    const date =
        new Date(dateString);


    return date.toLocaleDateString();

}


// ========================================
// SEARCH BUTTON
// ========================================

searchBtn.addEventListener(
    "click",
    function () {

        searchUsers();

    }
);


// ========================================
// SEARCH USING ENTER KEY
// ========================================

userSearch.addEventListener(
    "keypress",
    function (event) {

        if (event.key === "Enter") {

            searchUsers();

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

loadUsers();