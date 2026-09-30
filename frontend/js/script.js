const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");

loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    message.textContent = "Logging in...";

    try {

        const response = await fetch(
            "http://localhost:5000/api/login",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email: email,
                    password: password
                })
            }
        );

        const data = await response.json();

        if (data.success) {

            message.textContent = "Login successful!";

            // Save user information
            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );

            // Redirect based on user role
            if (data.user.role === "ADMIN") {

                window.location.href = "admin.html";

            } else {

                window.location.href = "dashboard.html";

            }

        } else {

            message.textContent = data.message;

        }

    } catch (error) {

        console.error("LOGIN ERROR:", error);

        message.textContent =
            "Unable to connect to server.";

    }

});