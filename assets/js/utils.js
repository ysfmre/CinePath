// Small helpers shared by every page.
import { t } from "./i18n.js";

const HTML_ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;", "`": "&#96;" };

/** Escape any value for safe interpolation into HTML text or quoted attributes. */
export function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"'`]/g, (c) => HTML_ESCAPES[c]);
}

/**
 * Return the URL if it uses an allowed scheme, otherwise the fallback.
 * Blocks javascript:, vbscript:, data:text/html, etc.
 */
export function safeUrl(value, { allowDataImage = false, fallback = "" } = {}) {
    if (typeof value !== "string" || !value.trim()) return fallback;
    const url = value.trim();
    if (allowDataImage && /^data:image\/(png|jpe?g|gif|webp);base64,[a-z0-9+/=]+$/i.test(url)) return url;
    try {
        const parsed = new URL(url, window.location.href);
        return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.href : fallback;
    } catch {
        return fallback;
    }
}

export const PLACEHOLDER_POSTER = "https://placehold.co/400x600/1a1a1d/FFF?text=No+Image";

/** Swap a broken <img> to a placeholder exactly once (no inline onerror needed). */
export function withFallback(img, fallback = PLACEHOLDER_POSTER) {
    img.addEventListener("error", () => { if (img.src !== fallback) img.src = fallback; }, { once: true });
    return img;
}

const AUTH_ERRORS = {
    "auth/invalid-credential": "err.invalid-credential",
    "auth/invalid-login-credentials": "err.invalid-credential",
    "auth/wrong-password": "err.invalid-credential",
    "auth/user-not-found": "err.invalid-credential",
    "auth/invalid-email": "err.invalid-email",
    "auth/missing-password": "err.missing-password",
    "auth/email-already-in-use": "err.email-already-in-use",
    "auth/weak-password": "err.weak-password",
    "auth/user-disabled": "err.user-disabled",
    "auth/too-many-requests": "err.too-many-requests",
    "auth/network-request-failed": "err.network-request-failed",
    "auth/popup-closed-by-user": "err.popup-closed-by-user",
    "auth/cancelled-popup-request": "err.popup-closed-by-user",
    "auth/popup-blocked": "err.popup-blocked",
    "auth/unauthorized-domain": "err.unauthorized-domain",
    "auth/operation-not-allowed": "err.operation-not-allowed",
    "auth/invalid-api-key": "err.invalid-api-key",
    "auth/api-key-not-valid.-please-pass-a-valid-api-key.": "err.invalid-api-key",
    "auth/account-exists-with-different-credential": "err.account-exists-with-different-credential",
    "auth/requires-recent-login": "err.requires-recent-login",
    "auth/no-password-provider": "err.no-password-provider",
    "auth/firebase-app-check-token-is-invalid": "err.firebase-app-check-token-is-invalid",
    "permission-denied": "err.permission-denied"
};

/** Turn a Firebase error into a short, translated message without leaking internals. */
export function friendlyError(error, fallbackKey = "err.generic") {
    const code = error?.code || "";
    if (AUTH_ERRORS[code]) return t(AUTH_ERRORS[code]);
    if (!code) return t(fallbackKey);
    console.warn("Firebase error:", code, error?.message || "");
    // Show the code so users can report it (codes contain no personal data).
    return `${t(fallbackKey)} (${code})`;
}

/** Show/hide an inline message element. */
export function showMessage(el, text, type = "error") {
    if (!el) return;
    el.textContent = text;
    el.dataset.type = type;
    el.style.display = text ? "block" : "none";
}
