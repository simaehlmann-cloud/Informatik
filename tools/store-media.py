"""Store-Screenshots für Bit für Bit.

Aufruf (Server muss laufen: python3 -m http.server 8765 --directory www):
    python3 tools/store-media.py shots      # Screenshots → store/screenshots/<sprache>/<gerät>/
Die Szenen spielen echte Zustände der App nach (keine Attrappen).
"""
import base64, json, pathlib, random, sys, time
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "store"
BASE = "http://localhost:8765/index.html"
ADMIN_PW = "Blauer-Wal-sucht-7-Sterne"

# Ausgabegrößen (App Store Connect): iPhone 6,9" und 6,3", iPad 13"
DEVICES = {
    "iphone-6.9": {"app": (440, 956, 3), "out": (1320, 2868)},
    "iphone-6.3": {"app": (402, 874, 3), "out": (1206, 2622)},
    "ipad-13":    {"app": (820, 1093, 2.5), "out": (2064, 2752)},
}

TEXT = {
    "de": {
        "home":    ("Informatik lernen –\nBit für Bit", "108 Lerneinheiten in 9 Themen.\nAuch ohne Computerraum."),
        "pc":      ("Einen PC bauen,\nder wirklich startet", "Bauteile einsetzen, einschalten –\nund Fehler selbst finden."),
        "sort":    ("Sortieren, tippen,\nverstehen", "Jedes Gerät wird per Info-Karte erklärt."),
        "pw":      ("Sichere Passwörter\nRegel für Regel", "Wie ein Spiel – mit jeder Regel\nwird es kniffliger."),
        "caesar":  ("Geheimschriften\nknacken", "Caesar-Scheibe, Häufigkeiten\nund Vigenère."),
        "maze":    ("Programmieren\nmit Blöcken", "Den Roboter Schritt für Schritt\ndurchs Labyrinth steuern."),
        "levels":  ("Drei Stufen –\nfür alle machbar", "36 Stationen × 3 Stufen,\nbeliebig oft wiederholbar."),
        "teacher": ("Fortschritt per\nQR-Code einsammeln", "Klassenübersicht für Lehrkräfte –\nohne Internet, ohne Konten."),
    },
    "en": {
        "home":    ("Computer science,\nbit by bit", "108 learning units in 9 topics.\nNo computer room needed."),
        "pc":      ("Build a PC\nthat really starts", "Fit the parts, switch it on –\nand find faults yourself."),
        "sort":    ("Sort, tap,\nunderstand", "Every device explained\non an info card."),
        "pw":      ("Secure passwords,\nrule by rule", "Like a game – every rule\nmakes it trickier."),
        "caesar":  ("Crack\nsecret codes", "Caesar wheel, letter frequencies\nand Vigenère."),
        "maze":    ("Coding\nwith blocks", "Steer the robot through the maze\nstep by step."),
        "levels":  ("Three levels\nfor everyone", "36 stations × 3 levels,\nrepeat as often as you like."),
        "teacher": ("Collect progress\nby QR code", "Class overview for teachers –\nno internet, no accounts."),
    },
}
ORDER = ["home", "pc", "sort", "pw", "caesar", "maze", "levels", "teacher"]

STARS_DEMO = {"hw-io": 3, "hw-inside": 3, "hw-ports": 2, "hw-build": 3, "hw-storage": 3, "tab-cells": 3, "tab-formula": 2,
              "pw-build": 3, "pw-crack": 3, "bl-maze": 2, "kr-caesar": 3, "mc-eva": 1, "cd-binary": 3, "dt-phish": 2}


def seed(page, lang, mode="free", extra=None):
    data = {"lang": lang, "mode": mode, "solo": {"level": 2, "stars": {k + "@2": v for k, v in STARS_DEMO.items()}, "stats": {}}}
    if extra: data.update(extra)
    page.goto(BASE)
    page.evaluate("d => { localStorage.clear(); sessionStorage.clear(); localStorage.setItem('infowerk.v2', JSON.stringify(d)); }", data)
    page.goto(BASE)
    page.wait_for_selector(".ch-card, .mode-card, #new-profile")


