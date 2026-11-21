// About page: scroll-reveal sections and count-up statistics.
import { formatNumber } from "../i18n.js";

const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const sections = [...document.querySelectorAll("[data-reveal]")];
const counters = [...document.querySelectorAll(".stat-number[data-count]")];

/** Show the final value (locale digits, e.g. Persian) with its suffix. */
const finalText = (el) => `${formatNumber(Number(el.dataset.count))}${el.dataset.suffix || ""}`;

function countUp(el) {
    if (el.dataset.done) return;
    el.dataset.done = "1";
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    const duration = 1600 + Math.min(target, 600); // bigger numbers count a little longer
    const start = performance.now();
    const ease = (x) => 1 - Math.pow(1 - x, 4);
    const step = (now) => {
        const x = Math.min((now - start) / duration, 1);
        el.textContent = `${formatNumber(Math.round(target * ease(x)))}${suffix}`;
        if (x < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
}

if (reducedMotion || !("IntersectionObserver" in window)) {
    counters.forEach((el) => { el.textContent = finalText(el); });
} else {
    // Hide sections only once we know JS can reveal them again.
    document.documentElement.classList.add("js-reveal");
    counters.forEach((el) => { el.textContent = `${formatNumber(0)}${el.dataset.suffix || ""}`; });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            entry.target.querySelectorAll(".stat-number[data-count]").forEach(countUp);
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.25, rootMargin: "0px 0px -8% 0px" });
    sections.forEach((s) => observer.observe(s));
}
