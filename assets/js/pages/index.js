// Home page: FAQ accordion + productions carousel.
import "../i18n.js"; // wait until the language (and text direction) is applied

document.querySelectorAll(".accordion-item").forEach((item) => {
    const btn = item.querySelector(".accordion-btn");
    const panel = item.querySelector(".accordion-panel");
    btn.setAttribute("aria-expanded", "false");
    btn.addEventListener("click", () => {
        const open = item.classList.toggle("is-open");
        btn.setAttribute("aria-expanded", String(open));
        panel.style.maxHeight = open ? `${panel.scrollHeight}px` : "0";
    });
});

const row = document.querySelector(".chip-row");
if (row) {
    const buttons = [...document.querySelectorAll(".carousel-btn")];
    const step = () => Math.max(row.clientWidth * 0.8, 240);

    buttons.forEach((btn) => btn.addEventListener("click", () => {
        row.scrollBy({ left: Number(btn.dataset.dir) * step(), behavior: "smooth" });
    }));

    // In right-to-left pages (Persian) scrollLeft runs from 0 down to -max instead of 0 up to max.
    const update = () => {
        const max = row.scrollWidth - row.clientWidth;
        const rtl = getComputedStyle(row).direction === "rtl";
        const [minPos, maxPos] = rtl ? [-max, 0] : [0, max];
        buttons.forEach((btn) => {
            btn.disabled = Number(btn.dataset.dir) < 0 ? row.scrollLeft <= minPos + 4 : row.scrollLeft >= maxPos - 4;
        });
    };
    let raf = 0;
    const schedule = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); };
    row.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    update();

    // Mouse drag-to-scroll (touch devices scroll natively). A drag must not open a card.
    let startX = 0, startScroll = 0, pressed = false, dragged = false;
    row.addEventListener("pointerdown", (e) => {
        if (e.pointerType !== "mouse" || e.button !== 0) return;
        pressed = true; dragged = false;
        startX = e.clientX; startScroll = row.scrollLeft;
    });
    row.addEventListener("pointermove", (e) => {
        if (!pressed) return;
        const dx = e.clientX - startX;
        if (!dragged && Math.abs(dx) > 6) { dragged = true; row.classList.add("is-dragging"); }
        if (dragged) row.scrollLeft = startScroll - dx;
    });
    const release = () => {
        if (!pressed) return;
        pressed = false;
        // Keep pointer-events off until the click that ends the drag has been swallowed.
        setTimeout(() => row.classList.remove("is-dragging"), 0);
    };
    row.addEventListener("pointerup", release);
    row.addEventListener("pointerleave", release);
    row.addEventListener("click", (e) => { if (dragged) { e.preventDefault(); dragged = false; } }, true);
    row.querySelectorAll("a, img").forEach((el) => el.setAttribute("draggable", "false"));
}
