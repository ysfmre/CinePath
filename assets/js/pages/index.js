// Home page: FAQ accordion + draggable chip carousel.
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
    const makeBtn = (dir, label, symbol) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = `scroll-btn ${dir}`;
        b.setAttribute("aria-label", label);
        b.textContent = symbol;
        b.addEventListener("click", () => row.scrollBy({ left: dir === "left" ? -300 : 300, behavior: "smooth" }));
        row.parentElement.appendChild(b);
        return b;
    };
    const left = makeBtn("left", "Scroll left", "‹");
    const right = makeBtn("right", "Scroll right", "›");

    const update = () => {
        left.disabled = row.scrollLeft <= 0;
        right.disabled = row.scrollLeft + row.clientWidth >= row.scrollWidth - 10;
        left.style.opacity = left.disabled ? "0" : "1";
        right.style.opacity = right.disabled ? "0" : "1";
    };
    let raf = 0;
    row.addEventListener("scroll", () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); }, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    update();

    // Mouse drag-to-scroll; a drag must not trigger the card link.
    let startX = 0, startScroll = 0, dragging = false, moved = false;
    row.addEventListener("mousedown", (e) => {
        dragging = true; moved = false;
        startX = e.pageX; startScroll = row.scrollLeft;
        row.classList.add("is-dragging");
    });
    const stop = () => { dragging = false; row.classList.remove("is-dragging"); };
    row.addEventListener("mouseleave", stop);
    row.addEventListener("mouseup", stop);
    row.addEventListener("mousemove", (e) => {
        if (!dragging) return;
        const dx = e.pageX - startX;
        if (Math.abs(dx) > 5) moved = true;
        e.preventDefault();
        row.scrollLeft = startScroll - dx * 2;
    });
    row.addEventListener("click", (e) => { if (moved) { e.preventDefault(); moved = false; } }, true);
    row.querySelectorAll("a, img").forEach((el) => el.setAttribute("draggable", "false"));
}
