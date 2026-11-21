// Home page: FAQ accordion + productions carousel.
import { t } from "../i18n.js"; // also waits until the language (and text direction) is applied

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
if (row) initCarousel(row);

/**
 * Productions carousel: scrolls by itself in an endless loop.
 * - The cards are duplicated once, and the position wraps around the width of one set,
 *   so the loop never "jumps back" visibly.
 * - Pauses while hovered, focused, touched/dragged, off-screen or in a background tab,
 *   and resumes shortly after; the pause button stops it for good (WCAG 2.2.2).
 * - Never auto-plays when the visitor asked the OS for reduced motion.
 * - Works in right-to-left pages, where scrollLeft runs from 0 to negative values.
 */
function initCarousel(row) {
    const SPEED = 40;          // px per second
    const RESUME_DELAY = 2500; // ms after the last interaction
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const toggle = document.querySelector(".carousel-toggle");
    const arrows = [...document.querySelectorAll(".carousel-btn[data-dir]")];

    // Second copy of the cards for a seamless loop (hidden from assistive tech and keyboard).
    const originals = [...row.children];
    originals.forEach((card) => {
        const clone = card.cloneNode(true);
        clone.setAttribute("aria-hidden", "true");
        clone.tabIndex = -1;
        clone.classList.add("is-clone");
        row.appendChild(clone);
    });
    row.querySelectorAll("a, img").forEach((el) => el.setAttribute("draggable", "false"));

    const rtl = () => getComputedStyle(row).direction === "rtl";
    const setWidth = () => (originals.length ? row.children[originals.length].offsetLeft - originals[0].offsetLeft : 0) * (rtl() ? -1 : 1);
    const readPos = () => Math.abs(row.scrollLeft);
    let pos = readPos();
    let lastWritten = row.scrollLeft;

    const write = (p) => {
        const w = Math.abs(setWidth());
        if (w > 0) p = ((p % w) + w) % w; // wrap inside one set of cards
        pos = p;
        row.scrollLeft = rtl() ? -p : p;
        lastWritten = row.scrollLeft;
    };

    // ---- play / pause state ----
    let stoppedByUser = reducedMotion;
    let holdUntil = 0;        // temporary pause after an interaction
    let hovered = false, focused = false, pressed = false, visible = true;
    const hold = () => { holdUntil = performance.now() + RESUME_DELAY; };
    const playing = () => !stoppedByUser && !hovered && !focused && !pressed && visible && !document.hidden && performance.now() > holdUntil;
    const renderToggle = () => {
        if (!toggle) return;
        toggle.setAttribute("aria-pressed", String(stoppedByUser));
        const key = stoppedByUser ? "common.play" : "common.pause";
        toggle.setAttribute("data-i18n-attr", `aria-label:${key}`);
        toggle.setAttribute("aria-label", t(key));
    };
    toggle?.addEventListener("click", () => { stoppedByUser = !stoppedByUser; holdUntil = 0; renderToggle(); });
    renderToggle();

    // ---- arrow animation (eased, handled in the same frame loop) ----
    let anim = null;
    const ease = (x) => 1 - Math.pow(1 - x, 3);
    arrows.forEach((btn) => btn.addEventListener("click", () => {
        // physical direction: -1 = left, +1 = right; in RTL "right" means going back
        const logical = Number(btn.dataset.dir) * (rtl() ? -1 : 1);
        const distance = logical * Math.max(row.clientWidth * 0.8, 240);
        if (reducedMotion) { write(pos + distance); hold(); return; }
        anim = { from: pos, by: distance, start: performance.now(), duration: 550 };
        hold();
    }));

    // ---- user scrolling (touch swipe, trackpad, mouse drag) ----
    row.addEventListener("scroll", () => {
        if (Math.abs(row.scrollLeft - lastWritten) < 1.5) return; // our own write
        pos = readPos();
        lastWritten = row.scrollLeft;
        anim = null;
        hold();
    }, { passive: true });
    row.addEventListener("wheel", hold, { passive: true });

    row.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") hovered = true; });
    row.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") { hovered = false; hold(); } });
    row.addEventListener("focusin", () => { focused = true; });
    row.addEventListener("focusout", () => { focused = false; hold(); });
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }).observe(row);

    // Mouse drag-to-scroll (touch devices scroll natively). A drag must not open a card.
    let startX = 0, startPos = 0, dragged = false;
    row.addEventListener("pointerdown", (e) => {
        pressed = true; anim = null;
        if (e.pointerType !== "mouse" || e.button !== 0) return;
        dragged = false; startX = e.clientX; startPos = pos;
        row.dataset.mouseDown = "1";
    });
    row.addEventListener("pointermove", (e) => {
        if (!row.dataset.mouseDown) return;
        const dx = e.clientX - startX;
        if (!dragged && Math.abs(dx) > 6) { dragged = true; row.classList.add("is-dragging"); }
        if (dragged) write(startPos - dx * (rtl() ? -1 : 1));
    });
    const release = () => {
        pressed = false;
        hold();
        if (!row.dataset.mouseDown) return;
        delete row.dataset.mouseDown;
        // Keep pointer-events off until the click that ends the drag has been swallowed.
        setTimeout(() => row.classList.remove("is-dragging"), 0);
    };
    row.addEventListener("pointerup", release);
    row.addEventListener("pointercancel", release);
    row.addEventListener("pointerleave", release);
    row.addEventListener("click", (e) => { if (dragged) { e.preventDefault(); dragged = false; } }, true);

    // ---- frame loop ----
    let last = performance.now();
    const frame = (now) => {
        const dt = Math.min(now - last, 100) / 1000;
        last = now;
        if (anim) {
            const x = Math.min((now - anim.start) / anim.duration, 1);
            write(anim.from + anim.by * ease(x));
            if (x >= 1) anim = null;
        } else if (playing()) {
            write(pos + SPEED * dt);
        }
        requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
}
