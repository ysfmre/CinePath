import { registerUser, loginWithGoogle, authReady } from "../auth_manager.js";
import { friendlyError, showMessage } from "../utils.js";
import { t } from "../i18n.js";
import "../cookie-notice.js";

const form = document.getElementById("signupForm");
const errorEl = form.querySelector("[data-error]");
const submitBtn = form.querySelector('button[type="submit"]');
const googleBtn = document.getElementById("googleBtn");

authReady.then((user) => { if (user) location.replace("index.html"); });

async function withBusy(button, busyText, task) {
    const label = button.querySelector("span") || button; // keep icons intact
    const original = label.textContent;
    button.disabled = true;
    label.textContent = busyText;
    try { return await task(); } finally { button.disabled = false; label.textContent = original; }
}

const termsBox = form.elements.terms;
function termsAccepted() {
    if (termsBox.checked) return true;
    showMessage(errorEl, t("auth.acceptTermsFirst"));
    termsBox.focus();
    return false;
}

googleBtn.addEventListener("click", async () => {
    showMessage(errorEl, "");
    if (!termsAccepted()) return;
    const result = await withBusy(googleBtn, t("auth.connecting"), loginWithGoogle);
    if (result.success) location.href = "index.html";
    else showMessage(errorEl, friendlyError(result.error, "err.googleFailed"));
});

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    showMessage(errorEl, "");
    const name = form.elements.name.value.trim();
    const email = form.elements.email.value.trim();
    const password = form.elements.password.value;

    if (name.length < 2) return showMessage(errorEl, t("auth.enterName"));
    if (!form.elements.email.checkValidity()) return showMessage(errorEl, t("err.invalid-email"));
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
        return showMessage(errorEl, t("auth.passwordRule"));
    }
    if (!termsAccepted()) return;

    const result = await withBusy(submitBtn, t("auth.creating"), () => registerUser(email, password, name));
    if (result.success) location.href = "index.html";
    else showMessage(errorEl, friendlyError(result.error, "err.signupFailed"));
});
