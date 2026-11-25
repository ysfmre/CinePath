import { loginUser, loginWithGoogle, resetPassword, authReady } from "../auth_manager.js";
import { friendlyError, showMessage } from "../utils.js";
import { t } from "../i18n.js";

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
    const label = button.querySelector("span") || button; // keep icons intact
    const original = label.textContent;
    button.disabled = true;
    label.textContent = busyText;
    try { return await task(); } finally { button.disabled = false; label.textContent = original; }
}

googleBtn.addEventListener("click", async () => {
    showMessage(errorEl, "");
    const result = await withBusy(googleBtn, t("auth.connecting"), loginWithGoogle);
    if (result.success) location.href = nextPage();
    else showMessage(errorEl, friendlyError(result.error, "err.googleFailed"));
});

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    showMessage(errorEl, "");
    const email = form.elements.email.value;
    const password = form.elements.password.value;
    const remember = form.elements.remember.checked;
    const result = await withBusy(submitBtn, t("auth.loggingIn"), () => loginUser(email, password, remember));
    if (result.success) location.href = nextPage();
    else showMessage(errorEl, friendlyError(result.error, "err.loginFailed"));
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
        setFpMessage(t("err.invalid-email"), "error");
        return;
    }
    setFpMessage(t("auth.sending"));
    const result = await withBusy(fpSend, t("auth.sending"), () => resetPassword(fpEmail.value));
    if (result.success) {
        // Same message whether or not the account exists (no account enumeration).
        setFpMessage(t("auth.resetSent"), "success");
        setTimeout(closeModal, 4000);
    } else {
        setFpMessage(friendlyError(result.error), "error");
    }
});
