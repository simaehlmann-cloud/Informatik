"""Prüft die Längen in STORE.md gegen die Grenzen von App Store Connect."""
import re, sys, pathlib
LIM = {"Name": 30, "Untertitel": 30, "Werbetext": 170, "Beschreibung": 4000, "Stichwörter": 100, "Neuerungen": 4000}
txt = pathlib.Path(__file__).resolve().parent.parent.joinpath("STORE.md").read_text()
bad = 0
for sec in re.split(r"\n## ", txt)[1:]:
    lang = sec.split("\n", 1)[0]
    for m in re.finditer(r"\*\*(\w+)\*\*[^\n]*\n```\n(.*?)\n```", sec, re.S):
        f, v = m.group(1), m.group(2)
        if f not in LIM: continue
        n = len(v.encode()) if f == "Stichwörter" else len(v)
        ok = n <= LIM[f] and not (f == "Stichwörter" and ", " in v)
        bad += not ok
        print(f"{'OK ' if ok else 'ZU LANG'} {lang[:8]:8} {f:13} {n:5}/{LIM[f]}")
sys.exit(1 if bad else 0)
