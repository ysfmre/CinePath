// Shared page chrome: mobile navigation, footer year and header profile button.
// Firebase is loaded separately at the end, so the menu keeps working even if it can't load.

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
    // The header's toggle sits underneath the open sheet, so the sheet gets its own close button.
    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "mobile-nav-close";
    closeBtn.setAttribute("aria-label", "Close menu");
    closeBtn.textContent = "×";
    menu.prepend(closeBtn);

    menuBtn.addEventListener("click", () => setOpen(!menu.classList.contains("open")));
    overlay.addEventListener("click", () => setOpen(false));
    menu.querySelectorAll("a, button").forEach((el) => el.addEventListener("click", () => setOpen(false)));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
}

const thisYear = String(new Date().getFullYear());
document.querySelectorAll("#year, [data-year]").forEach((el) => { el.textContent = thisYear; });

// Highlight the current page in the desktop and mobile navigation.
const currentPage = (location.pathname.split("/").pop() || "index.html").toLowerCase();
document.querySelectorAll(".nav-list a, .mobile-nav-panel a.mobile-link").forEach((link) => {
    if ((link.getAttribute("href") || "").toLowerCase() === currentPage) link.setAttribute("aria-current", "page");
});

import("./auth_manager.js")
    .then(({ initAuthListener }) => initAuthListener())
    .catch((error) => console.error("Firebase could not be loaded:", error));
