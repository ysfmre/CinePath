// Single Firebase entry point for the whole site.
// Every page imports from here, so the SDK is initialised exactly once and
// only one SDK version is ever loaded.
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import {
    getAuth,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup,
    sendPasswordResetEmail,
    updatePassword,
    EmailAuthProvider,
    reauthenticateWithCredential,
    reauthenticateWithPopup,
    deleteUser,
    getAdditionalUserInfo
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    deleteDoc,
    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    documentId,
    where,
    arrayUnion,
    arrayRemove,
    runTransaction,
    writeBatch,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import { FIREBASE_CONFIG, RECAPTCHA_ENTERPRISE_SITE_KEY } from "../../config.js";
import { safeUrl } from "./utils.js";
import { t } from "./i18n.js";

const SDK_BASE = "https://www.gstatic.com/firebasejs/12.19.0";

export const app = initializeApp(FIREBASE_CONFIG);

export const auth = getAuth(app);
export const db = getFirestore(app);

const ok = (extra = {}) => ({ success: true, ...extra });
const fail = (error) => ({ success: false, error, code: error?.code });

// ============================================
// AUTH
// ============================================

/** Resolves once Firebase has restored (or not) the previous session. */
export const authReady = new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => { unsubscribe(); resolve(user); });
});

function newUserDoc(user, name, birthDate) {
    return {
        uid: user.uid,
        birthDate, // Date → Firestore timestamp; firestore.rules require 18+
        name: String(name || "CinePath Member").slice(0, 80),
        email: user.email || "",
        photoURL: user.photoURL || "",
        createdAt: serverTimestamp(),
        favorites: [],
        role: "user",
        level: 1,
        xp: 0,
        nextLevelXp: 100,
        title: LEVEL_TITLES[1],
        language: "tr",
        stats: { visitedLocations: 0, reviews: 0, photos: 0 }
    };
}

// ---- Age limit: members must be 18 or older ----
export const MIN_AGE = 18;

/** Age in whole years on today's (local) date for a "YYYY-MM-DD" birth date, or NaN if invalid. */
export function ageOn(birthIso, today = new Date()) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(birthIso || ""));
    if (!m) return NaN;
    const [y, mo, d] = m.slice(1).map(Number);
    const date = new Date(Date.UTC(y, mo - 1, d));
    if (date.getUTCFullYear() !== y || date.getUTCMonth() !== mo - 1 || date.getUTCDate() !== d || y < 1900) return NaN;
    let age = today.getFullYear() - y;
    if (today.getMonth() + 1 < mo || (today.getMonth() + 1 === mo && today.getDate() < d)) age--;
    return age;
}
/** "YYYY-MM-DD" → Date at UTC midnight (what is stored in the profile). */
const birthDateValue = (iso) => new Date(`${iso}T00:00:00Z`);
const err = (code) => Object.assign(new Error(code), { code });

export async function registerUser(email, password, fullName, birthIso) {
    try {
        if (!(ageOn(birthIso) >= MIN_AGE)) throw err("auth/under-age");
        const { user } = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const name = fullName.trim().slice(0, 80);
        try {
            await updateProfile(user, { displayName: name });
            await setDoc(doc(db, "users", user.uid), newUserDoc(user, name, birthDateValue(birthIso)));
        } catch (error) {
            await deleteUser(user).catch(() => {}); // don't leave a login without a profile behind
            throw error;
        }
        return ok({ user });
    } catch (error) { return fail(error); }
}

export async function loginUser(email, password, remember = true) {
    try {
        await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
        const { user } = await signInWithEmailAndPassword(auth, email.trim(), password);
        return ok({ user });
    } catch (error) { return fail(error); }
}

/**
 * Google sign-in. A Google account without a CinePath profile can only become a member
 * through the sign-up page, where the date of birth is asked (pass birthIso there).
 * From the login page such an account is signed out again (and removed if it was just created).
 */