def quiet(page):
    """Keine Hinweis-Toasts und kein blinkender Cursor auf den Bildern."""
    page.add_style_tag(content=".toast{display:none!important} *{caret-color:transparent!important}")


def scene(page, name, lang, dev):
    ipad = dev.startswith("ipad")
    if name == "home":
        seed(page, lang)
    elif name == "levels":
        seed(page, lang)
        page.goto(BASE + "#/k/krypto"); page.wait_for_selector(".st-card, .station-card, .st-list, a[href^='#/s/']")
        page.evaluate("Store.setLevel(1)"); page.goto(BASE + "#/k/krypto"); page.wait_for_timeout(200)
        page.evaluate("openLevelChooser()"); page.wait_for_selector(".sheet-card .lv-btn")
    elif name == "pc":
        seed(page, lang)
        page.goto(BASE + "#/s/hw-build"); page.wait_for_selector(".pc-case")
        page.evaluate("window.__test.solve()")
        page.wait_for_timeout(2600)
    elif name == "sort":
        seed(page, lang)
        page.goto(BASE + "#/s/hw-io"); page.wait_for_selector(".sort-card")
        for _ in range(3):  # ein paar Karten richtig einsortieren
            page.evaluate("window.__test.solve()"); page.wait_for_timeout(900)
            if page.evaluate("document.getElementById('fb').classList.contains('show')"): page.click("#fb-btn"); page.wait_for_timeout(300)
        page.click(".sort-card .info-btn"); page.wait_for_selector(".sheet-card")
    elif name == "pw":
        seed(page, lang)
        page.goto(BASE + "#/s/pw-build"); page.wait_for_selector(".stage input")
        page.click(".stage input")
        page.keyboard.type("Igel!Mai78" if lang == "de" else "Owl!May78", delay=20)
    elif name == "caesar":
        seed(page, lang)
        page.goto(BASE + "#/s/kr-caesar"); page.wait_for_selector(".stage")
        plus = page.locator(f".stage [aria-label='{page.evaluate("t('keyPlus')")}']")
        for _ in range(3): plus.click(); page.wait_for_timeout(120)
        page.locator(".stage input").last.click(); page.keyboard.type("KDO" if lang == "de" else "KHO", delay=20)
    elif name == "maze":
        seed(page, lang)
        page.goto(BASE + "#/s/bl-maze"); page.wait_for_selector(".stage")
        btns = page.query_selector_all(".stage .blk-add, .stage .palette button, .stage .maze-pal button")
        for b in btns[:1]: b.click()
        for b in btns[1:2]: b.click()
        for b in btns[:1]: b.click()
    elif name == "teacher":
        teacher(page, lang)
    quiet(page)
    page.wait_for_timeout(400)


def teacher(page, lang):
    random.seed(7)
    seed(page, lang, mode="school")
    page.evaluate("""async pw => { Store.set('admin', await pwHash(pw)); }""", ADMIN_PW)
    names = ["AnBe", "BeKo", "CaLu", "DeMa", "ElSo", "FiNo", "GrWe", "HaOz", "IsYi", "JoRa", "KiSt", "LeAk"]
    ids = page.evaluate("STATION_ORDER")
    now = int(time.time() * 1000)
    results = {}
    for i, n in enumerate(names):
        skill = 0.35 + 0.6 * random.random()
        stars, stats = {}, {}
        for sid in ids:
            if random.random() < skill:
                s = 3 if random.random() < skill else 2 if random.random() < 0.7 else 1
                stars[sid + "@2"] = s
                stats[sid] = {"n": 1 + random.randint(0, 2), "e": random.randint(0, 4 - s), "h": random.randint(0, 1), "t": random.randint(60, 400), "at": now - random.randint(0, 6) * 86400000}
        pid = f"p{i:05d}x"
        results[pid] = {"pid": pid, "name": n, "at": now - random.randint(0, 3) * 3600000, "last": now, "stars": stars, "stats": stats}
    cls = {"id": "k9b000000001", "name": "9b Informatik" if lang == "de" else "9b Computing", "key": "AAAAAAAAAAAAAAAAAAAAAA", "roster": names + ["MiPa"],
           "created": now - 20 * 86400000, "exp": page.evaluate("schoolYearEnd()"), "results": results}
    page.evaluate("c => Store.addClass(c)", cls)
    page.goto(BASE + "#/admin/k/k9b000000001"); page.wait_for_selector(".pw-field")
    page.fill(".pw-field", ADMIN_PW); page.click("form button[type=submit]")
    page.wait_for_selector(".hm-cell")


