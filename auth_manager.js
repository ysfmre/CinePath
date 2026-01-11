

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
    GoogleAuthProvider,
    OAuthProvider,
    signInWithPopup,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    collection,
    addDoc,
    deleteDoc,
    getDocs,
    orderBy,
    query,
    arrayUnion,
    arrayRemove
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


import { CONFIG } from "./config.js";

const app = initializeApp(CONFIG.FIREBASE);
const auth = getAuth(app);
const db = getFirestore(app);



export async function registerUser(email, password, fullName) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await updateProfile(user, { displayName: fullName });

        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid, name: fullName, email: email, createdAt: new Date(),
            photoURL: "", favorites: [], role: "user",
            level: 1, xp: 0, nextLevelXp: 100, title: "Acemi Sinefil",
            language: "tr",
            stats: { visitedLocations: 0, reviews: 0, photos: 0 }
        });
        return { success: true, user: user };
    } catch (error) { return { success: false, error: error.message }; }
}

export async function loginUser(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user: userCredential.user };
    } catch (error) { return { success: false, error: error.message }; }
}

export async function resetPassword(email) {
    try {
        await sendPasswordResetEmail(auth, email);
        return { success: true };
    } catch (error) {
        console.error("Şifre sıfırlama hatası:", error);
        return { success: false, error: error.message };
    }
}

export async function loginWithGoogle() {
    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        await checkAndCreateUserInDB(result.user);
        return { success: true, user: result.user };
    } catch (error) { return { success: false, error: error.message }; }
}

export async function loginWithApple() {
    try {
        const provider = new OAuthProvider('apple.com');
        const result = await signInWithPopup(auth, provider);
        await checkAndCreateUserInDB(result.user);
        return { success: true, user: result.user };
    } catch (error) { return { success: false, error: error.message }; }
}

export async function logoutUser() {
    try {
        await signOut(auth);
        window.location.href = "login.html";
    } catch (error) { console.error("Çıkış hatası:", error); }
}

export async function getUserData(uid) {
    try {
        const snap = await getDoc(doc(db, "users", uid));
        return snap.exists() ? snap.data() : null;
    } catch (error) { return null; }
}

export async function updateUserProfile(uid, newData) {
    try {
        const user = auth.currentUser;
        const updates = {};
        if (newData.displayName || newData.photoURL) {
            await updateProfile(user, {
                displayName: newData.displayName || user.displayName,
                photoURL: newData.photoURL || user.photoURL
            });
        }
        if (newData.displayName) updates.name = newData.displayName;
        if (newData.photoURL) updates.photoURL = newData.photoURL;

        if (Object.keys(updates).length > 0) {
            await updateDoc(doc(db, "users", uid), updates);
        }
        return { success: true };
    } catch (error) { return { success: false, error: error.message }; }
}



// ============================================
// XP & LEVEL SYSTEM
// ============================================

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

function calculateNextLevelXp(level) {
    // Her level için gereken XP: 100, 150, 225, 337, 506...
    return Math.floor(100 * Math.pow(1.5, level - 1));
}

function getTitleForLevel(level) {
    if (level >= 10) return LEVEL_TITLES[10];
    return LEVEL_TITLES[level] || "Novice Cinephile";
}

export async function updateUserXP(uid, xpChange) {
    try {
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) return { success: false, error: "User not found" };

        const userData = userSnap.data();
        let currentXp = userData.xp || 0;
        let currentLevel = userData.level || 1;
        let nextLevelXp = userData.nextLevelXp || 100;

        // XP güncelle
        let newXp = currentXp + xpChange;
        if (newXp < 0) newXp = 0;

        let newLevel = currentLevel;
        let newNextLevelXp = nextLevelXp;
        let leveledUp = false;

        // Level up kontrolü
        while (newXp >= newNextLevelXp && newLevel < 10) {
            newXp -= newNextLevelXp;
            newLevel++;
            newNextLevelXp = calculateNextLevelXp(newLevel);
            leveledUp = true;
        }

        // Level down kontrolü (XP negatife düşerse)
        while (newXp < 0 && newLevel > 1) {
            newLevel--;
            newNextLevelXp = calculateNextLevelXp(newLevel);
            newXp = newNextLevelXp + newXp; // Önceki level'in XP'sinden düş
            if (newXp < 0) newXp = 0;
        }

        const newTitle = getTitleForLevel(newLevel);

        await updateDoc(userRef, {
            xp: newXp,
            level: newLevel,
            nextLevelXp: newNextLevelXp,
            title: newTitle
        });

        return {
            success: true,
            leveledUp: leveledUp,
            newLevel: newLevel,
            newXp: newXp,
            newTitle: newTitle
        };
    } catch (e) {
        console.error("XP update error:", e);
        return { success: false, error: e.message };
    }
}