export async function loginWithGoogle({ birthIso } = {}) {
    try {
        if (birthIso !== undefined && !(ageOn(birthIso) >= MIN_AGE)) throw err("auth/under-age");
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: "select_account" });
        const result = await signInWithPopup(auth, provider);
        const { user } = result;
        const ref = doc(db, "users", user.uid);
        if (!(await getDoc(ref)).exists()) {
            if (birthIso === undefined) {
                if (getAdditionalUserInfo(result)?.isNewUser) await deleteUser(user).catch(() => {});
                await signOut(auth);
                throw err("auth/signup-required");
            }
            await setDoc(ref, newUserDoc(user, user.displayName, birthDateValue(birthIso)));
        }
        return ok({ user });
    } catch (error) { return fail(error); }
}

export async function resetPassword(email) {
    try {
        await sendPasswordResetEmail(auth, email.trim());
        return ok();
    } catch (error) {
        // Don't reveal whether an account exists for this address.
        if (error?.code === "auth/user-not-found") return ok();
        return fail(error);
    }
}

export async function updateUserPassword(currentPassword, newPassword) {
    try {
        const user = auth.currentUser;
        if (!user) throw Object.assign(new Error("Not signed in"), { code: "auth/requires-recent-login" });
        if (!user.providerData.some((p) => p.providerId === "password")) {
            throw Object.assign(new Error("No password provider"), { code: "auth/no-password-provider" });
        }
        await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, currentPassword));
        await updatePassword(user, newPassword);
        return ok();
    } catch (error) { return fail(error); }
}

/**
 * Permanently delete the signed-in user's account (KVKK / GDPR right to erasure):
 * photos, ratings and profile in Firestore first (they need the session), then the login itself.
 * Firebase requires a recent sign-in, so the user confirms with their password or Google first.
 */
export async function deleteAccount(currentPassword) {
    try {
        const user = auth.currentUser;
        if (!user) throw Object.assign(new Error("Not signed in"), { code: "auth/requires-recent-login" });
        if (user.providerData.some((p) => p.providerId === "password")) {
            await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, currentPassword));
        } else {
            await reauthenticateWithPopup(user, new GoogleAuthProvider());
        }
        for (const sub of ["user_photos", "ratings"]) {
            const snap = await getDocs(collection(db, "users", user.uid, sub));
            for (let i = 0; i < snap.docs.length; i += 400) {
                const batch = writeBatch(db);
                snap.docs.slice(i, i + 400).forEach((d) => batch.delete(d.ref));
                await batch.commit();
            }
        }
        await deleteDoc(doc(db, "users", user.uid));
        await deleteUser(user);
        return ok();
    } catch (error) { return fail(error); }
}

export async function logoutUser() {
    try { await signOut(auth); } finally { window.location.href = "login.html"; }
}

/** Subscribe to sign-in / sign-out events. */
export const onUserChange = (callback) => onAuthStateChanged(auth, callback);

/**
 * Subscribe to auth changes and keep the header profile button in sync.
 * The optional callback receives the Firebase user (or null).
 */
export function initAuthListener(callback) {
    return onAuthStateChanged(auth, (user) => {
        renderProfileButton(user);
        if (callback) callback(user);
    });
}

const USER_ICON = '<svg class="avatar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>';

function renderProfileButton(user) {
    const btn = document.querySelector("[data-profile-btn]");
    if (!btn) return;
    const label = btn.querySelector("[data-avatar-label]");
    const avatar = btn.querySelector("[data-avatar]");

    btn.onclick = (e) => {
        e.preventDefault();
        window.location.href = user ? "profil.html" : "login.html";
    };
    if (label) label.textContent = user ? (user.displayName?.split(" ")[0] || t("nav.profile")) : t("nav.login");
    if (!avatar) return;

    avatar.replaceChildren();
    avatar.classList.toggle("is-user", !!user);
    const photo = user && safeUrl(user.photoURL);
    if (photo) {
        const img = document.createElement("img");
        img.src = photo;
        img.alt = "";
        img.referrerPolicy = "no-referrer";
        img.className = "avatar-img";
        avatar.appendChild(img);
    } else {
        if (user) avatar.textContent = (user.displayName?.[0] || "U").toUpperCase();
        else avatar.innerHTML = USER_ICON; // static markup, no user data
    }
}

