// Firebase web configuration.
// These values are NOT secrets: Firebase identifies the project with them and every
// visitor's browser receives them. Data is protected by Firestore Security Rules
// (firestore.rules) and by restricting this API key to the site's domains in
// Google Cloud Console → APIs & Services → Credentials.
// Never put private keys (e.g. a Gemini API key) in this file.
export const FIREBASE_CONFIG = Object.freeze({
    apiKey: "AIzaSyAyAfkLuPdW1Vi_32I_1eYX18LQyVZkAog",
    authDomain: "cinepath-2c233.firebaseapp.com",
    projectId: "cinepath-2c233",
    storageBucket: "cinepath-2c233.firebasestorage.app",
    messagingSenderId: "781626702698",
    appId: "1:781626702698:web:66ac7f1ce955cbf8f40313"
});

// Public reCAPTCHA Enterprise (Fraud Defense) site key used by Firebase App Check.
// Required by Firebase AI Logic. Only works on the domains registered for the key.
export const RECAPTCHA_ENTERPRISE_SITE_KEY = "6LchFiouAAAAABJpfFo9CNodVos7U3NExZJqPl7_";
