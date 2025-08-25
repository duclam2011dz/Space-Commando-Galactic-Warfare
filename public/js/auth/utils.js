// public/js/auth/utils.js

// Password visibility toggle
export function togglePasswordVisibility(inputId, iconElement) {
    const input = document.getElementById(inputId);
    const icon = iconElement.querySelector("i");

    if (input.type === "password") {
        input.type = "text";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash", "text-blue-400");
    } else {
        input.type = "password";
        icon.classList.add("fa-eye");
        icon.classList.remove("fa-eye-slash", "text-blue-400");
    }
}

// Show/hide generate password button
export function showGeneratePasswordBtn(inputElement) {
    const btn = document.getElementById("generatePasswordBtn");
    if (!btn) return;

    // Nếu focus vào đúng input registerPassword thì hiện nút ngay
    if (inputElement && inputElement.id === "registerPassword") {
        btn.classList.remove("hidden");
        return;
    }

    // Nếu không có input (ví dụ onblur) — đừng ẩn ngay lập tức:
    // chờ 120ms để kịp xử lý click trên nút (tránh việc input blur -> ẩn trước click).
    setTimeout(() => {
        // nếu focus hiện tại không phải là nút hoặc input password thì ẩn
        const active = document.activeElement;
        const generateBtnEl = document.getElementById("generatePassword");
        if (
            active &&
            (active.id === "generatePassword" || active.id === "registerPassword" || (generateBtnEl && generateBtnEl.contains(active)))
        ) {
            // vẫn giữ hiển thị vì user đang tương tác với nút hoặc input
            return;
        }
        btn.classList.add("hidden");
    }, 120);
}

// Hide generate button when clicking outside
export function initGeneratePasswordBtn() {
    document.addEventListener("click", (e) => {
        const passwordInput = document.getElementById("registerPassword");
        const generateBtn = document.getElementById("generatePasswordBtn");

        if (!generateBtn || !passwordInput) return;

        // Nếu click vào password input hoặc phần chứa nút (hoặc con của nó) thì không ẩn
        if (e.target === passwordInput || e.target === generateBtn || generateBtn.contains(e.target)) {
            return;
        }

        // ẩn sau 50ms (để còn an toàn cho các tương tác khác)
        setTimeout(() => generateBtn.classList.add("hidden"), 50);
    });

    // thêm keyboard listener: nếu nhấn Escape thì ẩn nút
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            const generateBtn = document.getElementById("generatePasswordBtn");
            if (generateBtn) generateBtn.classList.add("hidden");
        }
    });
}

// Generate strong password
export function generateStrongPassword() {
    const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
    let password = "";

    for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Gán trực tiếp vào input
    const passInput = document.getElementById("registerPassword");
    if (passInput) {
        passInput.value = password;
        // đặt focus lại vào input để người dùng thấy và confirm
        passInput.focus();
    }

    return password;
}