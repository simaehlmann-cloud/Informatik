/* Stufen 1 (Einsteiger) und 3 (Profi) für die Stationen aus content.js.
   Stufe 2 ist die Grundfassung. Einsteiger: kurze Sätze, kleine Zahlen, höchstens 3 Antworten, wenige Aufgaben.
   pick: wählt Einträge der Grundfassung aus, add: hängt neue an, alles andere ersetzt. */
'use strict';

const COLORS = ['rot', 'blau', 'grün', 'gruen', 'gelb', 'lila', 'pink', 'schwarz', 'weiß', 'weiss', 'red', 'blue', 'green', 'yellow', 'purple', 'black', 'white'];
const YEAR = 365.25 * 86400;

const LEVELS = {
  /* ---------- Tabellenkalkulation ---------- */
  'tab-cells': {
    1: { rounds: [
      { mode: 'cell', target: 'C3', q: T('Tippe auf die Zelle C3. C ist die Spalte, 3 ist die Zeile.', 'Tap cell C3. C is the column, 3 is the row.'), why: T('Genau: Spalte C, Zeile 3.', 'Exactly: column C, row 3.') },
      { mode: 'cell', target: 'A5', q: T('Wo steht „Muffins“? Tippe darauf.', 'Where does it say “Muffins”? Tap it.'), why: T('„Muffins“ steht in A5.', '“Muffins” is in A5.') },
      { mode: 'cell', target: 'B2', q: T('Wie viele Säfte werden gekauft? Tippe auf die Zahl.', 'How many juices are bought? Tap the number.'), why: T('In B2 steht 6. Das ist die Anzahl.', 'B2 holds 6. That is the quantity.') },
      { mode: 'cell', target: 'D7', q: T('Tippe auf die Gesamtsumme ganz unten.', 'Tap the grand total at the bottom.'), why: T('Die Summe steht in D7.', 'The total is in D7.') }
    ] },
    3: { rounds: [
      { mode: 'range', target: 'B2:C6', q: T('Markiere alle Anzahlen und Preise in einem Bereich – über zwei Spalten.', 'Select all quantities and prices as one range – across two columns.'), why: T('B2:C6 umfasst 2 Spalten · 5 Zeilen = 10 Zellen.', 'B2:C6 covers 2 columns × 5 rows = 10 cells.') },
      { mode: 'cell', target: 'D4', q: T('In welcher Zelle steht die Formel =B4*C4?', 'Which cell contains the formula =B4*C4?'), why: T('Die Formel steht in D4 und berechnet den Preis für die Brezeln.', 'The formula is in D4 and works out the cost of the pretzels.'), hint: T('Tippe Zellen in Spalte D an und lies die Bearbeitungsleiste.', 'Tap cells in column D and read the formula bar.') },
      { mode: 'range', target: 'A1:D1', q: T('Markiere die Kopfzeile mit den Spaltennamen.', 'Select the header row with the column names.'), why: T('Die Kopfzeile ist A1:D1.', 'The header row is A1:D1.') },
      { mode: 'range', target: 'D2:D6', q: T('Welcher Bereich steht in der Formel der Gesamtsumme? Markiere ihn.', 'Which range is used in the grand-total formula? Select it.'), why: T('=SUMME(D2:D6) addiert D2 bis D6.', '=SUM(D2:D6) adds D2 to D6.'), hint: T('Tippe D7 an und lies die Formel.', 'Tap D7 and read the formula.') },
      { mode: 'cell', target: 'C6', q: T('Welche Zelle müsstest du ändern, wenn Servietten teurer werden?', 'Which cell would you change if napkins became more expensive?'), why: T('Der Preis steht in C6 – D6 und D7 rechnen dann von selbst neu.', 'The price is in C6 – D6 and D7 then recalculate on their own.') }
    ] }
  },
  'tab-formula': {
    1: { how: T('Lies die Formel. Schau in der Tabelle nach. Tippe auf das richtige Ergebnis.', 'Read the formula. Look it up in the table. Tap the correct result.'), rounds: [
      { f: '=B2+B3', choices: [10, 64, 9], why: T('B2 ist 6, B3 ist 4. 6 + 4 = 10', 'B2 is 6, B3 is 4. 6 + 4 = 10'), hint: T('Suche B2 und B3. Rechne plus.', 'Find B2 and B3. Add them.') },
      { f: '=C3*2', choices: [4, 2, 6], why: T('C3 ist 2. 2 · 2 = 4', 'C3 is 2. 2 × 2 = 4'), hint: T('* bedeutet mal.', '* means times.') },
      { f: T('=SUMME(B3:B4)', '=SUM(B3:B4)'), choices: [14, 10, 40], why: T('SUMME rechnet plus: 4 + 10 = 14', 'SUM adds: 4 + 10 = 14'), hint: T('B3:B4 bedeutet B3 und B4.', 'B3:B4 means B3 and B4.') },
      { f: '=MAX(B2:B4)', choices: [10, 6, 4], why: T('MAX nimmt die größte Zahl: 10', 'MAX takes the largest number: 10'), hint: T('Welche Zahl ist am größten: 6, 4 oder 10?', 'Which number is largest: 6, 4 or 10?') }
    ] },
    3: { rounds: [
      { f: '=B2*C2+B3*C3', why: T('Punkt vor Strich: 6 · 1,50 + 4 · 2 = 9 + 8 = 17', 'Multiplication first: 6 × 1.50 + 4 × 2 = 9 + 8 = 17') },
      { f: '=MAX(D2:D6)-MIN(D2:D6)', why: T('14,40 − 3,80 = 10,60 – die Spannweite der Kosten.', '14.40 − 3.80 = 10.60 – the range of the costs.') },
      { f: T('=SUMME(D2:D6)/ANZAHL(B2:B6)', '=SUM(D2:D6)/COUNT(B2:B6)'), why: T('43,20 : 5 = 8,64 – im Schnitt kostet ein Artikel 8,64 €.', '43.20 ÷ 5 = 8.64 – on average an item costs €8.64.') },
      { f: T('=WENN(MITTELWERT(B2:B6)>5;"ja";"nein")', '=IF(AVERAGE(B2:B6)>5,"yes","no")'), opts: [T('ja', 'yes'), T('nein', 'no')], why: T('Der Mittelwert ist 6,8 und damit größer als 5 → „ja“.', 'The average is 6.8, which is greater than 5 → “yes”.') },
      { f: T('=WENN(D5>=10;D5-2;D5)', '=IF(D5>=10,D5-2,D5)'), why: T('D5 = 14,40 ist mindestens 10, also gibt es 2 € Rabatt: 12,40.', 'D5 = 14.40 is at least 10, so there is a €2 discount: 12.40.'), hint: T('Prüfe erst die Bedingung, dann rechne den passenden Teil.', 'Check the condition first, then work out the matching part.') }
    ] }
  },
  'tab-filter': {
    1: { rounds: [
      { mode: 'num', calc: P => P.filter(p => p.sport === 'basket').length, q: T('Wie viele Personen spielen Basketball?', 'How many people play basketball?'), why: T('Noah, Aylin und Luca – das sind 3.', 'Noah, Aylin and Luca – that is 3.'), hint: T('Stelle oben „Sport“ auf Basketball. Zähle die Zeilen.', 'Set “Sport” at the top to Basketball. Count the rows.') },
      { mode: 'num', calc: P => P.filter(p => p.sport === 'dance').length, q: T('Wie viele Personen tanzen?', 'How many people dance?'), why: T('Elif und Sara – das sind 2.', 'Elif and Sara – that is 2.'), hint: T('Stelle „Sport“ auf Tanzen.', 'Set “Sport” to Dance.') },
      { mode: 'row', calc: P => P.reduce((a, b) => (b.min > a.min ? b : a)).name, q: T('Wer hat die meisten Minuten? Tippe die Person an.', 'Who has the most minutes? Tap the person.'), why: T('Finn hat 200 Minuten.', 'Finn has 200 minutes.'), hint: T('Tippe zweimal auf „Minuten“. Dann steht die größte Zahl oben.', 'Tap “Minutes” twice. Then the largest number is at the top.') }
    ] },
    3: { rounds: [
      { mode: 'num', calc: P => P.filter(p => p.age === 15 && p.sport !== 'basket').length, q: T('Wie viele 15-Jährige spielen nicht Basketball?', 'How many 15-year-olds do not play basketball?'), why: T('Bei 15 Jahren bleiben Ben, Aylin und Emma. Ohne Aylin (Basketball): 2.', 'Age 15 leaves Ben, Aylin and Emma. Without Aylin (basketball): 2.') },
      { mode: 'num', calc: P => { const f = P.filter(p => p.sport === 'foot'); return f.reduce((a, p) => a + p.min, 0) / f.length; }, q: T('Wie viele Minuten haben die Fußballspieler im Durchschnitt?', 'What is the average number of minutes of the football players?'), why: T('(140 + 110 + 200) : 3 = 150', '(140 + 110 + 200) ÷ 3 = 150'), hint: T('Filtere nach Fußball, addiere die Minuten und teile durch die Anzahl.', 'Filter for football, add the minutes and divide by the count.') },
      { mode: 'num', calc: P => P.filter(p => p.min > 100).length, q: T('Wie viele Personen haben mehr als 100 Minuten Bildschirmzeit?', 'How many people have more than 100 minutes of screen time?'), why: T('Absteigend sortiert: Finn, Noah, Tim, Ben, Aylin, Luca, Jonas – 7 Personen.', 'Sorted descending: Finn, Noah, Tim, Ben, Aylin, Luca, Jonas – 7 people.'), hint: T('Sortiere nach Minuten und zähle bis zur ersten Zahl unter 100.', 'Sort by minutes and count until the first number below 100.') },
      { mode: 'row', calc: P => P.filter(p => p.age === 16).reduce((a, b) => (b.min < a.min ? b : a)).name, q: T('Welche 16-jährige Person hat die wenigste Bildschirmzeit? Tippe sie an.', 'Which 16-year-old has the least screen time? Tap them.'), why: T('Bei den 16-Jährigen hat Sara 85 Minuten, Noah 180.', 'Among the 16-year-olds Sara has 85 minutes, Noah 180.') }
    ] }
  },
  'tab-copy': {
    1: { pick: { items: [0, 2, 4] }, maxOpts: 3 },
    3: { add: { items: [
      { q: T('In B2 steht =$A2*B$1. Du kopierst die Formel nach C3. Was steht dort?', 'B2 contains =$A2*B$1. You copy the formula to C3. What is there?'),
        opts: ['=$A3*C$1', '=$A2*C$1', '=B3*C$1', '=$A3*B$1'], a: 0, why: T('$A: Spalte bleibt A, Zeile wandert 2 → 3. B$1: Spalte wandert B → C, Zeile 1 bleibt.', '$A: column stays A, row moves 2 → 3. B$1: column moves B → C, row 1 stays.'), hint: T('Das $ hält nur das fest, was direkt dahinter steht.', 'The $ only locks what comes right after it.') },
      { q: T('In F1 steht ein Rabatt. Welche Formel in E2 kannst du richtig nach unten kopieren?', 'F1 holds a discount. Which formula in E2 can you copy down correctly?'),
        opts: ['=D2*$F$1', '=D2*F1', '=$D$2*F1', '=D2*F$2'], a: 0, why: T('D2 soll mitwandern, der Rabatt in F1 muss fest bleiben.', 'D2 should move along, the discount in F1 must stay fixed.') }
    ] } }
  },
  'tab-chart': {
    1: { pick: { items: [0, 1, 2] }, maxOpts: 3 },
    3: { add: { items: [
      { q: T('Du willst zeigen, ob mehr Lernzeit zu mehr Testpunkten führt (30 Personen).', 'You want to show whether more study time leads to more test points (30 people).'),
        opts: [{ t: T('Punktdiagramm', 'Scatter plot'), icon: 'scatter' }, { t: T('Kreisdiagramm', 'Pie chart'), icon: 'pie' }, { t: T('Liniendiagramm', 'Line chart'), icon: 'line' }], a: 0,
        why: T('Jede Person ist ein Punkt (Lernzeit | Punkte). So erkennt man einen Zusammenhang.', 'Each person is one point (study time | points). That shows a relationship.') },
      { q: T('Eine Firma zeigt nur die drei Monate, in denen ihre Verkäufe stiegen. Was ist das Problem?', 'A company only shows the three months in which its sales rose. What is the problem?'),
        opts: [T('Ausgewählte Daten erzeugen einen falschen Eindruck.', 'Selected data gives a false impression.'), T('Drei Monate sind zu bunt.', 'Three months are too colourful.'), T('Es gibt kein Problem.', 'There is no problem.')], a: 0,
        why: T('Wer Daten weglässt, kann jede Aussage „beweisen“. Frage immer: Was fehlt?', 'Leaving data out can “prove” anything. Always ask: what is missing?') }
    ] } }
  },

  /* ---------- Passwörter ---------- */
  'pw-build': {
    1: { pick: { rules: [0, 1, 2, 3, 4] },
      task: T('Baue ein Passwort. Erfülle alle 5 Regeln.', 'Build a password. Meet all 5 rules.'),
      hint: T('Sonderzeichen sind zum Beispiel ! ? # oder %.', 'Symbols are for example ! ? # or %.'),
      example: T('Sonne!Hut2026', 'Sunny!Hat2026'),
      final: T('Super! Lang, mit Großbuchstaben, Zahl und Sonderzeichen – so sieht ein starkes Passwort aus.', 'Great! Long, with capitals, a digit and a symbol – that is what a strong password looks like.') },
    3: { add: { rules: [
      { t: T('Enthält eine Farbe (z. B. rot, blau, grün).', 'Contains a colour (e.g. red, blue, green).'), test: s => COLORS.some(c => s.toLowerCase().includes(c)) },
      { t: T('Mindestens 16 Zeichen.', 'At least 16 characters.'), test: s => [...s].length >= 16 }
    ] }, example: T('Igel!Mai78xyzQRot', 'Owl!May78xyzQRed'),
      task: T('Baue ein Passwort, das alle 12 Regeln erfüllt.', 'Build a password that meets all 12 rules.') }
  },
  'pw-crack': {
    1: { rounds: [
      { sets: null, atLeast: true, sec: 86400, q: T('Stelle ein Passwort ein, das länger als einen Tag zum Knacken braucht. Probiere: Länge oder Zeichenarten?', 'Set up a password that takes more than a day to crack. Try out: length or kinds of characters?'),
        why: T('Geschafft! Jedes Zeichen mehr macht das Knacken viel schwerer.', 'Done! Every extra character makes cracking much harder.'), hint: T('Schiebe den Regler nach rechts.', 'Move the slider to the right.') },
      { sets: ['lower', 'upper', 'digits', 'special'], atLeast: true, sec: YEAR, q: T('Schalte alle vier Zeichenarten ein. Mach das Passwort so lang, dass es länger als ein Jahr hält.', 'Switch on all four kinds of characters. Make the password long enough to last more than a year.'),
        why: T('Mit allen Zeichenarten reichen schon 9 Zeichen für mehr als ein Jahr.', 'With all kinds of characters, 9 characters already last more than a year.'), hint: T('Alle vier Knöpfe an. Dann die Länge erhöhen.', 'All four buttons on. Then increase the length.') }
    ] },
    3: { rounds: [
      { sets: ['digits'], sec: YEAR, q: T('Nur Ziffern: Welche Länge braucht man mindestens für mehr als ein Jahr?', 'Digits only: what is the shortest length for more than a year?'), why: T('18 Ziffern – kaum zu merken. Deshalb sind reine Zahlen-PINs nur mit Sperre nach Fehlversuchen sicher.', '18 digits – hard to remember. That is why number-only PINs are only safe with a lock-out after wrong attempts.') },
      { sets: ['lower', 'upper'], sec: 1000 * YEAR, q: T('Klein- und Großbuchstaben: kürzeste Länge für mehr als 1000 Jahre?', 'Lower- and upper-case letters: shortest length for more than 1000 years?'), why: T('52 Zeichen, 12 Stellen: 52¹² Möglichkeiten reichen für über 1000 Jahre.', '52 characters, 12 places: 52¹² possibilities last over 1000 years.') },
      { sets: ['lower', 'upper', 'digits', 'special'], sec: 1e6 * YEAR, q: T('Alle Zeichenarten: kürzeste Länge für mehr als eine Million Jahre?', 'All kinds of characters: shortest length for more than a million years?'), why: T('12 Stellen mit 95 Zeichen. Ab hier hilft jede weitere Stelle um das 95-Fache.', '12 places with 95 characters. From here every extra place multiplies the time by 95.') }
    ] }
  },
  'pw-sort': {
    1: { pick: { items: [0, 3, 8, 2, 5, 4] } },
    3: { add: { items: [
      { t: '1qay2wsx', b: 'bad', why: T('Sieht zufällig aus, ist aber ein Tastaturmuster (senkrechte Reihen).', 'Looks random but is a keyboard pattern (vertical columns).') },
      { t: T('7Zwerge-trinken-kalten-Tee', '7Dwarfs-drink-cold-Tea'), b: 'good', why: T('Lange Passphrase mit Zahl und Zeichen – stark.', 'Long passphrase with a digit and symbols – strong.') },
      { t: 'M4rc0!2009', b: 'bad', why: T('Name mit Ersetzungen und Geburtsjahr – das probieren Knackprogramme zuerst.', 'Name with substitutions and year of birth – cracking tools try that first.') }
    ] } }
  },
  'pw-myth': {
    1: { pick: { items: [0, 2, 4, 1] }, maxOpts: 3 },
    3: { add: { items: [
      { q: T('Ein Dienst wurde gehackt, dein Passwort steht in einer Liste im Netz. Was ist am wichtigsten?', 'A service was hacked and your password is on a list online. What matters most?'),
        opts: [T('Das Passwort überall ändern, wo ich es benutzt habe.', 'Change the password everywhere I used it.'), T('Abwarten, ob etwas passiert.', 'Wait and see if anything happens.'), T('Das Konto einfach nicht mehr benutzen.', 'Simply stop using the account.')], a: 0,
        why: T('Angreifer probieren gestohlene Passwörter automatisch bei vielen Diensten aus.', 'Attackers automatically try stolen passwords on many services.') },
      { q: T('Warum speichern seriöse Dienste Passwörter nur als „Hashwert“?', 'Why do trustworthy services store passwords only as a “hash”?'),
        opts: [T('Damit niemand sie bei einem Datenleck direkt lesen kann.', 'So nobody can read them directly after a data leak.'), T('Damit sie weniger Platz brauchen.', 'So they take up less space.'), T('Damit sie das Passwort per E-Mail zurückschicken können.', 'So they can email the password back to you.')], a: 0,
        why: T('Ein Hashwert lässt sich nicht zurückrechnen. Bietet ein Dienst an, dir dein altes Passwort zu schicken, ist das ein Warnzeichen.', 'A hash cannot be reversed. If a service offers to send you your old password, that is a warning sign.') }
    ] } }
  },

  /* ---------- Blockprogrammierung ---------- */
  'bl-maze': {
    1: { stages: [
      { map: ['S...Z'], dir: 'E', sol: ['f', 'f', 'f', 'f'], goal: T('Bring den Roboter zum Stern.', 'Get the robot to the star.'), hint: T('Zähle die Felder bis zum Stern.', 'Count the squares to the star.') },
      { map: ['S..', '##.', '##Z'], dir: 'E', sol: ['f', 'f', 'r', 'f', 'f'], goal: T('Der Weg macht eine Kurve nach rechts.', 'The path turns right.'), hint: T('Zwei Schritte, rechts drehen, zwei Schritte.', 'Two steps, turn right, two steps.') },
      { map: ['S..##', '##.##', '##..Z'], dir: 'E', sol: ['f', 'f', 'r', 'f', 'f', 'l', 'f', 'f'], goal: T('Jetzt zwei Kurven.', 'Now two turns.'), hint: T('Zwei vor, rechts, zwei vor, links, zwei vor.', 'Two forward, right, two forward, left, two forward.') }
    ] },
    3: { stages: [
      { map: ['S.###', '#..##', '##..#', '###.Z'], dir: 'E', loops: true, limit: 6, sol: ['f', { rep: 3, body: ['r', 'f', 'l', 'f'] }], goal: T('Die Treppe mit höchstens 6 Blöcken.', 'The staircase with at most 6 blocks.') },
      { map: ['S....', '####.', 'Z....'], dir: 'E', loops: true, limit: 8, sol: [{ rep: 4, body: ['f'] }, 'r', { rep: 2, body: ['f'] }, 'r', { rep: 4, body: ['f'] }], goal: T('Um die Mauer – höchstens 8 Blöcke.', 'Round the wall – at most 8 blocks.') },
      { map: ['S####', '..###', '#..##', '##..#', '###.Z'], dir: 'S', loops: true, limit: 5, sol: [{ rep: 4, body: ['f', 'l', 'f', 'r'] }], goal: T('Treppe abwärts – höchstens 5 Blöcke.', 'Down the stairs – at most 5 blocks.') },
      { map: ['S..####', '##.####', '##...##', '####.##', '####...', '######.', '######Z'], dir: 'E', loops: true, limit: 7, sol: [{ rep: 3, body: [{ rep: 2, body: ['f'] }, 'r', { rep: 2, body: ['f'] }, 'l'] }],
        goal: T('Große Stufen – höchstens 7 Blöcke. Tipp: Eine Wiederholung darf in einer Wiederholung stecken.', 'Big steps – at most 7 blocks. Tip: a repeat may sit inside a repeat.'),
        hint: T('Außen 3-mal wiederholen. Innen: 2-mal vor, rechts, 2-mal vor, links.', 'Repeat 3 times on the outside. Inside: 2 × forward, right, 2 × forward, left.') }
    ] }
  },
  'bl-predict': {
    1: { pick: { items: [0, 1, 3] }, maxOpts: 3 },
    3: { add: { items: [
      { q: T('Welchen Wert hat n am Ende?', 'What is the value of n at the end?'), code: [B(T('setze n auf 0', 'set n to 0'), 'var'), B(T('wiederhole 3 mal', 'repeat 3 times'), 'control'), B(T('wiederhole 4 mal', 'repeat 4 times'), 'control', 1), B(T('ändere n um 1', 'change n by 1'), 'var', 2)],
        opts: ['12', '7', '4', '3'], a: 0, why: T('Die innere Schleife läuft 3 · 4 = 12-mal.', 'The inner loop runs 3 × 4 = 12 times.') },
      { q: T('Welchen Wert hat s am Ende?', 'What is the value of s at the end?'), code: [B(T('setze s auf 0', 'set s to 0'), 'var'), B(T('setze i auf 1', 'set i to 1'), 'var'), B(T('wiederhole bis i > 4', 'repeat until i > 4'), 'control'), B(T('falls i gerade ist dann', 'if i is even then'), 'control', 1), B(T('ändere s um i', 'change s by i'), 'var', 2), B(T('ändere i um 1', 'change i by 1'), 'var', 1)],
        opts: ['6', '10', '4', '5'], a: 0, why: T('i läuft 1, 2, 3, 4. Nur die geraden Werte 2 und 4 werden addiert: 6.', 'i runs 1, 2, 3, 4. Only the even values 2 and 4 are added: 6.'), hint: T('Schreibe für jeden Durchlauf i und s auf.', 'Write down i and s for each pass.') }
    ] } }
  },
  'bl-order': {
    1: { tasks: [
      { goal: T('Eine Ampel springt von Rot auf Grün.', 'A traffic light changes from red to green.'), blocks: [B(T('schalte Rot an', 'switch red on'), 'look'), B(T('warte 3 Sekunden', 'wait 3 seconds'), 'control'), B(T('schalte Rot aus', 'switch red off'), 'look'), B(T('schalte Grün an', 'switch green on'), 'look')],
        why: T('Erst Rot, warten, dann Rot aus und Grün an.', 'First red, wait, then red off and green on.'), hint: T('Was passiert zuerst bei einer Ampel?', 'What happens first at a traffic light?') },
      { goal: T('Ein Roboter holt eine Flasche aus dem Kühlschrank.', 'A robot fetches a bottle from the fridge.'), blocks: [B(T('gehe zum Kühlschrank', 'go to the fridge'), 'motion'), B(T('öffne die Tür', 'open the door'), 'motion'), B(T('nimm die Flasche', 'take the bottle'), 'motion'), B(T('schließe die Tür', 'close the door'), 'motion')],
        why: T('Ein Computer macht genau das, was dasteht – in genau dieser Reihenfolge.', 'A computer does exactly what is written – in exactly this order.') }
    ] },
    3: { add: { tasks: [
      { goal: T('Ein Thermostat hält das Zimmer warm: unter 20 °C heizen, sonst Heizung aus – immer wieder.', 'A thermostat keeps the room warm: below 20 °C heat, otherwise heating off – again and again.'),
        blocks: [B(T('wiederhole fortlaufend', 'forever'), 'control'), B(T('miss die Temperatur', 'measure the temperature'), 'sense', 1), B(T('falls Temperatur < 20 dann', 'if temperature < 20 then'), 'control', 1), B(T('Heizung an', 'heating on'), 'look', 2), B(T('sonst', 'else'), 'control', 1), B(T('Heizung aus', 'heating off'), 'look', 2)],
        why: T('Endlosschleife außen, Messen vor dem Entscheiden – so arbeiten Steuerungen.', 'Endless loop outside, measure before deciding – that is how controllers work.') }
    ] } }
  },
  'bl-bug': {
    1: { pick: { tasks: [0, 1] } },
    3: { add: { tasks: [
      { goal: T('Das Programm soll die größte von drei Zahlen a, b, c finden.', 'The program should find the largest of three numbers a, b, c.'),
        blocks: [B(T('setze max auf a', 'set max to a'), 'var'), B(T('falls b > max dann', 'if b > max then'), 'control'), B(T('setze max auf b', 'set max to b'), 'var', 1), B(T('falls c < max dann', 'if c < max then'), 'control'), B(T('setze max auf c', 'set max to c'), 'var', 1), B(T('sage max', 'say max'), 'look')], bug: 3,
        why: T('Es muss „c > max“ heißen – sonst wird max durch eine kleinere Zahl ersetzt.', 'It must say “c > max” – otherwise max is replaced by a smaller number.'), hint: T('Teste mit a = 1, b = 5, c = 3.', 'Test with a = 1, b = 5, c = 3.') }
    ] } }
  },

  /* ---------- Verschlüsselung ---------- */
  'kr-caesar': {
    1: { rounds: [
      { mode: 'enc', text: T('OMA', 'MUM'), key: 1 },
      { mode: 'enc', text: T('HUND', 'DOG'), key: 2 },
      { mode: 'dec', text: T('HAUS', 'HOME'), key: 1 }
    ] },
    3: { noDisk: true, rounds: [
      { mode: 'enc', text: T('KLASSENFAHRT', 'SCHOOLTRIP'), key: 7 },
      { mode: 'dec', text: T('TREFFENUMACHT', 'MEETATEIGHT'), key: 20 },
      { mode: 'enc', text: T('GEHEIMNIS', 'MYSTERY'), key: 25 }
    ] }
  },
  'kr-crack': {
    1: { rounds: [
      { text: T('HALLO DU', 'HELLO YOU'), key: 3 },
      { text: T('ICH MAG PIZZA', 'I LIKE PIZZA'), key: 5 }
    ] },
    3: { rounds: [
      { text: T('ANGRIFF IM MORGENGRAUEN', 'ATTACK AT DAWN TOMORROW'), key: 4 },
      { text: T('DER SCHLUESSEL LIEGT UNTER DER MATTE', 'THE KEY IS UNDER THE DOORMAT'), key: 15 },
      { text: T('NIEMAND KANN DIESE NACHRICHT LESEN', 'NOBODY CAN READ THIS MESSAGE'), key: 22 }
    ] }
  },
  'kr-vig': {
    1: { rounds: [
      { mode: 'enc', text: T('OMA', 'MUM'), key: 'AB' },
      { mode: 'enc', text: T('HUND', 'DOGS'), key: 'BA' }
    ] },
    3: { rounds: [
      { mode: 'enc', text: T('INFORMATIK', 'COMPUTERS'), key: 'CODE' },
      { mode: 'dec', text: T('VERSCHLUESSELT', 'ENCRYPTED'), key: 'KEY' },
      { mode: 'dec', text: T('SICHERHEIT', 'SECURITY'), key: 'INFO' }
    ] }
  },

  /* ---------- Mikrocontroller ---------- */
  'mc-eva': {
    1: { buckets: [{ id: 'e', t: T('Eingabe', 'Input'), sub: T('Sensor misst', 'sensor measures') }, { id: 'a', t: T('Ausgabe', 'Output'), sub: T('Aktor tut etwas', 'actuator does something') }],
      task: T('Ist das Eingabe oder Ausgabe?', 'Is this input or output?'), pick: { items: [0, 1, 2, 3, 5, 6] } },
    3: { add: { items: [
      { t: T('Mikrofon misst die Lautstärke', 'Microphone measures loudness'), b: 'e', why: T('Ein Sensor für Geräusche – Eingabe.', 'A sensor for sound – input.') },
      { t: T('Programm zählt, wie oft Taste A gedrückt wurde', 'Program counts how often button A was pressed'), b: 'v', why: T('Zählen ist Verarbeitung.', 'Counting is processing.') },
      { t: T('Servomotor dreht einen Zeiger', 'Servo motor turns a pointer'), b: 'a', why: T('Ein Motor ist ein Aktor.', 'A motor is an actuator.') }
    ] } }
  },
  'mc-matrix': {
    1: { rounds: [
      { mode: 'xy', x: 2, y: 2, hint: T('x = 2: zwei nach rechts. y = 2: zwei nach unten. Du startest oben links bei 0.', 'x = 2: two to the right. y = 2: two down. You start top left at 0.') },
      { mode: 'xy', x: 0, y: 0, hint: T('0 und 0 ist ganz oben links.', '0 and 0 is the very top left.') },
      { mode: 'copy', pattern: ['.....', '.....', '#####', '.....', '.....'] }
    ] },
    3: { rounds: [
      { mode: 'code', pattern: ['#....', '.#...', '..#..', '...#.', '....#'] },
      { mode: 'copy', pattern: ['..#..', '.###.', '#.#.#', '..#..', '..#..'] },
      { mode: 'code', pattern: ['#####', '#...#', '#.#.#', '#...#', '#####'] },
      { mode: 'copy', pattern: ['.#.#.', '#####', '#####', '.###.', '..#..'] }
    ] }
  },
  'mc-if': {
    1: { pick: { rounds: [0, 3] } },
    3: { add: { rounds: [
      { spec: T('Frostwarner: Ist die Temperatur kleiner als 0 °C, zeige ein X, sonst ein Häkchen.', 'Frost alarm: if the temperature is less than 0 °C, show an X, otherwise a tick.'),
        sensor: 'temp', cmp: '<', val: 0, then: 'cross', else: 'check', why: T('Gut! Bedingung und Aktionen passen zusammen.', 'Good! Condition and actions match.') }
    ] } }
  },

  /* ---------- Codierung ---------- */
  'cd-bin': {
    1: { rounds: [
      { mode: 'make', bits: 4, value: 3 }, { mode: 'make', bits: 4, value: 6 }, { mode: 'make', bits: 4, value: 10 },
      { mode: 'read', bits: 4, value: 5 }, { mode: 'make', bits: 4, value: 15 }
    ] },
    3: { rounds: [
      { mode: 'make', bits: 8, rand: [100, 250] }, { mode: 'read', bits: 8, rand: [60, 250] },
      { mode: 'typebin', bits: 8, rand: [20, 250] }, { mode: 'typebin', bits: 8, rand: [130, 255] }
    ] }
  },
  'cd-ascii': {
    1: { tableOpen: true, rounds: [{ mode: 'dec', word: 'OK' }, { mode: 'enc', ch: 'A' }, { mode: 'enc', ch: 'C' }] },
    3: { rounds: [{ mode: 'dec', word: T('INFO', 'CODE') }, { mode: 'enc', ch: 'Q' }, { mode: 'dec', word: T('KLASSE', 'SCHOOL') }, { mode: 'enc', ch: 'M' }] }
  },
  'cd-rgb': {
    1: { tolerance: 45, rounds: [
      { target: [255, 0, 0], name: T('Rot', 'Red'), hint: T('Nur den roten Regler ganz nach rechts.', 'Only the red slider all the way to the right.') },
      { target: [255, 255, 0], name: T('Gelb', 'Yellow'), hint: T('Rot und Grün ganz nach rechts.', 'Red and green all the way to the right.'), why: T('Rot + Grün = Gelb!', 'Red + green = yellow!') },
      { target: [255, 255, 255], name: T('Weiß', 'White'), hint: T('Alle drei Regler ganz nach rechts.', 'All three sliders all the way to the right.'), why: T('Alle Farben zusammen ergeben Weiß.', 'All colours together make white.') }
    ] },
    3: { tolerance: 20, rounds: [
      { target: [255, 140, 0], name: T('Orange', 'Orange') },
      { target: [255, 105, 180], name: T('Pink', 'Pink'), hint: T('Viel Rot, etwas Grün, ziemlich viel Blau.', 'Lots of red, some green, quite a lot of blue.') },
      { target: [139, 69, 19], name: T('Braun', 'Brown'), hint: T('Braun ist ein dunkles Orange: etwa halb Rot, ein Viertel Grün, kaum Blau.', 'Brown is a dark orange: about half red, a quarter green, hardly any blue.') },
      { target: [0, 128, 128], name: T('Petrol', 'Teal') },
      { target: [75, 0, 130], name: T('Indigo', 'Indigo'), hint: T('Wenig Rot, kein Grün, etwa halb Blau.', 'A little red, no green, about half blue.') }
    ] }
  },

  /* ---------- Internet ---------- */
  'nt-match': {
    1: { pick: { pairs: [0, 1, 2, 3] } },
    3: { add: { pairs: [
      { a: T('Protokoll', 'Protocol'), b: T('feste Regeln, wie Geräte Daten austauschen', 'fixed rules for how devices exchange data') },
      { a: 'Switch', b: T('verbindet Geräte innerhalb eines lokalen Netzes', 'connects devices within a local network') }
    ] } }
  },
  'nt-route': {
    1: { pick: { rounds: [0, 1] } },
    3: { pick: { rounds: [2, 3] }, add: { rounds: [
      { broken: ['R2', 'R6', 'R7'], shortest: true, q: T('Drei Router sind ausgefallen. Finde den kürzesten Weg.', 'Three routers are down. Find the shortest route.') }
    ] } }
  },
  'nt-quiz': {
    1: { pick: { items: [0, 1, 2] }, maxOpts: 3 },
    3: { add: { items: [
      { q: T('Wie viele verschiedene Werte kann eine der vier Zahlen einer IPv4-Adresse haben?', 'How many different values can one of the four numbers in an IPv4 address have?'), opts: ['256', '255', '100', '1000'], a: 0, why: T('0 bis 255 – das sind 256 Werte, also genau ein Byte.', '0 to 255 – that is 256 values, exactly one byte.') },
      { q: T('Was ist ein Protokoll im Netz?', 'What is a protocol in a network?'), opts: [T('Feste Regeln, wie Daten ausgetauscht werden', 'fixed rules for how data is exchanged'), T('Ein Bericht über Netzwerkfehler', 'a report about network errors'), T('Ein besonders schneller Router', 'a particularly fast router')], a: 0,
        why: T('Nur wenn alle dieselben Regeln (z. B. TCP/IP, HTTP) nutzen, verstehen sich die Geräte.', 'Devices only understand each other if they all use the same rules (e.g. TCP/IP, HTTP).') }
    ] } }
  },

  /* ---------- Daten & Recht ---------- */
  'dt-phish': {
    1: { pick: { mails: [0, 1] } },
    3: { add: { mails: [
      { from: { t: 'Schul-Cloud <support@schulcloud-login.net>', sus: true, why: T('Die Adresse sieht ähnlich aus, gehört aber nicht zu deiner Schule.', 'The address looks similar but does not belong to your school.') },
        subject: { t: T('Neue Nachricht von deiner Lehrkraft', 'New message from your teacher'), sus: false },
        body: [
          { t: T('Hallo,', 'Hello,'), sus: false },
          { t: T('deine Lehrkraft hat dir eine Datei geschickt.', 'your teacher has sent you a file.'), sus: false },
          { t: T('Öffne den Anhang „Hausaufgaben.pdf.exe“.', 'Open the attachment “Homework.pdf.exe”.'), sus: true, why: T('„.exe“ am Ende: Das ist ein Programm, kein PDF – vermutlich Schadsoftware.', '“.exe” at the end: that is a program, not a PDF – probably malware.') },
          { t: T('Viele Grüße', 'Best wishes'), sus: false }
        ] }
    ] } }
  },
  'dt-pers': {
    1: { pick: { items: [0, 1, 2, 4, 5, 7] } },
    3: { add: { items: [
      { t: T('das Kennzeichen eines Autos', 'a car’s number plate'), b: 'yes', why: T('Über das Kennzeichen lässt sich der Halter ermitteln.', 'The registered keeper can be traced through the number plate.') },
      { t: T('dein Fingerabdruck', 'your fingerprint'), b: 'yes', why: T('Biometrische Daten sind besonders geschützt.', 'Biometric data is specially protected.') },
      { t: T('„30 % der Klasse fahren mit dem Rad“', '“30 % of the class cycle to school”'), b: 'no', why: T('Eine zusammengefasste Statistik – keine einzelne Person erkennbar.', 'An aggregated statistic – no single person can be identified.') }
    ] } }
  },
  'dt-law': {
    1: { pick: { items: [0, 1, 3] }, maxOpts: 3 },
    3: { add: { items: [
      { q: T('Darfst du ein Gespräch mit deiner Lehrkraft heimlich aufnehmen und weiterschicken?', 'May you secretly record a conversation with your teacher and pass it on?'),
        opts: [T('Nein – das nichtöffentlich gesprochene Wort ist geschützt.', 'No – privately spoken words are protected.'), T('Ja, wenn es lustig ist.', 'Yes, if it is funny.'), T('Ja, wenn ich es nur Freunden schicke.', 'Yes, if I only send it to friends.')], a: 0,
        why: T('Heimliche Tonaufnahmen nichtöffentlicher Gespräche sind in Deutschland strafbar (§ 201 StGB).', 'Secretly recording private conversations is a criminal offence in Germany (Section 201 of the Criminal Code).') }
    ] } }
  }
};

