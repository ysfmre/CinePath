// Contact page: the form is delivered to cinepathcontact@gmail.com through Web3Forms
// (the site is static and has no mail server of its own).
import { t, formatNumber } from "../i18n.js";
import { CONTACT_FORM_ACCESS_KEY } from "../../../config.js";

const CONTACT_EMAIL = "cinepathcontact@gmail.com";
const ENDPOINT = "https://api.web3forms.com/submit";
const COOLDOWN_MS = 60_000;        // one message per minute from the same browser
const COOLDOWN_KEY = "cinepath:contact-sent";
const MAX_MESSAGE = 1500;

const $ = (id) => document.getElementById(id);
const form = $("contactForm");
const fields = form.elements;
const statusEl = $("formStatus");
const submitBtn = $("submitBtn");
const submitLabel = $("submitLabel");
const counter = $("messageCount");

// ---- helpers ----
const clean = (v, max) => String(v || "").replace(/\s+\n/g, "\n").trim().slice(0, max);
const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/;

function setStatus(text, type = "error", mailtoBody) {
    statusEl.textContent = text;
    statusEl.className = `form-status is-${type}`;
    statusEl.hidden = !text;
    if (mailtoBody) {
        // Offer the visitor's own mail app as a way out (built with DOM APIs, never innerHTML).
        const a = document.createElement("a");
        a.href = mailtoBody;
        a.textContent = t("contact.useMailApp");
        statusEl.append(" ", a);
    }
}

function markInvalid(el, invalid) {
    el.toggleAttribute("aria-invalid", invalid);
    el.closest(".form-group")?.classList.toggle("has-error", invalid);
}

function lastSent() {
    try { return Number(localStorage.getItem(COOLDOWN_KEY)) || 0; } catch { return 0; }
}
function rememberSent() {
    try { localStorage.setItem(COOLDOWN_KEY, String(Date.now())); } catch { /* ignore */ }
}

function mailtoLink({ name, email, subjectText, message }) {
    const body = `${message}\n\n— ${name} <${email}>`;
    return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`[CinePath] ${subjectText}`)}&body=${encodeURIComponent(body.slice(0, 1800))}`;
}

function updateCounter() {
    const n = fields.message.value.length;
    counter.textContent = `${formatNumber(n)} / ${formatNumber(MAX_MESSAGE)}`;
    counter.classList.toggle("is-near", n > MAX_MESSAGE * 0.9);
}

/** Returns the cleaned values, or null after showing what is wrong. */
function validate() {
    const values = {
        name: clean(fields.name.value, 80),
        email: clean(fields.email.value, 120),
        subjectText: fields.subject.options[fields.subject.selectedIndex].text,
        message: clean(fields.message.value, MAX_MESSAGE)
    };
    const problems = [
        [fields.name, values.name.length < 2, "contact.errName"],
        [fields.email, !EMAIL_RE.test(values.email), "err.invalid-email"],
        [fields.message, values.message.length < 10, "contact.errMessage"]
    ];
    problems.forEach(([el, bad]) => markInvalid(el, bad));
    const first = problems.find(([, bad]) => bad);
    if (first) {
        setStatus(t(first[2]));
        first[0].focus();
        return null;
    }
    return values;
}

function setBusy(busy) {
    submitBtn.disabled = busy;
    submitLabel.textContent = busy ? t("contact.sending") : t("contact.send");
}

function showSuccess() {
    form.reset();
    updateCounter();
    setStatus("");
    form.hidden = true;
    $("formSuccess").hidden = false;
    $("newMessageBtn").focus();
}

// ---- submit ----
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    setStatus("");
    const values = validate();
    if (!values) return;

    // Bots fill in the hidden field: pretend everything went fine and send nothing.
    if (fields.botcheck.value) return showSuccess();

    const wait = lastSent() + COOLDOWN_MS - Date.now();
    if (wait > 0) {
        return setStatus(t("contact.tooSoon", { s: formatNumber(Math.ceil(wait / 1000)) }));
    }

    // Not configured yet: hand the message to the visitor's mail app instead.
    if (!CONTACT_FORM_ACCESS_KEY) {
        window.location.href = mailtoLink(values);
        return setStatus(t("contact.opening"), "info");
    }

    setBusy(true);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15_000);
    try {
        const res = await fetch(ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify({
                access_key: CONTACT_FORM_ACCESS_KEY,
                subject: `[CinePath] ${values.subjectText}`,
                from_name: "CinePath",
                name: values.name,
                email: values.email,
                replyto: values.email,
                message: values.message,
                botcheck: ""
            }),
            signal: controller.signal
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || data.success !== true) throw new Error(data.message || `HTTP ${res.status}`);
        rememberSent();
        showSuccess();
    } catch (error) {
        console.error("Contact form failed:", error);
        setStatus(t("contact.failed"), "error", mailtoLink(values));
    } finally {
        clearTimeout(timer);
        setBusy(false);
    }
});

// ---- small things ----
fields.message.addEventListener("input", updateCounter);
[fields.name, fields.email, fields.message].forEach((el) => {
    el.addEventListener("input", () => { if (el.hasAttribute("aria-invalid")) markInvalid(el, false); });
});
updateCounter();

$("newMessageBtn").addEventListener("click", () => {
    $("formSuccess").hidden = true;
    form.hidden = false;
    fields.name.focus();
});

$("copyEmailBtn").addEventListener("click", async (e) => {
    const btn = e.currentTarget;
    try {
        await navigator.clipboard.writeText(CONTACT_EMAIL);
        btn.classList.add("is-copied");
        btn.setAttribute("aria-label", t("contact.copied"));
        setTimeout(() => {
            btn.classList.remove("is-copied");
            btn.setAttribute("aria-label", t("contact.copy"));
        }, 1800);
    } catch {
        window.location.href = `mailto:${CONTACT_EMAIL}`;
    }
});
