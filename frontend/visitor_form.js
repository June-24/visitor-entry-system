document.addEventListener("DOMContentLoaded", function () {
    const userRole = localStorage.getItem("userType");
    const userId = localStorage.getItem("userId");
    document.querySelector(".alert-box button").addEventListener("click", closeAlert);

    document.getElementById("user-role").innerText = userRole ? `Role: ${userRole}` : "Unknown Role";
    document.getElementById("user-id").innerText = userId ? `(${userId})` : "";

    const visitorTypeSelect = document.getElementById("visitor-type");
    const visitorCountContainer = document.getElementById("count-container");
    const visitorCountSelect = document.getElementById("visitor-count");
    const visitorDetailsContainer = document.getElementById("visitor-details-container");

    // Logout functionality
    document.getElementById("logout-btn").addEventListener("click", function () {
        localStorage.removeItem("token");
        localStorage.removeItem("userType");
        localStorage.removeItem("userId");
        window.location.href = "login.html";
    });

    // Populate dropdown based on user role
    if (userRole === "student") {
        visitorTypeSelect.innerHTML = `<option value="nil">--</option><option value="parents">Parents</option>`;
    } else if (userRole === "professor") {
        visitorTypeSelect.innerHTML = `
            <option value="nil">--</option>
            <option value="parents">Parents</option>
            <option value="friends">Friends</option>
            <option value="bulk">Bulk</option>
        `;
    }

    // Handle visitor type selection
    visitorTypeSelect.addEventListener("change", function () {
        const selectedType = visitorTypeSelect.value;
        visitorDetailsContainer.innerHTML = ""; // Clear previous inputs
        visitorCountSelect.innerHTML = ""; // Clear previous count options

        if (selectedType === "nil") {
            visitorCountContainer.style.display = "none";
        } else if (selectedType === "bulk") {
            visitorCountContainer.style.display = "none";
            generateBulkForm();
        } else {
            visitorCountContainer.style.display = "block";
            populateVisitorCountOptions(selectedType);
        }
    });

    // Populate visitor count based on role and type
    function populateVisitorCountOptions(type) {
        visitorCountSelect.innerHTML = ""; // Clear old options

        let maxCount = 1;
        if (userRole === "student") {
            maxCount = 2;
        } else if (userRole === "professor" && (type === "parents" || type === "friends")) {
            maxCount = 5;
        }

        for (let i = 1; i <= maxCount; i++) {
            const option = document.createElement("option");
            option.value = i;
            option.textContent = i;
            visitorCountSelect.appendChild(option);
        }

        generateVisitorForms(1); // Default to 1 form initially
    }

    // Handle visitor count selection
    visitorCountSelect.addEventListener("change", function () {
        generateVisitorForms(visitorCountSelect.value);
    });

    function generateVisitorForms(count) {
        visitorDetailsContainer.innerHTML = ""; // Clear previous forms

        for (let i = 0; i < count; i++) {
            const visitorForm = document.createElement("div");
            visitorForm.classList.add("visitor-card");

            visitorForm.innerHTML = `
                <label>Name:</label>
                <input type="text" class="visitor-name" placeholder="Enter name" required>

                <label>Phone Number:</label>
                <input type="text" class="visitor-phone" placeholder="Enter phone number" required>

                <label>Government ID:</label>
                <input type="text" class="visitor-id" placeholder="Enter ID" required>

                <label>Email:</label>
                <input type="email" class="visitor-email" placeholder="Enter email" required>
            `;

            visitorDetailsContainer.appendChild(visitorForm);
        }
    }

    function generateBulkForm() {
        visitorDetailsContainer.innerHTML = `
            <label>Number of Visitors:</label>
            <input type="number" id="bulk-count" placeholder="Enter count" required>

            <label>Institute Name:</label>
            <input type="text" id="bulk-institute" placeholder="Enter institute name" required>

            <label>Contact Person Phone:</label>
            <input type="text" id="bulk-phone" placeholder="Enter phone number" required>

            <label>Contact Person Email:</label>
            <input type="email" id="bulk-email" placeholder="Enter email" required>

            <label>Purpose:</label>
            <input type="text" id="bulk-purpose" placeholder="Enter purpose (optional)">
        `;
    }
});

function closeAlert() {
    document.getElementById("custom-alert").classList.remove("show-alert");
}

function showAlert(message) {
    document.getElementById("alert-message").innerText = message;
    document.getElementById("custom-alert").classList.add("show-alert");
}

document.getElementById("submit-btn").addEventListener("click", function () {
    const userRole = localStorage.getItem("userType");
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    const visitorType = document.getElementById("visitor-type").value;
    let visitors = [];

    if (visitorType === "bulk") {
        // Bulk entry
        visitors.push({
            type: "bulk",
            count: document.getElementById("bulk-count").value,
            institute: document.getElementById("bulk-institute").value,
            phone: document.getElementById("bulk-phone").value,
            email: document.getElementById("bulk-email").value,
            purpose: document.getElementById("bulk-purpose").value || null
        });
    } else {
        // Individual visitor entries
        const visitorCards = document.querySelectorAll(".visitor-card");
        visitorCards.forEach(card => {
            visitors.push({
                type: visitorType,
                name: card.querySelector(".visitor-name").value,
                phone: card.querySelector(".visitor-phone").value,
                govId: card.querySelector(".visitor-id").value,
                email: card.querySelector(".visitor-email").value
            });
        });
    }

    const payload = {
        userRole,
        userId,
        token,
        visitorType,
        visitors
    };

    // Send data to backend
    fetch("http://localhost:5000/submit-visitor", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showAlert("Visitor entry submitted successfully! They will be mailed the QR code.");
        } else {
            showAlert("Failed to submit. Try again.");
        }
    })
    .catch(error => {
        console.error("Error:", error);
        showAlert("An error occurred while submitting.");
    });
});