// ============================================
// USER PROFILE
// ============================================

export async function getUserData(uid) {
    try {
        const snap = await getDoc(doc(db, "users", uid));
        return snap.exists() ? snap.data() : null;
    } catch { return null; }
}

export async function isAdmin(uid) {
    const data = await getUserData(uid);
    return data?.role === "admin";
}

// ============================================
// XP & LEVEL SYSTEM
// ============================================

const MAX_LEVEL = 10;
const LEVEL_TITLES = {
    1: "Novice Cinephile",
    2: "Movie Explorer",
    3: "Location Hunter",
    4: "Cinema Enthusiast",
    5: "Set Detective",
    6: "Film Traveler",
    7: "Scene Master",
    8: "Location Expert",
    9: "Cinema Legend",
    10: "CinePath Master"
};

// XP required to finish a level: 100, 150, 225, 337, ...
const xpForLevel = (level) => Math.floor(100 * Math.pow(1.5, level - 1));

/** Pure function: apply an XP delta and carry level ups / downs. */
export function applyXp({ xp = 0, level = 1 }, delta) {
    let newXp = xp + delta;
    let newLevel = Math.min(Math.max(level, 1), MAX_LEVEL);

    while (newLevel < MAX_LEVEL && newXp >= xpForLevel(newLevel)) {
        newXp -= xpForLevel(newLevel);
        newLevel++;
    }
    while (newXp < 0 && newLevel > 1) {
        newLevel--;
        newXp += xpForLevel(newLevel);
    }
    newXp = Math.max(0, newXp);

    return {
        xp: newXp,
        level: newLevel,
        nextLevelXp: xpForLevel(newLevel),
        title: LEVEL_TITLES[newLevel],
        leveledUp: newLevel > level
    };
}

/**
 * Atomically change XP and (optionally) one stats counter in a transaction,
 * so concurrent actions can't overwrite each other.
 */
async function changeXpAndStat(uid, xpDelta, statKey, statDelta) {
    return runTransaction(db, async (tx) => {
        const ref = doc(db, "users", uid);
        const snap = await tx.get(ref);
        if (!snap.exists()) throw new Error("User not found");
        const data = snap.data();
        const { leveledUp, ...next } = applyXp(data, xpDelta);
        const update = { ...next };
        if (statKey) {
            update[`stats.${statKey}`] = Math.max(0, (data.stats?.[statKey] || 0) + statDelta);
        }
        tx.update(ref, update);
        return { leveledUp, newLevel: next.level, newTitle: next.title };
    });
}

// ============================================
// CONTENTS (movies / series)
// ============================================