/* Grundfassung der Filter-Aufgaben: Antworten aus den Daten berechnen */
(() => {
  const st = CHAPTERS.flatMap(c => c.stations).find(s => s.id === 'tab-filter');
  const calcs = [
    P => P.filter(p => p.sport === 'basket').length,
    P => P.filter(p => p.age === 14 && p.sport === 'swim').length,
    P => P.reduce((a, b) => (b.min > a.min ? b : a)).name,
    P => P.filter(p => p.sport === 'foot').reduce((a, b) => (b.age < a.age ? b : a)).name
  ];
  st.rounds.forEach((r, k) => { r.calc = calcs[k]; delete r.a; });
})();

for (const ch of CHAPTERS) for (const st of ch.stations) if (LEVELS[st.id]) st.levels = Object.assign({}, st.levels, LEVELS[st.id]);

/* Feste Reihenfolge der Stationen für den Abgabe-Code. NIE umsortieren oder löschen – neue Stationen nur hinten anhängen. */
const STATION_ORDER = [
  'hw-io', 'hw-inside', 'hw-ports', 'hw-build', 'hw-doctor', 'hw-storage', 'hw-size', 'hw-os',
  'tab-cells', 'tab-formula', 'tab-filter', 'tab-copy', 'tab-chart',
  'pw-build', 'pw-crack', 'pw-sort', 'pw-myth',
  'bl-maze', 'bl-predict', 'bl-order', 'bl-bug',
  'kr-caesar', 'kr-crack', 'kr-vig',
  'mc-eva', 'mc-matrix', 'mc-if',
  'cd-bin', 'cd-ascii', 'cd-rgb',
  'nt-match', 'nt-route', 'nt-quiz',
  'dt-phish', 'dt-pers', 'dt-law'
];
