import {
    auth, onUserChange, getAllContents, getUserData,
    toggleFavorite, getUserRatingsForMovie, saveUserRating
} from "../auth_manager.js";
import { escapeHtml, safeUrl, withFallback, PLACEHOLDER_POSTER } from "../utils.js";
import { t, tp, formatNumber } from "../i18n.js";

const $ = (id) => document.getElementById(id);
const grid = $("contentGrid");
const loader = $("loader");
const modal = $("detailModal");
const videoModal = $("sceneVideoModal");
const videoPlayer = $("sceneVideoPlayer");

let allContent = [];
let favorites = new Set();
let mapInstance = null;
let mapMarkers = [];
let activeIndex = -1;
let currentItemId = null;
const filterState = { type: "all", search: "", sort: "newest" };

// Content type is stored inconsistently ("Movie", "movie", "Tv Show"...): normalise it.
const isMovie = (item) => /movie|film/i.test(item.type || "") && !/show|series|dizi|tv/i.test(item.type || "");
const toNumber = (v) => (Number.isFinite(Number(v)) ? Number(v) : NaN);
const validLocations = (item) =>
    (Array.isArray(item.locations) ? item.locations : [])
        .map((l) => ({ ...l, lat: toNumber(l.lat), lng: toNumber(l.lng) }))
        .filter((l) => Number.isFinite(l.lat) && Number.isFinite(l.lng))
        .sort((a, b) => (a.order || 0) - (b.order || 0));

const HEART_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>';
const NAV_SVG = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>';
const PLAY_SVG = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';

// ---------------- Grid ----------------

function updateView() {
    const term = filterState.search.trim().toLocaleLowerCase("tr");
    let result = allContent.filter((item) => {
        if (filterState.type === "movie" && !isMovie(item)) return false;
        if (filterState.type === "show" && isMovie(item)) return false;
        return !term || String(item.title || "").toLocaleLowerCase("tr").includes(term);
    });

    const year = (item, missing) => parseInt(item.year, 10) || missing;
    const byTitle = (a, b) => String(a.title || "").localeCompare(String(b.title || ""), "tr");
    const sorters = {
        newest: (a, b) => year(b, 0) - year(a, 0),
        oldest: (a, b) => year(a, 9999) - year(b, 9999),
        az: byTitle,
        za: (a, b) => byTitle(b, a)
    };
    result.sort(sorters[filterState.sort] || sorters.newest);
    $("resultCount").textContent = tp("explore.result", result.length);
    renderGrid(result);
}

function renderGrid(items) {
    if (items.length === 0) {
        grid.innerHTML = `<p>${escapeHtml(t("explore.noResults"))}</p>`;
        return;
    }
    const fragment = document.createDocumentFragment();
    for (const item of items) {
        const card = document.createElement("div");
        card.className = "movie-card";
        card.dataset.id = item.id;
        card.tabIndex = 0;
        card.innerHTML = `
            <div class="poster-wrapper">
                <img alt="${escapeHtml(item.title)}" class="poster-img" loading="lazy">
                ${item.rating ? `<div class="rating-badge-card">★ ${escapeHtml(item.rating)}</div>` : ""}
                <button type="button" class="fav-btn ${favorites.has(item.id) ? "active" : ""}" title="${escapeHtml(t("explore.addFavorite"))}" aria-label="${escapeHtml(t("explore.addFavorite"))}">${HEART_SVG}</button>
            </div>
            <div class="card-info">
                <div class="card-header">
                    <h3 class="card-title" dir="auto">${escapeHtml(item.title)}</h3>
                    ${item.year ? `<span class="year-meta-card">${escapeHtml(item.year)}</span>` : ""}
                </div>
                <div class="card-meta">
                    <span>${escapeHtml(t(isMovie(item) ? "explore.movie" : "explore.show"))}</span>
                    <span class="loc-badge">${escapeHtml(locationsLabel(validLocations(item).length))}</span>
                </div>
            </div>`;
        const img = withFallback(card.querySelector("img"));
        img.src = safeUrl(item.poster, { fallback: PLACEHOLDER_POSTER });
        fragment.appendChild(card);
    }
    grid.replaceChildren(fragment);
}

