// Shared page chrome: mobile navigation, footer year and header profile button.
import { initAuthListener } from "./auth_manager.js";

const menuBtn = document.getElementById("hamburgerBtn");
const menu = document.querySelector(".mobile-nav-panel");
const overlay = document.getElementById("mobileOverlay");

if (menuBtn && menu && overlay) {
    const setOpen = (open) => {
        menu.classList.toggle("open", open);
        overlay.classList.toggle("active", open);
        menuBtn.classList.toggle("active", open);
        menuBtn.setAttribute("aria-expanded", String(open));
        document.body.style.overflow = open ? "hidden" : "";
    };
    menuBtn.addEventListener("click", () => setOpen(!menu.classList.contains("open")));
    overlay.addEventListener("click", () => setOpen(false));
    menu.querySelectorAll("a, button").forEach((el) => el.addEventListener("click", () => setOpen(false)));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
}

const year = document.getElementById("year");
if (year) year.textContent = String(new Date().getFullYear());

initAuthListener();
