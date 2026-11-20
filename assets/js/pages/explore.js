import {
    auth, onUserChange, getAllContents, getUserData,
    toggleFavorite, getUserRatingsForMovie, saveUserRating
} from "../auth_manager.js";
import { escapeHtml, safeUrl, withFallback, PLACEHOLDER_POSTER } from "../utils.js";

const $ = (id) => document.getElementById(id);
const grid = $("contentGrid");
const loader = $("loader");
const modal = $("detailModal");
const videoModal = $("sceneVideoModal");
const videoPlayer = $("sceneVideoPlayer");

let allContent = [];
let favorites = new Set();
let mapInstance = null;
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
    renderGrid(result);
}

function renderGrid(items) {
    if (items.length === 0) {
        grid.innerHTML = "<p>No results found.</p>";
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
                <button type="button" class="fav-btn ${favorites.has(item.id) ? "active" : ""}" title="Add to Favorites" aria-label="Add to Favorites">${HEART_SVG}</button>
            </div>
            <div class="card-info">
                <div class="card-header">
                    <h3 class="card-title">${escapeHtml(item.title)}</h3>
                    ${item.year ? `<span class="year-meta-card">${escapeHtml(item.year)}</span>` : ""}
                </div>
                <div class="card-meta">
                    <span>${isMovie(item) ? "Movie" : "Tv Show"}</span>
                    <span class="loc-badge">${validLocations(item).length} Locations</span>
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
    $("mType").textContent = isMovie(item) ? "MOVIE" : "TV SHOW";

    const yearEl = $("mYear");
    yearEl.textContent = item.year || "";
    yearEl.style.display = item.year ? "inline-block" : "none";
    $("mRatingVal").textContent = item.rating || "";
    $("mRatingBox").style.display = item.rating ? "flex" : "none";

    const spotify = safeUrl(item.spotify);
    const spotifyBtn = $("spotifyBtn");
    const isSpotify = spotify && new URL(spotify).hostname === "open.spotify.com";
    spotifyBtn.href = isSpotify ? spotify : "#";
    spotifyBtn.style.display = isSpotify ? "flex" : "none";

    const routeBtn = $("startRouteBtn");
    const mapDiv = $("osm-map");
    const list = $("mLocations");
    routeBtn.style.display = "none";
    mapDiv.style.display = "none";
    list.replaceChildren();
    modal.style.display = "flex";

    if (locations.length === 0) {
        list.innerHTML = "<p style='color:#666;'>No location information available yet.</p>";
        return;
    }

    const ratings = await getUserRatingsForMovie(item.id);
    if (currentItemId !== item.id) return; // user already opened another item

    locations.forEach((loc, index) => list.appendChild(renderLocation(item, loc, index, ratings[index] || 0)));

    routeBtn.style.display = "block";
    routeBtn.onclick = () => window.open(buildRouteUrl(locations), "_blank", "noopener,noreferrer");

    mapDiv.style.display = "block";
    renderMap(item, locations);
}

function renderLocation(item, loc, index, currentRating) {
    const div = document.createElement("div");
    div.className = "location-item";
    const video = safeUrl(loc.scene);
    let stars = "";
    for (let i = 1; i <= 5; i++) {
        stars += `<button type="button" class="star ${i <= currentRating ? "filled" : ""}" data-val="${i}" aria-label="${i} stars">★</button>`;
    }
    div.innerHTML = `
        <div class="loc-header">
            <button type="button" class="play-icon-left ${video ? "" : "disabled"}" ${video ? 'title="Play Scene"' : "disabled"}>${PLAY_SVG}</button>
            <div class="loc-number">${index + 1}</div>
            <div style="flex:1; margin-left:15px;">
                <strong style="color:white; display:block;">${escapeHtml(loc.name)}</strong>
                <small style="color:#666;">${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}</small>
            </div>
        </div>
        <div class="rating-container">
            <span class="rating-label">Your Rating:</span>
            ${stars}
            <span class="user-only-msg">Login required!</span>
        </div>`;

    if (video) div.querySelector(".play-icon-left").addEventListener("click", () => playSceneVideo(video));

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
    mapInstance = L.map("osm-map").setView([locs[0].lat, locs[0].lng], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "&copy; OpenStreetMap" }).addTo(mapInstance);
    const points = locs.map((loc, i) => {
        const point = [loc.lat, loc.lng];
        L.marker(point).addTo(mapInstance)
            .bindPopup(`<b>${i + 1}. ${escapeHtml(loc.name)}</b><br>${escapeHtml(item.title)}`);
        return point;
    });
    if (points.length > 1) {
        mapInstance.fitBounds(L.polyline(points, { color: "#e50914", weight: 4 }).addTo(mapInstance).getBounds());
    }
}

function closeModal() {
    modal.style.display = "none";
    currentItemId = null;
    if (mapInstance) { mapInstance.remove(); mapInstance = null; }
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

async function loadContent() {
    try {
        allContent = await getAllContents();
        loader.style.display = "none";
        updateView();
        const target = allContent.find((m) => m.id === new URLSearchParams(location.search).get("id"));
        if (target) openModal(target);
    } catch (error) {
        console.error("Content load failed:", error?.code || error);
        loader.textContent = "Content could not be loaded. Please try again later.";
    }
}

const contentLoaded = loadContent();

// Favourites depend on the signed-in user; content does not, so load it only once.
onUserChange(async (user) => {
    const data = user ? await getUserData(user.uid) : null;
    favorites = new Set(data?.favorites || []);
    await contentLoaded;
    if (allContent.length) updateView();
});
