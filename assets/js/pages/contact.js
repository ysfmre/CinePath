// The site is static (no backend), so the contact form opens the visitor's
// mail app with a pre-filled message instead of pretending to "send" it.
const CONTACT_EMAIL = "cinepathcontact@gmail.com";
const form = document.getElementById("contactForm");

form.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = form.elements;
    const subjectLabel = f.subject.options[f.subject.selectedIndex].text;
    const subject = `[CinePath] ${subjectLabel}`;
    const body = `${f.message.value.trim()}\n\n— ${f.name.value.trim()} <${f.email.value.trim()}>`;
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body.slice(0, 1800))}`;

    const btn = form.querySelector(".submit-btn span");
    if (btn) btn.textContent = "Opening your mail app…";
    setTimeout(() => { if (btn) btn.textContent = "Send Message"; }, 4000);
});
