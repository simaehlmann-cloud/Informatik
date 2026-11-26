#!/usr/bin/env python3
"""Erzeugt Datenschutz, Impressum und Lizenzen (Deutsch/Englisch) in www/ und – zusammen mit
den Support-Seiten – die öffentliche Webseite in docs/ (GitHub Pages, Ordner /docs).

    python3 tools/make-legal.py

Rechtstexte nur hier ändern, dann neu erzeugen. Bewusst ohne Namen von
Betriebssystemen oder App-Vertrieben (wie bei SneakPlay); validate.js prüft das."""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "www")
APP = "Bit für Bit"
import json as _json, os as _os
_V = ".".join(_json.load(open(_os.path.join(_os.path.dirname(__file__), "..", "package.json")))["version"].split(".")[:2])
STAND_DE = f"Stand: November 2026 (Version {_V})"
STAND_EN = f"Last updated: November 2026 (version {_V})"
MAIL = "smaehlmann.appdev@gmail.com"

ADDR = """<address>
    Wisdompeak Apps<br>
    {owner}: Simon Mählmann<br>
    Oderstraße 13<br>
    28844 Weyhe<br>
    {country}
  </address>"""
ADDR_DE = ADDR.format(owner="Inhaber", country="Deutschland")
ADDR_EN = ADDR.format(owner="Owner", country="Germany")

HEAD = """<!DOCTYPE html>
<html lang="{lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<meta name="color-scheme" content="light dark">
<title>{title} – {app}</title>
<style>
  :root {{ --bg:#F3F5FB; --card:#fff; --ink:#141B3A; --muted:#5A6386; --line:#E2E7F3; --pri:#4255E8; }}
  @media (prefers-color-scheme: dark) {{ :root {{ --bg:#0E1326; --card:#171F3A; --ink:#EEF1FB; --muted:#A4ACCB; --line:#2A3560; --pri:#7C8BFF; }} }}
  * {{ box-sizing: border-box; }}
  body {{ margin:0; padding:calc(24px + env(safe-area-inset-top)) 16px calc(40px + env(safe-area-inset-bottom)); background:var(--bg); color:var(--ink);
         font-family: system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif; line-height:1.6; }}
  main {{ max-width:760px; margin:0 auto; background:var(--card); border:1.5px solid var(--line); border-radius:24px; padding:24px; border-top:8px solid var(--pri); }}
  h1 {{ font-family: ui-rounded, "SF Pro Rounded", system-ui, sans-serif; font-size:clamp(26px,5vw,34px); margin:0 0 4px; }}
  h2 {{ font-size:clamp(18px,4vw,21px); margin:28px 0 8px; }}
  .stand {{ color:var(--muted); font-size:14px; margin:0 0 20px; }}
  address {{ font-style:normal; }}
  a {{ color:var(--pri); }}
  .links {{ margin-top:32px; display:flex; flex-wrap:wrap; gap:10px; }}
  .links a {{ display:inline-block; padding:12px 20px; border-radius:999px; text-decoration:none; font-weight:700; border:2px solid var(--line); color:var(--ink); }}
  pre {{ white-space:pre-wrap; font-size:12px; background:var(--bg); padding:12px; border-radius:12px; overflow-x:auto; }}
  .links a.back {{ background:var(--pri); border-color:var(--pri); color:#fff; }}
</style>
</head>
<body>
<main>
"""

FOOT = """  <div class="links">
    <a class="back" href="index.html">{back}</a>
    <a href="{other}">{other_label}</a>
    <a href="{lang_link}">{lang_label}</a>
  </div>
</main>
</body>
</html>
"""