// One delegated listener instead of one per card.
grid.addEventListener("click", async (e) => {
    const card = e.target.closest(".movie-card");
    if (!card) return;
    const item = allContent.find((m) => m.id === card.dataset.id);
    if (!item) return;
    const favBtn = e.target.closest(".fav-btn");
    if (favBtn) {
        e.stopPropagation();
        await onFavoriteClick(item.id, favBtn);
    } else {
        openModal(item);
    }
});
grid.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.classList.contains("movie-card")) e.target.click();
});

async function onFavoriteClick(id, btn) {
    if (!auth.currentUser) {
        window.location.href = "login.html?next=explore.html";
        return;
    }
    const wasFav = favorites.has(id);
    btn.classList.toggle("active", !wasFav);
    btn.disabled = true;
    const result = await toggleFavorite(id, wasFav);
    btn.disabled = false;
    if (result.success) {
        wasFav ? favorites.delete(id) : favorites.add(id);
    } else {
        btn.classList.toggle("active", wasFav);
    }
}

// ---------------- Detail modal ----------------

async function openModal(item) {
    currentItemId = item.id;
    const locations = validLocations(item);
    const poster = safeUrl(item.poster, { fallback: PLACEHOLDER_POSTER });

    withFallback($("mPoster")).src = poster;
    $("mPoster").alt = item.title || "";
    $("mPosterBg").style.backgroundImage = `url(${JSON.stringify(poster)})`;
    $("mTitle").textContent = item.title || "";
    $("mDesc").textContent = item.description || "";
    $("mType").textContent = t(isMovie(item) ? "explore.movie" : "explore.show");

    const yearEl = $("mYear");
    yearEl.textContent = item.year || "";
    yearEl.hidden = !item.year;
    $("mRatingVal").textContent = item.rating || "";
    $("mRatingBox").hidden = !item.rating;

    const spotifyBtn = $("spotifyBtn");
    const { href: spotifyHref, isSearch } = spotifyLink(item);
    spotifyBtn.href = spotifyHref;
    spotifyBtn.title = t(isSearch ? "explore.spotifySearch" : "explore.spotifyListen");
    spotifyBtn.setAttribute("aria-label", spotifyBtn.title);
    spotifyBtn.hidden = !spotifyHref;

    const routeBtn = $("startRouteBtn");
    const mapDiv = $("osm-map");
    const list = $("mLocations");
    routeBtn.hidden = true;
    mapDiv.hidden = true;
    $("mLocCount").textContent = locations.length ? formatNumber(locations.length) : "";
    list.replaceChildren();
    activeIndex = -1;
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
    modal.querySelector(".modal-details").scrollTop = 0;

    if (locations.length === 0) {
        list.innerHTML = `<p>${escapeHtml(t("explore.noLocations"))}</p>`;
        return;
    }

    // Map first (above the list), then the list.
    routeBtn.hidden = false;
    routeBtn.onclick = () => window.open(buildRouteUrl(locations), "_blank", "noopener,noreferrer");
    mapDiv.hidden = false;
    renderMap(item, locations);

    const ratings = await getUserRatingsForMovie(item.id);
    if (currentItemId !== item.id) return; // user already opened another item
    locations.forEach((loc, index) => list.appendChild(renderLocation(item, loc, index, ratings[index] || 0)));
}

const locationsLabel = (n) => tp("explore.location", n);

