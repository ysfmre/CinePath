import { registerUser, loginWithGoogle, authReady } from "../auth_manager.js";
import { friendlyError, showMessage } from "../utils.js";

const form = document.getElementById("signupForm");
const errorEl = form.querySelector("[data-error]");
const submitBtn = form.querySelector('button[type="submit"]');
const googleBtn = document.getElementById("googleBtn");

authReady.then((user) => { if (user) location.replace("index.html"); });

async function withBusy(button, busyText, task) {
    const original = button.textContent;
    button.disabled = true;
    button.textContent = busyText;
    try { return await task(); } finally { button.disabled = false; button.textContent = original; }
}

googleBtn.addEventListener("click", async () => {
    showMessage(errorEl, "");
    const result = await withBusy(googleBtn, "Connecting…", loginWithGoogle);
    if (result.success) location.href = "index.html";
    else showMessage(errorEl, friendlyError(result.error, "Google sign-in failed. Please try again."));
});

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    showMessage(errorEl, "");
    const name = form.elements.name.value.trim();
    const email = form.elements.email.value.trim();
    const password = form.elements.password.value;

    if (name.length < 2) return showMessage(errorEl, "Please enter your name.");
    if (!form.elements.email.checkValidity()) return showMessage(errorEl, "Please enter a valid e-mail address.");
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
        return showMessage(errorEl, "Password must be at least 8 characters and contain letters and numbers.");
    }

    const result = await withBusy(submitBtn, "Creating account…", () => registerUser(email, password, name));
    if (result.success) location.href = "index.html";
    else showMessage(errorEl, friendlyError(result.error, "Sign-up failed. Please try again."));
});