PAGES = {
"datenschutz.html": ("de", "Datenschutz", f"""
  <h1>Datenschutzerklärung</h1>
  <p class="stand">{APP} · {STAND_DE}</p>

  <h2>1. Verantwortlicher</h2>
  <p>Verantwortlich im Sinne von Art. 4 Nr. 7 DSGVO ist:</p>
  {ADDR_DE}
  <p>E-Mail: <a href="mailto:{MAIL}">{MAIL}</a></p>
  <p>Ein Datenschutzbeauftragter ist nicht bestellt, da die Voraussetzungen des Art. 37 DSGVO und des § 38 BDSG nicht vorliegen.</p>

  <h2>2. Grundsatz: keine Datenerhebung</h2>
  <p>{APP} verarbeitet keine personenbezogenen Daten auf Servern des Anbieters. Die App funktioniert vollständig offline. Es gibt keine Konten beim Anbieter, keine Registrierung, keine Analyse- oder Trackingdienste, keine Werbung und keine Weitergabe von Daten an Dritte. Profilnamen und Passwörter (falls Profile genutzt werden) bleiben auf dem Gerät. Die App ist damit auch für den Einsatz im Unterricht geeignet.</p>

  <h2>3. Welche Daten auf dem Gerät gespeichert werden</h2>
  <p>Ausschließlich im lokalen Speicher der App auf dem jeweiligen Gerät liegen:</p>
  <ul>
    <li><b>Profile:</b> ein Vor- oder Spitzname bzw. ein Kürzel, das Passwort nur als Hashwert (PBKDF2 mit Salt – das Passwort selbst wird nirgends gespeichert), die gewählte Stufe und gegebenenfalls die beigetretene Klasse</li>
    <li><b>Lernfortschritt je Profil:</b> Sterne je Station und Stufe, Anzahl der Versuche, Fehler, genutzte Tipps, Übungszeit und Datum der letzten Nutzung</li>
    <li><b>Eltern-/Lehrkraftbereich:</b> das Passwort dieses Bereichs nur als Hashwert; auf dem Gerät der Lehrkraft außerdem die angelegten Klassen, die Klassenliste (Kürzel) und die eingesammelten Ergebnisse</li>
    <li>Einstellungen zur Nutzung (ohne Profile/Zuhause/Schule, Gastzugang), Sprache, Darstellung, Schriftgröße und Tönen</li>
  </ul>
  <p>Eingaben in den Übungen – etwa ausprobierte Passwörter – werden nicht gespeichert und nicht übertragen. Die Vorlesefunktion nutzt die Sprachausgabe Ihres Geräts; die App überträgt dabei selbst keine Daten. Nach 15 Minuten ohne Nutzung wird ein Profil automatisch abgemeldet.</p>
  <p>Wird die App „ohne Profile“ genutzt, gibt es keinen Namen und kein Passwort; gespeichert werden nur Stufe und Lernfortschritt des Geräts. Wer „als Gast“ übt, dessen Fortschritt wird nur bis zum Schließen der App vorgehalten und danach verworfen.</p>
  <p>Alle Daten sind für den Anbieter nicht einsehbar. Profile und Klassen lassen sich im Eltern- bzw. Lehrkraftbereich löschen; Klassen und eingesammelte Ergebnisse werden zum Schuljahresende (31. Juli) automatisch gelöscht. Beim Entfernen der App wird alles gelöscht.</p>

  <h2>3a. Weitergabe von Ergebnissen per QR-Code (Schule)</h2>
  <p>Im Schulbetrieb kann ein Profil seinen Lernfortschritt als QR-Code anzeigen. Die Lehrkraft liest ihn mit der Kamera ihres Geräts ein. Der Code enthält nur Name bzw. Kürzel, Sterne, Versuche, Fehler, Tipps, Übungszeit und Zeitpunkte sowie eine Prüfsumme. Die Übertragung erfolgt direkt von Bildschirm zu Kamera, ohne Internet und ohne Server des Anbieters.</p>
  <p>Für die Verarbeitung der Schülerdaten auf schuleigenen Geräten und auf dem Gerät der Lehrkraft ist die Schule verantwortlich. Wir empfehlen, Kürzel statt voller Namen zu verwenden.</p>

  <h2>3b. Kamera</h2>
  <p>Die Kamera wird nur verwendet, wenn Sie einen Klassen- oder Abgabe-Code scannen, und nur nach Ihrer Erlaubnis. Die Bilder werden ausschließlich auf dem Gerät ausgewertet und weder gespeichert noch übertragen. Alternativ kann ein Foto gewählt oder der Code als Text eingefügt werden.</p>

  <h2>4. Kauf der App</h2>
  <p>Die App wird als Einmalkauf über den App-Vertrieb angeboten, über den Sie sie installieren. Bezahlung und Abwicklung erfolgen ausschließlich durch den Betreiber dieses Vertriebs nach dessen Datenschutzbestimmungen. Der Anbieter erhält dabei keine Angaben, mit denen sich einzelne Käuferinnen oder Käufer identifizieren lassen, sondern nur zusammengefasste Verkaufszahlen. Die App selbst enthält keine Kaufknöpfe und keine In-App-Käufe.</p>

  <h2>5. Absturzberichte und Statistiken des App-Vertriebs</h2>
  <p>Wenn Sie es in den Einstellungen Ihres Geräts erlaubt haben, stellt der Betreiber des App-Vertriebs dem Anbieter zusammengefasste, nicht personenbezogene Statistiken und Absturzberichte zur Verfügung. Darauf hat die App keinen Einfluss; die Einstellung können Sie jederzeit auf Ihrem Gerät ändern.</p>

  <h2>6. Kontakt per E-Mail</h2>
  <p>Wenn Sie über „Feedback senden“ oder auf anderem Weg eine E-Mail schreiben, wird Ihr E-Mail-Programm geöffnet. Die E-Mail enthält, wenn Sie sie nicht ändern, die App-Version, die gewählte Sprache und Angaben zum Gerätetyp, damit Fehler nachvollzogen werden können. Ihre Nachricht und Ihre E-Mail-Adresse werden nur zur Bearbeitung Ihres Anliegens verwendet (Art. 6 Abs. 1 lit. f DSGVO) und gelöscht, sobald sie dafür nicht mehr benötigt werden.</p>

  <h2>7. Berechtigungen</h2>
  <p>Die App nutzt die Kamera nur zum Scannen von Codes (siehe 3b). Mikrofon, Standort und Kontakte werden nicht verwendet; auf Fotos greift die App nur zu, wenn Sie selbst ein Foto eines Codes auswählen. Die App baut keine Verbindungen zum Internet auf.</p>

  <h2>8. Ihre Rechte</h2>
  <p>Sie haben die Rechte auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch nach Art. 15 bis 21 DSGVO sowie das Recht auf Beschwerde bei einer Datenschutz-Aufsichtsbehörde. Da der Anbieter keine personenbezogenen Daten aus der App speichert, werden Auskunfts- oder Löschanfragen an den Anbieter in der Regel ins Leere gehen. Alle Daten können Sie in der App jederzeit selbst löschen.</p>

  <h2>9. Änderungen</h2>
  <p>Diese Erklärung wird angepasst, sobald sich datenschutzrelevante Funktionen der App ändern. Die aktuelle Fassung ist stets in der App abrufbar.</p>
"""),
"datenschutz-en.html": ("en", "Privacy", f"""
  <h1>Privacy policy</h1>
  <p class="stand">{APP} · {STAND_EN}</p>

  <h2>1. Controller</h2>
  <p>The controller within the meaning of Art. 4(7) GDPR is:</p>
  {ADDR_EN}
  <p>Email: <a href="mailto:{MAIL}">{MAIL}</a></p>
  <p>No data protection officer has been appointed, as the requirements of Art. 37 GDPR and Section 38 BDSG are not met.</p>

  <h2>2. Principle: no data collection</h2>
  <p>{APP} does not process any personal data on the provider’s servers. The app works completely offline. There are no accounts with the provider, no registration, no analytics or tracking services, no advertising and no sharing of data with third parties. Profile names and passwords (if profiles are used) stay on the device. This makes the app suitable for use in class.</p>

  <h2>3. Data stored on the device</h2>
  <p>Only the following is stored, in the app’s local storage on the device concerned:</p>
  <ul>
    <li><b>Profiles:</b> a first name, nickname or code, the password only as a hash (PBKDF2 with salt – the password itself is not stored anywhere), the chosen level and, if applicable, the class joined</li>
    <li><b>Learning progress per profile:</b> stars per station and level, number of attempts, mistakes, tips used, practice time and date of last use</li>
    <li><b>Parent/teacher area:</b> the password of this area only as a hash; on the teacher’s device also the classes created, the class list (codes) and the collected results</li>
    <li>settings for use (without profiles/home/school, guest access), language, appearance, text size and sounds</li>
  </ul>
  <p>Input in the exercises – such as passwords you try out – is neither stored nor transmitted. The read-aloud feature uses your device’s speech output; the app itself transmits no data. A profile is logged out automatically after 15 minutes without use.</p>
  <p>If the app is used “without profiles”, there is no name and no password; only the device’s level and learning progress are stored. When practising “as a guest”, progress is kept only until the app is closed and is then discarded.</p>
  <p>None of this data can be viewed by the provider. Profiles and classes can be deleted in the parent or teacher area; classes and collected results are deleted automatically at the end of the school year (31 July). Removing the app deletes everything.</p>

  <h2>3a. Passing on results by QR code (school)</h2>
  <p>In school use, a profile can show its learning progress as a QR code. The teacher reads it with the camera of their device. The code only contains the name or code, stars, attempts, mistakes, tips, practice time and timestamps plus a checksum. The transfer takes place directly from screen to camera, without internet and without any server of the provider.</p>
  <p>The school is responsible for processing student data on school-owned devices and on the teacher’s device. We recommend using codes instead of full names.</p>

  <h2>3b. Camera</h2>
  <p>The camera is only used when you scan a class or hand-in code, and only with your permission. The images are analysed on the device only and are neither stored nor transmitted. Alternatively, a photo can be chosen or the code pasted as text.</p>

  <h2>4. Purchasing the app</h2>
  <p>The app is offered as a one-time purchase through the store from which you install it. Payment and processing are handled exclusively by the operator of that store under its own privacy policy. The provider does not receive any information that identifies individual buyers, only aggregated sales figures. The app itself contains no purchase buttons and no in-app purchases.</p>

  <h2>5. Crash reports and statistics from the store</h2>
  <p>If you have allowed this in your device settings, the store operator provides the provider with aggregated, non-personal statistics and crash reports. The app has no influence on this; you can change the setting on your device at any time.</p>

  <h2>6. Contact by email</h2>
  <p>If you write an email via “Send feedback” or otherwise, your email app opens. Unless you change it, the email contains the app version, the selected language and information about the type of device so that bugs can be traced. Your message and email address are used only to deal with your request (Art. 6(1)(f) GDPR) and deleted once they are no longer needed for that purpose.</p>

  <h2>7. Permissions</h2>
  <p>The app only uses the camera to scan codes (see 3b). Microphone, location and contacts are not used; the app only accesses photos if you choose a photo of a code yourself. The app does not connect to the internet.</p>

  <h2>8. Your rights</h2>
  <p>You have the rights of access, rectification, erasure, restriction of processing, data portability and objection under Art. 15 to 21 GDPR, as well as the right to lodge a complaint with a supervisory authority. Since the provider does not store any personal data from the app, requests for access or erasure addressed to the provider will generally have nothing to act on. You can delete all data yourself in the app at any time.</p>

  <h2>9. Changes</h2>
  <p>This policy will be updated as soon as app features relevant to data protection change. The current version is always available in the app.</p>
"""),
"impressum.html": ("de", "Impressum", f"""
  <h1>Impressum</h1>
  <p class="stand">{APP} · {STAND_DE}</p>

  <h2>Angaben gemäß § 5 DDG</h2>
  {ADDR_DE}

  <h2>Kontakt</h2>
  <p>E-Mail: <a href="mailto:{MAIL}">{MAIL}</a></p>

  <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
  <p>Simon Mählmann, Anschrift wie oben.</p>

  <h2>Umsatzsteuer</h2>
  <p>Umsatzsteuer-Identifikationsnummer gemäß § 27 a UStG: DE430437820</p>
  <p>Kleinunternehmer gemäß § 19 UStG. Es wird keine Umsatzsteuer ausgewiesen und kein Vorsteuerabzug geltend gemacht.</p>

  <h2>Verbraucherstreitbeilegung</h2>
  <p>Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>

  <h2>Haftung für Inhalte</h2>
  <p>Die Inhalte dieser App wurden mit Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte kann jedoch keine Gewähr übernommen werden. Die Inhalte zu Datenschutz und Recht dienen der Bildung und sind keine Rechtsberatung.</p>

  <h2>Marken und Namen</h2>
  <p>Die in den Übungen verwendeten Firmen-, Produkt- und Personennamen sind frei erfunden. Ähnlichkeiten mit tatsächlichen Unternehmen oder Personen sind zufällig. Die App steht in keiner Verbindung zu Herstellern von Programmierumgebungen, Lernplatinen oder Tabellenprogrammen.</p>

  <h2>Urheberrecht</h2>
  <p>Die durch den Anbieter erstellten Inhalte, Texte, Aufgaben, Grafiken und Spielideen dieser App unterliegen dem deutschen Urheberrecht. Für QR-Codes nutzt die App zwei quelloffene Bausteine; ihre Lizenzen stehen unter <a href="lizenzen.html">Lizenzen</a>.</p>
"""),
"impressum-en.html": ("en", "Legal notice", f"""
  <h1>Legal notice</h1>
  <p class="stand">{APP} · {STAND_EN}</p>

  <h2>Information pursuant to Section 5 DDG</h2>
  {ADDR_EN}

  <h2>Contact</h2>
  <p>Email: <a href="mailto:{MAIL}">{MAIL}</a></p>

  <h2>Responsible for content pursuant to Section 18(2) MStV</h2>
  <p>Simon Mählmann, address as above.</p>

  <h2>VAT</h2>
  <p>VAT identification number pursuant to Section 27a UStG: DE430437820</p>
  <p>Small business pursuant to Section 19 UStG. No VAT is charged and no input tax is deducted.</p>

  <h2>Consumer dispute resolution</h2>
  <p>We are neither willing nor obliged to take part in dispute resolution proceedings before a consumer arbitration board.</p>

  <h2>Liability for content</h2>
  <p>The content of this app has been created with care. However, no guarantee can be given for its accuracy, completeness or timeliness. The content on data protection and law is for educational purposes and is not legal advice.</p>

  <h2>Trademarks and names</h2>
  <p>The company, product and personal names used in the exercises are fictitious. Any resemblance to actual companies or persons is coincidental. The app is not affiliated with any maker of programming environments, learning boards or spreadsheet software.</p>

  <h2>Copyright</h2>
  <p>The content, texts, exercises, graphics and game ideas created by the provider are subject to German copyright law. For QR codes the app uses two open-source components; their licences are listed under <a href="lizenzen-en.html">Licences</a>.</p>
"""),
}

