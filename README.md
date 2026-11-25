# Bit für Bit – Informatik (früherer Arbeitstitel: Informatik-Werkstatt)

Selbstlern-App für den Informatikunterricht in den Jahrgängen 9 und 10 (Niedersachsen) – für Stunden ohne Computerraum.
Schulversion als Einmalkauf: keine Kaufknöpfe, kein Konto, offline, keine Daten verlassen das Gerät. Deutsch/Englisch per Flaggen.

**9 Themen, 36 Stationen, je 3 Stufen** (Einsteiger · Fortgeschritten · Profi): Computer & Hardware (mit PC-Werkstatt) · Tabellenkalkulation · Sichere Passwörter · Blockprogrammierung · Verschlüsselung ·
Mikrocontroller · Daten codieren · Internet · Daten & Recht. Jedes Thema mit Merkkasten, jede Station mit Hilfe und Tipps (Tipp kostet einen Stern).

Bewusst **ohne Produktnamen** von Programmierumgebungen, Lernplatinen, Tabellenprogrammen und Plattformen – `validate.js` bricht sonst ab.

## Ordner
```
www/index.html            Hülle
www/css/app.css           Gestaltung (hell/dunkel, große Schrift)
www/js/i18n.js            Oberflächentexte DE/EN
www/js/core.js            Speicher, Sprache, Symbole, Töne, Bottom-Sheet
www/js/content.js         Themen, Stationen, Merkkästen, Aufgaben (DE/EN) – Grundfassung = Stufe 2
www/js/content-hardware.js Thema Computer & Hardware (alle Stufen)
www/js/content-levels.js  Stufen 1 und 3 der übrigen Stationen (pick/add/ersetzen)
www/js/devices.js         Geräte-Zeichnungen und i-Karten
www/js/games-hardware.js  PC-Werkstatt und PC-Konfigurator
www/js/games-*.js         Spieltypen (Quiz, Sortieren, Zuordnen, Reihenfolge, Fehler finden,
                          Tabelle, Passwort, Caesar/Vigenère, Phishing, Labyrinth, Binär/ASCII/RGB,
                          LED-Matrix, Wenn-dann, Paketreise)
www/js/app.js             Bildschirme, Navigation, Stationsrahmen, Sterne
www/js/profiles.js        Passwörter (Hash, Regeln), Klassen- und Abgabe-Codes, Auswertung
www/js/account.js         Einrichtung, Anmelden, Profilmenü, QR-Anzeige und -Scanner
www/js/admin.js           Eltern-/Lehrkraftbereich, Klassen, Einsammeln, CSV
www/vendor/               QR-Erzeugung (MIT), QR-Lesen (Apache-2.0), native.js (gebündelt aus native/bridge.js)
www/datenschutz(-en).html, impressum(-en).html, lizenzen(-en).html   erzeugt von tools/make-legal.py
native/bridge.js          Brücke zu den nativen Bausteinen (Speicher-Sicherung, Teilen, Vorlesen)
ios/                      iOS-Projekt (Capacitor 8, Swift Package Manager)
.github/workflows/        Prüfen · iOS TestFlight · iOS Zertifikat erstellen
validate.js               statische Prüfung (Übersetzungen, Lösbarkeit aller Aufgaben, verbotene Namen)
smoketest.py              Ablauftest im Browser: alle Stationen in DE und EN bis zum Ende, Fehlerpfade
```

## Testen
```bash
python3 -m http.server 8765 --directory www   # http://localhost:8765/index.html
node validate.js
python3 smoketest.py            # --shots legt Bildschirmfotos in shots/ ab
```
Rechtstexte nur in `tools/make-legal.py` ändern, dann `python3 tools/make-legal.py` (die Versionsangabe kommt aus `package.json`).

## iOS-App
```bash
npm ci
npm run cap:sync     # bündelt native/bridge.js und kopiert www/ ins iOS-Projekt
```
Hochladen zu TestFlight über GitHub Actions – Schritt für Schritt in [TESTFLIGHT.md](TESTFLIGHT.md).

## Stufen
Grundfassung einer Station = Stufe 2. In `levels: {1: {...}, 3: {...}}` stehen die Abweichungen:
`pick: {items: [0, 2]}` wählt aus, `add: {items: [...]}` ergänzt, jedes andere Feld ersetzt.
Einsteiger-Regeln (höchstens 3 Antworten, wenige Aufgaben, kleine Zahlen, keine Schleifen-Limits …) prüft `validate.js`.
Auf Stufe 1 sind Tipps kostenlos, nach 2 Fehlern erscheint der Tipp automatisch.

## Nutzungsarten (ab 0.4)
- **Ohne Profile** („Einfach loslegen“): kein Name, kein Passwort, ein Fortschritt für das Gerät (`Store.isFree()`, Daten in `solo`). Über Einstellungen → „Profile einrichten“ (`#/setup`) wechseln; die Sterne bekommt das erste Profil.
- **Zuhause / Schule**: Profile mit Passwort, Eltern- bzw. Lehrkraftbereich. Dort lässt sich auch wieder auf „Ohne Profile“ umschalten – Profile und Klassen bleiben gespeichert.
- **Gastzugang** (im Bereich einschaltbar, Standard aus): „Als Gast üben“, Fortschritt nur in der Sitzung (`sessionStorage`), nie dauerhaft.

## Profile, Eltern- und Lehrkraftbereich (ab 0.3)
- **Ersteinrichtung:** „Zuhause“ (Elternbereich) oder „Schule“ (Lehrkraftbereich), Passwort für diesen Bereich, bei Schule: Namen selbst eingeben oder Kürzel aus der Klassenliste.
- **Profile:** bis zu 40 je Gerät, jedes mit eigenem Passwort. Regeln: ≥ 12 Zeichen (wie im Lernbaustein), ≥ 3 Zeichenarten (oder Passphrase ≥ 16), keine Zahlen-/Buchstabenfolgen (123, abc), keine Tastaturmuster, nichts dreifach, keine häufigen Wörter, nicht der eigene Name.
  Gespeichert wird nur ein PBKDF2-Hash (SHA-256, 120 000 Runden, Salt). Sperre nach 5 Fehlversuchen (30 s, dann doppelt). Abmeldung nach 15 Minuten Pause.
- **Zurücksetzen:** im geschützten Bereich → Einmal-Passwort, das Kind legt danach ein eigenes fest. Bereichs-Passwort vergessen → nur „Alle Daten löschen“.
- **Klasse:** Lehrkraft legt Klasse an (optional Kürzelliste) → Klassen-QR. Kinder treten bei → „Fortschritt abgeben“ zeigt einen signierten QR-Code
  (`IW2.`, ca. 460 Zeichen, mit Profilkennung gegen Namensdoppelungen: Sterne je Station/Stufe, Versuche, Fehler, Tipps, Minuten; HMAC-SHA256 mit Klassenschlüssel). Lehrkraft sammelt im Dauer-Scan ein.
  Fallback ohne Kamera: Foto wählen oder Text-Code einfügen. Klassen werden am 31.07. automatisch gelöscht.
- **Auswertung:** Heatmap Kinder × Themen (Stufenfilter), Einzelansicht mit „sicher/üben/offen“, „Wo hakt es?“, CSV-Export (gegen Formel-Injektion geschützt).
- `STATION_ORDER` in `content-levels.js` legt die Reihenfolge im Abgabe-Code fest: **nie umsortieren, neue Stationen nur hinten anhängen** (validate.js prüft).
- Fremdbausteine in `www/vendor/`: qrcode-generator 1.4.4 (MIT), jsQR 1.4.0 (Apache 2.0) → `lizenzen.html`.
