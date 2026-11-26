import { registerUser, loginWithGoogle, authReady, ageOn, MIN_AGE } from "../auth_manager.js";
import { friendlyError, showMessage } from "../utils.js";
import { t } from "../i18n.js";

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

// Latest date of birth that is old enough today (for the date picker).
const birthInput = form.elements.birthDate;
const today = new Date();
const pad = (n) => String(n).padStart(2, "0");
birthInput.max = `${today.getFullYear() - MIN_AGE}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

/** Validates the date of birth; shows the reason and returns null if it can't be used. */
function checkedBirthDate() {
    const value = birthInput.value;
    const age = ageOn(value);
    if (!value || Number.isNaN(age) || age > 120) {
        showMessage(errorEl, t("auth.enterBirthDate"));
        birthInput.focus();
        return null;
    }
    if (age < MIN_AGE) {
        showMessage(errorEl, t("err.under-age"));
        birthInput.focus();
        return null;
    }
    return value;
}

googleBtn.addEventListener("click", async () => {
    showMessage(errorEl, "");
    const birthIso = checkedBirthDate(); // Google doesn't share the birthday, so it is asked here first
    if (!birthIso) return;
    const result = await withBusy(googleBtn, t("auth.connecting"), () => loginWithGoogle({ birthIso }));
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
    const birthIso = checkedBirthDate();
    if (!birthIso) return;
    if (!form.elements.email.checkValidity()) return showMessage(errorEl, t("err.invalid-email"));
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
        return showMessage(errorEl, t("auth.passwordRule"));
    }

    const result = await withBusy(submitBtn, t("auth.creating"), () => registerUser(email, password, name, birthIso));
    if (result.success) location.href = "index.html";
    else showMessage(errorEl, friendlyError(result.error, "err.signupFailed"));
});
