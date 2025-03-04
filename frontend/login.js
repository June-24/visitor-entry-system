document.addEventListener("DOMContentLoaded", () => {
    const roleButtons = document.querySelectorAll(".role-btn");
    const formTitle = document.getElementById("form-title");
    const inputFields = document.getElementById("input-fields");
    const authForm = document.getElementById("auth-form");
    const toggleText = document.getElementById("toggle-form");
    document.querySelector(".alert-box button").addEventListener("click", closeAlert);

    let isLogin = true;
    let userRole = "student";

    const roleInputs = {
        student: '<input type="text" id="rollNo" placeholder="Roll No" required><input type="password" id="password" placeholder="Password" required>',
        professor: '<input type="text" id="profId" placeholder="Professor ID" required><input type="password" id="password" placeholder="Password" required>',
        admin: '<input type="text" id="adminUsername" placeholder="Admin Username" required><input type="password" id="password" placeholder="Password" required>'
    };

    function updateForm() {
        formTitle.innerText = isLogin ? `${userRole.charAt(0).toUpperCase() + userRole.slice(1)} Login` : `${userRole.charAt(0).toUpperCase() + userRole.slice(1)} Register`;
        inputFields.innerHTML = roleInputs[userRole] + (isLogin ? '' : '<input type="password" id="confirmPassword" placeholder="Confirm Password" required>');
        


    }

    roleButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            roleButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            userRole = btn.dataset.role;
            updateForm();
        });
    });

    toggleText.addEventListener("click", () => {
        isLogin = !isLogin;
        document.querySelector(".submit-btn").innerText = isLogin ? "Login" : "Register";
        updateForm();
        document.getElementById("toggle-form").innerHTML = isLogin ? "Don't have an account? <span id='toggle-btn'>Register</span>" : "Already have an account? <span id='toggle-btn'>Login</span>";
    });
    
    function closeAlert() {
        document.getElementById("custom-alert").classList.remove("show-alert");
    }
    function showAlert(message) {
        document.getElementById("alert-message").innerText = message;
        document.getElementById("custom-alert").classList.add("show-alert");
    }
    
    authForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const data = {
            role: userRole,
            password: document.getElementById("password").value
        };
        if (userRole === "student") data.rollNo = document.getElementById("rollNo").value;
        if (userRole === "professor") data.profId = document.getElementById("profId").value;
        if (userRole === "admin") data.adminUsername = document.getElementById("adminUsername").value;
        if (!isLogin) data.confirmPassword = document.getElementById("confirmPassword").value;

        const endpoint = isLogin ? "/login" : "/register";
        const response = await fetch(`http://localhost:5000${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        console.log(result);
        console.log(response.ok);
        if (response.ok) {
            localStorage.setItem("token", result.token);
            localStorage.setItem("userType", userRole)
            userId = userRole === "student" ? data.rollNo : userRole === "professor" ? data.profId : data.adminUsername;
            localStorage.setItem("userId", userId);
            window.location.href = "visitor_form.html"; 
        } else {
            showAlert(result.message);
            authForm.reset();
        }
    });

    updateForm();
});
