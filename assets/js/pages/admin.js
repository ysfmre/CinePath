// Content manager. Access is checked here for UX, but the real protection is
// firestore.rules: only users whose users/{uid}.role == "admin" can write to /contents.
import { onUserChange, isAdmin, addContents, addContent } from "../auth_manager.js";
import { safeUrl } from "../utils.js";

const $ = (id) => document.getElementById(id);
const panel = $("adminPanel");
const gate = $("adminGate");

onUserChange(async (user) => {
    if (!user) {
        window.location.replace("login.html?next=admin.html");
        return;
    }
    const allowed = await isAdmin(user.uid);
    gate.textContent = allowed ? "" : "Access denied. This page is only available to administrators.";
    gate.style.display = allowed ? "none" : "block";
    panel.style.display = allowed ? "grid" : "none";
});

// ---------------- Helpers ----------------

function distanceKm(a, b) {
    const R = 6371;
    const rad = (d) => (d * Math.PI) / 180;
    const dLat = rad(b.lat - a.lat);
    const dLng = rad(b.lng - a.lng);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/** Nearest-neighbour ordering so the route visits locations in a sensible sequence. */
function optimizeRoute(locations) {
    if (locations.length < 2) return locations.map((l, i) => ({ ...l, order: i + 1 }));
    const sorted = [locations[0]];
    const remaining = locations.slice(1);
    while (remaining.length) {
        const current = sorted[sorted.length - 1];
        let best = 0;
        remaining.forEach((loc, i) => { if (distanceKm(current, loc) < distanceKm(current, remaining[best])) best = i; });
        sorted.push(remaining.splice(best, 1)[0]);
    }
    return sorted.map((loc, i) => ({ ...loc, order: i + 1 }));
}

const clean = (v, max) => String(v ?? "").trim().slice(0, max);
const parseCoord = (v) => (typeof v === "number" ? v : parseFloat(String(v ?? "").replace(/,/g, ".").trim()));
const validCoord = (lat, lng) => Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
const normalizeType = (raw) => (/dizi|series|show|tv/i.test(String(raw)) ? "Tv Show" : "Movie");

function buildContent({ title, type, poster, description, spotify, rating, year, locations }) {
    return {
        title: clean(title, 150),
        type: normalizeType(type),
        poster: safeUrl(clean(poster, 1000)),
        description: clean(description, 3000),
        spotify: safeUrl(clean(spotify, 500)),
        rating: clean(rating, 10),
        year: clean(year, 10),
        locations: optimizeRoute(locations.slice(0, 100))
    };
}

// ---------------- Excel bulk import ----------------

let bulkData = [];
const bulkBtn = $("bulkUploadBtn");

function getVal(row, keys) {
    const norm = (k) => k.toLowerCase().replace(/[^a-z0-9]/g, "");
    const wanted = keys.map(norm);
    const found = Object.keys(row).find((k) => wanted.includes(norm(k)));
    return found === undefined ? undefined : row[found];
}

function processExcelData(rows) {
    const grouped = new Map();
    let lastTitle = "";
    for (const row of rows) {
        const title = clean(getVal(row, ["Movie/Series Title", "Movie Title", "Title", "Baslik", "Ad", "Film Adi"]), 150) || lastTitle;
        if (!title) continue;
        lastTitle = title;

        if (!grouped.has(title)) {
            grouped.set(title, {
                title,
                type: getVal(row, ["Type", "Tur"]) || "Movie",
                poster: getVal(row, ["Poster", "Resim", "Image"]),
                description: getVal(row, ["Description", "Aciklama"]),
                spotify: getVal(row, ["Spotify", "Music"]),
                rating: getVal(row, ["Rating", "IMDB", "Puan"]),
                year: getVal(row, ["Year", "Yil", "Date"]),
                locations: []
            });
        }
        const entry = grouped.get(title);

        let lat = getVal(row, ["Lat", "Latitude", "Enlem"]);
        let lng = getVal(row, ["Lng", "Longitude", "Boylam"]);
        if (!lat && !lng) {
            const combined = getVal(row, ["LatLng", "Lat Lng", "locations", "Coordinates", "Koordinat"]);
            const parts = String(combined ?? "").split(/[\t,\s]+/).filter(Boolean);
            if (parts.length >= 2) [lat, lng] = parts;
        }
        lat = parseCoord(lat);
        lng = parseCoord(lng);
        if (validCoord(lat, lng)) {
            const name = clean(getVal(row, ["Location Name (English)", "Location Name", "LocationName", "Mekan", "Yer"]), 150);
            entry.locations.push({ name: name || `Location ${entry.locations.length + 1}`, lat, lng });
        }
    }

    bulkData = [...grouped.values()].map(buildContent);
    const preview = $("jsonPreview");
    preview.style.display = "block";
    preview.textContent = bulkData.map((m) => `🎬 ${m.title} [${m.type}] (${m.locations.length} Lokasyon)`).join("\n")
        + "\n\n--- JSON ---\n" + JSON.stringify(bulkData, null, 2);
    bulkBtn.style.display = "block";
    bulkBtn.disabled = bulkData.length === 0;
    bulkBtn.textContent = `${bulkData.length} İÇERİK HAZIR - YÜKLEMEYİ BAŞLAT 🚀`;
}

$("excelFile").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert("Dosya 5 MB'tan büyük olamaz."); return; }
    const reader = new FileReader();
    reader.onload = () => {
        try {
            const workbook = XLSX.read(new Uint8Array(reader.result), { type: "array" });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            processExcelData(XLSX.utils.sheet_to_json(sheet, { defval: "" }));
        } catch (err) {
            console.error(err);
            alert("Dosya okunamadı.");
        }
    };
    reader.readAsArrayBuffer(file);
});

