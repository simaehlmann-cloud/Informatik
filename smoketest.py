#!/usr/bin/env python3
"""Ablauftest im Browser.

    python3 -m http.server 8765 --directory www &
    python3 smoketest.py            # --shots: Bildschirmfotos in shots/   --quick: nur Stufe 2

Prüft: Einrichtung (ohne Profile/Zuhause/Schule), Gastzugang, Profile mit Passwortregeln, Anmeldung, Sperre nach Fehlversuchen,
Zurücksetzen durch Eltern/Lehrkraft, automatische Abmeldung, jede Station in jeder Stufe und Sprache,
Klasse beitreten, Abgabe, Einsammeln, Auswertung, Export, kaputte Daten."""
import sys, re
from playwright.sync_api import sync_playwright

BASE = "http://localhost:8765/index.html"
SHOTS = "--shots" in sys.argv
QUICK = "--quick" in sys.argv
ADMIN_PW = "Wolke-Anker-Komet!58"
KID_PW = "Fuchs-Laterne-Insel!7"
checks = 0
fails = []

def ok(cond, msg):
    global checks
    checks += 1
    if not cond:
        fails.append(msg)
        print("✗", msg)

def garbage(page, where):
    t = page.evaluate("document.body.innerText")
    m = re.search(r"\bnull\b|\bundefined\b|\[object |NaN|\{[a-z]\w*\}", t)
    ok(not m, f"{where}: Fehltext auf dem Bildschirm: {m.group(0) if m else ''} … {t[max(0, (m.start() if m else 0) - 40):(m.start() if m else 0) + 40] if m else ''}")

def fresh(page, lang="de", extra=""):
    page.goto(BASE)
    page.evaluate(f"localStorage.clear(); sessionStorage.clear(); localStorage.setItem('infowerk.v2', JSON.stringify({{lang:'{lang}'}}))")
    page.goto(BASE + extra)

def setup(page, mode="home", name_mode="self"):
    page.click(f".mode-card[data-mode='{mode}']")
    fill_pw(page, ADMIN_PW)
    if mode == "school":
        page.click(".mode-card >> nth=" + ("0" if name_mode == "self" else "1"))
    page.wait_for_selector("#new-profile")

def fill_pw(page, pw, old=None):
    inputs = page.locator(".sheet-card .pw-form input, .stage .pw-form input")
    if old:
        inputs.nth(0).fill(old); inputs.nth(1).fill(pw); inputs.nth(2).fill(pw)
    else:
        inputs.nth(0).fill(pw); inputs.nth(1).fill(pw)
    page.click(".pw-form button[type=submit]")

def new_profile(page, name, lvl=2, pw=KID_PW):
    page.click("#new-profile")
    page.fill(".sheet-card input.field", name)
    page.click(".sheet-card button[type=submit]")
    fill_pw(page, pw)
    page.wait_for_selector(".sheet-card .lv-btn")
    page.click(f".sheet-card .lv-btn[data-lv='{lvl}']")
    page.wait_for_selector(".ch-card")

def login(page, name, pw=KID_PW):
    page.click(f".prof-btn:has-text('{name}')")
    page.fill(".sheet-card input[type=password]", pw)
    page.click(".sheet-card button[type=submit]")

def solve_station(page, sid, tag):
    page.goto(f"{BASE}?fast=1#/s/{sid}")
    page.wait_for_selector(".stage")
    for step in range(60):
        if page.query_selector(".result"):
            return True
        if page.evaluate("document.getElementById('fb').classList.contains('ok')"):
            page.click("#fb-btn"); page.wait_for_timeout(20); continue
        if page.evaluate("document.getElementById('fb').classList.contains('bad')"):
            ok(False, f"{tag}/{sid}: Lösungsweg führte zu Fehlermeldung: " + page.inner_text("#fb .fb-txt")); return False
        garbage(page, f"{tag}/{sid}")
        ok(page.evaluate("window.__test.solve()") is not False, f"{tag}/{sid}: kein Löser")
        try:
            page.wait_for_function("document.getElementById('fb').classList.contains('show') || !!document.querySelector('.result')", timeout=6000)
        except Exception:
            ok(False, f"{tag}/{sid}: keine Rückmeldung (Schritt {step})"); return False
    ok(False, f"{tag}/{sid}: Station endet nicht"); return False