MIT = """Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE."""
import html as _h
APACHE = open(os.path.join(OUT, "vendor", "jsQR-LICENSE.txt"), encoding="utf-8").read()
def lic(lang):
    de = lang == "de"
    return f"""
  <h1>{'Lizenzen' if de else 'Licences'}</h1>
  <p class="stand">{APP} · {STAND_DE if de else STAND_EN}</p>
  <p>{'Die App nutzt zwei quelloffene Bausteine für QR-Codes. Wir danken den Autorinnen und Autoren.' if de else 'The app uses two open-source components for QR codes. Many thanks to their authors.'}</p>
  <h2>QR Code Generator for JavaScript (1.4.4)</h2>
  <p>Copyright (c) 2009 Kazuhiko Arase · {'MIT-Lizenz' if de else 'MIT licence'}</p>
  <p>{'„QR Code“ ist eine eingetragene Marke der DENSO WAVE INCORPORATED.' if de else '“QR Code” is a registered trademark of DENSO WAVE INCORPORATED.'}</p>
  <pre>{_h.escape(MIT)}</pre>
  <h2>jsQR (1.4.0)</h2>
  <p>Cosmo Wolfe, Jefff Nelson {'und Mitwirkende' if de else 'and contributors'} · Apache License 2.0</p>
  <pre>{_h.escape(APACHE)}</pre>
"""
PAGES["lizenzen.html"] = ("de", "Lizenzen", lic("de"))
PAGES["lizenzen-en.html"] = ("en", "Licences", lic("en"))