bulkBtn.addEventListener("click", async () => {
    if (!bulkData.length) return;
    const status = $("bulkStatus");
    bulkBtn.disabled = true;
    bulkBtn.textContent = "Veritabanına Yazılıyor...";
    status.style.display = "block";
    try {
        const saved = await addContents(bulkData);
        status.style.background = "#10b981";
        status.textContent = `✅ İşlem Tamam! ${saved} adet içerik veritabanına eklendi.`;
        bulkBtn.textContent = "YÜKLEME BİTTİ";
    } catch (err) {
        console.error(err);
        status.style.background = "#b91c1c";
        status.textContent = "❌ Yükleme başarısız (yetki veya bağlantı hatası).";
        bulkBtn.disabled = false;
        bulkBtn.textContent = "TEKRAR DENE";
    }
});

// ---------------- Manual entry ----------------

function addLocationField() {
    const row = document.createElement("div");
    row.className = "location-item";
    row.innerHTML = `<input type="text" placeholder="Mekan" class="loc-name" maxlength="150">
        <input type="number" step="any" min="-90" max="90" placeholder="Lat" class="loc-lat">
        <input type="number" step="any" min="-180" max="180" placeholder="Lng" class="loc-lng">
        <button type="button" class="btn btn-del">Sil</button>`;
    row.querySelector(".btn-del").addEventListener("click", () => row.remove());
    $("locationsContainer").appendChild(row);
}

$("addLocationBtn").addEventListener("click", addLocationField);
$("saveManualBtn").addEventListener("click", async () => {
    const title = clean($("title").value, 150);
    if (!title) return alert("Başlık giriniz");

    const locations = [...document.querySelectorAll(".location-item")].map((el) => ({
        name: clean(el.querySelector(".loc-name").value, 150),
        lat: parseFloat(el.querySelector(".loc-lat").value),
        lng: parseFloat(el.querySelector(".loc-lng").value)
    })).filter((l) => validCoord(l.lat, l.lng));

    const btn = $("saveManualBtn");
    btn.disabled = true;
    try {
        await addContent(buildContent({
            title,
            type: $("type").value,
            poster: $("poster").value,
            spotify: $("spotify").value,
            description: $("description").value,
            locations
        }));
        alert("Kaydedildi!");
        location.reload();
    } catch (err) {
        console.error(err);
        alert("Kaydedilemedi (yetki veya bağlantı hatası).");
        btn.disabled = false;
    }
});

addLocationField();
