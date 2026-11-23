import {
    onUserChange, getUserData, logoutUser, addUserPhoto, getUserPhotos,
    deleteUserPhoto, getContentsByIds, updateUserPassword, deleteAccount, MAX_PHOTO_BYTES
} from "../auth_manager.js";
import { escapeHtml, safeUrl, withFallback, friendlyError, initialsAvatar, PLACEHOLDER_POSTER } from "../utils.js";
import { t, lang } from "../i18n.js";

const levelTitle = (level) => t(`level.${Math.min(Math.max(Number(level) || 1, 1), 10)}`);

const $ = (id) => document.getElementById(id);
const EMPTY = (text) => `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 20px;">${escapeHtml(text)}</p>`;
let currentUid = null;
let selectedImage = null;

// ---------------- Rendering ----------------

function renderStats(data) {
    const xp = data.xp || 0;
    const nextXp = data.nextLevelXp || 100;
    $("currentXp").textContent = xp;
    $("nextXp").textContent = nextXp;
    $("userLevel").textContent = data.level || 1;
    $("userTitle").textContent = levelTitle(data.level);
    $("xpBar").style.width = `${Math.min(100, (xp / nextXp) * 100)}%`;
    $("statLoc").textContent = data.stats?.visitedLocations || 0;
    $("statRev").textContent = data.stats?.reviews || 0;
    $("statPhoto").textContent = data.stats?.photos || 0;
}

async function refreshUserData() {
    const data = currentUid && await getUserData(currentUid);
    if (data) renderStats(data);
    return data;
}

async function loadProfile(user) {
    currentUid = user.uid;
    const data = (await getUserData(user.uid)) || {};
    const name = data.name || user.displayName || t("profile.user");

    $("displayName").textContent = name;
    $("displayEmail").textContent = data.email || user.email || "";
    // Admin access is decided by the Firestore role (and enforced by security rules), not by e-mail.
    $("adminBtn").style.display = data.role === "admin" ? "block" : "none";

    const fallbackAvatar = initialsAvatar(name);
    const avatar = withFallback($("currentAvatar"), fallbackAvatar);
    avatar.referrerPolicy = "no-referrer";
    avatar.src = safeUrl(data.photoURL || user.photoURL, { fallback: fallbackAvatar });

    let joined = t("profile.newMember");
    if (data.createdAt) {
        const date = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
        if (!Number.isNaN(date.getTime())) joined = t("profile.joined", { date: date.toLocaleDateString(lang, { year: "numeric", month: "long" }) });
    }
    $("joinDate").textContent = joined;
    renderStats(data);

    const isPasswordUser = user.providerData.some((p) => p.providerId === "password");
    $("openPasswordBtn").style.display = isPasswordUser ? "flex" : "none";
    $("deletePassword").hidden = !isPasswordUser;
    $("deleteGoogleHint").hidden = isPasswordUser;

    loadUserPhotos(user.uid);
    loadFavorites(data.favorites || []);
}

async function loadUserPhotos(uid) {
    const grid = $("userPhotosGrid");
    const photos = await getUserPhotos(uid);
    if (photos.length === 0) {
        grid.innerHTML = EMPTY(t("profile.noPhotos"));
        return;
    }
    const fragment = document.createDocumentFragment();
    for (const photo of photos) {
        const src = safeUrl(photo.image, { allowDataImage: true });
        if (!src) continue;
        const card = document.createElement("div");
        card.className = "user-photo-card";
        card.dataset.photoId = photo.id;
        card.innerHTML = `
            <img class="user-photo-img" loading="lazy" alt="${escapeHtml(photo.caption || photo.locationName)}">
            <button type="button" class="delete-photo-btn" aria-label="${escapeHtml(t("profile.deletePhoto"))}">×</button>
            <div class="photo-overlay"><span class="photo-location">📍 ${escapeHtml(photo.locationName)}</span></div>`;
        card.querySelector("img").src = src;
        fragment.appendChild(card);
    }
    grid.replaceChildren(fragment);
}