FRAME = """<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: X; src: local('Inter'), local('Segoe UI'), local('Roboto'), local('Noto Sans'); }
html,body{margin:0;width:100vw;height:100vh;overflow:hidden}
body{background:radial-gradient(120% 70% at 10% 0%,#6C7BFF 0%,rgba(108,123,255,0) 60%),linear-gradient(160deg,#3443D9 0%,#5B3FD8 55%,#8E4BD6 100%);
  font-family:system-ui,-apple-system,'Segoe UI',Roboto,'Noto Sans',sans-serif;color:#fff;position:relative}
.bits{position:absolute;inset:0;font:600 var(--bs) ui-monospace,Menlo,monospace;color:rgba(255,255,255,.07);line-height:1.25;white-space:pre;overflow:hidden;letter-spacing:.2em}
body{display:flex;flex-direction:column;align-items:center}
.head{position:relative;padding:var(--top) var(--px) 0;text-align:center}
h1{margin:0;font-size:var(--h1);line-height:1.08;font-weight:800;letter-spacing:-.02em;white-space:pre-line;text-shadow:0 .03em .12em rgba(20,10,80,.25)}
p{margin:var(--gap) 0 0;font-size:var(--p);line-height:1.3;font-weight:500;opacity:.92;white-space:pre-line}
.dev{position:relative;flex-shrink:0;margin-top:var(--dtop);width:var(--dw);background:#14162B;border-radius:var(--r);padding:var(--bz);
  box-shadow:0 2vw 8vw rgba(16,8,70,.45),0 0 0 .25vw rgba(255,255,255,.18) inset}
.dev img{display:block;width:100%;border-radius:calc(var(--r) - var(--bz))}
</style></head><body><div class="bits">BITS</div>
<div class="head"><h1>H1</h1><p>SUB</p></div>
<div class="dev"><img src="IMG"></div></body></html>"""


def compose(browser, img_png, title, sub, dev, out_path):
    W, H = DEVICES[dev]["out"]
    ipad = dev.startswith("ipad")
    dpr = 2 if ipad else 3
    cw, ch = W // dpr, H // dpr
    if ipad:
        v = {"--px": "8vw", "--top": "4.6vh", "--h1": "6vw", "--p": "2.7vw", "--gap": "1.4vh", "--dtop": "3.6vh", "--dw": "84vw", "--r": "3.4vw", "--bz": "1.5vw", "--bs": "2.2vw"}
    else:
        v = {"--px": "6vw", "--top": "5.6vh", "--h1": "8.6vw", "--p": "4.5vw", "--gap": "1.2vh", "--dtop": "3.4vh", "--dw": "80vw", "--r": "9vw", "--bz": "2.6vw", "--bs": "3.6vw"}
    random.seed(title)
    bits = "\n".join("".join(random.choice("01  ") for _ in range(60)) for _ in range(80))
    html = (FRAME.replace("BITS", bits).replace("H1", title.replace("&", "&amp;")).replace("SUB", sub.replace("&", "&amp;"))
            .replace("IMG", "data:image/png;base64," + base64.b64encode(img_png).decode()))
    html = html.replace("<body>", "<body style=\"" + ";".join(f"{k}:{val}" for k, val in v.items()) + "\">")
    ctx = browser.new_context(viewport={"width": cw, "height": ch}, device_scale_factor=dpr)
    pg = ctx.new_page(); pg.set_content(html); pg.wait_for_timeout(150)
    pg.screenshot(path=str(out_path), type="png", omit_background=False)
    ctx.close()


