// Legal pages (terms / privacy / cookies). The Turkish text is binding; other languages see the English translation.
import { t, lang } from "../i18n.js";

const article = document.getElementById("legalDoc");
const docKey = article?.dataset.doc;
const source = lang === "tr" ? "tr" : "en";

document.querySelectorAll(".legal-nav a").forEach((a) => {
    if (a.getAttribute("href") === `${docKey}.html`) a.setAttribute("aria-current", "page");
});

if (article && docKey) {
    const { default: docs } = await import(`../legal/${source}.js`);
    const d = docs[docKey];
    // Trusted static HTML from our own module, never user input.
    article.innerHTML = `
        <header class="legal-head">
            <h1>${d.title}</h1>
            <p class="legal-updated">${t("legal.updated")}: ${d.updated}</p>
            ${source === "en" && lang !== "en" ? `<p class="legal-note">${t("legal.translationNote")}</p>` : ""}
            ${source === "en" ? `<p class="legal-note">${t("legal.bindingNote")}</p>` : ""}
        </header>
        <div class="legal-body">${d.html}</div>`;
}
