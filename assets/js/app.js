/**
 * CinePath Main Logic
 * Optimized for Performance
 */

document.addEventListener("DOMContentLoaded", () => {
  // 1. Footer Year Update
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear().toString();

  // 2. Mobile Navigation Toggle
  const navToggle = document.querySelector("[data-nav-toggle]");
  const navList = document.querySelector("[data-nav-list]");
  
  if (navToggle && navList) {
    navToggle.addEventListener("click", () => {
      const isOpened = navList.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", isOpened);
      // Toggle icon if needed (SVG change logic can go here)
    });
  }

  // 3. Authentication Logic (Local Storage - DEMO ONLY)
  // WARNING: Storing passwords in localStorage is NOT secure for production.
  // Use a real backend service (Firebase, Node.js, etc.) for a live app.
  
  const AUTH_KEY = "cinepath:users";
  const SESSION_KEY = "cinepath:session";

  const getStorage = (key) => {
    try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; }
  };
  
  const updateProfileUI = () => {
    const session = localStorage.getItem(SESSION_KEY);
    const profileBtn = document.querySelector("[data-profile-btn]");
    const avatarLabel = document.querySelector("[data-avatar-label]");
    const loginLink = document.querySelector("[data-menu-login]");
    const signupLink = document.querySelector("[data-menu-signup]");
    const logoutLink = document.querySelector("[data-menu-logout]");

    if (!profileBtn) return;

    if (session) {
      // User is logged in
      const userEmail = JSON.parse(session).email;
      const users = getStorage(AUTH_KEY);
      const user = users.find(u => u.email === userEmail);
      
      if (avatarLabel) avatarLabel.textContent = user ? user.name.split(' ')[0] : 'Profil';
      if (loginLink) loginLink.style.display = 'none';
      if (signupLink) signupLink.style.display = 'none';
      if (logoutLink) logoutLink.style.display = 'block';
    } else {
      // Guest
      if (avatarLabel) avatarLabel.textContent = 'Giriş';
      if (loginLink) loginLink.style.display = 'block';
      if (signupLink) signupLink.style.display = 'block';
      if (logoutLink) logoutLink.style.display = 'none';
    }
  };

  // Initialize UI
  updateProfileUI();

  // Profile Menu Toggle Logic (Updated for Direct Login Redirect)
  const profileBtn = document.querySelector("[data-profile-btn]");
  const profileMenu = document.querySelector("[data-profile-menu]");
  
  if (profileBtn && profileMenu) {
    profileBtn.addEventListener("click", (e) => {
      e.stopPropagation();

      // KONTROL: Kullanıcı giriş yapmış mı?
      const session = localStorage.getItem(SESSION_KEY);
      
      if (!session) {
        // Eğer giriş yapılmamışsa, menü açma -> Login sayfasına git
        window.location.href = "login.html";
        return; 
      }

      // Giriş yapılmışsa normal menü (Logout vb.) açılsın
      const isOpen = profileMenu.classList.toggle("is-open");
      profileBtn.setAttribute("aria-expanded", isOpen);
    });

    // Close on click outside
    document.addEventListener("click", (e) => {
      if (!profileBtn.contains(e.target) && !profileMenu.contains(e.target)) {
        profileMenu.classList.remove("is-open");
        profileBtn.setAttribute("aria-expanded", "false");
      }
    });
  }

  // Logout Action
  const logoutBtn = document.querySelector("[data-menu-logout]");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem(SESSION_KEY);
      window.location.reload(); // Refresh to update UI state
    });
  }

  // Login Form Handler
  const loginForm = document.querySelector("[data-auth='login']");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = loginForm.email.value.trim().toLowerCase();
      const password = loginForm.password.value;
      const errorEl = loginForm.querySelector("[data-error]");

      const users = getStorage(AUTH_KEY);
      const validUser = users.find(u => u.email === email && u.password === password);

      if (validUser) {
        localStorage.setItem(SESSION_KEY, JSON.stringify({ email }));
        window.location.href = "index.html";
      } else {
        errorEl.textContent = "Hatalı e-posta veya şifre.";
        errorEl.style.display = "block";
      }
    });
  }

  // Signup Form Handler
  const signupForm = document.querySelector("[data-auth='signup']");
  if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = signupForm.name.value.trim();
      const email = signupForm.email.value.trim().toLowerCase();
      const pass = signupForm.password.value;
      const pass2 = signupForm.password2.value;
      const errorEl = signupForm.querySelector("[data-error]");

      if (pass !== pass2) {
        errorEl.textContent = "Şifreler eşleşmiyor.";
        errorEl.style.display = "block";
        return;
      }

      const users = getStorage(AUTH_KEY);
      if (users.find(u => u.email === email)) {
        errorEl.textContent = "Bu e-posta zaten kayıtlı.";
        errorEl.style.display = "block";
        return;
      }

      users.push({ name, email, password: pass });
      localStorage.setItem(AUTH_KEY, JSON.stringify(users));
      localStorage.setItem(SESSION_KEY, JSON.stringify({ email }));
      window.location.href = "index.html";
    });
  }

  // 4. FAQ Accordion Logic
  const accordions = document.querySelectorAll(".accordion-item");
  accordions.forEach(acc => {
    const btn = acc.querySelector(".accordion-btn");
    const panel = acc.querySelector(".accordion-panel");
    
    btn.addEventListener("click", () => {
      const isOpen = acc.classList.toggle("is-open");
      panel.style.maxHeight = isOpen ? panel.scrollHeight + "px" : "0";
    });
  });

  // 5. Draggable & Button Scroll Logic (Optimized)
  const chipRow = document.querySelector(".chip-row");
  if (chipRow) {
    const parent = chipRow.parentElement;
    
    // Inject Buttons via JS
    const btnLeft = document.createElement("button");
    btnLeft.className = "scroll-btn left";
    btnLeft.innerHTML = "‹"; // Simple arrow
    
    const btnRight = document.createElement("button");
    btnRight.className = "scroll-btn right";
    btnRight.innerHTML = "›";

    parent.appendChild(btnLeft);
    parent.appendChild(btnRight);

    // Scroll Logic
    const scrollAmount = 300;
    
    btnLeft.addEventListener("click", () => {
      chipRow.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });
    
    btnRight.addEventListener("click", () => {
      chipRow.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });

    // Update Button Visibility (Debounced)
    let isScrolling;
    const updateButtons = () => {
      btnLeft.disabled = chipRow.scrollLeft <= 0;
      btnRight.disabled = chipRow.scrollLeft + chipRow.clientWidth >= chipRow.scrollWidth - 10;
      
      // Visual Opacity Toggle
      btnLeft.style.opacity = btnLeft.disabled ? "0" : "1";
      btnRight.style.opacity = btnRight.disabled ? "0" : "1";
    };

    chipRow.addEventListener("scroll", () => {
      window.clearTimeout(isScrolling);
      isScrolling = setTimeout(updateButtons, 50);
    });

    // Draggable Logic
    let isDown = false;
    let startX, scrollLeft;

    chipRow.addEventListener("mousedown", (e) => {
      isDown = true;
      chipRow.classList.add("is-dragging");
      startX = e.pageX - chipRow.offsetLeft;
      scrollLeft = chipRow.scrollLeft;
    });

    chipRow.addEventListener("mouseleave", () => {
      isDown = false;
      chipRow.classList.remove("is-dragging");
    });

    chipRow.addEventListener("mouseup", () => {
      isDown = false;
      chipRow.classList.remove("is-dragging");
    });

    chipRow.addEventListener("mousemove", (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - chipRow.offsetLeft;
      const walk = (x - startX) * 2; // Scroll speed multiplier
      chipRow.scrollLeft = scrollLeft - walk;
    });

    // Initial check
    updateButtons();
  }
});
 
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
      contactForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Sayfa yenilemesini engelle
        
        const btn = contactForm.querySelector('.submit-btn');
        const originalText = btn.innerHTML;
        
        // Yükleniyor durumu
        btn.innerHTML = 'Gönderiliyor...';
        btn.style.opacity = '0.7';
        btn.disabled = true;

        // Gönderimi simüle et (2 saniye sonra)
        setTimeout(() => {
          btn.innerHTML = '✨ Mesaj Gönderildi!';
          btn.style.background = '#10b981'; // Yeşil renk
          btn.style.opacity = '1';
          
          contactForm.reset();

          // 3 saniye sonra butonu eski haline getir
          setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = ''; // Orijinal renge dön (CSS'den gelir)
            btn.disabled = false;
          }, 3000);
        }, 2000);
      });
    }