def shots(only=None):
    errors = []
    with sync_playwright() as p:
        browser = p.chromium.launch()
        import os
        langs = os.environ.get("LANGS", "de,en").split(",")
        devs = os.environ.get("DEVS", ",".join(DEVICES)).split(",")
        for lang in langs:
            for dev, spec in [(k, v) for k, v in DEVICES.items() if k in devs]:
                w, h, dpr = spec["app"]
                d = OUT / "screenshots" / lang / dev
                d.mkdir(parents=True, exist_ok=True)
                for i, name in enumerate(ORDER, 1):
                    if only and name not in only: continue
                    ctx = browser.new_context(viewport={"width": w, "height": h}, device_scale_factor=dpr, locale="de-DE" if lang == "de" else "en-GB",
                                              has_touch=True, is_mobile=not dev.startswith("ipad"))
                    page = ctx.new_page()
                    page.on("pageerror", lambda e: errors.append(str(e)))
                    scene(page, name, lang, dev)
                    raw = page.screenshot(type="png")
                    (d / "raw").mkdir(exist_ok=True)
                    (d / "raw" / f"{i:02d}-{name}.png").write_bytes(raw)
                    ctx.close()
                    t1, t2 = TEXT[lang][name]
                    png = d / f"{i:02d}-{name}.png"
                    compose(browser, raw, t1, t2, dev, png)
                    from PIL import Image  # JPEG: kleiner, ohne Transparenz (Vorgabe von App Store Connect)
                    Image.open(png).convert("RGB").save(png.with_suffix(".jpg"), quality=93, subsampling=0, optimize=True)
                    png.unlink()
                    print("ok", lang, dev, name, flush=True)
        browser.close()
    if errors: print("FEHLER:", errors[:5]); sys.exit(1)


# ---------------------------------------------------------------- Vorschauvideos
# App Store: 15–30 s, höchstens 30 fps, H.264 mit Stereo-Tonspur (AAC 256 kbit/s),
# iPhone 886×1920, iPad 1200×1600. Nur echte Aufnahmen aus der App, keine Gerätebilder.
VIDEO = {"iphone": {"vp": (443, 960, 2), "out": (886, 1920)}, "ipad": {"vp": (800, 1067, 1.5), "out": (1200, 1600)}}

FINGER = """
(() => {
  const d = document.createElement('div');
  d.id = '__finger';
  d.style.cssText = 'position:fixed;left:0;top:0;width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:50%;background:rgba(255,255,255,.55);' +
    'border:3px solid rgba(66,85,232,.85);box-shadow:0 4px 14px rgba(20,20,80,.35);pointer-events:none;z-index:99999;opacity:0;transition:opacity .2s,transform .12s';
  const add = () => document.body.appendChild(d);
  document.body ? add() : addEventListener('DOMContentLoaded', add);
  addEventListener('pointermove', e => { d.style.left = e.clientX + 'px'; d.style.top = e.clientY + 'px'; d.style.opacity = '1'; }, true);
  addEventListener('pointerdown', () => { d.style.transform = 'scale(.75)'; }, true);
  addEventListener('pointerup', () => { d.style.transform = ''; }, true);
  window.__hideFinger = () => { d.style.opacity = '0'; };
})();
"""


class Rec:
    def __init__(self, page):
        self.page, self.frames = page, []
        self.cdp = page.context.new_cdp_session(page)
        self.cdp.on("Page.screencastFrame", self._frame)

    def _frame(self, ev):
        self.frames.append((ev["metadata"]["timestamp"], base64.b64decode(ev["data"])))
        try: self.cdp.send("Page.screencastFrameAck", {"sessionId": ev["sessionId"]})
        except Exception: pass

    def start(self, w, h):
        self.cdp.send("Page.startScreencast", {"format": "png", "maxWidth": w, "maxHeight": h, "everyNthFrame": 1})

    def stop(self):
        self.cdp.send("Page.stopScreencast")