LINKS = {
    "datenschutz.html": ("Zurück zur App", "impressum.html", "Impressum", "datenschutz-en.html", "English"),
    "datenschutz-en.html": ("Back to the app", "impressum-en.html", "Legal notice", "datenschutz.html", "Deutsch"),
    "impressum.html": ("Zurück zur App", "datenschutz.html", "Datenschutz", "impressum-en.html", "English"),
    "impressum-en.html": ("Back to the app", "datenschutz-en.html", "Privacy", "impressum.html", "Deutsch"),
    "lizenzen.html": ("Zurück zur App", "impressum.html", "Impressum", "lizenzen-en.html", "English"),
    "lizenzen-en.html": ("Back to the app", "impressum-en.html", "Legal notice", "lizenzen.html", "Deutsch"),
}

SUPPORT_DE = f"""
  <h1>{APP} – Informatik</h1>
  <p class="stand">Hilfe und Kontakt · {STAND_DE}</p>
  <p>{APP} ist eine Lern-App für Informatik in den Jahrgängen 9 und 10: 108 Lerneinheiten – 36 kurze Stationen in neun Themen (Computer &amp; Hardware, Tabellenkalkulation, sichere Passwörter, Blockprogrammierung, Verschlüsselung, Mikrocontroller, Daten codieren, Internet, Daten &amp; Recht), jeweils in drei Stufen. Sie funktioniert ohne Internet, ohne Werbung und ohne Konten beim Anbieter.</p>

  <h2>Kontakt</h2>
  <p>Fragen, Fehler oder Ideen? Schreiben Sie an <a href="mailto:{MAIL}?subject={APP}">{MAIL}</a>. In der App geht das auch über Einstellungen → „Feedback senden“.</p>

  <h2 id="klasse">Mit einer Klasse starten</h2>
  <p><b>Einmalig auf dem Gerät der Lehrkraft</b></p>
  <ol>
    <li>Beim ersten Start „Schule“ wählen (später: Zahnrad → Nutzungsart → Ändern) und ein Passwort für den Lehrkraftbereich festlegen.</li>
    <li>Im Lehrkraftbereich „Neue Klasse“ anlegen, z.&nbsp;B. „9b“. Optional eine Liste mit Kürzeln hinterlegen und bei den Namen „Kürzel aus der Klassenliste“ einstellen – dann wählen die Kinder beim Beitreten ihr Kürzel, statt einen Namen einzutippen.</li>
    <li>„Klassen-Code zeigen“: Der QR-Code erscheint groß, z.&nbsp;B. für den Beamer.</li>
  </ol>
  <p><b>Einmalig auf jedem Schülergerät</b></p>
  <ol>
    <li>Die App ebenfalls auf „Schule“ einrichten. Jedes Gerät hat sein eigenes Passwort für den Lehrkraftbereich – am einfachsten überall dasselbe. Die Geräte sind nicht miteinander verbunden; deshalb ist kein Internet nötig.</li>
    <li>Jedes Kind legt ein Profil mit eigenem, sicherem Passwort an. Mehrere Kinder können sich ein Gerät teilen.</li>
    <li>Im Profilmenü (Kreis mit den Initialen oben rechts) „Klasse beitreten“ wählen und den Klassen-Code scannen.</li>
  </ol>
  <p><b>Ergebnisse einsammeln – so oft Sie möchten</b></p>
  <ol>
    <li>Die Kinder zeigen im Profilmenü „Fortschritt abgeben“. Teilen sich mehrere Kinder ein Gerät, geht es schneller über „Abgabe aller Profile“ auf der Anmeldeseite: Die Codes wechseln automatisch, ohne dass sich jemand anmelden muss.</li>
    <li>Auf dem Gerät der Lehrkraft die Klasse öffnen und „Ergebnisse einsammeln“ wählen. Die Kamera bleibt an; jeder erkannte Code piept und erscheint in der Liste. Beim nächsten Einsammeln werden die Ergebnisse einfach aktualisiert.</li>
    <li>Die Übersicht zeigt jedes Kind und jedes Thema, wahlweise je Stufe, dazu die Stationen, die der Klasse am schwersten fallen. Unter „Exportieren“ gibt es alles als CSV-Datei für die Tabellenkalkulation.</li>
  </ol>
  <p>Ohne Kamera lässt sich jeder Code auch als Text kopieren und einfügen. Klassen und eingesammelte Ergebnisse werden zum Schuljahresende (31.&nbsp;Juli) automatisch gelöscht.</p>

  <h2>Häufige Fragen</h2>
  <p><b>Ein Kind hat sein Passwort vergessen.</b><br>Im Eltern- bzw. Lehrkraftbereich beim Profil „Passwort zurücksetzen“ wählen. Das Kind bekommt ein Einmal-Passwort und legt danach ein neues, sicheres Passwort fest.</p>
  <p><b>Das Passwort für den Eltern- bzw. Lehrkraftbereich ist vergessen.</b><br>Aus Sicherheitsgründen lässt es sich nicht wiederherstellen. Unter „Passwort vergessen?“ können alle Daten auf dem Gerät gelöscht werden; danach wird die App neu eingerichtet.</p>
  <p><b>Wie kommen die Ergebnisse zur Lehrkraft?</b><br>Die Lehrkraft legt im Lehrkraftbereich eine Klasse an und zeigt den Klassen-Code. Die Schülerinnen und Schüler treten im Profilmenü mit „Klasse beitreten“ bei und zeigen mit „Fortschritt abgeben“ ihren Code. Die Lehrkraft sammelt ihn mit „Ergebnisse einsammeln“ per Kamera ein. Alles läuft direkt von Bildschirm zu Kamera, ohne Internet.</p>
  <p><b>Die Kamera scannt nicht.</b><br>Prüfen Sie in den Einstellungen des Geräts, ob die App die Kamera nutzen darf. Alternativ kann ein Foto des Codes gewählt oder der Code als Text kopiert und eingefügt werden.</p>
  <p><b>Muss man Profile anlegen?</b><br>Nein. Mit „Einfach loslegen“ wird ohne Profile und Passwörter geübt. Profile lassen sich später unter Zahnrad → Nutzungsart → Ändern einrichten; die bisherigen Sterne bleiben erhalten.</p>
  <p><b>Wo liegen die Daten, und wie lösche ich sie?</b><br>Ausschließlich auf dem Gerät. Profile und Klassen löschen Sie im Eltern- bzw. Lehrkraftbereich, dort auch „Alle Daten löschen“. Beim Entfernen der App wird alles gelöscht. Mehr dazu in der <a href="datenschutz.html">Datenschutzerklärung</a>.</p>
  <p><b>Gibt es eine Schullizenz?</b><br>Die App ist ein Einmalkauf ohne In-App-Käufe. Schulen erhalten sie über das Volumenprogramm des App-Vertriebs zum Bildungsrabatt.</p>
"""
SUPPORT_EN = f"""
  <h1>{APP} – Computer Science</h1>
  <p class="stand">Help and contact · {STAND_EN}</p>
  <p>{APP} is a learning app for computer science in years 9 and 10: 108 learning units – 36 short stations in nine topics (computers &amp; hardware, spreadsheets, secure passwords, block coding, encryption, microcontrollers, encoding data, the internet, data &amp; law), each on three levels. It works without internet, without ads and without accounts with the provider.</p>

  <h2>Contact</h2>
  <p>Questions, bugs or ideas? Write to <a href="mailto:{MAIL}?subject={APP}">{MAIL}</a>. In the app you can also use Settings → “Send feedback”.</p>

  <h2 id="class">Getting started with a class</h2>
  <p><b>Once, on the teacher’s device</b></p>
  <ol>
    <li>On first launch choose “School” (later: gear → How it is used → Change) and set a password for the teacher area.</li>
    <li>In the teacher area, create a “New class”, e.g. “9b”. Optionally add a list of codes and set names to “Codes from the class list” – students then pick their code when joining instead of typing a name.</li>
    <li>“Show class code”: the QR code appears in large size, e.g. for the projector.</li>
  </ol>
  <p><b>Once, on every student device</b></p>
  <ol>
    <li>Set up the app as “School” as well. Each device has its own password for the teacher area – easiest to use the same one everywhere. The devices are not connected to each other, so no internet is needed.</li>
    <li>Each student creates a profile with their own secure password. Several students can share one device.</li>
    <li>In the profile menu (circle with initials, top right) choose “Join a class” and scan the class code.</li>
  </ol>
  <p><b>Collecting results – as often as you like</b></p>
  <ol>
    <li>Students show “Hand in progress” in their profile menu. If several share a device, “Hand in all profiles” on the login page is quicker: the codes change automatically and nobody has to log in.</li>
    <li>On the teacher’s device, open the class and choose “Collect results”. The camera stays on; every recognised code beeps and appears in the list. Collecting again simply updates the results.</li>
    <li>The overview shows every student and every topic, optionally per level, plus the stations the class finds hardest. “Export” gives you everything as a CSV file for spreadsheets.</li>
  </ol>
  <p>Without a camera every code can also be copied and pasted as text. Classes and collected results are deleted automatically at the end of the school year (31 July).</p>

  <h2>Frequently asked questions</h2>
  <p><b>A child forgot their password.</b><br>In the parent or teacher area, choose “Reset password” for the profile. The child gets a one-time password and then sets a new, secure password.</p>
  <p><b>The password for the parent or teacher area is forgotten.</b><br>For security reasons it cannot be recovered. Under “Forgotten the password?” all data on the device can be deleted; the app is then set up again.</p>
  <p><b>How do results get to the teacher?</b><br>The teacher creates a class in the teacher area and shows the class code. Students use “Join a class” in their profile menu and show their code with “Hand in progress”. The teacher collects it with “Collect results” using the camera – directly from screen to camera, without internet.</p>
  <p><b>The camera does not scan.</b><br>Check in the device settings that the app may use the camera. Alternatively, choose a photo of the code or copy and paste the code as text.</p>
  <p><b>Do I need profiles?</b><br>No. With “Just start” you practise without profiles or passwords. Profiles can be set up later via gear → How it is used → Change; the stars collected so far are kept.</p>
  <p><b>Where is the data, and how do I delete it?</b><br>Only on the device. Delete profiles and classes in the parent or teacher area, where you also find “Delete all data”. Removing the app deletes everything. More in the <a href="datenschutz-en.html">privacy policy</a>.</p>
  <p><b>Is there a school licence?</b><br>The app is a one-time purchase without in-app purchases. Schools get it through the app store’s volume purchase programme at the education discount.</p>
"""

