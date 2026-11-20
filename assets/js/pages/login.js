import { loginUser, loginWithGoogle, resetPassword, authReady } from "../auth_manager.js";
import { friendlyError, showMessage } from "../utils.js";

const form = document.getElementById("loginForm");
const errorEl = form.querySelector("[data-error]");
const submitBtn = form.querySelector('button[type="submit"]');
const googleBtn = document.getElementById("googleBtn");

// Only allow redirects back to pages on this site (prevents open redirects).
function nextPage() {
    const next = new URLSearchParams(location.search).get("next");
    return next && /^[a-zA-Z0-9_-]+\.html(\?[\w=&%-]*)?$/.test(next) ? next : "index.html";
}

// Already signed in? Skip the form.
authReady.then((user) => { if (user) location.replace(nextPage()); });

async function withBusy(button, busyText, task) {
    const original = button.textContent;
    button.disabled = true;
    button.textContent = busyText;
    try { return await task(); } finally { button.disabled = false; button.textContent = original; }
}

googleBtn.addEventListener("click", async () => {
    showMessage(errorEl, "");
    const result = await withBusy(googleBtn, "Connecting…", loginWithGoogle);
    if (result.success) location.href = nextPage();
    else showMessage(errorEl, friendlyError(result.error, "Google sign-in failed. Please try again."));
});

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    showMessage(errorEl, "");
    const email = form.elements.email.value;
    const password = form.elements.password.value;
    const remember = form.elements.remember.checked;
    const result = await withBusy(submitBtn, "Logging in…", () => loginUser(email, password, remember));
    if (result.success) location.href = nextPage();
    else showMessage(errorEl, friendlyError(result.error, "Login failed. Please try again."));
});

// ---- Forgot password modal ----
const modal = document.getElementById("fpModal");
const fpEmail = document.getElementById("fpEmail");
const fpMsg = document.getElementById("fpMessage");
const fpSend = document.getElementById("fpSend");

function setFpMessage(text, type = "") {
    fpMsg.textContent = text;
    fpMsg.className = `fp-message ${type}`;
    fpMsg.style.display = text ? "block" : "none";
}
function closeModal() {
    modal.style.display = "none";
    fpEmail.value = "";
    setFpMessage("");
}

document.getElementById("forgotLink").addEventListener("click", (e) => {
    e.preventDefault();
    fpEmail.value = form.elements.email.value;
    modal.style.display = "flex";
    fpEmail.focus();
});
document.getElementById("fpCancel").addEventListener("click", closeModal);
modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });

fpSend.addEventListener("click", async () => {
    if (!fpEmail.checkValidity() || !fpEmail.value.trim()) {
        setFpMessage("Please enter a valid e-mail address.", "error");
        return;
    }
    setFpMessage("Sending…");
    const result = await withBusy(fpSend, "Sending…", () => resetPassword(fpEmail.value));
    if (result.success) {
        // Same message whether or not the account exists (no account enumeration).
        setFpMessage("If an account exists for this address, a reset link has been sent.", "success");
        setTimeout(closeModal, 4000);
    } else {
        setFpMessage(friendlyError(result.error), "error");
    }
});
