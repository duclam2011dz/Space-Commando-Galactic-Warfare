// public/js/auth/index.js
import AuthForms from "./forms.js";
import {
    togglePasswordVisibility,
    showGeneratePasswordBtn,
    initGeneratePasswordBtn,
    generateStrongPassword,
} from "./utils.js";

// expose global functions for inline HTML onclick handlers
window.togglePasswordVisibility = togglePasswordVisibility;
window.showGeneratePasswordBtn = showGeneratePasswordBtn;
window.generateStrongPassword = generateStrongPassword;

document.addEventListener("DOMContentLoaded", () => {
    initGeneratePasswordBtn();
    new AuthForms();

    // đúng nút button
    const genBtn = document.getElementById("generatePassword");
    if (genBtn) {
        genBtn.addEventListener("click", () => generateStrongPassword());
    }

    // chặn copy/paste/drag trong confirm password
    const confirmInput = document.getElementById("registerConfirmPassword");
    if (confirmInput) {
        ["paste", "copy", "cut", "drop", "dragover"].forEach(evt => {
            confirmInput.addEventListener(evt, e => e.preventDefault());
        });
    }
});