async function loadFavorites(favIds) {
    const grid = $("favoritesGrid");
    if (favIds.length === 0) {
        grid.innerHTML = EMPTY(t("profile.noFavorites"));
        return;
    }
    grid.innerHTML = EMPTY(t("common.loading"));
    try {
        const movies = await getContentsByIds(favIds);
        if (movies.length === 0) {
            grid.innerHTML = EMPTY(t("profile.noFavorites"));
            return;
        }
        const fragment = document.createDocumentFragment();
        for (const movie of movies) {
            const link = document.createElement("a");
            link.className = "user-photo-card";
            link.href = `explore.html?id=${encodeURIComponent(movie.id)}`;
            link.style.aspectRatio = "2/3";
            link.innerHTML = `
                <img class="user-photo-img" loading="lazy" alt="${escapeHtml(movie.title)}" style="width:100%; height:100%; object-fit:cover;">
                <div class="photo-overlay"><span class="photo-location" style="font-size:12px;">${escapeHtml(movie.title)}</span></div>`;
            withFallback(link.querySelector("img")).src = safeUrl(movie.poster, { fallback: PLACEHOLDER_POSTER });
            fragment.appendChild(link);
        }
        grid.replaceChildren(fragment);
    } catch {
        grid.innerHTML = EMPTY(t("profile.favoritesFailed"));
    }
}

