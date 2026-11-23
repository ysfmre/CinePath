// One-time cookie notice. The site only uses strictly necessary / functional storage,
// so this informs (no consent needed) and is dismissed for good with "OK".
import { t } from "./i18n.js";

const KEY = "cinepath:cookie-notice";
let seen = false;
try { seen = localStorage.getItem(KEY) === "1"; } catch { /* storage blocked: show every time */ }

if (!seen && !document.querySelector(".cookie-notice")) {
    const box = document.createElement("div");
    box.className = "cookie-notice";
    box.setAttribute("role", "region");
    box.setAttribute("aria-label", t("cookie.label"));
    const text = document.createElement("p");
    text.textContent = `${t("cookie.text")} `;
    const link = document.createElement("a");
    link.href = "cookies.html";
    link.textContent = t("cookie.more");
    text.appendChild(link);
    const ok = document.createElement("button");
    ok.type = "button";
    ok.textContent = t("cookie.ok");
    ok.addEventListener("click", () => {
        try { localStorage.setItem(KEY, "1"); } catch { /* ignore */ }
        box.classList.add("is-hiding");
        setTimeout(() => box.remove(), 250);
    });
    box.append(text, ok);
    document.body.appendChild(box);
}
