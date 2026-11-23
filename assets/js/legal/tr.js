// Legal documents — Turkish (binding version). Trusted static HTML, never user data.
// <mark class="legal-todo"> marks details the site owner still has to fill in.
const TODO = (s) => `<mark class="legal-todo">[${s}]</mark>`;
const UPDATED = TODO("GG.AA.YYYY");
const MAIL = '<a href="mailto:cinepathcontact@gmail.com">cinepathcontact@gmail.com</a>';

export default {
    cookies: {
        title: "Çerez Politikası",
        updated: UPDATED,
        html: `
<h2>1. Bu politika neyi anlatır?</h2>
<p>Bu politika, CinePath web sitesini (“Site”) ziyaret ettiğinizde cihazınızda saklanan çerezleri ve benzeri teknolojileri (tarayıcı yerel depolaması, IndexedDB vb.) anlatır. Hangilerini neden kullandığımızı ve nasıl kontrol edebileceğinizi açıklar.</p>

<h2>2. Çerez nedir?</h2>
<p>Çerezler, ziyaret ettiğiniz sitenin tarayıcınıza kaydettiği küçük metin dosyalarıdır. “Yerel depolama” ve “IndexedDB” de benzer amaçla tarayıcınızda bilgi saklayan teknolojilerdir. Bu politikada hepsine kısaca “çerez” diyoruz.</p>

<h2>3. CinePath reklam veya takip çerezi kullanmaz</h2>
<p>CinePath'te reklam, yeniden hedefleme (retargeting) ya da ziyaretçi istatistiği tutan analitik çerezler <strong>bulunmaz</strong>. Kullandığımız çerezler yalnızca sitenin çalışması, oturumunuzun açık kalması, güvenlik ve tercihlerinizin hatırlanması içindir.</p>

<h2>4. Kullandığımız çerezler</h2>
<div class="legal-table"><table>
<thead><tr><th>Ad / Teknoloji</th><th>Sağlayıcı</th><th>Amaç</th><th>Tür</th><th>Süre</th></tr></thead>
<tbody>
<tr><td><code>cinepath:lang</code> (yerel depolama)</td><td>CinePath</td><td>Seçtiğiniz dili hatırlamak</td><td>Tercih (işlevsel)</td><td>Siz silene kadar</td></tr>
<tr><td><code>cinepath:cookie-notice</code> (yerel depolama)</td><td>CinePath</td><td>Çerez bilgilendirme notunu kapattığınızı hatırlamak</td><td>Tercih (işlevsel)</td><td>Siz silene kadar</td></tr>
<tr><td>Firebase Authentication oturum verisi (IndexedDB / yerel depolama)</td><td>Google Firebase</td><td>Giriş yaptığınızda oturumunuzu açık tutmak. “Beni hatırla” seçili değilse yalnızca tarayıcı sekmesi kapanana kadar tutulur.</td><td>Zorunlu</td><td>Çıkış yapana kadar veya oturum süresince</td></tr>
<tr><td>Google ile giriş çerezleri (<code>accounts.google.com</code>, <code>*.firebaseapp.com</code>)</td><td>Google</td><td>“Google ile giriş” penceresinin çalışması</td><td>Zorunlu (yalnızca bu yöntemi seçerseniz)</td><td>Google'ın belirlediği süre</td></tr>
<tr><td>reCAPTCHA Enterprise / Firebase App Check</td><td>Google</td><td>CineAI özelliğinin bot ve kötüye kullanıma karşı korunması</td><td>Zorunlu (güvenlik)</td><td>Google'ın belirlediği süre</td></tr>
</tbody></table></div>

<h2>5. Üçüncü taraf kaynaklar</h2>
<p>Site çalışırken aşağıdaki hizmetlerden içerik yüklenir. Bu sırada IP adresiniz ve tarayıcı bilgileriniz ilgili sağlayıcıya iletilebilir:</p>
<ul>
<li><strong>Google Fonts</strong> (yazı tipleri)</li>
<li><strong>Google Firebase</strong> (üyelik, veritabanı, CineAI yapay zekâ özelliği)</li>
<li><strong>OpenStreetMap</strong> (Keşfet sayfasındaki harita görselleri)</li>
<li><strong>ui-avatars.com</strong> (profil fotoğrafı olmayan üyeler için adın baş harflerinden oluşturulan görsel)</li>
<li><strong>Spotify, YouTube vb. dış bağlantılar:</strong> Yalnızca siz tıkladığınızda ilgili siteye gidersiniz. O sitelerin kendi çerez politikaları geçerlidir.</li>
</ul>

<h2>6. Çerezleri nasıl kontrol edebilirsiniz?</h2>
<p>Tarayıcınızın ayarlarından çerezleri ve site verilerini silebilir veya engelleyebilirsiniz. Zorunlu çerezleri engellerseniz giriş yapma, favoriler ve CineAI gibi özellikler çalışmayabilir. Dil tercihiniz silinirse site, tarayıcınızın dilini kullanır.</p>

<h2>7. Onay</h2>
<p>Sitede yalnızca zorunlu ve işlevsel çerezler kullanıldığı için ayrıca onay istenmez. İlk ziyaretinizde kısa bir bilgilendirme notu gösterilir. İleride analitik veya reklam çerezi eklenirse, bunlar ancak açık onayınız alındıktan sonra çalıştırılır.</p>

<h2>8. İletişim</h2>
<p>Sorularınız için: ${MAIL}</p>`
    },

    terms: {
        title: "Kullanıcı Sözleşmesi",
        updated: UPDATED,
        html: `
<h2>1. Taraflar ve kapsam</h2>
<p>Bu sözleşme, CinePath web sitesini ve hizmetlerini (“Hizmet”) işleten ${TODO("İşletenin adı / ünvanı, adresi")} (“CinePath”, “biz”) ile Hizmet'i kullanan kişi (“Kullanıcı”, “siz”) arasındadır. Siteye üye olarak veya Siteyi kullanarak bu sözleşmeyi kabul etmiş sayılırsınız. Kabul etmiyorsanız lütfen Hizmet'i kullanmayın.</p>

<h2>2. Hizmetin tanımı</h2>
<p>CinePath; Türkiye'deki film ve dizi çekim mekânlarını harita üzerinde gösteren, kullanıcıların mekânları puanlayıp fotoğraf paylaşabildiği, favori listesi oluşturabildiği ve yapay zekâ destekli (CineAI) öneriler alabildiği bir platformdur. Katalog ve bazı özellikler yalnızca üyelere açıktır.</p>

<h2>3. Üyelik</h2>
<ul>
<li>Üye olmak için ${TODO("13 / 18")} yaşını doldurmuş olmanız gerekir. Bu yaşın altındaysanız Siteyi ancak velinizin izniyle kullanabilirsiniz.</li>
<li>Kayıt sırasında doğru bilgi vermeyi kabul edersiniz.</li>
<li>Hesabınızın ve şifrenizin güvenliğinden siz sorumlusunuz. Hesabınızın izinsiz kullanıldığını fark ederseniz bize hemen haber verin.</li>
<li>Bir kişi yalnızca bir hesap açabilir. Hesaplar başkasına devredilemez.</li>
</ul>

<h2>4. Kullanım kuralları</h2>
<p>Hizmet'i kullanırken aşağıdakileri yapmamayı kabul edersiniz:</p>
<ul>
<li>Hukuka, genel ahlaka veya başkalarının haklarına aykırı içerik paylaşmak;</li>
<li>Başkasına ait fotoğrafları izinsiz yüklemek veya telif hakkını ihlal etmek;</li>
<li>Kişilerin yüzünü veya özel bilgilerini rızaları olmadan gösteren fotoğraflar paylaşmak;</li>
<li>Puanlama sistemini manipüle etmek, sahte hesap açmak;</li>
<li>Siteye, sunuculara veya diğer kullanıcılara zarar verecek yazılım, bot veya otomatik veri toplama araçları kullanmak;</li>
<li>Güvenlik önlemlerini aşmaya çalışmak;</li>
<li>CineAI özelliğini kötüye kullanmak veya otomatik sorgularla aşırı yüklemek.</li>
</ul>

<h2>5. Kullanıcı içerikleri</h2>
<ul>
<li>Yüklediğiniz fotoğrafların ve paylaştığınız puanların sorumluluğu size aittir.</li>
<li>Paylaştığınız içeriğin sahibi olarak kalırsınız. Ancak içeriği Hizmet kapsamında göstermemiz, saklamamız ve teknik olarak işlememiz için CinePath'e ücretsiz, münhasır olmayan ve dünya çapında geçerli bir kullanım izni verirsiniz. İçeriği silmeniz ya da hesabınızı kapatmanız hâlinde bu izin sona erer.</li>
<li>Bu sözleşmeye aykırı içerikleri önceden haber vermeden kaldırabiliriz.</li>
</ul>

<h2>6. Mekân bilgileri ve ziyaretler</h2>
<ul>
<li>Mekân bilgileri özenle hazırlanır, ancak eksiksiz ve güncel olacağı garanti edilmez. Bir mekân özel mülk olabilir, kapanmış olabilir veya ziyarete kapalı olabilir.</li>
<li>Mekânları ziyaret ederken yerel kurallara, mülkiyet haklarına ve güvenlik uyarılarına uymak sizin sorumluluğunuzdadır. Ziyaretler sırasında doğabilecek zararlardan CinePath sorumlu tutulamaz.</li>
<li>Yol tarifleri üçüncü taraf harita servislerine yönlendirilir.</li>
</ul>

<h2>7. CineAI (yapay zekâ önerileri)</h2>
<ul>
<li>CineAI önerileri Google'ın yapay zekâ modeli tarafından otomatik olarak üretilir. Bu öneriler hatalı veya eksik olabilir ve tavsiye niteliğindedir.</li>
<li>Öneri üretmek için seçtiğiniz filtreler, katalog bilgileri ve (“Bana özel” modunda) favori listenizdeki yapım adları Google'a iletilir. Adınız, e-posta adresiniz veya fotoğraflarınız gönderilmez.</li>
</ul>

<h2>8. Fikri mülkiyet</h2>
<p>Sitenin tasarımı, logosu, yazılımı ve CinePath tarafından hazırlanan metinler CinePath'e aittir. Film ve dizi adları, afişler ve diğer görseller hak sahiplerine aittir ve yalnızca tanıtım ve bilgilendirme amacıyla kullanılır. Sitedeki fotoğrafların lisans ve sahip bilgileri ilgili yerde belirtilir.</p>

<h2>9. Kişisel veriler</h2>
<p>Üyelik ve kullanım sırasında ad-soyad, e-posta adresi, favoriler, puanlar, yüklenen fotoğraflar ve seviye/XP bilgileri işlenir. Bu veriler Google Firebase altyapısında saklanır. Kişisel verilerinizin işlenmesi <a href="privacy.html">KVKK Aydınlatma Metni</a>'nde, çerezler ise <a href="cookies.html">Çerez Politikası</a>'nda ayrıca açıklanır.</p>

<h2>10. Hizmetin değiştirilmesi ve sonlandırılması</h2>
<ul>
<li>Hizmet'i veya bir bölümünü dilediğimiz zaman değiştirebilir, geçici olarak durdurabilir ya da sonlandırabiliriz.</li>
<li>Bu sözleşmeye aykırı davranan kullanıcıların hesaplarını askıya alabilir veya kapatabiliriz.</li>
<li>Hesabınızı istediğiniz zaman profil sayfanızdaki <strong>“Hesabımı sil”</strong> butonuyla kalıcı olarak silebilirsiniz. Sorun yaşarsanız ${MAIL} adresine yazabilirsiniz.</li>
</ul>

<h2>11. Sorumluluğun sınırlandırılması</h2>
<p>Hizmet “olduğu gibi” sunulur. Kesintisiz veya hatasız çalışacağı garanti edilmez. Kanunun izin verdiği ölçüde, Hizmet'in kullanımından veya kullanılamamasından doğan dolaylı zararlardan CinePath sorumlu değildir.</p>

<h2>12. Sözleşmede değişiklik</h2>
<p>Bu sözleşmeyi güncelleyebiliriz. Önemli değişiklikleri Sitede duyururuz. Güncellemeden sonra Hizmet'i kullanmaya devam etmeniz, yeni koşulları kabul ettiğiniz anlamına gelir.</p>

<h2>13. Uygulanacak hukuk ve yetkili mahkeme</h2>
<p>Bu sözleşmeye Türkiye Cumhuriyeti hukuku uygulanır. Uyuşmazlıklarda ${TODO("İstanbul (Çağlayan)")} mahkemeleri ve icra daireleri yetkilidir. Tüketici sıfatıyla hareket eden kullanıcıların kanundan doğan hakları saklıdır.</p>

<h2>14. İletişim</h2>
<p>${MAIL}</p>`
    },

    privacy: {
        title: "KVKK Aydınlatma Metni",
        updated: UPDATED,
        html: `
<h2>1. Veri sorumlusu</h2>
<p>Bu aydınlatma metni, 6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) kapsamında veri sorumlusu sıfatıyla ${TODO("İşletenin adı-soyadı / ünvanı")} (“CinePath”) tarafından hazırlanmıştır.</p>
<ul>
<li><strong>Adres:</strong> ${TODO("Açık adres")}</li>
<li><strong>E-posta:</strong> ${MAIL}</li>
</ul>

<h2>2. İşlenen kişisel veriler</h2>
<div class="legal-table"><table>
<thead><tr><th>Veri kategorisi</th><th>Hangi veriler</th><th>Ne zaman toplanır</th></tr></thead>
<tbody>
<tr><td><strong>Kimlik</strong></td><td>Ad-soyad (veya Google hesabınızdaki görünen ad)</td><td>Üye olurken, profilinizi düzenlerken</td></tr>
<tr><td><strong>İletişim</strong></td><td>E-posta adresi. Bize yazdığınızda e-posta adresiniz ve mesajınız</td><td>Üye olurken, bize e-posta gönderdiğinizde</td></tr>
<tr><td><strong>Müşteri işlem / kullanım</strong></td><td>Favori listesi, mekân puanları, seviye/XP, unvan, ziyaret ve fotoğraf sayıları, dil tercihi, hesap oluşturma tarihi</td><td>Siteyi kullanırken</td></tr>
<tr><td><strong>Görsel kayıtlar</strong></td><td>Mekânlarda çekip yüklediğiniz fotoğraflar. Google ile girişte Google profil fotoğrafınızın bağlantısı</td><td>Fotoğraf yüklediğinizde / Google ile giriş yaptığınızda</td></tr>
<tr><td><strong>İşlem güvenliği</strong></td><td>Şifrenin şifrelenmiş (hash) hâli, oturum bilgileri, giriş yöntemi, son giriş zamanı, IP adresi ve cihaz/tarayıcı bilgileri, kötüye kullanımı önleme (reCAPTCHA) sinyalleri</td><td>Giriş yaparken ve CineAI'ı kullanırken</td></tr>
<tr><td><strong>CineAI kullanım verileri</strong></td><td>CineAI'da seçtiğiniz filtreler. “Bana özel” modunda favori listenizdeki yapım adları</td><td>CineAI'dan öneri istediğinizde</td></tr>
</tbody></table></div>
<p>Şifreniz CinePath tarafından görülmez; kimlik doğrulama hizmeti sağlayıcısı tarafından şifrelenmiş olarak saklanır. <strong>Özel nitelikli kişisel veri</strong> (sağlık, din, etnik köken, biyometrik veri vb.) talep etmiyoruz. Lütfen yüklediğiniz fotoğraflarda bu tür bilgilere ve başka kişilerin yüzlerine yer vermeyin. Hizmet ${TODO("13 / 18")} yaşın altındaki kişilere yönelik değildir.</p>

<h2>3. Kişisel verilerin işlenme amaçları</h2>
<ol>
<li>Üyelik hesabınızın oluşturulması, kimliğinizin doğrulanması ve oturumunuzun yönetilmesi;</li>
<li>Film ve dizi çekim mekânları kataloğuna, haritaya ve üyelere özel özelliklere erişiminizin sağlanması;</li>
<li>Favori listenizin, mekân puanlarınızın, fotoğraflarınızın ve seviye/XP bilgilerinizin saklanması ve size gösterilmesi;</li>
<li>CineAI yapay zekâ özelliğiyle size film/dizi ve rota önerisi sunulması;</li>
<li>Bilgi güvenliğinin sağlanması, sahte hesapların, botların ve kötüye kullanımın önlenmesi;</li>
<li>Talep ve şikâyetlerinizin yanıtlanması;</li>
<li>Hukuki uyuşmazlıklarda hakların tesisi, kullanılması ve korunması; yetkili kurumların kanuni taleplerinin karşılanması.</li>
</ol>
<p>Verileriniz reklam, profilleme amaçlı pazarlama veya üçüncü kişilere satış amacıyla <strong>kullanılmaz</strong>.</p>

<h2>4. Toplama yöntemi ve hukuki sebepler</h2>
<p>Kişisel verileriniz; kayıt ve giriş formları, Google ile giriş, profil sayfası, fotoğraf yükleme ve puanlama alanları, CineAI sayfası ve e-posta yazışmaları aracılığıyla elektronik ortamda, otomatik yollarla toplanır.</p>
<div class="legal-table"><table>
<thead><tr><th>Hukuki sebep (KVKK md. 5/2)</th><th>İlgili işlemler</th></tr></thead>
<tbody>
<tr><td><strong>(c)</strong> Sözleşmenin kurulması veya ifası</td><td>Üyelik, giriş, favoriler, puanlar, fotoğraflar, seviye/XP, CineAI önerileri</td></tr>
<tr><td><strong>(f)</strong> Meşru menfaat</td><td>Bilgi güvenliği, bot ve kötüye kullanımın önlenmesi, hizmetin iyileştirilmesi, taleplerin yanıtlanması</td></tr>
<tr><td><strong>(e)</strong> Bir hakkın tesisi, kullanılması veya korunması</td><td>Uyuşmazlık hâlinde kayıtların saklanması ve kullanılması</td></tr>
<tr><td><strong>(ç)</strong> Hukuki yükümlülük</td><td>Yetkili kamu kurumlarının kanuni taleplerinin karşılanması</td></tr>
</tbody></table></div>

<h2>5. Kişisel verilerin aktarılması</h2>
<div class="legal-table"><table>
<thead><tr><th>Alıcı</th><th>Aktarılan veriler</th><th>Amaç</th></tr></thead>
<tbody>
<tr><td>Google — Firebase (Authentication, Cloud Firestore, App Check)</td><td>Hesap, kullanım, görsel kayıt ve işlem güvenliği verileri</td><td>Barındırma, veritabanı, kimlik doğrulama ve güvenlik hizmetleri</td></tr>
<tr><td>Google — Firebase AI Logic / Gemini</td><td>CineAI filtreleriniz, “Bana özel” modunda favori yapım adlarınız. Ad, e-posta veya fotoğraf gönderilmez.</td><td>Yapay zekâ önerisi üretilmesi</td></tr>
<tr><td>Google — reCAPTCHA Enterprise</td><td>IP adresi, cihaz/tarayıcı bilgileri, etkileşim sinyalleri</td><td>Bot ve kötüye kullanımın önlenmesi</td></tr>
<tr><td>ui-avatars.com</td><td>Adınız (profil fotoğrafınız yoksa)</td><td>Profilinizde baş harflerinizden oluşan görselin gösterilmesi</td></tr>
<tr><td>Google Fonts, OpenStreetMap</td><td>IP adresi ve tarayıcı bilgileri (sayfa yüklenirken teknik olarak)</td><td>Yazı tiplerinin ve harita görsellerinin gösterilmesi</td></tr>
<tr><td>Yetkili kamu kurum ve kuruluşları, yargı mercileri</td><td>Talep edilen veriler</td><td>Kanuni yükümlülüklerin yerine getirilmesi</td></tr>
</tbody></table></div>
<p>Yüklediğiniz fotoğraflar ve verdiğiniz puanlar <strong>yalnızca size görünür</strong>; diğer kullanıcılarla paylaşılmaz.</p>

<h2>6. Yurt dışına aktarım</h2>
<p>Kullandığımız Google (Firebase) altyapısının sunucuları yurt dışında bulunabilir. Bu nedenle kişisel verileriniz yurt dışına aktarılmaktadır. Aktarım, KVKK md. 9 kapsamında ${TODO("seçilen dayanak, ör. Kurul'un ilan ettiği standart sözleşme")} ile yapılır.</p>

<h2>7. Saklama süreleri</h2>
<ul>
<li><strong>Hesap ve profil verileri, favoriler, puanlar, fotoğraflar:</strong> Hesabınız açık olduğu sürece. “Hesabımı sil” ile hesabınızı sildiğinizde bu veriler hemen silinir; hizmet sağlayıcının teknik yedeklerinden en geç ${TODO("30")} gün içinde kalkar.</li>
<li><strong>Tek tek silinen fotoğraflar ve puanlar:</strong> Siz sildiğiniz anda silinir.</li>
<li><strong>İşlem güvenliği kayıtları:</strong> Hizmet sağlayıcının belirlediği süreler ve kanuni zamanaşımı süreleri boyunca.</li>
<li><strong>E-posta yazışmaları:</strong> Talebiniz sonuçlandıktan sonra ${TODO("2")} yıl.</li>
<li>Hukuki uyuşmazlık hâlinde ilgili veriler, uyuşmazlık sonuçlanana ve zamanaşımı süreleri dolana kadar saklanabilir.</li>
</ul>

<h2>8. Haklarınız (KVKK md. 11)</h2>
<p>Veri sorumlusuna başvurarak şu haklarınızı kullanabilirsiniz:</p>
<ol type="a">
<li>Kişisel verilerinizin işlenip işlenmediğini öğrenme,</li>
<li>İşlenmişse buna ilişkin bilgi talep etme,</li>
<li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
<li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme,</li>
<li>Eksik veya yanlış işlenmişse düzeltilmesini isteme,</li>
<li>KVKK md. 7'deki şartlar çerçevesinde silinmesini veya yok edilmesini isteme,</li>
<li>Düzeltme ve silme işlemlerinin, verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme,</li>
<li>Münhasıran otomatik sistemlerle analiz edilmesi sonucunda aleyhinize bir sonuç çıkmasına itiraz etme,</li>
<li>Kanuna aykırı işleme nedeniyle zarara uğramanız hâlinde zararın giderilmesini talep etme.</li>
</ol>
<p><strong>Kendiniz yapabilecekleriniz:</strong> Profil bilgilerinizi profil sayfanızdan düzeltebilir, fotoğraflarınızı ve favorilerinizi istediğiniz zaman silebilir, profil sayfanızdaki <strong>“Hesabımı sil”</strong> butonuyla hesabınızı ve tüm verilerinizi kalıcı olarak silebilirsiniz.</p>

<h2>9. Başvuru yöntemi</h2>
<p>Başvurularınızı, Veri Sorumlusuna Başvuru Usul ve Esasları Hakkında Tebliğ'e uygun olarak kayıtlı e-posta adresinizden ${MAIL} adresine konu satırına “KVKK Bilgi Talebi” yazarak veya ${TODO("adres")} adresine ıslak imzalı dilekçeyle iletebilirsiniz. Başvurunuzda adınız-soyadınız, iletişim bilginiz ve talebinizin konusu bulunmalıdır.</p>
<p>Başvurunuz en geç <strong>30 gün</strong> içinde ücretsiz olarak sonuçlandırılır. İşlemin ayrıca bir maliyet gerektirmesi hâlinde Kurul'un belirlediği tarifedeki ücret alınabilir. Başvurunuzun reddedilmesi, cevabı yetersiz bulmanız veya süresinde cevap verilmemesi hâlinde Kişisel Verileri Koruma Kurulu'na şikâyette bulunabilirsiniz.</p>

<h2>10. Değişiklikler</h2>
<p>Bu metni gerektiğinde güncelleyebiliriz. Güncel metin her zaman bu sayfada yayımlanır. Önemli değişiklikleri sitede duyururuz.</p>`
    }
};
