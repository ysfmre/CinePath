// Small, dependency-free helpers shared by every page.

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
    "auth/invalid-credential": "E-mail or password is incorrect.",
    "auth/invalid-login-credentials": "E-mail or password is incorrect.",
    "auth/wrong-password": "E-mail or password is incorrect.",
    "auth/user-not-found": "E-mail or password is incorrect.",
    "auth/invalid-email": "Please enter a valid e-mail address.",
    "auth/missing-password": "Please enter your password.",
    "auth/email-already-in-use": "An account with this e-mail already exists.",
    "auth/weak-password": "Password must be at least 8 characters.",
    "auth/user-disabled": "This account has been disabled.",
    "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
    "auth/network-request-failed": "Network error. Check your connection and try again.",
    "auth/popup-closed-by-user": "The sign-in window was closed before finishing.",
    "auth/cancelled-popup-request": "The sign-in window was closed before finishing.",
    "auth/popup-blocked": "Your browser blocked the sign-in window. Allow pop-ups for this site and try again.",
    "auth/unauthorized-domain": "This domain is not authorized for sign-in. Add it in Firebase Console → Authentication → Settings → Authorized domains.",
    "auth/operation-not-allowed": "This sign-in method is disabled. Enable it in Firebase Console → Authentication → Sign-in method.",
    "auth/invalid-api-key": "The site's Firebase configuration is invalid (API key).",
    "auth/api-key-not-valid.-please-pass-a-valid-api-key.": "The site's Firebase configuration is invalid (API key).",
    "auth/account-exists-with-different-credential": "An account already exists with this e-mail using a different sign-in method.",
    "auth/requires-recent-login": "Please log in again and retry.",
    "auth/no-password-provider": "This account signs in with Google and has no password to change.",
    "auth/firebase-app-check-token-is-invalid": "Sign-in is temporarily unavailable (security check failed). Please try again later.",
    "permission-denied": "You don't have permission to do that."
};

/** Turn a Firebase error into a short, user-facing message without leaking internals. */
export function friendlyError(error, fallback = "Something went wrong. Please try again.") {
    const code = error?.code || "";
    if (AUTH_ERRORS[code]) return AUTH_ERRORS[code];
    if (code) console.warn("Firebase error:", code);
    return fallback;
}

/** Show/hide an inline message element. */
export function showMessage(el, text, type = "error") {
    if (!el) return;
    el.textContent = text;
    el.dataset.type = type;
    el.style.display = text ? "block" : "none";
}