DOCS = os.path.join(ROOT, "docs")
os.makedirs(DOCS, exist_ok=True)
DOC_LINKS = {
    "index.html": ("Datenschutz", "datenschutz.html", "Impressum", "impressum.html", "English", "index-en.html"),
    "index-en.html": ("Privacy", "datenschutz-en.html", "Legal notice", "impressum-en.html", "Deutsch", "index.html"),
}
for name, (lang, title, body) in PAGES.items():
    back, other, other_label, lang_link, lang_label = LINKS[name]
    html = HEAD.format(lang=lang, title=title, app=APP) + body + FOOT.format(
        back=back, other=other, other_label=other_label, lang_link=lang_link, lang_label=lang_label)
    with open(os.path.join(OUT, name), "w", encoding="utf-8") as f:
        f.write(html)
    # Webseite: gleicher Text, „zurück“ führt zur Hilfe-Seite statt in die App
    web = html.replace('href="index.html">Zurück zur App<', 'href="index.html">Hilfe &amp; Kontakt<').replace('href="index.html">Back to the app<', 'href="index-en.html">Help &amp; contact<')
    with open(os.path.join(DOCS, name), "w", encoding="utf-8") as f:
        f.write(web)

for name, body in (("index.html", SUPPORT_DE), ("index-en.html", SUPPORT_EN)):
    lang = "de" if name == "index.html" else "en"
    a, al, b, bl, c, cl = DOC_LINKS[name]
    lic_link = "lizenzen.html" if lang == "de" else "lizenzen-en.html"
    foot = f"""  <div class="links">
    <a class="back" href="{al}">{a}</a>
    <a href="{bl}">{b}</a>
    <a href="{lic_link}">{'Lizenzen' if lang == 'de' else 'Licences'}</a>
    <a href="{cl}">{c}</a>
  </div>
</main>
</body>
</html>
"""
    with open(os.path.join(DOCS, name), "w", encoding="utf-8") as f:
        f.write(HEAD.format(lang=lang, title="Hilfe" if lang == "de" else "Help", app=APP) + body + foot)
open(os.path.join(DOCS, ".nojekyll"), "w").close()  # GitHub Pages: Dateien unverändert ausliefern, kein Jekyll
print("Rechtstexte geschrieben:", ", ".join(PAGES), "· Webseite in docs/")