function showLevelUp(level) {
    const overlay = document.createElement("div");
    overlay.className = "level-up-notification";
    overlay.innerHTML = `
        <div class="level-up-content">
            <span class="level-up-icon">🎉</span>
            <h3>${escapeHtml(t("profile.levelUp"))}</h3>
            <p>${t("profile.reachedLevel", { n: escapeHtml(level) })}</p>
            <p class="new-title">${escapeHtml(levelTitle(level))}</p>
        </div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener("click", () => overlay.remove());
    setTimeout(() => overlay.remove(), 4000);
}

// ---------------- Photo upload ----------------

const uploadModal = $("uploadModal");
const photoInput = $("photoInput");
const confirmUploadBtn = $("confirmUploadBtn");

function closeUploadModal() {
    uploadModal.style.display = "none";
    photoInput.value = "";
    $("photoLocation").value = "";
    $("photoCaption").value = "";
    $("fileName").textContent = t("profile.selectPhoto");
    selectedImage = null;
    confirmUploadBtn.disabled = true;
}

/** Re-encode the image through a canvas: strips EXIF/GPS metadata and any non-image payload. */
function resizeImage(file, maxSize = 800) {
    return new Promise((resolve, reject) => {
        if (!/^image\/(jpeg|png|webp|gif)$/.test(file.type) || file.size > 15 * 1024 * 1024) {
            reject(new Error(t("profile.imageType")));
            return;
        }
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(url);
            const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
            const canvas = document.createElement("canvas");
            canvas.width = Math.round(img.width * scale);
            canvas.height = Math.round(img.height * scale);
            canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
            let quality = 0.75;
            let data = canvas.toDataURL("image/jpeg", quality);
            while (data.length > MAX_PHOTO_BYTES && quality > 0.3) {
                quality -= 0.15;
                data = canvas.toDataURL("image/jpeg", quality);
            }
            data.length > MAX_PHOTO_BYTES ? reject(new Error(t("profile.imageTooLarge"))) : resolve(data);
        };
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error(t("profile.imageInvalid"))); };
        img.src = url;
    });
}

photoInput.addEventListener("change", async () => {
    const file = photoInput.files[0];
    if (!file) return;
    $("fileName").textContent = file.name;
    confirmUploadBtn.disabled = true;
    try {
        selectedImage = await resizeImage(file);
        confirmUploadBtn.disabled = false;
    } catch (e) {
        selectedImage = null;
        $("fileName").textContent = e.message;
    }
});

confirmUploadBtn.addEventListener("click", async () => {
    if (!selectedImage || !currentUid) return;
    confirmUploadBtn.textContent = t("profile.saving");
    confirmUploadBtn.disabled = true;
    const result = await addUserPhoto({
        image: selectedImage,
        locationName: $("photoLocation").value.trim(),
        caption: $("photoCaption").value.trim()
    });
    confirmUploadBtn.textContent = t("profile.upload");
    if (result.success) {
        closeUploadModal();
        loadUserPhotos(currentUid);
        const data = await refreshUserData();
        if (result.leveledUp && data) showLevelUp(data.level);
    } else {
        confirmUploadBtn.disabled = false;
        alert(friendlyError(result.error, "err.photoSave"));
    }
});

$("userPhotosGrid").addEventListener("click", async (e) => {
    const btn = e.target.closest(".delete-photo-btn");
    if (!btn) return;
    const card = btn.closest(".user-photo-card");
    if (!confirm(t("profile.deleteConfirm"))) return;
    card.style.opacity = "0.5";
    const result = await deleteUserPhoto(card.dataset.photoId);
    if (result.success) {
        card.remove();
        if (!$("userPhotosGrid").children.length) $("userPhotosGrid").innerHTML = EMPTY(t("profile.noPhotos"));
        refreshUserData();
    } else {
        card.style.opacity = "1";
        alert(friendlyError(result.error, "err.photoDelete"));
    }
});

// ---------------- Password ----------------

const passwordModal = $("passwordModal");
function closePasswordModal() {
    passwordModal.style.display = "none";
    ["currentPassword", "newPassword", "confirmNewPassword"].forEach((id) => { $(id).value = ""; });
}

$("confirmPasswordBtn").addEventListener("click", async () => {
    const current = $("currentPassword").value;
    const next = $("newPassword").value;
    if (!current || !next || !$("confirmNewPassword").value) return alert(t("profile.fillAll"));
    if (next !== $("confirmNewPassword").value) return alert(t("profile.mismatch"));
    if (next.length < 8 || !/[A-Za-z]/.test(next) || !/\d/.test(next)) {
        return alert(t("auth.passwordRule"));
    }
    const btn = $("confirmPasswordBtn");
    btn.textContent = t("profile.updating");
    btn.disabled = true;
    const result = await updateUserPassword(current, next);
    btn.textContent = t("profile.update");
    btn.disabled = false;
    if (result.success) {
        alert(t("profile.passwordUpdated"));
        closePasswordModal();
    } else {
        alert(friendlyError(result.error, "err.passwordUpdate"));
    }
});

// ---------------- Delete account ----------------

const deleteModal = $("deleteModal");
let deleting = false;
function closeDeleteModal() {
    deleteModal.style.display = "none";
    $("deletePassword").value = "";
    $("deleteConfirm").checked = false;
    $("confirmDeleteBtn").disabled = true;
}
$("deleteConfirm").addEventListener("change", (e) => { $("confirmDeleteBtn").disabled = !e.target.checked; });

$("confirmDeleteBtn").addEventListener("click", async () => {
    const needsPassword = !$("deletePassword").hidden;
    const password = $("deletePassword").value;
    if (needsPassword && !password) return alert(t("profile.fillAll"));
    const btn = $("confirmDeleteBtn");
    btn.disabled = true;
    btn.textContent = t("profile.deleting");
    deleting = true;
    const result = await deleteAccount(password);
    if (result.success) {
        alert(t("profile.deleted"));
        window.location.replace("index.html");
        return;
    }
    deleting = false;
    btn.textContent = t("profile.deleteForever");
    btn.disabled = !$("deleteConfirm").checked;
    alert(friendlyError(result.error, "err.deleteAccount"));
});

// ---------------- Wiring ----------------

document.querySelectorAll("[data-logout]").forEach((b) => b.addEventListener("click", logoutUser));
$("openUploadBtn").addEventListener("click", () => { uploadModal.style.display = "flex"; });
$("cancelUploadBtn").addEventListener("click", closeUploadModal);
$("openPasswordBtn").addEventListener("click", () => { passwordModal.style.display = "flex"; });
$("cancelPasswordBtn").addEventListener("click", closePasswordModal);
$("openDeleteBtn").addEventListener("click", () => { deleteModal.style.display = "flex"; });
$("cancelDeleteBtn").addEventListener("click", closeDeleteModal);
const closers = new Map([[uploadModal, closeUploadModal], [passwordModal, closePasswordModal], [deleteModal, closeDeleteModal]]);
closers.forEach((close, m) => m.addEventListener("click", (e) => { if (e.target === m && !deleting) close(); }));

onUserChange((user) => {
    if (user) loadProfile(user);
    else if (!deleting) window.location.replace("login.html?next=profil.html");
});