// ============================================
// RATINGS SYSTEM
// ============================================

export async function getUserRatingsForMovie(movieId) {
    const user = auth.currentUser;
    if (!user) return {};
    try {
        const ratingRef = doc(db, "users", user.uid, "ratings", movieId);
        const snap = await getDoc(ratingRef);
        return snap.exists() ? snap.data() : {};
    } catch (e) { return {}; }
}

export async function saveUserRating(movieId, locationIndex, ratingValue) {
    const user = auth.currentUser;
    if (!user) return { success: false, error: "Please log in" };

    try {
        const ratingRef = doc(db, "users", user.uid, "ratings", movieId);
        const userRef = doc(db, "users", user.uid);

        // Mevcut rating'i kontrol et
        const existingSnap = await getDoc(ratingRef);
        const existingRatings = existingSnap.exists() ? existingSnap.data() : {};
        const hadPreviousRating = existingRatings[locationIndex] !== undefined;

        // Rating'i kaydet
        await setDoc(ratingRef, { [locationIndex]: ratingValue }, { merge: true });

        // Eğer yeni bir rating ise XP ve review sayısını artır
        if (!hadPreviousRating) {
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                const currentStats = userSnap.data().stats || {};
                await updateDoc(userRef, {
                    "stats.reviews": (currentStats.reviews || 0) + 1
                });
            }

            // +3 XP ekle
            await updateUserXP(user.uid, 3);
        }

        return { success: true, isNewRating: !hadPreviousRating };
    } catch (e) {
        return { success: false, error: e.message };
    }
}

export async function removeUserRating(movieId, locationIndex) {
    const user = auth.currentUser;
    if (!user) return { success: false, error: "Please log in" };

    try {
        const ratingRef = doc(db, "users", user.uid, "ratings", movieId);
        const userRef = doc(db, "users", user.uid);

        // Mevcut rating'i kontrol et
        const existingSnap = await getDoc(ratingRef);
        if (!existingSnap.exists()) return { success: true };

        const existingRatings = existingSnap.data();
        if (existingRatings[locationIndex] === undefined) return { success: true };

        // Rating'i sil
        delete existingRatings[locationIndex];
        await setDoc(ratingRef, existingRatings);

        // Review sayısını azalt
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            const currentStats = userSnap.data().stats || {};
            const newReviewCount = (currentStats.reviews || 1) - 1;
            await updateDoc(userRef, {
                "stats.reviews": newReviewCount < 0 ? 0 : newReviewCount
            });
        }

        // -3 XP çıkar
        await updateUserXP(user.uid, -3);

        return { success: true };
    } catch (e) {
        return { success: false, error: e.message };
    }
}



export async function addUserPhoto(uid, photoData) {
    try {
        const userRef = doc(db, "users", uid);
        const photosColRef = collection(userRef, "user_photos");

        await addDoc(photosColRef, {
            image: photoData.image,
            caption: photoData.caption || "",
            locationName: photoData.locationName || "Unknown Location",
            createdAt: new Date().toISOString()
        });

        // Update photo count
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            const currentStats = userSnap.data().stats || {};
            await updateDoc(userRef, {
                "stats.photos": (currentStats.photos || 0) + 1
            });
        }

        // +10 XP for photo upload
        const xpResult = await updateUserXP(uid, 10);

        return { success: true, leveledUp: xpResult.leveledUp, newLevel: xpResult.newLevel };
    } catch (e) {
        console.error("Photo upload error:", e);
        return { success: false, error: "Data too large or connection error." };
    }
}