function renderLocation(item, loc, index, currentRating) {
    const div = document.createElement("div");
    div.className = "location-item";
    const video = safeUrl(loc.scene);
    let stars = "";
    for (let i = 1; i <= 5; i++) {
        stars += `<button type="button" class="star ${i <= currentRating ? "filled" : ""}" data-val="${i}" aria-label="${escapeHtml(t("explore.stars", { n: i }))}">★</button>`;
    }
    div.innerHTML = `
        <div class="loc-header">
            <div class="loc-number">${index + 1}</div>
            <button type="button" class="loc-info" title="${escapeHtml(t("explore.showOnMap"))}">
                <strong dir="auto">${escapeHtml(loc.name)}</strong>
                <small dir="ltr">${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}</small>
            </button>
            <button type="button" class="play-icon-left ${video ? "" : "disabled"}" ${video ? `title="${escapeHtml(t("explore.playScene"))}" aria-label="${escapeHtml(t("explore.playScene"))}"` : "disabled"}>${PLAY_SVG}</button>
            <a class="loc-go-btn" target="_blank" rel="noopener noreferrer" title="${escapeHtml(t("explore.directions"))}" aria-label="${escapeHtml(t("explore.directionsTo", { name: loc.name }))}">${NAV_SVG}</a>
        </div>
        <div class="rating-container">
            <span class="rating-label">${escapeHtml(t("explore.yourRating"))}</span>
            ${stars}
            <span class="user-only-msg">${escapeHtml(t("explore.loginRequired"))}</span>
        </div>`;
    div.dataset.index = index;

    if (video) div.querySelector(".play-icon-left").addEventListener("click", () => playSceneVideo(video));
    div.querySelector(".loc-go-btn").href = buildDirectionsUrl(loc);
    div.querySelector(".loc-info").addEventListener("click", () => focusLocation(index));

    const starEls = div.querySelectorAll(".star");
    const paint = (val) => starEls.forEach((s) => s.classList.toggle("filled", Number(s.dataset.val) <= val));
    starEls.forEach((star) => star.addEventListener("click", async () => {
        if (!auth.currentUser) {
            const msg = div.querySelector(".user-only-msg");
            msg.style.display = "inline";
            setTimeout(() => { msg.style.display = "none"; }, 2000);
            return;
        }
        const val = Number(star.dataset.val);
        const previous = div.querySelectorAll(".star.filled").length;
        paint(val);
        const result = await saveUserRating(item.id, index, val);
        if (!result.success) paint(previous);
    }));
    return div;
}

/**
 * The content's own Spotify link if it has a valid one; otherwise a Spotify search
 * for its soundtrack (e.g. "Ezel dizi müzikleri"), so every title gets a music button.
 */
function spotifyLink(item) {
    const own = safeUrl(item.spotify);
    if (own && new URL(own).hostname === "open.spotify.com") return { href: own, isSearch: false };
    const title = String(item.title || "").trim();
    if (!title) return { href: "", isSearch: true };
    const query = `${title} ${isMovie(item) ? "film" : "dizi"} müzikleri`;
    return { href: `https://open.spotify.com/search/${encodeURIComponent(query)}`, isSearch: true };
}

/** Directions from the visitor's current position to a single location. */
function buildDirectionsUrl(loc) {
    return `https://www.google.com/maps/dir/?${new URLSearchParams({ api: "1", destination: `${loc.lat},${loc.lng}` })}`;
}

/** Highlight one location in both the map and the list. */
function setActive(index, { fromMap = false } = {}) {
    activeIndex = index;
    mapMarkers.forEach((m, i) => m.getElement()?.classList.toggle("is-active", i === index));
    document.querySelectorAll("#mLocations .location-item").forEach((el) => el.classList.toggle("is-active", Number(el.dataset.index) === index));
    if (fromMap) document.querySelector(`#mLocations .location-item[data-index="${index}"]`)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

/** Zoom the map (which sits above the list) to one location and open its popup. */
function focusLocation(index) {
    const marker = mapMarkers[index];
    if (!mapInstance || !marker) return;
    setActive(index);
    mapInstance.flyTo(marker.getLatLng(), 16, { duration: 0.6 });
    marker.openPopup();
    $("osm-map").scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function buildRouteUrl(locs) {
    const ll = (l) => `${l.lat},${l.lng}`;
    if (locs.length === 1) return `https://www.google.com/maps/search/?api=1&query=${ll(locs[0])}`;
    const params = new URLSearchParams({
        api: "1",
        origin: ll(locs[0]),
        destination: ll(locs[locs.length - 1]),
        travelmode: "driving"
    });
    if (locs.length > 2) params.set("waypoints", locs.slice(1, -1).map(ll).join("|"));
    return `https://www.google.com/maps/dir/?${params}`;
}

function renderMap(item, locs) {
    if (typeof L === "undefined") return;
    if (mapInstance) mapInstance.remove();
    mapInstance = L.map("osm-map", { scrollWheelZoom: false }).setView([locs[0].lat, locs[0].lng], 14);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>'
    }).addTo(mapInstance);
    const points = locs.map((loc) => [loc.lat, loc.lng]);
    if (points.length > 1) L.polyline(points, { color: "#e50914", weight: 3, opacity: 0.85, dashArray: "6 8" }).addTo(mapInstance);
    mapMarkers = locs.map((loc, i) => L.marker([loc.lat, loc.lng], {
        title: loc.name,
        icon: L.divIcon({ className: "map-pin", html: `<span><b>${i + 1}</b></span>`, iconSize: [30, 30], iconAnchor: [15, 30], popupAnchor: [0, -28] })
    }).addTo(mapInstance)
        .bindPopup(`<b>${i + 1}. ${escapeHtml(loc.name)}</b><br>${escapeHtml(item.title)}`)
        .on("click", () => setActive(i, { fromMap: true })));
    if (points.length > 1) mapInstance.fitBounds(L.latLngBounds(points), { padding: [36, 36], maxZoom: 15 });
    // The modal animates in; let Leaflet measure the final size.
    setTimeout(() => mapInstance?.invalidateSize(), 350);
}