with sync_playwright() as p:
    browser = p.chromium.launch()
    def ctx_page(lang="de", w=390, h=844):
        ctx = browser.new_context(viewport={"width": w, "height": h}, device_scale_factor=2 if SHOTS else 1, locale="de-DE" if lang == "de" else "en-GB")
        page = ctx.new_page()
        errs = []
        page.on("console", lambda m: errs.append(m.text) if m.type in ("error", "warning") else None)
        page.on("pageerror", lambda e: errs.append(str(e)))
        return ctx, page, errs

    # ---------- 1. Alle Stationen, alle Stufen, beide Sprachen ----------
    for lang in ["de", "en"]:
        ctx, page, errs = ctx_page(lang)
        fresh(page, lang)
        setup(page, "home")
        levels = [2] if QUICK else [1, 2, 3]
        new_profile(page, "Testkind", levels[0])
        stations = page.evaluate("CHAPTERS.flatMap(c => c.stations.map(s => s.id))")
        ok(len(stations) == 36, f"36 Stationen erwartet, {len(stations)}")
        for lvl in levels:
            page.evaluate(f"Store.setLevel({lvl})")
            for sid in stations:
                if solve_station(page, sid, f"{lang}/L{lvl}"):
                    ok(page.evaluate(f"Store.stars('{sid}', {lvl})") == 3, f"{lang}/L{lvl}/{sid}: 3 Sterne erwartet")
            page.goto(BASE); page.wait_for_selector(".hero")
            ok("36" in page.inner_text(".hero-progress"), f"{lang}/L{lvl}: Gesamtfortschritt")
        st = page.evaluate("Store.current().stats['hw-io']")
        ok(st and st["n"] == len(levels) and st["t"] >= 0, f"{lang}: Statistik wird nicht mitgeschrieben: {st}")
        garbage(page, f"{lang}: Startseite")
        ok(not errs, f"{lang}: Konsolenfehler: {errs[:5]}")
        ctx.close()

    # ---------- 2. Zuhause: Einrichtung, Profile, Passwortregeln, Sperre, Zurücksetzen ----------
    ctx, page, errs = ctx_page()
    fresh(page)
    page.wait_for_selector(".mode-card")
    if SHOTS: page.screenshot(path="shots/p-setup.png")
    page.click(".mode-card[data-mode='home']")
    inp = page.locator(".pw-form input").nth(0)
    for weak in ["Passwort123", "Hund-1234-Maus", "qwertz-Wolke7", "kurz!A1"]:
        inp.fill(weak); page.locator(".pw-form input").nth(1).fill(weak)
        ok(page.is_disabled(".pw-form button[type=submit]"), f"schwaches Passwort „{weak}“ wird angenommen")
    inp.fill("Hund-1234-Maus")
    ok(page.locator(".pw-form .rule:not(.ok)").count() >= 1 and "123" in page.inner_text(".pw-form"), "Regel gegen Zahlenfolgen wird nicht angezeigt")
    if SHOTS: page.screenshot(path="shots/p-adminpw.png", full_page=True)
    fill_pw(page, ADMIN_PW)
    page.wait_for_selector("#new-profile")
    ok(page.evaluate("Store.get('admin') && Store.get('admin').hash.length > 20 && !JSON.stringify(localStorage).includes('" + ADMIN_PW + "')"), "Admin-Passwort im Klartext gespeichert")
    # Profil anlegen: Name im Passwort ist verboten
    page.click("#new-profile"); page.fill(".sheet-card input.field", "Leonie"); page.click(".sheet-card button[type=submit]")
    page.locator(".pw-form input").nth(0).fill("Leonie-Tanzt-88!"); page.locator(".pw-form input").nth(1).fill("Leonie-Tanzt-88!")
    ok(page.is_disabled(".pw-form button[type=submit]"), "Passwort mit eigenem Namen wird angenommen")
    page.locator(".pw-form input").nth(1).fill("anders")
    ok(page.query_selector(".pw-tips") is not None and "Sichere Passwörter" in page.inner_text(".pw-tips summary"), "Hinweis auf den Lernbaustein fehlt im Passwort-Formular")
    page.click(".pw-tips summary")
    ok("12 Zeichen" in page.inner_text(".pw-tips"), "Lernbaustein-Tipps werden nicht angezeigt")
    if SHOTS: page.screenshot(path="shots/p-kidpw.png", full_page=True)
    fill_pw(page, KID_PW)
    page.wait_for_selector(".sheet-card .lv-btn"); page.click(".sheet-card .lv-btn[data-lv='1']")
    page.wait_for_selector(".ch-card")
    ok(page.query_selector("#profile-btn") is not None, "Profil-Knopf fehlt")
    ok(KID_PW not in page.evaluate("localStorage.getItem('infowerk.v2')"), "Kinder-Passwort im Klartext gespeichert")
    # Abmelden, zweites Profil, falsches Passwort → Sperre
    page.click("#profile-btn"); page.click("#logout")
    page.wait_for_selector("#new-profile")
    new_profile(page, "Jonas", 2)
    page.click("#profile-btn"); page.click("#logout"); page.wait_for_selector(".prof-btn")
    if SHOTS: page.wait_for_timeout(300); page.screenshot(path="shots/p-login.png", full_page=True)
    page.click(".prof-btn:has-text('Leonie')")
    for i in range(5):
        page.fill(".sheet-card input[type=password]", f"Falsch-Versuch-{i}x")
        page.click(".sheet-card button[type=submit]")
        page.wait_for_timeout(250)
    ok("warten" in page.inner_text(".sheet-card .form-err"), "Sperre nach 5 Fehlversuchen greift nicht: " + page.inner_text(".sheet-card .form-err"))
    page.fill(".sheet-card input[type=password]", KID_PW)
    ok(page.is_disabled(".sheet-card button[type=submit]"), "Anmelden trotz Sperre möglich")
    page.keyboard.press("Escape")
    # Elternbereich: falsches Passwort, dann richtig; Passwort zurücksetzen
    page.goto(BASE + "#/admin"); page.wait_for_selector(".stage input[type=password]")
    page.fill(".stage input[type=password]", "Falsch-Passwort-9!"); page.click(".stage button[type=submit]")
    page.wait_for_timeout(300)
    ok(page.query_selector(".adm-card") is None, "Elternbereich öffnet mit falschem Passwort")
    for i in range(4):
        page.fill(".stage input[type=password]", f"Falsch-Passwort-{i}!"); page.click(".stage button[type=submit]"); page.wait_for_timeout(250)
    page.reload(); page.wait_for_selector(".stage input[type=password]")
    page.fill(".stage input[type=password]", ADMIN_PW); page.click(".stage button[type=submit]"); page.wait_for_timeout(400)
    ok(page.query_selector(".adm-card") is None and "warten" in page.inner_text(".stage .form-err"), "Sperre des Elternbereichs lässt sich durch Neuladen umgehen")
    page.evaluate("Store.set('adminLock', 0)")
    page.fill(".stage input[type=password]", ADMIN_PW); page.click(".stage button[type=submit]")
    page.wait_for_selector(".adm-card")
    garbage(page, "Elternbereich")
    if SHOTS: page.wait_for_timeout(300); page.screenshot(path="shots/p-admin-home.png", full_page=True)
    page.locator(".adm-card:has-text('Leonie') button:has-text('Passwort zurücksetzen')").click()
    page.click(".sheet-card .btn.pri")
    page.wait_for_selector(".otp")
    otp = page.inner_text(".otp").strip()
    ok(re.match(r"^[A-Z][a-z]+-[A-Z][a-z]+-\d\d$", otp) is not None, f"Einmal-Passwort sieht falsch aus: {otp}")
    page.keyboard.press("Escape")
    page.locator(".adm-card:has-text('Leonie') button:has-text('Details')").click()
    page.wait_for_selector(".md-row"); garbage(page, "Einzelansicht")
    page.keyboard.press("Escape")
    page.click(".back-btn")
    page.wait_for_selector(".prof-btn")
    login(page, "Leonie", otp)
    page.wait_for_selector(".sheet-card .pw-form")
    ok("Neues Passwort" in page.inner_text(".sheet-card"), "Nach Zurücksetzen wird kein neues Passwort verlangt")
    ok(page.evaluate("Store.current()") is None, "Vor dem Passwortwechsel schon angemeldet")
    fill_pw(page, "Komet-Birke-Murmel!3")
    page.wait_for_selector(".ch-card")
    ok(page.evaluate("Store.current().name") == "Leonie", "Anmeldung nach Passwortwechsel klappt nicht")
    # Automatische Abmeldung nach langer Pause
    page.evaluate("sessionStorage.setItem('infowerk.session', JSON.stringify({id: Store.current().id, seen: Date.now() - 16*60*1000})); document.dispatchEvent(new Event('visibilitychange'))")
    page.wait_for_timeout(300)
    ok(page.query_selector(".prof-btn") is not None, "Automatische Abmeldung greift nicht")
    # Eigenes Profil löschen (Pflicht für den App Store)
    login(page, "Jonas"); page.wait_for_selector("#profile-btn")
    page.click("#profile-btn"); page.click("#delete-own")
    page.fill(".sheet-card input[type=password]", "Falsch-Passwort-1!"); page.click(".sheet-card button[type=submit]"); page.wait_for_timeout(400)
    ok(page.evaluate("Store.profiles().some(p => p.name === 'Jonas')"), "Profil wurde mit falschem Passwort gelöscht")
    page.fill(".sheet-card input[type=password]", KID_PW); page.click(".sheet-card button[type=submit]")
    page.wait_for_selector(".prof-btn")
    ok(not page.evaluate("Store.profiles().some(p => p.name === 'Jonas')") and page.evaluate("Store.current()") is None, "Eigenes Profil lässt sich nicht löschen")
    ok(not errs, f"Zuhause: Konsolenfehler: {errs[:5]}")
    ctx.close()

    # ---------- 3. Schule: Lehrkraftgerät + Schülergerät, Beitreten, Abgabe, Einsammeln ----------
    tctx, teacher, terrs = ctx_page(w=1100, h=900)
    fresh(teacher); setup(teacher, "school", "list")
    teacher.goto(BASE + "#/admin"); teacher.fill(".stage input[type=password]", ADMIN_PW); teacher.click(".stage button[type=submit]")
    teacher.wait_for_selector(".adm-sec")
    teacher.click("button:has-text('Neue Klasse')")
    teacher.fill(".sheet-card input.field", "9b Informatik")
    teacher.fill(".sheet-card textarea", "MaKo\nLeSc\nJoBa\n=SUMME(A1)")
    teacher.click(".sheet-card button[type=submit]")
    teacher.wait_for_selector(".qr-box svg")
    ok(teacher.query_selector(".qr-box svg path") is not None, "Klassen-QR-Code wird nicht gezeichnet")
    class_code = teacher.eval_on_selector(".sheet-card textarea", "e => e.value")
    ok(class_code.startswith("IWK."), "Klassen-Code fehlt")
    if SHOTS: teacher.screenshot(path="shots/s-classcode.png")
    teacher.keyboard.press("Escape")

    sctx, student, serrs = ctx_page()
    fresh(student); setup(student, "school", "list")
    codes = []
    for kid in ["MaKo", "LeSc"]:
        student.click("#new-profile")
        student.wait_for_selector(".scan-sheet")
        student.click(".scan-sheet summary")
        student.fill(".scan-sheet textarea", "Quatsch")
        student.click(".scan-sheet .btn.pri")
        student.wait_for_timeout(200)
        ok("kein Klassen-Code" in student.inner_text(".scan-status"), "falscher Klassen-Code wird nicht gemeldet")
        student.fill(".scan-sheet textarea", class_code)
        student.click(".scan-sheet .btn.pri")
        student.wait_for_selector(".code-grid")
        if kid == "LeSc":
            ok(student.is_disabled(".code-grid button:has-text('MaKo')"), "Vergebenes Kürzel ist noch wählbar")
            if SHOTS: student.screenshot(path="shots/s-pickcode.png")
        student.click(f".code-grid button:has-text('{kid}')")
        fill_pw(student, KID_PW if kid == "MaKo" else "Pinguin-Rakete-Sonne")
        student.wait_for_selector(".sheet-card .lv-btn"); student.click(".sheet-card .lv-btn[data-lv='2']")
        student.wait_for_selector(".ch-card")
        for sid in (["hw-io", "tab-cells", "cd-bin"] if kid == "MaKo" else ["hw-io"]):
            solve_station(student, sid, "Schule/" + kid)
        # Ein Fehler, damit die Fehlerstatistik etwas zeigt
        student.goto(BASE + "#/s/tab-copy"); student.wait_for_selector(".opt")
        student.click(".opt:not([data-correct])"); student.click("#fb-btn")
        for _ in range(10):
            if student.query_selector(".result"): break
            if student.evaluate("document.getElementById('fb').classList.contains('show')"): student.click("#fb-btn"); continue
            student.evaluate("window.__test.solve()"); student.wait_for_timeout(50)
        student.goto(BASE); student.wait_for_selector(".ch-card")
        student.click("#profile-btn")
        student.click(".menu-list .btn.pri")
        student.wait_for_selector(".qr-box svg")
        codes.append(student.eval_on_selector(".sheet-card textarea", "e => e.value"))
        if SHOTS and kid == "MaKo": student.screenshot(path="shots/s-handin.png")
        student.keyboard.press("Escape")
        student.click("#profile-btn"); student.click("#logout"); student.wait_for_selector("#new-profile")
    ok(all(c.startswith("IW2.") for c in codes), "Abgabe-Codes fehlen")
    # Abgabe aller Profile: wechselnde Codes
    student.click("button:has-text('Abgabe aller Profile')")
    student.wait_for_selector(".qr-box svg")
    first = student.eval_on_selector(".sheet-card textarea", "e => e.value")
    student.wait_for_timeout(2700)
    ok(student.eval_on_selector(".sheet-card textarea", "e => e.value") != first, "Codes aller Profile wechseln nicht")
    garbage(student, "Schülergerät")
    ok(not serrs, f"Schülergerät: Konsolenfehler: {serrs[:5]}")

    teacher.click("button:has-text('Ergebnisse einsammeln')")
    teacher.wait_for_selector(".scan-sheet")
    teacher.click(".scan-sheet summary")
    for code in codes + [codes[0], codes[1][:40] + ("A" if codes[1][40] != "A" else "B") + codes[1][41:]]:
        teacher.fill(".scan-sheet textarea", code); teacher.click(".scan-sheet .btn.pri"); teacher.wait_for_timeout(250)
    ok(teacher.locator(".scan-list li").count() == 3, f"Eingesammelt: {teacher.locator('.scan-list li').count()} statt 3 (2 neu + 1 doppelt)")
    ok("beschädigt" in teacher.inner_text(".scan-status"), "veränderter Code wird nicht erkannt")
    if SHOTS: teacher.screenshot(path="shots/s-collect.png")
    teacher.keyboard.press("Escape")
    teacher.wait_for_selector(".heatmap")
    body = teacher.inner_text(".heatmap")
    ok("MaKo" in body and "LeSc" in body and "JoBa" in body and "noch keine Abgabe" in body, "Heatmap zeigt nicht alle Kinder")
    ok(re.search(r"\b[1-9]/36\b", body) is not None, "Heatmap zeigt den Fortschritt nicht: " + body[-300:])
    garbage(teacher, "Klassenansicht")
    if SHOTS: teacher.wait_for_timeout(300); teacher.screenshot(path="shots/s-heatmap.png", full_page=True)
    teacher.click(".heatmap .linkish:has-text('MaKo')")
    teacher.wait_for_selector(".md-row")
    ok("sicher" in teacher.inner_text(".sheet-card").lower(), "Einzelansicht zeigt keine sicheren Stationen: " + str(teacher.evaluate("JSON.stringify(Store.classes()[0].results['MaKo'])"))[:400])
    if SHOTS: teacher.screenshot(path="shots/s-member.png")
    teacher.keyboard.press("Escape")
    teacher.click("button:has-text('Exportieren')")
    teacher.wait_for_selector(".sheet-card .btn.pri")
    with teacher.expect_download() as dl:
        teacher.click(".sheet-card .btn.pri")
    csv = open(dl.value.path(), encoding="utf-8-sig").read()
    ok(csv.count("\n") >= 3 and "MaKo" in csv and ";" in csv, "CSV-Export unvollständig")
    ok("'=SUMME(A1)" in csv and "\n=SUMME" not in csv, "CSV-Injection nicht entschärft")
    teacher.keyboard.press("Escape")
    # Stufenfilter
    teacher.click(".seg-ctl button:has-text('Profi')")
    ok("0/36" in teacher.inner_text(".heatmap"), "Stufenfilter wirkt nicht")
    ok(not terrs, f"Lehrkraftgerät: Konsolenfehler: {terrs[:5]}")
    # Löschfrist: abgelaufene Klasse verschwindet
    teacher.evaluate("Store.classes()[0].exp = Date.now() - 1000; Store.save()")
    teacher.goto(BASE + "#/admin"); teacher.wait_for_timeout(300)
    ok(teacher.evaluate("Store.classes().length") == 0, "abgelaufene Klasse wird nicht gelöscht")
    tctx.close(); sctx.close()

    # ---------- 4. Robustheit ----------
    ctx, page, errs = ctx_page()
    page.goto(BASE)
    page.evaluate("localStorage.setItem('infowerk.v2', '{kaputt')")
    page.goto(BASE); page.wait_for_selector(".mode-card")
    ok(True, "")
    page.evaluate("localStorage.setItem('infowerk.v2', JSON.stringify({mode:'home', profiles:[{id:'x', name:'A', stars:{'tab-cells@2':99,'q':'a'}, level:7}, 5, null], classes:'nein'}))")
    page.goto(BASE); page.wait_for_selector(".prof-btn")
    ok(page.evaluate("Store.profiles().length") == 1 and page.evaluate("Object.keys(Store.profiles()[0].stars).length") == 0, "ungültige Daten werden übernommen")
    # Übernahme aus Fassung 0.2: Sterne landen beim ersten Profil
    page.evaluate("localStorage.clear(); sessionStorage.clear(); localStorage.setItem('infowerk.v1', JSON.stringify({lang:'de', stars:{'tab-cells@2':3}}))")
    page.goto(BASE); setup(page, "home"); new_profile(page, "Alt", 2)
    ok(page.evaluate("Store.stars('tab-cells', 2)") == 3, "Fortschritt aus 0.2 geht verloren")
    # Rechtstexte
    for f in ["datenschutz.html", "impressum.html", "datenschutz-en.html", "impressum-en.html", "lizenzen.html", "lizenzen-en.html"]:
        r = page.goto(BASE.replace("index.html", f))
        ok(r.status == 200, f"{f} nicht erreichbar")
    ok(not errs, f"Robustheit: Konsolenfehler: {errs[:5]}")
    ctx.close()
    # ---------- 5. Ohne Profile, Wechsel zu Profilen, Gast ----------
    ctx, page, errs = ctx_page()
    fresh(page)
    page.wait_for_selector(".mode-card[data-mode='free']")
    garbage(page, "Einrichtung")
    ok(page.locator(".mode-card").count() == 3, "Einrichtung: drei Startmöglichkeiten erwartet")
    page.click(".mode-card[data-mode='free']")
    page.wait_for_selector(".sheet-card .lv-btn")
    if SHOTS: page.screenshot(path="shots/f-level.png")
    page.click(".sheet-card .lv-btn[data-lv='1']")
    page.wait_for_selector(".ch-card")
    ok(page.locator("#profile-btn").count() == 0, "ohne Profile: kein Profilknopf erwartet")
    ok(page.evaluate("Store.get('admin')") is None, "ohne Profile: kein Passwort nötig")
    solve_station(page, "hw-io", "frei")
    ok(page.evaluate("Store.stars('hw-io', 1)") == 3, "ohne Profile: Sterne werden nicht gezählt")
    page.goto(BASE); page.reload(); page.wait_for_selector(".ch-card")
    ok(page.evaluate("Store.stars('hw-io', 1)") == 3 and page.evaluate("Store.level()") == 1, "ohne Profile: Fortschritt übersteht Neustart nicht")
    page.evaluate("sessionStorage.clear()"); page.reload(); page.wait_for_selector(".ch-card")
    ok(page.locator(".prof-list, #new-profile").count() == 0, "ohne Profile: Anmeldung erscheint nach Neustart")
    garbage(page, "ohne Profile: Startseite")
    if SHOTS: page.screenshot(path="shots/f-home.png")
    # Einstellungen → Profile einrichten; Sterne gehen an das erste Profil
    page.click(".topbar .icon-btn")
    page.wait_for_selector("#setup-profiles")
    if SHOTS: page.wait_for_timeout(500); page.screenshot(path="shots/f-settings.png")
    page.click("#setup-profiles")
    page.wait_for_selector(".mode-card[data-mode='home']")
    ok(page.locator(".mode-card[data-mode='free']").count() == 0, "Profile einrichten: „Einfach loslegen“ sollte fehlen")
    garbage(page, "Profile einrichten")
    setup(page, "home")
    new_profile(page, "Mia", 2)
    ok(page.evaluate("Store.stars('hw-io', 1)") == 3 and page.evaluate("Store.current().stats['hw-io'].n") == 1, "Sterne ohne Profile gehen beim Einrichten verloren")
    # Lehrkraft/Eltern: zurück zu „Ohne Profile“ – Profile bleiben erhalten
    page.goto(BASE + "#/admin"); page.fill(".pw-field", ADMIN_PW); page.click("form button[type=submit]")
    page.wait_for_selector(".seg-ctl button[data-mode='free']")
    page.click(".seg-ctl button[data-mode='free']")
    page.wait_for_selector(".sheet-card .btn.pri"); page.click(".sheet-card .btn.pri")
    page.wait_for_timeout(200)
    ok(page.evaluate("Store.get('mode')") == "free" and page.evaluate("Store.profiles().length") == 1, "Umschalten auf ohne Profile: Profile müssen erhalten bleiben")
    page.goto(BASE); page.wait_for_selector(".ch-card")
    ok(page.evaluate("Store.stars('hw-io', 1)") == 0, "ohne Profile: fremde Sterne sichtbar")
    page.click(".topbar .icon-btn"); page.wait_for_selector("#open-admin")
    ok(page.locator("#setup-profiles").count() == 0, "bei vorhandenem Bereich kein zweites Einrichten")
    page.click("#open-admin"); page.fill(".pw-field", ADMIN_PW); page.click("form button[type=submit]")
    page.wait_for_selector(".seg-ctl button[data-mode='home']")
    page.click(".seg-ctl button[data-mode='home']"); page.wait_for_timeout(200)
    # Gast erlauben
    ok(page.evaluate("Store.get('guest')") is False, "Gast sollte anfangs aus sein")
    page.click("#guest-switch")
    ok(page.evaluate("Store.get('guest')") is True, "Gast lässt sich nicht einschalten")
    page.goto(BASE); page.wait_for_selector("#guest-login")
    ok(page.locator(".prof-btn").count() == 1, "Profil nach dem Zurückschalten weg")
    page.click("#guest-login"); page.wait_for_selector(".sheet-card .lv-btn"); page.click(".sheet-card .lv-btn[data-lv='2']")
    solve_station(page, "hw-io", "gast")
    ok(page.evaluate("Store.isGuest()") and page.evaluate("Store.stars('hw-io', 2)") == 3, "Gast: Sterne in der Sitzung")
    page.goto(BASE); page.wait_for_selector("#profile-btn"); page.click("#profile-btn"); page.wait_for_selector("#logout")
    garbage(page, "Gastmenü")
    if SHOTS: page.wait_for_timeout(500); page.screenshot(path="shots/f-guestmenu.png")
    ok(page.locator("#delete-own").count() == 0, "Gast: Profil löschen darf es nicht geben")
    page.click("#logout"); page.wait_for_selector(".prof-btn")
    ok("Gast" not in page.evaluate("localStorage.getItem('infowerk.v2')") and page.evaluate("JSON.parse(localStorage.getItem('infowerk.v2')).profiles.length") == 1, "Gast wurde gespeichert")
    login(page, "Mia"); page.wait_for_selector(".ch-card")
    ok(page.evaluate("Store.stars('hw-io', 2)") == 0 and page.evaluate("Store.stars('hw-io', 1)") == 3, "Gast-Sterne landen im Profil")
    ok(not errs, f"Ohne Profile/Gast: Konsolenfehler: {errs[:5]}")
    ctx.close()
    # ---------- 6. Ziehen: kleine Karte über dem Finger, farbige Kisten, Info ohne Lösung ----------
    ctx, page, errs = ctx_page()
    page.goto(BASE)
    page.evaluate("d=>{localStorage.clear();localStorage.setItem('infowerk.v2',JSON.stringify(d))}", {"lang": "de", "mode": "free", "solo": {"level": 2, "stars": {}, "stats": {}}})
    page.goto(BASE + "#/s/hw-io"); page.reload(); page.wait_for_selector(".sort-card")
    ok(page.locator(".bucket.colored .bk-ic").count() == 3, "Kisten: Farbe und Symbol fehlen")
    page.click(".sort-card .info-btn"); page.wait_for_selector(".info-sheet p")
    ok(not re.search(r"Eingabe|Ausgabe|beides", page.inner_text(".info-sheet p")), "i-Karte verrät vor der Antwort die Lösung")
    page.keyboard.press("Escape"); page.wait_for_timeout(250)
    bk = page.evaluate("""() => { const st = resolveStation(CHAPTERS.flatMap(c => c.stations).find(s => s.id === 'hw-io'), 2);
      const l = document.querySelector('.sort-card').getAttribute('aria-label'); return st.items.find(it => itemText(it) === l).b; }""")
    c = page.locator(".sort-card").bounding_box(); t = page.locator(f".bucket[data-b='{bk}']").bounding_box()
    page.mouse.move(c["x"] + c["width"] / 2, c["y"] + c["height"] / 2); page.mouse.down()
    page.mouse.move(c["x"] + c["width"] / 2 + 8, c["y"] + c["height"] / 2 + 8, steps=3)
    page.mouse.move(t["x"] + t["width"] / 2, t["y"] + t["height"] / 2 + 26, steps=15)
    sc = page.evaluate("new DOMMatrix(getComputedStyle(document.querySelector('.sort-card')).transform).a")
    ok(0.3 < sc < 0.5, f"Karte schrumpft beim Ziehen nicht ({sc})")
    ok(page.evaluate("document.querySelector('.bucket.over')?.dataset.b") == bk, "Kiste unter der Karte leuchtet nicht")
    page.mouse.up(); page.wait_for_selector("#fb.show.ok")
    page.click(".sort-card .info-btn"); page.wait_for_selector(".info-sheet p")
    ok(re.search(r"Eingabe|Ausgabe|beides", page.inner_text(".info-sheet p")), "i-Karte nach der Antwort ohne Einordnung")
    page.keyboard.press("Escape"); page.wait_for_timeout(250); page.click("#fb-btn"); page.wait_for_timeout(300)
    c = page.locator(".sort-card").bounding_box()
    page.mouse.move(c["x"] + 40, c["y"] + 40); page.mouse.down(); page.mouse.move(c["x"] + 90, c["y"] - 120, steps=8); page.mouse.up(); page.wait_for_timeout(350)
    ok(page.evaluate("getComputedStyle(document.querySelector('.sort-card')).transform") == "none", "Karte springt nicht zurück")
    ok(not page.evaluate("document.getElementById('fb').classList.contains('show')"), "Loslassen außerhalb zählt als Antwort")
    # PC-Werkstatt: Bauteil schwebt über dem Finger, Steckplatz leuchtet
    page.goto(BASE + "#/s/hw-build"); page.wait_for_selector(".pc-case")
    key = page.evaluate("""() => { const st = resolveStation(CHAPTERS.flatMap(c => c.stations).find(s => s.id === 'hw-build'), 2);
      return 'p' + st.parts.findIndex(p => p.dev === PC_SLOTS.find(s => s.id === 'board').accepts); }""")
    if page.locator(".slot[data-slot='board']").is_visible():
        c = page.locator(f".pc-part[data-key='{key}']").bounding_box(); t = page.locator(".slot[data-slot='board']").bounding_box()
        page.mouse.move(c["x"] + c["width"] / 2, c["y"] + c["height"] / 2); page.mouse.down()
        page.mouse.move(t["x"] + t["width"] / 2, t["y"] + t["height"] / 2 + 56, steps=15)
        ok(page.locator(".slot.target[data-slot='board']").count() == 1, "PC: Steckplatz leuchtet beim Ziehen nicht")
        page.mouse.up(); page.wait_for_timeout(300)
        ok(page.locator(".slot[data-slot='board'].filled").count() == 1, "PC: Bauteil landet nicht im Steckplatz")
        ok(page.locator(".slot.target").count() == 0, "PC: Leuchten bleibt nach dem Loslassen")
    ok(not errs, f"Ziehen: Konsolenfehler: {errs[:5]}")
    ctx.close()
    browser.close()

print(f"{checks} Prüfungen, {len(fails)} Fehler")
sys.exit(1 if fails else 0)
