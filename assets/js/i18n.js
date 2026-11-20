// Lightweight i18n for CinePath.
//
// Static text:   <h1 data-i18n="home.title">English fallback</h1>
// Trusted HTML:  <h1 data-i18n-html="home.heading">…</h1>   (dictionary strings only, never user data)
// Attributes:    <input data-i18n-attr="placeholder:explore.search|aria-label:explore.searchLabel">
// In JS:         import { t } from "./i18n.js";  t("explore.count", { n: 3 })
//
// Dictionaries live in assets/js/i18n/<code>.js. English is the fallback for missing keys.

export const LANGUAGES = [
    { code: "tr", name: "Türkçe", flag: "tr" },
    { code: "en", name: "English", flag: "gb" },
    { code: "de", name: "Deutsch", flag: "de" },
    { code: "es", name: "Español", flag: "es" },
    { code: "fr", name: "Français", flag: "fr" },
    { code: "fa", name: "فارسی", flag: "ir", rtl: true },
    { code: "ru", name: "Русский", flag: "ru" }
];
const STORAGE_KEY = "cinepath:lang";
const BASE = new URL("../", import.meta.url); // …/assets/

function detectLanguage() {
    const supported = LANGUAGES.map((l) => l.code);
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (supported.includes(saved)) return saved;
    } catch { /* storage blocked */ }
    for (const tag of navigator.languages || [navigator.language || ""]) {
        const code = String(tag).toLowerCase().split("-")[0];
        if (supported.includes(code)) return code;
    }
    return "en";
}

export const lang = detectLanguage();
export const language = LANGUAGES.find((l) => l.code === lang);

async function loadDictionary(code) {
    try { return (await import(`./i18n/${code}.js`)).default; } catch { return {}; }
}
const [fallback, current] = await Promise.all([
    loadDictionary("en"),
    lang === "en" ? Promise.resolve(null) : loadDictionary(lang)
]);
const dict = current || fallback;

/** Translate a key; {name} placeholders are replaced from vars. */
export function t(key, vars) {
    let text = dict[key] ?? fallback[key] ?? key;
    if (vars) text = text.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
    return text;
}

/**
 * Plural-aware translation: looks up "<key>.<category>" (one / few / many / other,
 * per Intl.PluralRules for the current language) and falls back to "<key>.other".
 * e.g. tp("explore.location", 3) → "3 locations" / "3 места" / "3 konum".
 */
const pluralRules = new Intl.PluralRules(lang);
export function tp(key, n) {
    const category = pluralRules.select(n);
    const k = [`${key}.${category}`, `${key}.other`].find((x) => x in dict || x in fallback) || `${key}.other`;
    return t(k, { n: formatNumber(n) });
}

/** Locale-aware number formatting (e.g. Persian digits). */
export const formatNumber = (n) => new Intl.NumberFormat(lang).format(n);

export function applyTranslations(root = document) {
    root.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
    root.querySelectorAll("[data-i18n-html]").forEach((el) => { el.innerHTML = t(el.dataset.i18nHtml); });
    root.querySelectorAll("[data-i18n-attr]").forEach((el) => {
        el.dataset.i18nAttr.split("|").forEach((pair) => {
            const [attr, key] = pair.split(":");
            if (attr && key) el.setAttribute(attr.trim(), t(key.trim()));
        });
    });
}

export function setLanguage(code) {
    if (!LANGUAGES.some((l) => l.code === code) || code === lang) return;
    try { localStorage.setItem(STORAGE_KEY, code); } catch { /* ignore */ }
    location.reload();
}

const flagUrl = (flag) => new URL(`flags/${flag}.svg`, BASE).href;

/** Render the flag dropdown into every [data-lang-switcher] element. */
function renderSwitchers() {
    document.querySelectorAll("[data-lang-switcher]").forEach((host, index) => {
        const menuId = `langMenu${index}`;
        host.classList.add("lang-switcher");
        host.innerHTML = `
            <button type="button" class="lang-btn" aria-haspopup="true" aria-expanded="false" aria-controls="${menuId}">
                <img class="lang-flag" alt="" width="22" height="16">
                <span class="lang-code"></span>
                <svg class="lang-caret" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
            </button>
            <ul class="lang-menu" id="${menuId}" role="menu" hidden></ul>`;
        const btn = host.querySelector(".lang-btn");
        const menu = host.querySelector(".lang-menu");
        btn.querySelector(".lang-flag").src = flagUrl(language.flag);
        btn.querySelector(".lang-code").textContent = lang.toUpperCase();
        btn.setAttribute("aria-label", `${t("lang.choose")}: ${language.name}`);

        for (const l of LANGUAGES) {
            const li = document.createElement("li");
            li.setAttribute("role", "none");
            const item = document.createElement("button");
            item.type = "button";
            item.className = "lang-option";
            item.setAttribute("role", "menuitemradio");
            item.setAttribute("aria-checked", String(l.code === lang));
            item.lang = l.code;
            const img = document.createElement("img");
            img.className = "lang-flag";
            img.alt = "";
            img.width = 22;
            img.height = 16;
            img.loading = "lazy";
            img.src = flagUrl(l.flag);
            const name = document.createElement("span");
            name.textContent = l.name;
            if (l.rtl) name.dir = "rtl"; // only the label is right-to-left; the row layout stays consistent
            item.append(img, name);
            item.addEventListener("click", () => setLanguage(l.code));
            li.appendChild(item);
            menu.appendChild(li);
        }

        const setOpen = (open) => {
            menu.hidden = !open;
            btn.setAttribute("aria-expanded", String(open));
            if (open) menu.querySelector('[aria-checked="true"]')?.focus();
        };
        btn.addEventListener("click", (e) => { e.stopPropagation(); setOpen(menu.hidden); });
        document.addEventListener("click", (e) => { if (!host.contains(e.target)) setOpen(false); });
        host.addEventListener("keydown", (e) => {
            if (e.key === "Escape") { setOpen(false); btn.focus(); }
            if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                e.preventDefault();
                const items = [...menu.querySelectorAll(".lang-option")];
                const i = items.indexOf(document.activeElement);
                items[(i + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length]?.focus();
            }
        });
    });
}

// ---- Apply immediately (this module is loaded by every page) ----
function applyToPage() {
    const html = document.documentElement;
    html.lang = lang;
    html.dir = language.rtl ? "rtl" : "ltr";
    if (lang === "fa") {
        const font = document.createElement("link");
        font.rel = "stylesheet";
        font.href = "https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700;800&display=swap";
        document.head.appendChild(font);
    }
    applyTranslations();
    renderSwitchers();
    html.removeAttribute("data-i18n-loading");
}
// The Turkish-only admin page opts out with <html data-i18n-skip>.
if (!document.documentElement.hasAttribute("data-i18n-skip")) applyToPage();