export async function getAllContents() {
    const snap = await getDocs(query(collection(db, "contents"), orderBy("createdAt", "desc")));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/** Fetch several content documents in as few round-trips as possible. */
export async function getContentsByIds(ids) {
    const unique = [...new Set(ids)].filter((id) => typeof id === "string" && id);
    const results = [];
    for (let i = 0; i < unique.length; i += 30) {
        const chunk = unique.slice(i, i + 30);
        const snap = await getDocs(query(collection(db, "contents"), where(documentId(), "in", chunk)));
        snap.forEach((d) => results.push({ id: d.id, ...d.data() }));
    }
    return results;
}

/** Admin only (enforced by Firestore rules). */
export async function addContents(items) {
    let saved = 0;
    for (let i = 0; i < items.length; i += 400) {
        const batch = writeBatch(db);
        items.slice(i, i + 400).forEach((item) => {
            batch.set(doc(collection(db, "contents")), { ...item, createdAt: serverTimestamp() });
        });
        await batch.commit();
        saved += Math.min(400, items.length - i);
    }
    return saved;
}

export async function addContent(item) {
    return addDoc(collection(db, "contents"), { ...item, createdAt: serverTimestamp() });
}

// ============================================
// FAVORITES
// ============================================

export async function toggleFavorite(movieId, isCurrentlyFavorite) {
    const user = auth.currentUser;
    if (!user) return fail({ code: "auth/requires-recent-login" });
    try {
        await updateDoc(doc(db, "users", user.uid), {
            favorites: isCurrentlyFavorite ? arrayRemove(movieId) : arrayUnion(movieId)
        });
        return ok({ action: isCurrentlyFavorite ? "removed" : "added" });
    } catch (error) { return fail(error); }
}

// ============================================
// RATINGS
// ============================================

export async function getUserRatingsForMovie(movieId) {
    const user = auth.currentUser;
    if (!user) return {};
    try {
        const snap = await getDoc(doc(db, "users", user.uid, "ratings", movieId));
        return snap.exists() ? snap.data() : {};
    } catch { return {}; }
}

export async function saveUserRating(movieId, locationIndex, ratingValue) {
    const user = auth.currentUser;
    if (!user) return fail({ code: "auth/requires-recent-login" });
    const value = Math.round(Number(ratingValue));
    if (!Number.isInteger(locationIndex) || locationIndex < 0 || value < 1 || value > 5) {
        return fail({ code: "invalid-argument" });
    }
    try {
        const ratingRef = doc(db, "users", user.uid, "ratings", movieId);
        const existing = await getDoc(ratingRef);
        const isNew = !existing.exists() || existing.data()[locationIndex] === undefined;
        await setDoc(ratingRef, { [locationIndex]: value }, { merge: true });
        if (isNew) await changeXpAndStat(user.uid, 3, "reviews", 1);
        return ok({ isNewRating: isNew });
    } catch (error) { return fail(error); }
}

// ============================================
// USER PHOTOS
// ============================================

export const MAX_PHOTO_BYTES = 700 * 1024;

export async function addUserPhoto(photo) {
    const user = auth.currentUser;
    if (!user) return fail({ code: "auth/requires-recent-login" });
    if (!/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(photo.image) || photo.image.length > MAX_PHOTO_BYTES) {
        return fail({ code: "invalid-argument" });
    }
    try {
        await addDoc(collection(db, "users", user.uid, "user_photos"), {
            image: photo.image,
            caption: String(photo.caption || "").slice(0, 200),
            locationName: String(photo.locationName || "Unknown Location").slice(0, 120),
            createdAt: new Date().toISOString()
        });
        return ok(await changeXpAndStat(user.uid, 10, "photos", 1));
    } catch (error) { return fail(error); }
}

export async function getUserPhotos(uid) {
    try {
        const snap = await getDocs(query(collection(db, "users", uid, "user_photos"), orderBy("createdAt", "desc")));
        return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch { return []; }
}

export async function deleteUserPhoto(photoId) {
    const user = auth.currentUser;
    if (!user) return fail({ code: "auth/requires-recent-login" });
    try {
        await deleteDoc(doc(db, "users", user.uid, "user_photos", photoId));
        await changeXpAndStat(user.uid, -10, "photos", -1);
        return ok();
    } catch (error) { return fail(error); }
}

// ============================================
// AI (Firebase AI Logic — no API key in the browser)
// ============================================

// App Check (reCAPTCHA Enterprise) is required by AI Logic. It is started only when
// CineAI is used: if a visitor's browser blocks reCAPTCHA, an App Check started at
// page load would stall every Firebase request (login, catalog...) on every page.
let aiModelPromise;
export function getAiModel() {
    aiModelPromise ??= Promise.all([
        import(`${SDK_BASE}/firebase-app-check.js`),
        import(`${SDK_BASE}/firebase-ai.js`)
    ]).then(([{ initializeAppCheck, ReCaptchaEnterpriseProvider }, { getAI, getGenerativeModel, GoogleAIBackend }]) => {
        initializeAppCheck(app, {
            provider: new ReCaptchaEnterpriseProvider(RECAPTCHA_ENTERPRISE_SITE_KEY),
            isTokenAutoRefreshEnabled: true
        });
        return getGenerativeModel(getAI(app, { backend: new GoogleAIBackend() }), {
            model: "gemini-3.8-flash",
            generationConfig: { responseMimeType: "application/json", temperature: 0.7, maxOutputTokens: 512 }
        });
    }).catch((error) => { aiModelPromise = null; throw error; });
    return aiModelPromise;
}
