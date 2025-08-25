// public/js/auth/forms.js

export default class AuthForms {
    constructor() {
        this.loginTab = document.getElementById("loginTab");
        this.registerTab = document.getElementById("registerTab");
        this.loginForm = document.getElementById("loginForm");
        this.registerForm = document.getElementById("registerForm");

        this.initEventListeners();
        this.checkUrlForTab();
    }

    initEventListeners() {
        this.loginTab.addEventListener("click", () => this.showLoginForm());
        this.registerTab.addEventListener("click", () => this.showRegisterForm());

        this.loginForm.addEventListener("submit", (e) => this.handleLogin(e));
        this.registerForm.addEventListener("submit", (e) => this.handleRegister(e));
    }

    checkUrlForTab() {
        const urlParams = new URLSearchParams(window.location.search);
        const tab = urlParams.get("tab");

        if (tab === "register") this.showRegisterForm();
        else this.showLoginForm();
    }

    showLoginForm() {
        this.loginTab.classList.add("text-blue-400", "border-b-2", "border-blue-500");
        this.loginTab.classList.remove("text-gray-400");
        this.registerTab.classList.add("text-gray-400");
        this.registerTab.classList.remove("text-blue-400", "border-b-2", "border-blue-500");

        this.loginForm.classList.remove("hidden");
        this.registerForm.classList.add("hidden");

        history.pushState(null, null, "?tab=login");
    }

    showRegisterForm() {
        this.registerTab.classList.add("text-blue-400", "border-b-2", "border-blue-500");
        this.registerTab.classList.remove("text-gray-400");
        this.loginTab.classList.add("text-gray-400");
        this.loginTab.classList.remove("text-blue-400", "border-b-2", "border-blue-500");

        this.registerForm.classList.remove("hidden");
        this.loginForm.classList.add("hidden");

        history.pushState(null, null, "?tab=register");
    }

    async handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById("loginUsername").value;
        const password = document.getElementById("loginPassword").value;
        const rememberMe = document.getElementById("rememberMe").checked;

        console.log("Login attempt:", { username, password, rememberMe });

        this.showLoading("login");

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });
            const data = await res.json();

            this.hideLoading("login");

            if (!res.ok) throw new Error(data.error || "Login failed");

            this.showSuccess("Login successful! Redirecting...");

            // save token
            if (rememberMe) localStorage.setItem("token", data.token);
            else sessionStorage.setItem("token", data.token);

            setTimeout(() => (window.location.href = "index.html"), 1500);
        } catch (err) {
            this.showError(err.message);
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        const username = document.getElementById("registerUsername").value.trim().toLowerCase();
        const email = document.getElementById("registerEmail").value.trim();
        const password = document.getElementById("registerPassword").value;
        const confirmPassword = document.getElementById("registerConfirmPassword").value;

        const errors = [];
        if (!/^[a-z]+$/.test(username)) errors.push("Username chỉ chứa chữ thường a-z.");
        if (!/^\S+@\S+\.\S+$/.test(email)) errors.push("Email không hợp lệ.");
        if (password.length < 8 || !/[a-z]/.test(password) || !/[0-9]/.test(password))
            errors.push("Password phải >=8 ký tự, có chữ thường và số.");
        if (password !== confirmPassword) errors.push("Confirm password không khớp.");

        if (errors.length > 0) {
            this.showError(errors.join("\n"));
            return;
        }

        console.log("Registration attempt:", { username, email, password });

        this.showLoading("register");

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password, confirmPassword }),
            });
            const data = await res.json();

            this.hideLoading("register");

            if (!res.ok) throw new Error(data.error || "Registration failed");

            this.showSuccess("Registration successful! You can now login.");
            setTimeout(() => this.showLoginForm(), 1500);
        } catch (err) {
            this.showError(err.message);
        }
    }

    showLoading(formType) {
        const button =
            formType === "login"
                ? this.loginForm.querySelector("button[type='submit']")
                : this.registerForm.querySelector("button[type='submit']");

        button.disabled = true;
        button.innerHTML = `
      <span class="absolute left-0 inset-y-0 flex items-center pl-3">
        <i class="fas fa-spinner fa-spin ${formType === "login" ? "text-blue-300" : "text-purple-300"}"></i>
      </span>
      ${formType === "login" ? "Logging in..." : "Registering..."}
    `;
    }

    hideLoading(formType) {
        const button =
            formType === "login"
                ? this.loginForm.querySelector("button[type='submit']")
                : this.registerForm.querySelector("button[type='submit']");

        button.disabled = false;
        button.innerHTML = `
      <span class="absolute left-0 inset-y-0 flex items-center pl-3">
        <i class="fas ${formType === "login" ? "fa-sign-in-alt text-blue-300" : "fa-user-plus text-purple-300"}"></i>
      </span>
      ${formType === "login" ? "Login" : "Create Account"}
    `;
    }

    showError(message) {
        alert(message);
    }

    showSuccess(message) {
        alert(message);
    }
}