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
 * Hero background slideshow: historic and natural places from all over Anatolia.
 * Photos are credited on the page as their licences require.
 * Only the current photo is loaded up front; each next one is fetched just before it is shown.
 */
const CC3 = { name: "CC BY-SA 3.0", url: "https://creativecommons.org/licenses/by-sa/3.0/" };
const CC4 = { name: "CC BY-SA 4.0", url: "https://creativecommons.org/licenses/by-sa/4.0/" };
const FAL = { name: "Free Art License", url: "https://artlibre.org/licence/lal/en/" };
const UNSPLASH = { name: "Unsplash License", url: "https://unsplash.com/license" };
const COMMONS = "https://commons.wikimedia.org/wiki/File:";
const HERO_SLIDES = [
    { slug: "01-cappadocia", place: "place.cappadocia", author: "Wolfgang Moroder", source: COMMONS + "Hot_air_balloon_ride_at_sunrise_in_Cappadocia.JPG", license: CC3 },
    { slug: "02-pamukkale", place: "place.pamukkale", author: "A.Savin", source: COMMONS + "TR_Pamukkale_White_Terraces_asv2020-02_img14.jpg", license: FAL },
    { slug: "03-ephesus", place: "place.ephesus", author: "Herbert Weber", source: COMMONS + "Library_of_Celsus_6242.jpg", license: CC4 },
    { slug: "04-aspendos", place: "place.aspendos", author: "Saffron Blaze", source: COMMONS + "Aspendos_Basilica_Antalya_Turkey.jpg", license: CC3 },
    { slug: "05-burdur", place: "place.burdur", author: "Ekrem07", source: COMMONS + "Elmas_g%C3%B6l.jpg", license: CC4 },
    { slug: "06-yedigoller", place: "place.yedigoller", author: "A.Savin", source: COMMONS + "TR_Yedig%C3%B6ller_asv2021-10_img16.jpg", license: FAL },
    { slug: "07-nemrut", place: "place.nemrut", author: "Mkrc85", source: COMMONS + "APOLLON_NEMRUT_MOUNTAIN.jpg", license: CC4 },
    { slug: "08-mardin", place: "place.mardin", author: "Nevit Dilmen", source: COMMONS + "Mardin_P1030274_20080423101837.JPG", license: CC3 },
    { slug: "09-istanbul", place: "place.istanbul", author: "Unsplash", source: "https://unsplash.com/license", license: UNSPLASH }
];

function initHeroSlider(hero) {
    if (!hero) return;
    const DURATION = 7000; // ms per photo
    const slideEls = [...hero.querySelectorAll(".hero-slide")];
    const dotsHost = hero.querySelector(".hero-dots");
    const credit = hero.querySelector(".hero-credit");
    if (slideEls.length !== HERO_SLIDES.length || !dotsHost || !credit) return;

    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = matchMedia("(max-width: 768px)");
    const webp = document.createElement("canvas").toDataURL("image/webp").startsWith("data:image/webp");
    const urlFor = (slug) => `assets/hero/${slug}${mobile.matches ? "-m" : ""}.${webp ? "webp" : "jpg"}`;
    const loaded = new Map(); // url -> Promise

    function load(i) {
        const url = urlFor(HERO_SLIDES[i].slug);
        if (!loaded.has(url)) {
            loaded.set(url, new Promise((resolve) => {
                const img = new Image();
                img.onload = img.onerror = () => resolve(url);
                img.src = url;
            }));
        }
        return loaded.get(url).then((u) => {
            // slide 1 is styled in CSS; the others get their photo once it is in the cache
            if (i > 0) slideEls[i].style.backgroundImage = `url("${u}")`;
            return u;
        });
    }

    // indicators
    const dots = HERO_SLIDES.map((slide, i) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "hero-dot";
        b.setAttribute("aria-label", t("hero.showSlide", { place: t(slide.place) }));
        b.addEventListener("click", () => { go(i); restart(); });
        dotsHost.appendChild(b);
        return b;
    });
    dotsHost.style.setProperty("--slide-ms", `${DURATION}ms`);

    let current = 0;
    const stopped = reducedMotion; // no auto-advance when the visitor asked for reduced motion
    let timer = 0;
    let visible = true;

    function renderCredit(i) {
        const s = HERO_SLIDES[i];
        credit.querySelector(".hero-credit-place").textContent = t(s.place);
        const author = credit.querySelector(".hero-credit-author");
        author.textContent = s.author;
        author.href = s.source;
        const lic = credit.querySelector(".hero-credit-license");
        lic.textContent = s.license.name;
        lic.href = s.license.url;
    }

    function render() {
        slideEls.forEach((el, i) => el.classList.toggle("is-active", i === current));
        // clear, reflow, then mark the current indicator so its progress bar starts from zero
        dots.forEach((d) => d.setAttribute("aria-current", "false"));
        void dotsHost.offsetWidth;
        dots[current].setAttribute("aria-current", "true");
        renderCredit(current);
        dotsHost.classList.toggle("is-paused", stopped);
    }

    async function go(i) {
        const next = (i + HERO_SLIDES.length) % HERO_SLIDES.length;
        await load(next);
        current = next;
        render();
        load((current + 1) % HERO_SLIDES.length); // warm up the following photo
    }

    function restart() {
        clearTimeout(timer);
        if (stopped || !visible || document.hidden) return;
        timer = setTimeout(async () => { await go(current + 1); restart(); }, DURATION);
    }

    document.addEventListener("visibilitychange", restart);
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; restart(); }).observe(hero);
    mobile.addEventListener("change", () => { loaded.clear(); slideEls.forEach((el, i) => { if (i > 0) el.style.backgroundImage = ""; }); load(current); });

    render();
    // Start fetching the second photo only after the page has finished loading.
    const warm = () => load(1);
    if (document.readyState === "complete") warm(); else addEventListener("load", warm, { once: true });
    restart();
}

/**
 * Productions carousel: scrolls by itself in an endless loop.
 * - The cards are duplicated once, and the position wraps around the width of one set,
 *   so the loop never "jumps back" visibly.
 * - Pauses while hovered, focused, touched/dragged, off-screen or in a background tab,
 *   and resumes shortly after.
 * - Never auto-plays when the visitor asked the OS for reduced motion.
 * - Works in right-to-left pages, where scrollLeft runs from 0 to negative values.
 */
function initCarousel(row) {
    const SPEED = 40;          // px per second
    const RESUME_DELAY = 2500; // ms after the last interaction
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

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
    const stoppedByUser = reducedMotion;
    let holdUntil = 0;        // temporary pause after an interaction
    let hovered = false, focused = false, pressed = false, visible = true;
    const hold = () => { holdUntil = performance.now() + RESUME_DELAY; };
    const playing = () => !stoppedByUser && !hovered && !focused && !pressed && visible && !document.hidden && performance.now() > holdUntil;

    // ---- user scrolling (touch swipe, trackpad, mouse drag) ----
    row.addEventListener("scroll", () => {
        if (Math.abs(row.scrollLeft - lastWritten) < 1.5) return; // our own write
        pos = readPos();
        lastWritten = row.scrollLeft;
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
        pressed = true;
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
        if (playing()) {
            write(pos + SPEED * dt);
        }
        requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
}

initHeroSlider(document.querySelector(".home-hero"));
