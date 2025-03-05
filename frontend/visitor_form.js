const ip = "http://43.204.142.131:5000";

document.addEventListener("DOMContentLoaded", function () {
    const userRole = localStorage.getItem("userType");
    const userId = localStorage.getItem("userId");
    const phoneRegex = /^[0-9]{10}$/;
    const nameRegex = /^[A-Za-z\s]+$/;
    document.querySelector(".alert-box button").addEventListener("click", closeAlert);

    document.getElementById("user-role").innerText = userRole ? `Role: ${userRole} ` : "Unknown Role";
    document.getElementById("user-id").innerText = userId ? ` (${userId})` : "";

    const visitorTypeSelect = document.getElementById("visitor-type");
    const visitorCountContainer = document.getElementById("count-container");
    const visitorCountSelect = document.getElementById("visitor-count");
    const visitorDetailsContainer = document.getElementById("visitor-details-container");

    document.getElementById("logout-btn").addEventListener("click", function () {
        localStorage.removeItem("token");
        localStorage.removeItem("userType");
        localStorage.removeItem("userId");
        window.location.href = "login.html";
    });

    if (userRole === "student") {
        visitorTypeSelect.innerHTML = `<option value="nil">--</option><option value="parents">Parents</option>`;
    } else if (userRole === "professor") {
        visitorTypeSelect.innerHTML = `
            <option value="nil">--</option>
            <option value="parents">Parents</option>
            <option value="guests">Guests</option>
            <option value="bulk">Bulk</option>
        `;
    }

    visitorTypeSelect.addEventListener("change", function () {
        const selectedType = visitorTypeSelect.value;
        visitorDetailsContainer.innerHTML = "";
        visitorCountSelect.innerHTML = "";

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

    function populateVisitorCountOptions(type) {
        visitorCountSelect.innerHTML = "";

        let maxCount = 1;
        if (userRole === "student") {
            maxCount = 2;
        } else if (userRole === "professor" && type === "parents") {
            maxCount = 2;
        } else if (userRole === "professor" && type === "guests") {
            maxCount = 15;
        }

        for (let i = 1; i <= maxCount; i++) {
            const option = document.createElement("option");
            option.value = i;
            option.textContent = i;
            visitorCountSelect.appendChild(option);
        }

        generateVisitorForms(1);
    }

    visitorCountSelect.addEventListener("change", function () {
        generateVisitorForms(visitorCountSelect.value);
    });

    function generateVisitorForms(count) {
        visitorDetailsContainer.innerHTML = "";

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
                
                <label>Purpose:</label>
                <input type="text" class="visitor-purpose" placeholder="Enter purpose">
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
            <label>Government ID:</label>
            <input type="text" id="bulk-id" placeholder="Enter ID" required>
            <label>Contact Person Email:</label>
            <input type="email" id="bulk-email" placeholder="Enter email" required>

            <label>Purpose:</label>
            <input type="text" id="bulk-purpose" placeholder="Enter purpose (optional)">
        `;
    }

    function closeAlert() {
        document.getElementById("custom-alert").classList.remove("show-alert");
    }

    function showAlert(message) {
        document.getElementById("alert-message").innerText = message;
        document.getElementById("custom-alert").classList.add("show-alert");
    }

    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    document.getElementById("submit-btn").addEventListener("click", function () {
        const userRole = localStorage.getItem("userType");
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("token");

        const visitorType = document.getElementById("visitor-type").value;
        let visitors = [];

        if (visitorType === "bulk") {
            const bulkCount = document.getElementById("bulk-count").value.trim();
            const bulkInstitute = document.getElementById("bulk-institute").value.trim();
            const bulkPhone = document.getElementById("bulk-phone").value.trim();
            const bulkEmail = document.getElementById("bulk-email").value.trim();
            const bulkID = document.getElementById("bulk-id").value.trim();
            
            if (!bulkCount || !bulkInstitute || !bulkPhone || !bulkEmail || !bulkID) {
                showAlert("All bulk visitor fields must be filled.");
                return;
            }

            if (!validateEmail(bulkEmail)) {
                showAlert("Invalid email format.");
                return;
            }
            if (!phoneRegex.test(bulkPhone)) {
                showAlert("Enter a valid 10-digit phone number.");
                return;
            }

            visitors.push({
                type: "bulk",
                quantity: bulkCount,
                name: bulkInstitute,
                phone: bulkPhone,
                email: bulkEmail,
                govID: bulkID,
                purpose: document.getElementById("bulk-purpose").value.trim() || null
            });
        } else {
            const visitorCards = document.querySelectorAll(".visitor-card");
            for (let card of visitorCards) {
                const name = card.querySelector(".visitor-name").value.trim();
                const phone = card.querySelector(".visitor-phone").value.trim();
                const govID = card.querySelector(".visitor-id").value.trim();
                const email = card.querySelector(".visitor-email").value.trim();

                if (!name || !phone || !govID || !email) {
                    showAlert("All visitor details are required.");
                    return;
                }

                if (!validateEmail(email)) {
                    showAlert("Invalid email format.");
                    return;
                }
                if (!nameRegex.test(name)) {
                    valid = false;
                    showAlert("Name should contain only alphabets.");
                    return;
                }
                if (!phoneRegex.test(phone)) {
                    valid = false;
                    showAlert("Enter a valid 10-digit phone number.");
                    return;
                }

                visitors.push({
                    type: visitorType,
                    name,
                    phone,
                    govID,
                    email,
                    quantity:1,
                    purpose: card.querySelector(".visitor-purpose").value.trim() || null

                });
            }
        }

        const payload = {
            userRole,
            userId,
            token,
            visitorType,
            visitors
        };

    // Send data to backend
    fetch(`${ip}/submit-visitor`, {
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