def center(page, sel):
    b = page.locator(sel).first.bounding_box()
    return b["x"] + b["width"] / 2, b["y"] + b["height"] / 2


def tap(page, sel, wait=350):
    x, y = center(page, sel)
    page.mouse.move(x, y, steps=14)
    page.wait_for_timeout(120)
    page.mouse.down(); page.wait_for_timeout(90); page.mouse.up()
    page.wait_for_timeout(wait)


def drag(page, src, dst, wait=400, lift=0):
    """Zieht src auf dst. lift: so weit schwebt das gezogene Teil über dem Finger (wie in der App)."""
    x1, y1 = center(page, src); x2, y2 = center(page, dst); y2 += lift
    page.mouse.move(x1, y1, steps=12); page.wait_for_timeout(120)
    page.mouse.down(); page.mouse.move(x1 + 6, y1 + 6, steps=3)
    page.mouse.move(x2, y2, steps=26); page.wait_for_timeout(100)
    page.mouse.up(); page.wait_for_timeout(wait)


def hold(page, ms):
    page.wait_for_timeout(ms)


SCROLL = """(arg) => new Promise(done => {
  const el = document.scrollingElement, from = el.scrollTop;
  const to = arg.to === 'end' ? el.scrollHeight - innerHeight : arg.to;
  const t0 = performance.now();
  const step = t => {
    const p = Math.min(1, (t - t0) / arg.ms), e = p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
    el.scrollTop = from + (to - from) * e;
    p < 1 ? requestAnimationFrame(step) : done();
  };
  requestAnimationFrame(step);
})"""


def scroll(page, to, ms):
    page.evaluate(SCROLL, {"to": to, "ms": ms})


def script(page, lang):
    """Ablauf der Vorschau (~27 s): Startbildschirm mit allen Themen, dann zwei Stationen aus „Computer & Hardware“."""
    hold(page, 900)                                            # Startbildschirm
    scroll(page, "end", 3100); hold(page, 300)                 # alle neun Themen
    scroll(page, 0, 900); hold(page, 150)
    tap(page, ".ch-card >> nth=0", 900)                       # Computer & Hardware
    tap(page, ".st-row >> nth=0", 900)                         # Station 1: Eingabe oder Ausgabe?
    for k in range(2):                                         # zwei Geräte einsortieren
        if k == 1:
            tap(page, ".sort-card .info-btn", 1150)            # i-Karte lesen
            tap(page, ".sheet-card .icon-btn", 400)
        b = page.evaluate("""() => {
          const st = resolveStation(CHAPTERS.flatMap(c => c.stations).find(s => s.id === 'hw-io'), Store.level());
          const lbl = document.querySelector('.sort-card').getAttribute('aria-label');
          return st.items.find(it => itemText(it) === lbl).b; }""")
        drag(page, ".sort-card", f".bucket[data-b='{b}']", 750, lift=26)
        tap(page, "#fb-btn", 500)
    back = page.evaluate("t('backToChapter')")
    tap(page, f".stage-head [aria-label='{back}'], [aria-label='{back}']", 900)   # zurück zum Thema
    tap(page, ".st-row >> nth=3", 900)                         # Station 4: PC-Werkstatt
    for _ in range(3):                                         # drei Bauteile hineinziehen
        nxt = page.evaluate("""() => {
          const st = resolveStation(CHAPTERS.flatMap(c => c.stations).find(s => s.id === 'hw-build'), Store.level());
          const parts = st.parts.map((p, k) => Object.assign({ key: 'p' + k }, p));
          const vis = sel => { const e = document.querySelector(sel); return e && e.getClientRects().length > 0; };
          for (const id of ['board', 'cpu', 'ram', 'ssd', 'gpu', 'psu']) {
            const el = document.querySelector(`.slot[data-slot='${id}']`);
            if (!el || !el.getClientRects().length || el.querySelector('.slot-part')) continue;
            const p = parts.find(p => p.dev === PC_SLOTS.find(s => s.id === id).accepts);
            if (p && vis(`.pc-part[data-key='${p.key}']`)) return [id, p.key];
          }
          return null; }""")
        if not nxt: break
        sid, key = nxt
        page.locator(f".pc-part[data-key='{key}']").first.scroll_into_view_if_needed()
        drag(page, f".pc-part[data-key='{key}']", f".slot[data-slot='{sid}']", 450, lift=56)
    page.evaluate("window.__hideFinger()")
    page.evaluate("window.__test.solve()"); hold(page, 1400)  # Rest einsetzen, einschalten, läuft
    page.wait_for_selector("#fb.show", timeout=8000); hold(page, 600)
    tap(page, "#fb-btn", 300)                                  # Ergebnis mit Sternen
    page.evaluate("window.__hideFinger()")
    hold(page, 1500)