export async function getUserPhotos(uid) {
    try {
        const photosColRef = collection(db, "users", uid, "user_photos");
        const q = query(photosColRef, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);

        let photos = [];
        querySnapshot.forEach((doc) => {
            photos.push({ id: doc.id, ...doc.data() });
        });

        return photos;
    } catch (e) {
        console.error("Fotoğraf çekme hatası:", e);
        return [];
    }
}


export async function deleteUserPhoto(uid, photoId) {
    try {
        // Delete photo document
        await deleteDoc(doc(db, "users", uid, "user_photos", photoId));

        // Update photo count
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const currentStats = userSnap.data().stats || {};
            const newCount = (currentStats.photos || 1) - 1;
            await updateDoc(userRef, {
                "stats.photos": newCount < 0 ? 0 : newCount
            });
        }

        // -10 XP for photo deletion
        await updateUserXP(uid, -10);

        return { success: true };
    } catch (e) {
        console.error("Photo delete error:", e);
        return { success: false, error: e.message };
    }
}



export async function toggleFavorite(movieId) {
    const user = auth.currentUser;
    if (!user) return { success: false, error: "Giriş yapmalısınız" };

    try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const favorites = userSnap.data().favorites || [];

            if (favorites.includes(movieId)) {
                await updateDoc(userRef, { favorites: arrayRemove(movieId) });
                return { success: true, action: 'removed' };
            } else {
                await updateDoc(userRef, { favorites: arrayUnion(movieId) });
                return { success: true, action: 'added' };
            }
        }
        return { success: false, error: "Kullanıcı verisi bulunamadı" };
    } catch (e) { return { success: false, error: e.message }; }
}

export async function getMovieById(movieId) {
    try {
        const docRef = doc(db, "contents", movieId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        }
        return null;
    } catch (e) {
        console.error("Film çekme hatası:", e);
        return null;
    }
}



async function checkAndCreateUserInDB(user) {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        await setDoc(userRef, {
            uid: user.uid,
            name: user.displayName || "CinePath Üyesi",
            email: user.email,
            photoURL: user.photoURL || "",
            createdAt: new Date(),
            favorites: [],
            role: "user",
            level: 1, xp: 0, nextLevelXp: 100, title: "Acemi Sinefil",
            language: "tr",
            stats: { visitedLocations: 0, reviews: 0, photos: 0 }
        });
    }
}

export function initAuthListener(callback) {
    onAuthStateChanged(auth, async (user) => {
        if (callback) callback(user);


        const oldBtn = document.querySelector("[data-profile-btn]");
        if (!oldBtn) return;

        const newBtn = oldBtn.cloneNode(true);
        oldBtn.parentNode.replaceChild(newBtn, oldBtn);

        const label = newBtn.querySelector("[data-avatar-label]");
        const avatar = newBtn.querySelector("[data-avatar]");
        const dropdown = document.querySelector("[data-profile-menu]");

        if (user) {

            if (label) label.textContent = user.displayName ? user.displayName.split(' ')[0] : "Profil";
            if (avatar) {
                avatar.textContent = "";
                if (user.photoURL) {
                    avatar.style.backgroundImage = `url('${user.photoURL}')`;
                    avatar.style.backgroundSize = "cover";
                    avatar.style.backgroundPosition = "center";
                    avatar.style.border = "2px solid #e50914";
                } else {
                    avatar.textContent = user.displayName ? user.displayName[0].toUpperCase() : "U";
                    avatar.style.background = "#e50914";
                    avatar.style.display = "flex";
                    avatar.style.alignItems = "center";
                    avatar.style.justifyContent = "center";
                    avatar.style.border = "none";
                }
            }
            if (dropdown) dropdown.style.display = "none";

            newBtn.onclick = function (e) {
                e.preventDefault();
                window.location.href = "profil.html";
            };

        } else {

            if (label) label.textContent = "Log In";
            if (avatar) {
                avatar.style.background = "transparent";
                avatar.textContent = "👤";
                avatar.style.backgroundImage = "none";
                avatar.style.border = "1px solid #333";
                avatar.style.display = "grid";
            }
            if (dropdown) dropdown.style.display = "none";

            newBtn.onclick = function (e) {
                e.preventDefault();
                window.location.href = "login.html";
            };
        }
    });
}