function closeModal() {
    modal.style.display = "none";
    document.body.style.overflow = "";
    currentItemId = null;
    if (mapInstance) { mapInstance.remove(); mapInstance = null; }
    mapMarkers = [];
}

function playSceneVideo(url) {
    videoPlayer.src = url;
    videoModal.style.display = "flex";
    requestAnimationFrame(() => {
        videoModal.classList.add("active");
        videoPlayer.play().catch(() => {});
    });
}

function closeSceneVideo() {
    videoModal.classList.remove("active");
    videoPlayer.pause();
    setTimeout(() => { videoModal.style.display = "none"; videoPlayer.removeAttribute("src"); videoPlayer.load(); }, 300);
}

// ---------------- Wiring ----------------

$("modalClose").addEventListener("click", closeModal);
modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
$("videoClose").addEventListener("click", closeSceneVideo);
videoModal.addEventListener("click", (e) => { if (e.target === videoModal) closeSceneVideo(); });
document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (videoModal.style.display === "flex") closeSceneVideo();
    else if (modal.style.display === "flex") closeModal();
});

document.querySelectorAll(".filter-btn").forEach((btn) => btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach((b) => b.classList.toggle("active", b === btn));
    filterState.type = btn.dataset.filter;
    updateView();
}));
let searchTimer;
$("searchInput").addEventListener("input", (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => { filterState.search = e.target.value; updateView(); }, 150);
});
$("sortSelect").addEventListener("change", (e) => { filterState.sort = e.target.value; updateView(); });

// The catalog is for members only (enforced by firestore.rules).
function showLoginPrompt() {
    allContent = [];
    grid.replaceChildren();
    loader.style.display = "block";
    $("resultCount").textContent = "";
    const next = encodeURIComponent(`explore.html${location.search}`);
    // Dictionary text is trusted; only the {login}/{signup} links are inserted.
    loader.innerHTML = escapeHtml(t("explore.loginPrompt"))
        .replace("{login}", `<a href="login.html?next=${next}">${escapeHtml(t("explore.loginLink"))}</a>`)
        .replace("{signup}", `<a href="signup.html">${escapeHtml(t("explore.signupLink"))}</a>`);
}

async function loadContent(user) {
    loader.style.display = "block";
    loader.textContent = t("common.loading");
    try {
        const [contents, data] = await Promise.all([getAllContents(), getUserData(user.uid)]);
        allContent = contents;
        favorites = new Set(data?.favorites || []);
        loader.style.display = "none";
        // explore.html?q=Ezel pre-fills the search (used by the home page posters).
        const q = (new URLSearchParams(location.search).get("q") || "").trim().slice(0, 80);
        if (q) { filterState.search = q; $("searchInput").value = q; }
        updateView();
        const target = allContent.find((m) => m.id === new URLSearchParams(location.search).get("id"));
        if (target) openModal(target);
    } catch (error) {
        console.error("Content load failed:", error?.code || error);
        loader.textContent = t("explore.loadFailed");
    }
}

onUserChange((user) => {
    if (user) loadContent(user);
    else { closeModal(); showLoginPrompt(); }
});
