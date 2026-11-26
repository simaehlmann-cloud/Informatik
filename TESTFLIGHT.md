# Bit für Bit – Informatik → TestFlight

Gebaut wird auf einem Mac von GitHub (kein eigener Mac nötig), genauso wie bei Mathe-Jahrmarkt.

| | |
| --- | --- |
| App-Name (Store) | Bit für Bit – Informatik (Untertitel siehe STORE.md) |
| Name auf dem Home-Bildschirm | Bit für Bit |
| App-Kennung (Bundle-ID) | `de.maehlmann.informatikwerkstatt`, lässt sich später nicht mehr ändern |
| Geräte | iPhone und iPad, ab iOS 15 |
| Version / Build | aus `package.json` (1.0.0) → Build `100.<Laufnummer>` |
| Verkauf | Einmalkauf, keine In-App-Käufe (passt zu Apple School Manager mit Bildungsrabatt) |

## Einmalig

1. **Repository anlegen** (`simaehlmann-cloud/Informatik`, öffentlich wie die anderen Apps (nötig für GitHub Pages)) und diesen Ordner hochladen.
2. **App-Kennung registrieren**: developer.apple.com → Certificates, IDs & Profiles → Identifiers → „+“ → App IDs → App → Bundle ID *explicit* `de.maehlmann.informatikwerkstatt`. Es werden keine besonderen Fähigkeiten (Capabilities) gebraucht.
3. **App in App Store Connect anlegen**: Apps → „+“ → Neue App → iOS, Name „Bit für Bit – Informatik“, Primärsprache Deutsch, Bundle-ID von oben, SKU z. B. `bitfuerbit`.
4. **Secrets übernehmen** (Repository → Settings → Secrets and variables → Actions). Es sind dieselben Werte wie bei Mathe-Jahrmarkt:
   - `APPLE_TEAM_ID`
   - `ASC_KEY_ID`, `ASC_ISSUER_ID`, `ASC_KEY_P8` (API-Schlüssel mit Rolle „Admin“, damit das App-Store-Profil automatisch angelegt werden darf; die .p8-Datei als Text oder Base64)
   - `IOS_DIST_P12_BASE64`, `IOS_DIST_P12_PASSWORD` (Verteilungszertifikat; gilt für alle Apps des Teams)

   Ist der Inhalt der .p12 nicht mehr zur Hand: Workflow **„iOS Zertifikat erstellen“** einmal laufen lassen und die Anleitung in der Ausgabe befolgen.

5. **Webseite (Support- und Datenschutz-URL)**: Settings → Pages → „Deploy from a branch“, Branch `main`, Ordner **`/docs`** (nicht „/ (root)“) → Save. Nach 1–2 Minuten erreichbar unter https://simaehlmann-cloud.github.io/Informatik/ – die Seiten erzeugt `python3 tools/make-legal.py` aus denselben Texten wie in der App.

## Jeder Upload

1. Version in `package.json` **und** `APP.version` in `www/js/core.js` erhöhen (die Prüfung `npm run verify` meldet einen Unterschied), dann `python3 tools/make-legal.py`.
2. GitHub → Actions → **„iOS TestFlight“** → *Run workflow*.
3. Nach 10–20 Minuten erscheint der Build in App Store Connect → TestFlight. Beim ersten Build fragt Apple nach der Verschlüsselung: Die Antwort ist bereits in `Info.plist` hinterlegt (`ITSAppUsesNonExemptEncryption = false`; die App nutzt nur Standardverfahren des Systems zum Hashen).
4. Interne Tester hinzufügen. Für externe Tester (z. B. Kolleginnen und Kollegen) ist eine kurze Beta-Prüfung durch Apple nötig.

Der Workflow **„Prüfen“** läuft bei jedem Push: Inhaltsprüfung (`validate.js`), Aktualität von `www/vendor/native.js` und der Rechtstexte sowie der Ablauftest im Browser (`smoketest.py`).

## Auf dem echten Gerät testen

Diese Punkte lassen sich nur auf einem iPad bzw. iPhone prüfen:

- [ ] **Kamera**: Klassen-Code beim Beitreten scannen, im Lehrerbereich „Einsammeln“ mit mehreren Geräten nacheinander. Die Erlaubnis-Abfrage erscheint beim ersten Mal.
- [ ] **Foto statt Kamera**: Bildschirmfoto eines Codes aus der Fotomediathek wählen.
- [ ] **Passwörter**: Anlegen und Anmelden dauern unter einer Sekunde; falsches Passwort → Wartezeit.
- [ ] **Vorlesen** (Lautsprecher-Knopf) auf Deutsch und Englisch, auch bei eingeschaltetem Stummschalter.
- [ ] **Ziehen und Ablegen** (Sortieren, PC-Werkstatt) mit dem Finger, auch im Querformat.
- [ ] **CSV teilen**: Klassenübersicht → Export → Teilen-Menü (Mail, Dateien).
- [ ] **Daten bleiben**: App beenden, neu starten → Profile und Sterne sind noch da; nach 15 Minuten ohne Eingabe ist man abgemeldet.
- [ ] Hell/Dunkel, Textgröße, Bildschirm drehen, Notch/Home-Leiste verdecken nichts.

## Vor der Veröffentlichung (nicht für TestFlight nötig)

- [ ] App-Datenschutz in App Store Connect: „Keine Daten erfasst“ (alles bleibt auf dem Gerät, die Codes werden direkt von Gerät zu Gerät gezeigt bzw. gescannt).
- [ ] Altersfreigabe 4+, Kategorie Bildung.
- [ ] Store-Texte, Screenshots iPhone 6,9" und iPad 13".
- [ ] Preis wählen und „Bildungsrabatt für Apple School Manager“ einschalten.
- [ ] Impressum/Datenschutz zusätzlich auf einer Webseite (Pflichtfeld „Datenschutz-URL“).