def video(lang, kind, browser):
    vw, vh, dpr = VIDEO[kind]["vp"]; W, H = VIDEO[kind]["out"]
    ctx = browser.new_context(viewport={"width": vw, "height": vh}, device_scale_factor=dpr, locale="de-DE" if lang == "de" else "en-GB")
    ctx.add_init_script(FINGER)
    page = ctx.new_page()
    errs = []; page.on("pageerror", lambda e: errs.append(str(e)))
    seed(page, lang); quiet(page)
    page.wait_for_timeout(500)
    rec = Rec(page); rec.start(W, H)
    script(page, lang)
    rec.stop(); page.wait_for_timeout(300)
    ctx.close()
    if errs: raise SystemExit(f"Fehler in der App: {errs[:3]}")
    return rec.frames


def encode(frames, out, W, H):
    import subprocess, tempfile, os
    tmp = pathlib.Path(tempfile.mkdtemp())
    frames = sorted(frames, key=lambda f: f[0])
    lines = []
    for i, (ts, png) in enumerate(frames):
        f = tmp / f"{i:05d}.png"; f.write_bytes(png)
        dur = (frames[i + 1][0] - ts) if i + 1 < len(frames) else 1.0
        lines += [f"file '{f}'", f"duration {max(dur, 0.001):.4f}"]
    lines.append(f"file '{tmp / f'{len(frames) - 1:05d}.png'}'")
    (tmp / "list.txt").write_text("\n".join(lines))
    total = frames[-1][0] - frames[0][0] + 1.0
    vf = f"scale={W}:{H}:force_original_aspect_ratio=decrease:flags=lanczos,pad={W}:{H}:(ow-iw)/2:(oh-ih)/2:color=#F3F5FB,fps=30,format=yuv420p"
    cmd = ["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", str(tmp / "list.txt"),
           "-f", "lavfi", "-i", "anullsrc=channel_layout=stereo:sample_rate=48000",
           "-vf", vf, "-c:v", "libx264", "-profile:v", "high", "-level", "4.0", "-preset", "slow",
           "-b:v", "11M", "-maxrate", "12M", "-bufsize", "24M", "-r", "30",
           "-c:a", "aac", "-b:a", "256k", "-ar", "48000", "-ac", "2", "-shortest", "-t", f"{min(total, 29.5):.2f}",
           "-movflags", "+faststart", str(out)]
    subprocess.run(cmd, check=True)
    return total


def videos():
    import os
    with sync_playwright() as p:
        browser = p.chromium.launch()
        for lang in os.environ.get("LANGS", "de,en").split(","):
            for kind in os.environ.get("KINDS", "iphone,ipad").split(","):
                W, H = VIDEO[kind]["out"]
                d = OUT / "previews" / lang; d.mkdir(parents=True, exist_ok=True)
                frames = video(lang, kind, browser)
                total = encode(frames, d / f"vorschau-{kind}-{lang}.mp4", W, H)
                print("ok", lang, kind, f"{len(frames)} Bilder, {total:.1f} s", flush=True)
        browser.close()


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "shots"
    if cmd == "shots": shots(sys.argv[2:] or None)
    if cmd == "videos": videos()
