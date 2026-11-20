# CinePath

Türkiye'deki film ve dizi çekim mekânlarını keşfetme sitesi (statik site: GitHub Pages + Firebase).

## Yapı

| Dosya | Görev |
|---|---|
| `config.js` | Firebase **web** yapılandırması (gizli değildir, tarayıcıya zaten gider) |
| `assets/js/auth_manager.js` | Firebase'in başlatıldığı tek yer: giriş, profil, XP, favori, puan, fotoğraf, AI |
| `assets/js/utils.js` | HTML kaçışlama, URL doğrulama, Firebase hata mesajları |
| `assets/js/layout.js` | Mobil menü, alt bilgi yılı, üst menüdeki profil butonu |
| `assets/js/pages/*.js` | Sayfaya özel kodlar (HTML içinde inline script yoktur) |
| `firestore.rules` | **Asıl güvenlik katmanı** — veritabanı yetkileri |

## Canlıya almadan önce yapılması gerekenler

1. **Firestore kurallarını yayınla** (bunu yapmadan site güvenli değildir):
   ```bash
   npm i -g firebase-tools && firebase login
   firebase deploy --only firestore:rules
   ```
2. **Firebase AI Logic'i aç** (CineAI sayfası için): Firebase Console → *AI Logic* → *Get started* → *Gemini Developer API*.
   Gemini anahtarı artık tarayıcıda değil, Firebase tarafında tutuluyor.
   Kötüye kullanımı engellemek için *App Check* (reCAPTCHA Enterprise) açılması önerilir.
3. **Sızan Gemini anahtarlarını iptal et**: Git geçmişinde açık duran tüm `GEMINI_API_KEY` değerlerini
   Google Cloud Console → *APIs & Services → Credentials* bölümünden silin.
4. **Firebase API anahtarını kısıtla**: Aynı ekranda Firebase "Browser key" için *HTTP referrers* kısıtı ekleyin
   (`ysfmre.github.io/*`, `cinepathtr.com/*`, `cinepath-2c233.firebaseapp.com/*`, `localhost/*`).
5. **Admin yetkisi ver**: Firestore'da `users/{uid}` belgesindeki `role` alanını elle `admin` yapın.
   Kullanıcılar bu alanı kendileri değiştiremez.
6. GitHub → Settings → Secrets'taki `FIREBASE_*` / `GEMINI_API_KEY` secret'ları artık kullanılmıyor, silinebilir.
