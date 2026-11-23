// Legal documents — English translation. The Turkish version is binding.
// Trusted static HTML, never user data. <mark class="legal-todo"> marks details still to be filled in.
const TODO = (s) => `<mark class="legal-todo">[${s}]</mark>`;
const UPDATED = TODO("DD.MM.YYYY");
const MAIL = '<a href="mailto:cinepathcontact@gmail.com">cinepathcontact@gmail.com</a>';

export default {
    cookies: {
        title: "Cookie Policy",
        updated: UPDATED,
        html: `
<h2>1. What this policy covers</h2>
<p>This policy describes the cookies and similar technologies (browser local storage, IndexedDB, etc.) stored on your device when you visit the CinePath website (the “Site”), why we use them and how you can control them.</p>

<h2>2. What is a cookie?</h2>
<p>Cookies are small text files that a website saves in your browser. “Local storage” and “IndexedDB” are similar technologies that keep information in your browser. In this policy we simply call all of them “cookies”.</p>

<h2>3. CinePath does not use advertising or tracking cookies</h2>
<p>CinePath has <strong>no</strong> advertising, retargeting or analytics cookies. The cookies we use exist only to make the Site work, keep you signed in, protect the service and remember your preferences.</p>

<h2>4. Cookies we use</h2>
<div class="legal-table"><table>
<thead><tr><th>Name / technology</th><th>Provider</th><th>Purpose</th><th>Type</th><th>Duration</th></tr></thead>
<tbody>
<tr><td><code>cinepath:lang</code> (local storage)</td><td>CinePath</td><td>Remembers the language you chose</td><td>Preference (functional)</td><td>Until you delete it</td></tr>
<tr><td><code>cinepath:cookie-notice</code> (local storage)</td><td>CinePath</td><td>Remembers that you closed the cookie notice</td><td>Preference (functional)</td><td>Until you delete it</td></tr>
<tr><td>Firebase Authentication session data (IndexedDB / local storage)</td><td>Google Firebase</td><td>Keeps you signed in. If “Remember me” is not ticked, it is kept only until the browser tab is closed.</td><td>Strictly necessary</td><td>Until you sign out, or for the session</td></tr>
<tr><td>Google sign-in cookies (<code>accounts.google.com</code>, <code>*.firebaseapp.com</code>)</td><td>Google</td><td>Make the “Continue with Google” window work</td><td>Strictly necessary (only if you choose this method)</td><td>Set by Google</td></tr>
<tr><td>reCAPTCHA Enterprise / Firebase App Check</td><td>Google</td><td>Protect CineAI against bots and abuse</td><td>Strictly necessary (security)</td><td>Set by Google</td></tr>
</tbody></table></div>

<h2>5. Third-party resources</h2>
<p>While the Site is running, content is loaded from the services below. Your IP address and browser details may be sent to these providers:</p>
<ul>
<li><strong>Google Fonts</strong> (fonts)</li>
<li><strong>Google Firebase</strong> (accounts, database, the CineAI feature)</li>
<li><strong>OpenStreetMap</strong> (map images on the Explore page)</li>
<li><strong>ui-avatars.com</strong> (an image made from your initials for members without a profile photo)</li>
<li><strong>External links such as Spotify or YouTube:</strong> you only go to those sites when you click, and their own cookie policies apply.</li>
</ul>

<h2>6. How to control cookies</h2>
<p>You can delete or block cookies and site data in your browser settings. If you block strictly necessary cookies, signing in, favourites and CineAI may stop working. If your language preference is deleted, the Site uses your browser's language.</p>

<h2>7. Consent</h2>
<p>As the Site only uses strictly necessary and functional cookies, no separate consent is requested. A short notice is shown on your first visit. If analytics or advertising cookies are ever added, they will only run after you have given your explicit consent.</p>

<h2>8. Contact</h2>
<p>Questions: ${MAIL}</p>`
    },

    terms: {
        title: "Terms of Use",
        updated: UPDATED,
        html: `
<h2>1. Parties and scope</h2>
<p>These terms are an agreement between ${TODO("operator's name / company, address")} (“CinePath”, “we”), who operates the CinePath website and services (the “Service”), and the person using the Service (“User”, “you”). By signing up for or using the Site you accept these terms. If you do not accept them, please do not use the Service.</p>

<h2>2. The Service</h2>
<p>CinePath is a platform that shows film and TV filming locations in Turkey on a map, lets users rate locations, share photos and keep a favourites list, and offers AI-powered recommendations (CineAI). The catalogue and some features are available to members only.</p>

<h2>3. Membership</h2>
<ul>
<li>You must be at least ${TODO("13 / 18")} years old to sign up. Below that age you may use the Site only with your parent's or guardian's permission.</li>
<li>You agree to give accurate information when signing up.</li>
<li>You are responsible for keeping your account and password secure. Tell us immediately if you notice unauthorised use of your account.</li>
<li>Each person may have only one account. Accounts cannot be transferred.</li>
</ul>

<h2>4. Rules of use</h2>
<p>When using the Service you agree not to:</p>
<ul>
<li>share content that is unlawful, offensive or violates the rights of others;</li>
<li>upload other people's photos without permission or infringe copyright;</li>
<li>share photos showing people's faces or private information without their consent;</li>
<li>manipulate the rating system or create fake accounts;</li>
<li>use software, bots or automated scraping tools that could harm the Site, its servers or other users;</li>
<li>try to bypass security measures;</li>
<li>abuse CineAI or overload it with automated requests.</li>
</ul>

<h2>5. User content</h2>
<ul>
<li>You are responsible for the photos you upload and the ratings you give.</li>
<li>You keep ownership of your content. You grant CinePath a free, non-exclusive, worldwide licence to display, store and technically process it as part of the Service. This licence ends when you delete the content or your account.</li>
<li>We may remove content that breaks these terms without prior notice.</li>
</ul>

<h2>6. Location information and visits</h2>
<ul>
<li>Location information is prepared with care, but we do not guarantee that it is complete or up to date. A location may be private property, closed or not open to visitors.</li>
<li>When visiting locations, you are responsible for following local rules, property rights and safety warnings. CinePath cannot be held liable for any harm during visits.</li>
<li>Directions are provided by third-party map services.</li>
</ul>

<h2>7. CineAI (AI recommendations)</h2>
<ul>
<li>CineAI recommendations are generated automatically by Google's AI model. They may be wrong or incomplete and are for guidance only.</li>
<li>To create a recommendation, the filters you choose, catalogue information and (in “Just for me” mode) the titles in your favourites are sent to Google. Your name, e-mail address and photos are not sent.</li>
</ul>

<h2>8. Intellectual property</h2>
<p>The Site's design, logo, software and the texts written by CinePath belong to CinePath. Film and series titles, posters and other images belong to their rights holders and are used for information and promotion only. Licence and author details of photos on the Site are given where they appear.</p>

<h2>9. Personal data</h2>
<p>When you sign up and use the Service we process your name, e-mail address, favourites, ratings, uploaded photos and level/XP. This data is stored on Google Firebase. How we process personal data is explained in the <a href="privacy.html">Privacy Notice</a>, and cookies in the <a href="cookies.html">Cookie Policy</a>.</p>

<h2>10. Changes to and termination of the Service</h2>
<ul>
<li>We may change, suspend or end the Service or any part of it at any time.</li>
<li>We may suspend or close the accounts of users who break these terms.</li>
<li>You can permanently delete your account at any time with the <strong>“Delete my account”</strong> button on your profile page. If anything goes wrong, write to ${MAIL}.</li>
</ul>

<h2>11. Limitation of liability</h2>
<p>The Service is provided “as is”. We do not guarantee that it will work without interruption or errors. To the extent permitted by law, CinePath is not liable for indirect damages arising from the use of, or inability to use, the Service.</p>

<h2>12. Changes to these terms</h2>
<p>We may update these terms and will announce important changes on the Site. By continuing to use the Service after an update, you accept the new terms.</p>

<h2>13. Governing law and jurisdiction</h2>
<p>These terms are governed by the laws of the Republic of Turkey. The courts and enforcement offices of ${TODO("Istanbul (Çağlayan)")} have jurisdiction over disputes. Statutory rights of users acting as consumers are reserved.</p>

<h2>14. Contact</h2>
<p>${MAIL}</p>`
    },

    privacy: {
        title: "Privacy Notice (KVKK)",
        updated: UPDATED,
        html: `
<h2>1. Data controller</h2>
<p>This notice is provided under the Turkish Personal Data Protection Law No. 6698 (“KVKK”) by ${TODO("operator's name / company")} (“CinePath”) as the data controller.</p>
<ul>
<li><strong>Address:</strong> ${TODO("full address")}</li>
<li><strong>E-mail:</strong> ${MAIL}</li>
</ul>

<h2>2. Personal data we process</h2>
<div class="legal-table"><table>
<thead><tr><th>Category</th><th>Data</th><th>When it is collected</th></tr></thead>
<tbody>
<tr><td><strong>Identity</strong></td><td>Name (or the display name of your Google account)</td><td>When you sign up or edit your profile</td></tr>
<tr><td><strong>Contact</strong></td><td>E-mail address. If you write to us, your e-mail address and message</td><td>When you sign up or e-mail us</td></tr>
<tr><td><strong>Usage</strong></td><td>Favourites, location ratings, level/XP, title, visit and photo counts, language preference, account creation date</td><td>While you use the Site</td></tr>
<tr><td><strong>Images</strong></td><td>Photos you upload. With Google sign-in, the link to your Google profile photo</td><td>When you upload a photo / sign in with Google</td></tr>
<tr><td><strong>Security</strong></td><td>Hashed password, session data, sign-in method, last sign-in time, IP address, device/browser details, anti-abuse (reCAPTCHA) signals</td><td>When you sign in and when you use CineAI</td></tr>
<tr><td><strong>CineAI usage</strong></td><td>The filters you choose in CineAI. In “Just for me” mode, the titles in your favourites</td><td>When you ask CineAI for a recommendation</td></tr>
</tbody></table></div>
<p>CinePath never sees your password; it is stored hashed by the authentication provider. We do <strong>not</strong> ask for special categories of personal data (health, religion, ethnic origin, biometrics, etc.). Please do not include such information or other people's faces in the photos you upload. The Service is not intended for people under ${TODO("13 / 18")}.</p>

<h2>3. Why we process personal data</h2>
<ol>
<li>To create your account, verify your identity and manage your session;</li>
<li>To give you access to the catalogue of filming locations, the map and members-only features;</li>
<li>To store and show your favourites, ratings, photos and level/XP;</li>
<li>To give you film/series and route recommendations with CineAI;</li>
<li>To keep the Service secure and prevent fake accounts, bots and abuse;</li>
<li>To answer your requests and complaints;</li>
<li>To establish, exercise and defend legal claims, and to respond to lawful requests from authorities.</li>
</ol>
<p>Your data is <strong>not</strong> used for advertising or marketing profiles and is never sold.</p>

<h2>4. How data is collected and legal grounds</h2>
<p>Personal data is collected electronically and automatically through the sign-up and sign-in forms, Google sign-in, the profile page, photo upload and rating features, the CineAI page and e-mail.</p>
<div class="legal-table"><table>
<thead><tr><th>Legal ground (KVKK Art. 5/2)</th><th>Processing</th></tr></thead>
<tbody>
<tr><td><strong>(c)</strong> Conclusion or performance of a contract</td><td>Membership, sign-in, favourites, ratings, photos, level/XP, CineAI recommendations</td></tr>
<tr><td><strong>(f)</strong> Legitimate interest</td><td>Security, preventing bots and abuse, improving the Service, answering requests</td></tr>
<tr><td><strong>(e)</strong> Establishing, exercising or defending a right</td><td>Keeping and using records in case of a dispute</td></tr>
<tr><td><strong>(ç)</strong> Legal obligation</td><td>Responding to lawful requests from public authorities</td></tr>
</tbody></table></div>

<h2>5. Who we share data with</h2>
<div class="legal-table"><table>
<thead><tr><th>Recipient</th><th>Data</th><th>Purpose</th></tr></thead>
<tbody>
<tr><td>Google — Firebase (Authentication, Cloud Firestore, App Check)</td><td>Account, usage, image and security data</td><td>Hosting, database, authentication and security</td></tr>
<tr><td>Google — Firebase AI Logic / Gemini</td><td>Your CineAI filters; in “Just for me” mode, your favourite titles. No name, e-mail or photos.</td><td>Generating AI recommendations</td></tr>
<tr><td>Google — reCAPTCHA Enterprise</td><td>IP address, device/browser details, interaction signals</td><td>Preventing bots and abuse</td></tr>
<tr><td>ui-avatars.com</td><td>Your name (if you have no profile photo)</td><td>Showing an image of your initials on your profile</td></tr>
<tr><td>Google Fonts, OpenStreetMap</td><td>IP address and browser details (technically, when pages load)</td><td>Showing fonts and map images</td></tr>
<tr><td>Competent public authorities and courts</td><td>The data requested</td><td>Meeting legal obligations</td></tr>
</tbody></table></div>
<p>The photos you upload and the ratings you give are <strong>visible only to you</strong> and are not shared with other users.</p>

<h2>6. Transfers abroad</h2>
<p>The servers of the Google (Firebase) infrastructure we use may be located outside Turkey, so your personal data is transferred abroad. The transfer is made under KVKK Art. 9 on the basis of ${TODO("chosen safeguard, e.g. the standard contract published by the Board")}.</p>

<h2>7. How long we keep data</h2>
<ul>
<li><strong>Account and profile data, favourites, ratings, photos:</strong> as long as your account exists. When you delete your account with “Delete my account”, this data is deleted immediately and disappears from the provider's technical backups within ${TODO("30")} days at the latest.</li>
<li><strong>Photos and ratings you delete one by one:</strong> deleted as soon as you delete them.</li>
<li><strong>Security records:</strong> for the periods set by the provider and the statutory limitation periods.</li>
<li><strong>E-mail correspondence:</strong> ${TODO("2")} years after your request is closed.</li>
<li>In a legal dispute, the relevant data may be kept until the dispute is resolved and limitation periods have expired.</li>
</ul>

<h2>8. Your rights (KVKK Art. 11)</h2>
<p>By applying to the data controller you can:</p>
<ol type="a">
<li>learn whether your personal data is processed,</li>
<li>request information about the processing,</li>
<li>learn the purpose of processing and whether data is used accordingly,</li>
<li>know the third parties in Turkey or abroad to whom data is transferred,</li>
<li>ask for incomplete or inaccurate data to be corrected,</li>
<li>ask for data to be deleted or destroyed under the conditions of KVKK Art. 7,</li>
<li>ask for corrections and deletions to be notified to the third parties the data was transferred to,</li>
<li>object to a result against you arising solely from automated analysis,</li>
<li>claim compensation if you suffer damage due to unlawful processing.</li>
</ol>
<p><strong>What you can do yourself:</strong> correct your profile on your profile page, delete your photos and favourites at any time, and permanently delete your account and all your data with the <strong>“Delete my account”</strong> button on your profile page.</p>

<h2>9. How to apply</h2>
<p>In line with the Communiqué on the Procedures and Principles of Application to the Data Controller, you can send your request from your registered e-mail address to ${MAIL} with the subject “KVKK Information Request”, or by a signed letter to ${TODO("address")}. Please include your name, contact details and the subject of your request.</p>
<p>Requests are answered free of charge within <strong>30 days</strong> at the latest. If the request involves an additional cost, the fee set by the Board may be charged. If your request is rejected, you find the answer insufficient, or it is not answered in time, you may file a complaint with the Turkish Personal Data Protection Board.</p>

<h2>10. Changes</h2>
<p>We may update this notice when needed. The current version is always published on this page, and important changes are announced on the Site.</p>`
    }
};
