/* Inhalte: Kapitel, Stationen, Merkkästen (Deutsch/Englisch)
   Hinweis: Keine Produkt- oder Markennamen von Programmierumgebungen, Platinen oder Tabellenprogrammen verwenden.
   validate.js prüft das. */
'use strict';

const T = (de, en) => ({ de, en });
const B = (t, k, i = 0) => ({ t, k, i });

/* ---------------- Daten für die Tabellen-Stationen ---------------- */
const DATA = {
  shop: [
    [{ v: T('Artikel', 'Item') }, { v: T('Anzahl', 'Qty') }, { v: T('Preis (€)', 'Price (€)') }, { v: T('Gesamt (€)', 'Total (€)') }],
    [{ v: T('Saft', 'Juice') }, { v: 6 }, { v: 1.5, money: true }, { v: 9, money: true, f: '=B2*C2' }],
    [{ v: T('Chips', 'Crisps') }, { v: 4 }, { v: 2, money: true }, { v: 8, money: true, f: '=B3*C3' }],
    [{ v: T('Brezeln', 'Pretzels') }, { v: 10 }, { v: 0.8, money: true }, { v: 8, money: true, f: '=B4*C4' }],
    [{ v: T('Muffins', 'Muffins') }, { v: 12 }, { v: 1.2, money: true }, { v: 14.4, money: true, f: '=B5*C5' }],
    [{ v: T('Servietten', 'Napkins') }, { v: 2 }, { v: 1.9, money: true }, { v: 3.8, money: true, f: '=B6*C6' }],
    [null, null, { v: T('Summe', 'Sum') }, { v: 43.2, money: true, f: T('=SUMME(D2:D6)', '=SUM(D2:D6)') }]
  ],
  people: [
    { name: 'Mia', age: 14, sport: 'swim', min: 95 },
    { name: 'Ben', age: 15, sport: 'foot', min: 140 },
    { name: 'Elif', age: 13, sport: 'dance', min: 60 },
    { name: 'Noah', age: 16, sport: 'basket', min: 180 },
    { name: 'Lena', age: 14, sport: 'swim', min: 75 },
    { name: 'Jonas', age: 13, sport: 'foot', min: 110 },
    { name: 'Aylin', age: 15, sport: 'basket', min: 130 },
    { name: 'Finn', age: 14, sport: 'foot', min: 200 },
    { name: 'Sara', age: 16, sport: 'dance', min: 85 },
    { name: 'Luca', age: 14, sport: 'basket', min: 120 },
    { name: 'Emma', age: 15, sport: 'swim', min: 70 },
    { name: 'Tim', age: 14, sport: 'swim', min: 150 }
  ],
  sports: { swim: T('Schwimmen', 'Swimming'), foot: T('Fußball', 'Football'), dance: T('Tanzen', 'Dance'), basket: T('Basketball', 'Basketball') }
};

/* ---------------- Hilfslisten für die Passwort-Baustelle ---------------- */
const MONTHS = ['januar', 'februar', 'märz', 'maerz', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'dezember',
  'january', 'february', 'march', 'may', 'june', 'july', 'october', 'december'];
const ANIMALS = ['hund', 'katze', 'maus', 'pferd', 'igel', 'fuchs', 'wolf', 'eule', 'hai', 'biber', 'panda', 'tiger', 'löwe', 'loewe', 'zebra', 'affe', 'elch', 'dachs', 'otter', 'luchs',
  'dog', 'cat', 'mouse', 'horse', 'hedgehog', 'fox', 'owl', 'shark', 'beaver', 'lion', 'monkey', 'moose', 'badger', 'lynx'];
const FORBIDDEN = ['passwort', 'password', '123', 'qwert', 'abc'];
const digitSum = s => (s.match(/\d/g) || []).reduce((a, d) => a + Number(d), 0);

/* ---------------- Kapitel ---------------- */
const CHAPTERS = [
/* ======================= 1 Tabellenkalkulation ======================= */
{
  id: 'tabelle', color: '#12A27A', icon: 'table',
  title: T('Tabellenkalkulation', 'Spreadsheets'),
  sub: T('Zellen, Formeln, Filter und Diagramme', 'Cells, formulas, filters and charts'),
  intro: T('Eine Klasse plant ein Fest. Mit einer Tabelle behältst du Einkauf und Kosten im Blick – und lässt den Computer rechnen.',
    'A class is planning a party. A spreadsheet keeps track of the shopping and the costs – and lets the computer do the maths.'),
  kc: T('Jg. 10 – Interpretation von Daten zur Informationsgewinnung: Daten filtern, sortieren, berechnen und in Diagrammen darstellen.',
    'Year 10 – interpreting data: filtering, sorting, calculating and showing data in charts.'),
  merk: [
    { h: T('Zellen und Bereiche', 'Cells and ranges'), p: T(
      '<p>Jede Zelle hat eine <b>Adresse</b>: erst die Spalte (Buchstabe), dann die Zeile (Zahl), z. B. <code>C3</code>.</p><p>Ein <b>Bereich</b> reicht von der ersten bis zur letzten Zelle: <code>B2:B6</code> sind die fünf Zellen B2, B3, B4, B5 und B6.</p>',
      '<p>Every cell has an <b>address</b>: first the column (letter), then the row (number), e.g. <code>C3</code>.</p><p>A <b>range</b> goes from the first to the last cell: <code>B2:B6</code> means the five cells B2, B3, B4, B5 and B6.</p>') },
    { h: T('Formeln', 'Formulas'), p: T(
      '<p>Eine Formel beginnt immer mit <code>=</code>. Statt Zahlen stehen darin meist Zelladressen – ändert sich ein Wert, rechnet die Tabelle neu.</p><ul><li><code>=B2*C2</code> multipliziert</li><li><code>=SUMME(D2:D6)</code> addiert einen Bereich</li><li><code>=MITTELWERT(…)</code>, <code>=MAX(…)</code>, <code>=MIN(…)</code></li><li><code>=WENN(B3>5;"viel";"wenig")</code> entscheidet</li></ul>',
      '<p>A formula always starts with <code>=</code>. It usually contains cell addresses instead of numbers – if a value changes, the sheet recalculates.</p><ul><li><code>=B2*C2</code> multiplies</li><li><code>=SUM(D2:D6)</code> adds up a range</li><li><code>=AVERAGE(…)</code>, <code>=MAX(…)</code>, <code>=MIN(…)</code></li><li><code>=IF(B3>5,"many","few")</code> decides</li></ul>') },
    { h: T('Relative und absolute Bezüge', 'Relative and absolute references'), p: T(
      '<p>Kopierst du eine Formel nach unten, wandern die Adressen mit: aus <code>=B2*C2</code> wird <code>=B3*C3</code> (<b>relativ</b>).</p><p>Mit <code>$</code> hältst du eine Adresse fest: <code>$G$1</code> bleibt beim Kopieren immer <code>$G$1</code> (<b>absolut</b>).</p>',
      '<p>If you copy a formula down, the addresses move with it: <code>=B2*C2</code> becomes <code>=B3*C3</code> (<b>relative</b>).</p><p>A <code>$</code> locks an address: <code>$G$1</code> stays <code>$G$1</code> when copied (<b>absolute</b>).</p>') },
    { h: T('Filtern und Sortieren', 'Filtering and sorting'), p: T(
      '<p><b>Filtern</b> blendet Zeilen aus, die eine Bedingung nicht erfüllen – die Daten bleiben aber erhalten. <b>Sortieren</b> ändert nur die Reihenfolge (aufsteigend ▲ oder absteigend ▼).</p>',
      '<p><b>Filtering</b> hides rows that do not meet a condition – the data is still there. <b>Sorting</b> only changes the order (ascending ▲ or descending ▼).</p>') },
    { h: T('Welches Diagramm?', 'Which chart?'), p: T(
      '<ul><li><b>Säulen/Balken:</b> Werte vergleichen</li><li><b>Linie:</b> Entwicklung über die Zeit</li><li><b>Kreis:</b> Anteile an einem Ganzen (zusammen 100 %)</li></ul><p>Achte auf die Achse: Beginnt sie nicht bei 0, wirken Unterschiede größer.</p>',
      '<ul><li><b>Column/bar:</b> compare values</li><li><b>Line:</b> change over time</li><li><b>Pie:</b> parts of a whole (adding up to 100 %)</li></ul><p>Check the axis: if it does not start at 0, differences look bigger.</p>') }
  ],
  stations: [
    { id: 'tab-cells', type: 'cells', merk: 0,
      title: T('Zellen-Detektiv', 'Cell detective'), desc: T('Adressen und Bereiche finden', 'Find addresses and ranges'),
      how: T('Tippe auf Zellen. Oben links siehst du die Adresse, daneben den Inhalt oder die Formel. Für einen Bereich tippst du erst die erste und dann die letzte Zelle an. Dann „Prüfen“.',
        'Tap cells. Top left shows the address, next to it the content or formula. For a range, tap the first and then the last cell. Then tap “Check”.'),
      hint: T('Erst die Spalte (Buchstabe), dann die Zeile (Zahl).', 'First the column (letter), then the row (number).'),
      rounds: [
        { mode: 'cell', target: 'C3', q: T('Tippe auf die Zelle C3.', 'Tap cell C3.'), why: T('C3 ist Spalte C, Zeile 3: der Preis für Chips.', 'C3 is column C, row 3: the price of crisps.') },
        { mode: 'cell', target: 'A5', q: T('In welcher Zelle steht „Muffins“? Tippe sie an.', 'Which cell contains “Muffins”? Tap it.'), why: T('„Muffins“ steht in Spalte A, Zeile 5 – also in A5.', '“Muffins” is in column A, row 5 – so in A5.') },
        { mode: 'cell', target: 'C5', q: T('Ein Muffin kostet 1,20 €. In welcher Zelle steht dieser Preis?', 'A muffin costs €1.20. Which cell holds this price?'), why: T('Richtig: C5. Die Preise stehen in Spalte C.', 'Right: C5. The prices are in column C.') },
        { mode: 'cell', target: 'D7', q: T('In welcher Zelle wird die Gesamtsumme berechnet? Schau dabei in die Bearbeitungsleiste.', 'Which cell calculates the grand total? Look at the formula bar.'),
          why: T('In D7 steht keine Zahl, sondern die Formel =SUMME(D2:D6). Angezeigt wird ihr Ergebnis.', 'D7 does not hold a number but the formula =SUM(D2:D6). The sheet shows its result.'),
          hint: T('Die Gesamtsumme steht ganz unten in der Spalte „Gesamt“.', 'The grand total is at the bottom of the “Total” column.') },
        { mode: 'range', target: 'B2:B6', q: T('Markiere den Bereich B2:B6 – alle Anzahlen. Tippe die erste und dann die letzte Zelle an.', 'Select the range B2:B6 – all quantities. Tap the first and then the last cell.'), why: T('B2:B6 umfasst die fünf Zellen von B2 bis B6.', 'B2:B6 covers the five cells from B2 to B6.') },
        { mode: 'range', target: 'A4:D4', q: T('Markiere die ganze Zeile mit den Brezeln – von Spalte A bis D. Wie heißt der Bereich?', 'Select the whole pretzel row – from column A to D. What is the range called?'), why: T('Der Bereich heißt A4:D4.', 'The range is called A4:D4.') }
      ] },
    { id: 'tab-formula', type: 'formula', merk: 1,
      title: T('Formel-Rechner', 'Formula calculator'), desc: T('Was berechnet die Formel?', 'What does the formula calculate?'),
      how: T('Lies die Formel, schau in der Tabelle nach und rechne das Ergebnis selbst aus. Du kannst Zellen antippen, um ihren Inhalt zu sehen.',
        'Read the formula, look up the cells and work out the result yourself. Tap cells to see what they contain.'),
      rounds: [
        { f: T('=SUMME(B2:B4)', '=SUM(B2:B4)'), a: 20, why: T('B2 + B3 + B4 = 6 + 4 + 10 = 20', 'B2 + B3 + B4 = 6 + 4 + 10 = 20'), hint: T('Addiere die Werte in B2, B3 und B4.', 'Add the values in B2, B3 and B4.') },
        { f: '=B5*C5', a: 14.4, why: T('12 · 1,20 = 14,40', '12 × 1.20 = 14.40'), hint: T('B5 ist die Anzahl Muffins, C5 ihr Preis. * bedeutet „mal“.', 'B5 is the number of muffins, C5 their price. * means “times”.') },
        { f: '=MAX(B2:B6)', a: 12, why: T('MAX liefert den größten Wert im Bereich: 12 (Muffins).', 'MAX returns the largest value in the range: 12 (muffins).'), hint: T('Welche Anzahl ist die größte?', 'Which quantity is the largest?') },
        { f: T('=MITTELWERT(B2:B6)', '=AVERAGE(B2:B6)'), a: 6.8, why: T('(6 + 4 + 10 + 12 + 2) : 5 = 34 : 5 = 6,8', '(6 + 4 + 10 + 12 + 2) ÷ 5 = 34 ÷ 5 = 6.8'), hint: T('Alle fünf Werte addieren und durch 5 teilen.', 'Add all five values and divide by 5.') },
        { f: '=MIN(C2:C6)', a: 0.8, why: T('Der kleinste Preis ist 0,80 € (Brezeln).', 'The lowest price is €0.80 (pretzels).'), hint: T('Suche den kleinsten Preis in Spalte C.', 'Find the lowest price in column C.') },
        { f: T('=WENN(B3>5;"viel";"wenig")', '=IF(B3>5,"many","few")'), opts: [T('viel', 'many'), T('wenig', 'few')], a: 1,
          why: T('B3 ist 4. Die Bedingung 4 > 5 ist falsch – also kommt der zweite Wert: „wenig“.', 'B3 is 4. The condition 4 > 5 is false – so the second value is used: “few”.'),
          hint: T('Ist der Wert in B3 größer als 5? Wenn ja: erster Wert, sonst zweiter.', 'Is the value in B3 greater than 5? If yes: first value, otherwise second.') }
      ] },
    { id: 'tab-filter', type: 'filter', merk: 3,
      title: T('Filtern & Sortieren', 'Filter & sort'), desc: T('Antworten in einer Umfrage finden', 'Find answers in a survey'),
      how: T('Wähle oben Filter aus, um nur passende Zeilen zu sehen. Tippe auf eine Spaltenüberschrift, um zu sortieren (einmal ▲, nochmal ▼).',
        'Choose filters at the top to show only matching rows. Tap a column heading to sort (once ▲, again ▼).'),
      rounds: [
        { mode: 'num', a: 3, q: T('Umfrage der 9b zur Bildschirmzeit (Minuten pro Tag). Wie viele Personen spielen Basketball?', 'Class survey on screen time (minutes per day). How many people play basketball?'),
          why: T('Mit dem Filter „Sport = Basketball“ bleiben 3 Zeilen übrig: Noah, Aylin und Luca.', 'With the filter “Sport = Basketball” 3 rows remain: Noah, Aylin and Luca.'), hint: T('Stelle den Filter „Sport“ auf Basketball und zähle die Zeilen.', 'Set the “Sport” filter to Basketball and count the rows.') },
        { mode: 'num', a: 3, q: T('Wie viele Personen sind 14 Jahre alt UND schwimmen?', 'How many people are 14 AND swim?'),
          why: T('Zwei Filter gleichzeitig: Alter 14 und Sport Schwimmen – das sind 3: Mia, Lena und Tim.', 'Two filters at once: age 14 and sport swimming – that is 3: Mia, Lena and Tim.'), hint: T('Du kannst beide Filter gleichzeitig benutzen.', 'You can use both filters at the same time.') },
        { mode: 'row', a: 'Finn', q: T('Wer hat die meiste Bildschirmzeit? Sortiere und tippe die Person an.', 'Who has the most screen time? Sort and tap the person.'),
          why: T('Absteigend nach Minuten sortiert steht Finn mit 200 Minuten oben.', 'Sorted by minutes, descending, Finn is at the top with 200 minutes.'), hint: T('Tippe zweimal auf „Minuten“, dann steht der größte Wert oben.', 'Tap “Minutes” twice and the largest value is at the top.') },
        { mode: 'row', a: 'Jonas', q: T('Wer ist die jüngste Person, die Fußball spielt? Tippe sie an.', 'Who is the youngest person who plays football? Tap them.'),
          why: T('Filter Fußball und nach Alter sortieren: Jonas ist 13.', 'Filter football and sort by age: Jonas is 13.'), hint: T('Erst nach Fußball filtern, dann nach Alter sortieren.', 'First filter for football, then sort by age.') }
      ] },
    { id: 'tab-copy', type: 'quiz', merk: 2,
      title: T('Kopieren mit $', 'Copying with $'), desc: T('Relative und absolute Bezüge', 'Relative and absolute references'),
      how: T('Wähle die richtige Antwort. Wenn du unsicher bist, öffne den Merkkasten.', 'Choose the correct answer. If you are unsure, open the key facts.'),
      items: [
        { q: T('In D2 steht =B2*C2. Du kopierst die Formel eine Zeile nach unten in D3. Was steht dann in D3?', 'D2 contains =B2*C2. You copy the formula one row down into D3. What is in D3 now?'),
          opts: ['=B3*C3', '=B2*C2', '=B3*C2', '=C3*D3'], a: 0, why: T('Relative Bezüge wandern mit: eine Zeile tiefer → aus 2 wird 3.', 'Relative references move along: one row down → 2 becomes 3.'),
          hint: T('Die Formel „rutscht“ mit nach unten.', 'The formula “slides” down with you.') },
        { q: T('In G1 steht ein Rabatt. In E2 steht =D2*$G$1. Was steht nach dem Kopieren in E3?', 'G1 holds a discount. E2 contains =D2*$G$1. What is in E3 after copying?'),
          opts: ['=D3*$G$1', '=D3*$G$2', '=D2*$G$1', '=D3*G2'], a: 0, why: T('D2 wandert mit (→ D3), $G$1 bleibt fest.', 'D2 moves along (→ D3), $G$1 stays fixed.') },
        { q: T('Wozu dient das $-Zeichen in einer Formel?', 'What is the $ sign in a formula for?'),
          opts: [T('Es hält die Adresse beim Kopieren fest.', 'It locks the address when copying.'), T('Es rechnet in Euro um.', 'It converts to euros.'), T('Es macht die Zahl größer.', 'It makes the number larger.'), T('Es blendet die Zelle aus.', 'It hides the cell.')], a: 0,
          why: T('$ macht einen Bezug absolut – er ändert sich beim Kopieren nicht.', '$ makes a reference absolute – it does not change when copied.') },
        { q: T('In A2 steht =A$1. Du kopierst die Formel nach rechts in B2. Was steht dann in B2?', 'A2 contains =A$1. You copy it to the right into B2. What is in B2?'),
          opts: ['=B$1', '=A$1', '=B$2', '=A$2'], a: 0, why: T('Nur die Zeile ist mit $ festgehalten. Die Spalte wandert: A → B.', 'Only the row is locked with $. The column moves: A → B.'),
          hint: T('Das $ steht nur vor der 1.', 'The $ is only in front of the 1.') },
        { q: T('Welche Formel addiert alle Zellen von B2 bis B6?', 'Which formula adds up all cells from B2 to B6?'),
          opts: [T('=SUMME(B2:B6)', '=SUM(B2:B6)'), T('=SUMME(B2;B6)', '=SUM(B2,B6)'), '=B2+B6', T('=SUMME(B2-B6)', '=SUM(B2-B6)')], a: 0,
          why: T('Der Doppelpunkt bedeutet „bis“. Das Semikolon trennt nur einzelne Zellen – =SUMME(B2;B6) addiert nur zwei Zellen.', 'The colon means “to”. A comma only separates single cells – =SUM(B2,B6) adds only two cells.') }
      ] },
    { id: 'tab-chart', type: 'quiz', merk: 4,
      title: T('Das passende Diagramm', 'The right chart'), desc: T('Säule, Linie oder Kreis?', 'Column, line or pie?'),
      how: T('Überlege, was das Diagramm zeigen soll: Vergleich, Entwicklung oder Anteile.', 'Think about what the chart should show: comparison, change over time or shares.'),
      items: [
        { q: T('Du willst zeigen, wie sich die Temperatur im Laufe einer Woche verändert.', 'You want to show how the temperature changes over a week.'),
          opts: [{ t: T('Liniendiagramm', 'Line chart'), icon: 'line' }, { t: T('Kreisdiagramm', 'Pie chart'), icon: 'pie' }, { t: T('Säulendiagramm', 'Column chart'), icon: 'bar' }, { t: T('Punktdiagramm', 'Scatter plot'), icon: 'scatter' }], a: 0,
          why: T('Eine Linie zeigt gut eine Entwicklung über die Zeit.', 'A line is good at showing change over time.') },
        { q: T('Wie kommen die Schülerinnen und Schüler zur Schule (Bus, Rad, zu Fuß, Auto)? Die Anteile ergeben zusammen 100 %.', 'How do students get to school (bus, bike, walking, car)? The shares add up to 100 %.'),
          opts: [{ t: T('Kreisdiagramm', 'Pie chart'), icon: 'pie' }, { t: T('Liniendiagramm', 'Line chart'), icon: 'line' }, { t: T('Punktdiagramm', 'Scatter plot'), icon: 'scatter' }, { t: T('Säulendiagramm', 'Column chart'), icon: 'bar' }], a: 0,
          why: T('Ein Kreisdiagramm zeigt Anteile an einem Ganzen.', 'A pie chart shows parts of a whole.') },
        { q: T('Du willst die Einwohnerzahlen von fünf Städten vergleichen.', 'You want to compare the populations of five towns.'),
          opts: [{ t: T('Säulendiagramm', 'Column chart'), icon: 'bar' }, { t: T('Kreisdiagramm', 'Pie chart'), icon: 'pie' }, { t: T('Liniendiagramm', 'Line chart'), icon: 'line' }], a: 0,
          why: T('Säulen nebeneinander lassen sich gut vergleichen. Eine Linie würde eine zeitliche Entwicklung vortäuschen.', 'Columns side by side are easy to compare. A line would suggest change over time.') },
        { q: T('Bei einer Umfrage durfte jede Person mehrere Lieblingsfächer nennen. Warum passt ein Kreisdiagramm hier nicht?', 'In a survey, everyone could name several favourite subjects. Why is a pie chart a bad choice here?'),
          opts: [T('Die Anteile ergeben zusammen mehr als 100 %.', 'The shares add up to more than 100 %.'), T('Kreise sind schwer zu zeichnen.', 'Circles are hard to draw.'), T('Es gibt zu wenige Fächer.', 'There are too few subjects.')], a: 0,
          why: T('Bei Mehrfachnennungen ist das Ganze kein „Kuchen“ mehr – ein Säulendiagramm ist besser.', 'With multiple answers the whole is no longer a “pie” – a column chart is better.') },
        { q: T('Die y-Achse eines Säulendiagramms beginnt bei 90 statt bei 0. Was bewirkt das?', 'The y-axis of a column chart starts at 90 instead of 0. What is the effect?'),
          opts: [T('Kleine Unterschiede sehen riesig aus.', 'Small differences look huge.'), T('Nichts, das ist egal.', 'Nothing, it does not matter.'), T('Die Werte werden genauer.', 'The values become more accurate.')], a: 0,
          why: T('Abgeschnittene Achsen übertreiben Unterschiede. Achte bei Diagrammen in Medien darauf!', 'Cut-off axes exaggerate differences. Watch out for this in charts in the media!') }
      ] }
  ]
},

/* ======================= 2 Passwörter ======================= */
{
  id: 'passwort', color: '#F0700E', icon: 'key',
  title: T('Sichere Passwörter', 'Strong passwords'),
  sub: T('Regeln, Knack-Zeit und Mythen', 'Rules, cracking time and myths'),
  intro: T('Ein gutes Passwort ist lang, schwer zu erraten und nur für einen Zugang. Hier baust und testest du Passwörter – ohne dein echtes zu verraten.',
    'A good password is long, hard to guess and used for one account only. Here you build and test passwords – without giving away your real one.'),
  kc: T('Jg. 10 – Aufbau des Internets: Schutzmaßnahmen (Passwörter), Formen des Datenmissbrauchs.', 'Year 10 – structure of the internet: protection (passwords), forms of data misuse.'),
  merk: [
    { h: T('Was macht ein Passwort sicher?', 'What makes a password strong?'), p: T(
      '<ul><li><b>Länge</b> ist am wichtigsten – mindestens 12 Zeichen.</li><li>Verschiedene Zeichenarten: klein, groß, Ziffern, Sonderzeichen.</li><li>Keine Namen, Geburtstage, Wörter aus dem Wörterbuch oder Tastaturmuster wie <code>qwertz</code>.</li><li>Für jeden Zugang ein <b>eigenes</b> Passwort.</li></ul>',
      '<ul><li><b>Length</b> matters most – at least 12 characters.</li><li>Different kinds of characters: lower case, upper case, digits, symbols.</li><li>No names, birthdays, dictionary words or keyboard patterns such as <code>qwerty</code>.</li><li>A <b>different</b> password for every account.</li></ul>') },
    { h: T('Wie knackt man Passwörter?', 'How are passwords cracked?'), p: T(
      '<p>Beim <b>Durchprobieren</b> (Brute Force) testet ein Rechner alle Möglichkeiten – schnelle Rechner schaffen Milliarden pro Sekunde. Die Zahl der Möglichkeiten ist <code>Zeichenvorrat<sup>Länge</sup></code>. Jedes zusätzliche Zeichen vervielfacht sie.</p><p>Bei <b>Wörterbuch-Angriffen</b> werden zuerst häufige Passwörter und Wörter probiert – darum sind <code>Sommer2026</code> oder <code>P@ssw0rt</code> schnell geknackt.</p>',
      '<p>With <b>brute force</b> a computer tries every possibility – fast machines manage billions per second. The number of possibilities is <code>character set<sup>length</sup></code>. Every extra character multiplies it.</p><p><b>Dictionary attacks</b> try common passwords and words first – that is why <code>Summer2026</code> or <code>P@ssw0rd</code> are cracked quickly.</p>') },
    { h: T('Tipps für den Alltag', 'Everyday tips'), p: T(
      '<ul><li><b>Satz-Methode:</b> „Mein Hund Bello frisst 3 Würste!“ → <code>MHBf3W!</code> – noch länger ist besser.</li><li><b>Passphrase:</b> vier zufällige Wörter mit Zeichen, z. B. <code>Kiwi-Turm-blau-Regen7</code>.</li><li><b>Passwort-Manager</b> merkt sich viele starke Passwörter.</li><li><b>Zwei-Faktor-Anmeldung</b>: zusätzlich ein Code vom Handy.</li><li>Passwörter nie weitergeben – auch nicht an Freunde.</li></ul>',
      '<ul><li><b>Sentence method:</b> “My dog Bello eats 3 sausages!” → <code>MdBe3s!</code> – longer is even better.</li><li><b>Passphrase:</b> four random words with symbols, e.g. <code>Kiwi-Tower-blue-Rain7</code>.</li><li>A <b>password manager</b> remembers many strong passwords.</li><li><b>Two-factor login</b>: an extra code from your phone.</li><li>Never share passwords – not even with friends.</li></ul>') }
  ],
  stations: [
    { id: 'pw-build', type: 'pwbuild', merk: 0,
      title: T('Passwort-Baustelle', 'Password building site'), desc: T('Erfülle alle zehn Regeln', 'Meet all ten rules'),
      how: T('Tippe ein Passwort ein. Mit jeder erfüllten Regel erscheint eine neue. Erfüllte Regeln werden grün. Gib hier nie ein echtes Passwort ein!',
        'Type a password. Each rule you meet unlocks a new one. Rules you meet turn green. Never type a real password here!'),
      hint: T('Ziffern, die zusammen 15 ergeben: z. B. 7 und 8, oder 5, 5 und 5 – aber Achtung bei Regel 10!', 'Digits adding up to 15: e.g. 7 and 8, or 5, 5 and 5 – but watch out for rule 10!'),
      task: T('Baue ein Passwort, das alle Regeln erfüllt.', 'Build a password that meets every rule.'),
      example: T('Igel!Mai78xyzQ', 'Owl!May78xyzQ'),
      final: T('Geschafft! Dein Passwort erfüllt alle Regeln. Echte Regeln sind einfacher – aber Länge und Vielfalt zählen immer.', 'Done! Your password meets every rule. Real rules are simpler – but length and variety always count.'),
      rules: [
        { t: T('Mindestens 8 Zeichen.', 'At least 8 characters.'), test: s => [...s].length >= 8 },
        { t: T('Mindestens ein Großbuchstabe.', 'At least one capital letter.'), test: s => /[A-ZÄÖÜ]/.test(s) },
        { t: T('Mindestens eine Ziffer.', 'At least one digit.'), test: s => /\d/.test(s) },
        { t: T('Mindestens ein Sonderzeichen wie ! ? # %.', 'At least one symbol like ! ? # %.'), test: s => /[^A-Za-z0-9ÄÖÜäöüß\s]/.test(s) },
        { t: T('Mindestens 12 Zeichen – Länge schlägt alles!', 'At least 12 characters – length beats everything!'), test: s => [...s].length >= 12 },
        { t: T('Alle Ziffern zusammen ergeben 15.', 'All digits add up to 15.'), test: s => digitSum(s) === 15 },
        { t: T('Enthält einen Monatsnamen.', 'Contains the name of a month.'), test: s => MONTHS.some(m => s.toLowerCase().includes(m)) },
        { t: T('Enthält ein Tier (z. B. Igel, Fuchs, Eule, Hai).', 'Contains an animal (e.g. fox, owl, shark, cat).'), test: s => ANIMALS.some(a => s.toLowerCase().includes(a)) },
        { t: T('Enthält keine typischen Muster wie „passwort“, „123“, „qwert“ oder „abc“.', 'Contains no typical patterns such as “password”, “123”, “qwert” or “abc”.'), test: s => !FORBIDDEN.some(f => s.toLowerCase().includes(f)) },
        { t: T('Kein Zeichen dreimal hintereinander.', 'No character three times in a row.'), test: s => !/(.)\1\1/.test(s) }
      ] },
    { id: 'pw-crack', type: 'pwcrack', merk: 1,
      title: T('Knack-Rechner', 'Cracking calculator'), desc: T('Wie lange dauert das Durchprobieren?', 'How long does brute force take?'),
      how: T('Wähle die Zeichenarten und die Länge. Der Rechner zeigt, wie viele Möglichkeiten es gibt und wie lange ein schneller Computer höchstens bräuchte.',
        'Choose the kinds of characters and the length. The calculator shows how many possibilities there are and how long a fast computer would need at most.'),
      rounds: [
        { sets: ['digits'], sec: 86400, q: T('Nur Ziffern (wie eine PIN): Welche Länge braucht man mindestens, damit das Knacken länger als einen Tag dauert?', 'Digits only (like a PIN): what is the shortest length that takes more than one day to crack?'),
          why: T('Mit 15 Ziffern gibt es 10¹⁵ Möglichkeiten – das dauert gut einen Tag. Eine 4-stellige PIN ist sofort geknackt!', 'With 15 digits there are 10¹⁵ possibilities – that takes just over a day. A 4-digit PIN is cracked instantly!'),
          hint: T('Schalte nur 0–9 ein und schiebe die Länge, bis mehr als 1 Tag dasteht.', 'Switch on only 0–9 and move the length until it shows more than 1 day.') },
        { sets: ['lower'], sec: 365.25 * 86400, q: T('Nur Kleinbuchstaben: Wie lang muss das Passwort mindestens sein, damit es länger als ein Jahr dauert?', 'Lower-case letters only: what is the shortest length that takes more than a year?'),
          why: T('13 Kleinbuchstaben reichen für mehr als ein Jahr – aber nur, wenn es kein echtes Wort ist.', '13 lower-case letters are enough for more than a year – but only if it is not a real word.'),
          hint: T('Nur a–z einschalten, dann die Länge erhöhen.', 'Switch on only a–z, then increase the length.') },
        { sets: ['lower', 'upper', 'digits', 'special'], sec: 1000 * 365.25 * 86400, q: T('Alle vier Zeichenarten: Welche Länge reicht für mehr als 1000 Jahre?', 'All four kinds of characters: what length is enough for more than 1000 years?'),
          why: T('Mit 95 möglichen Zeichen reichen schon 11 Stellen. Vielfalt und Länge zusammen machen ein Passwort stark.', 'With 95 possible characters, 11 places are enough. Variety and length together make a password strong.'),
          hint: T('Alle vier Schalter an. Bei welcher Länge springt die Zeit über 1000 Jahre?', 'All four switches on. At which length does the time jump above 1000 years?') }
      ] },
    { id: 'pw-sort', type: 'sort', merk: 0, mono: true,
      title: T('Stark oder schwach?', 'Strong or weak?'), desc: T('Passwörter einschätzen', 'Judge passwords'),
      how: T('Ordne jedes Passwort ein: stark oder schwach.', 'Sort each password: strong or weak.'),
      task: T('Ist dieses Passwort stark oder schwach?', 'Is this password strong or weak?'),
      buckets: [{ id: 'good', t: T('Stark 💪', 'Strong 💪') }, { id: 'bad', t: T('Schwach 🙈', 'Weak 🙈') }],
      items: [
        { t: 'hallo123', b: 'bad', why: T('Ein Wort plus „123“ – steht in jeder Liste der häufigsten Passwörter.', 'A word plus “123” – it is on every list of common passwords.') },
        { t: T('Sommer2026', 'Summer2026'), b: 'bad', why: T('Jahreszeit + Jahr ist ein beliebtes Muster und schnell erraten.', 'Season + year is a popular pattern and quickly guessed.') },
        { t: 'Tg7!pQ2#mZ9x', b: 'good', why: T('12 Zeichen, alle vier Zeichenarten, kein Wort – stark.', '12 characters, all four kinds, no word – strong.') },
        { t: 'qwertz', b: 'bad', why: T('Eine Tastaturreihe – wird als Erstes ausprobiert.', 'A row on the keyboard – one of the first things attackers try.') },
        { t: 'Lisa2011', b: 'bad', why: T('Name + Geburtsjahr lässt sich oft aus sozialen Netzwerken erraten.', 'Name + year of birth can often be guessed from social media.') },
        { t: T('Kiwi-Turm-blau-Regen7', 'Kiwi-Tower-blue-Rain7'), b: 'good', why: T('Eine lange Passphrase aus zufälligen Wörtern – stark und gut zu merken.', 'A long passphrase of random words – strong and easy to remember.') },
        { t: 'P@ssw0rt', b: 'bad', why: T('Buchstaben durch Zeichen ersetzen kennt jedes Knackprogramm.', 'Every cracking tool knows letters swapped for symbols.') },
        { t: T('MHBf3W!-Bello+Wurst', 'MdBe3s!-Bello+Sausage'), b: 'good', why: T('Satz-Methode plus Länge – stark.', 'Sentence method plus length – strong.') },
        { t: 'K@tze', b: 'bad', why: T('Viel zu kurz – nur 5 Zeichen.', 'Far too short – only 5 characters.') }
      ] },
    { id: 'pw-myth', type: 'quiz', merk: 2,
      title: T('Mythen-Check', 'Myth check'), desc: T('Was stimmt wirklich?', 'What is really true?'),
      how: T('Wähle die richtige Antwort.', 'Choose the correct answer.'),
      items: [
        { q: T('Ist es okay, dasselbe starke Passwort für alle Zugänge zu benutzen?', 'Is it okay to use the same strong password for every account?'),
          opts: [T('Nein – wird ein Dienst gehackt, sind alle Zugänge offen.', 'No – if one service is hacked, every account is open.'), T('Ja, wenn es stark genug ist.', 'Yes, if it is strong enough.'), T('Ja, so vergisst man es nicht.', 'Yes, so you do not forget it.')], a: 0,
          why: T('Gestohlene Passwörter werden automatisch bei vielen Diensten ausprobiert.', 'Stolen passwords are automatically tried on many services.') },
        { q: T('Was bedeutet Zwei-Faktor-Anmeldung?', 'What does two-factor login mean?'),
          opts: [T('Neben dem Passwort braucht man noch etwas Zweites, z. B. einen Code vom Handy.', 'Besides the password you need a second thing, e.g. a code from your phone.'), T('Man gibt das Passwort zweimal ein.', 'You type the password twice.'), T('Zwei Personen kennen das Passwort.', 'Two people know the password.')], a: 0,
          why: T('Selbst wenn jemand das Passwort kennt, fehlt ihm der zweite Faktor.', 'Even if someone knows the password, they still lack the second factor.') },
        { q: T('Deine beste Freundin fragt nach deinem Passwort, um dir zu helfen. Was tust du?', 'Your best friend asks for your password to help you. What do you do?'),
          opts: [T('Ich gebe es nicht weiter und helfe lieber gemeinsam am Gerät.', 'I do not share it and we work on it together on the device.'), T('Ich gebe es ihr, sie ist ja meine Freundin.', 'I give it to her, she is my friend.'), T('Ich schicke es per Nachricht.', 'I send it in a message.')], a: 0,
          why: T('Passwörter gehören nur dir. Freundschaften ändern sich – und Nachrichten können mitgelesen werden.', 'Passwords belong only to you. Friendships change – and messages can be read by others.') },
        { q: T('Wo bewahrst du viele verschiedene Passwörter am besten auf?', 'Where is the best place to keep many different passwords?'),
          opts: [T('In einem Passwort-Manager mit einem starken Hauptpasswort.', 'In a password manager with one strong main password.'), T('Auf einem Zettel am Bildschirm.', 'On a note stuck to the screen.'), T('In einer Notiz-App ohne Sperre.', 'In a notes app without a lock.')], a: 0,
          why: T('Ein Passwort-Manager verschlüsselt alle Passwörter.', 'A password manager encrypts all passwords.') },
        { q: T('Eine E-Mail fordert dich auf, dein Passwort „zur Sicherheit“ zu bestätigen. Was ist das wahrscheinlich?', 'An email asks you to confirm your password “for security”. What is it probably?'),
          opts: [T('Ein Phishing-Versuch.', 'A phishing attempt.'), T('Eine normale Sicherheitsprüfung.', 'A normal security check.'), T('Eine Werbung.', 'An advert.')], a: 0,
          why: T('Seriöse Dienste fragen nie per E-Mail nach deinem Passwort.', 'Trustworthy services never ask for your password by email.') }
      ] }
  ]
},

/* ======================= 3 Blockprogrammierung ======================= */
{
  id: 'bloecke', color: '#7B4FE8', icon: 'blocks',
  title: T('Blockprogrammierung', 'Block coding'),
  sub: T('Folge, Schleife, Bedingung, Variable', 'Sequence, loop, condition, variable'),
  intro: T('Programme bestehen aus Anweisungen, die nacheinander ausgeführt werden. Mit Blöcken baust du sie zusammen – ganz ohne Tippfehler.',
    'Programs are made of instructions that run one after another. With blocks you snap them together – without typos.'),
  kc: T('Jg. 9/10 – Algorithmisches Problemlösen: Algorithmen entwerfen, in einer grafischen Programmiersprache umsetzen, Kontrollstrukturen und Variablen nutzen, Programme testen.',
    'Years 9/10 – algorithmic problem solving: designing algorithms, implementing them in a visual language, using control structures and variables, testing programs.'),
  merk: [
    { h: T('Algorithmus', 'Algorithm'), p: T('<p>Ein <b>Algorithmus</b> ist eine eindeutige Schritt-für-Schritt-Anleitung, die ein Problem löst. Ein Programm ist ein Algorithmus, den ein Computer ausführen kann.</p>',
      '<p>An <b>algorithm</b> is a clear step-by-step set of instructions that solves a problem. A program is an algorithm a computer can run.</p>') },
    { h: T('Die drei Grundbausteine', 'The three building blocks'), p: T(
      '<ul><li><b>Sequenz:</b> Anweisungen der Reihe nach.</li><li><b>Wiederholung (Schleife):</b> <code>wiederhole 4 mal</code> oder <code>wiederhole bis …</code></li><li><b>Verzweigung (Bedingung):</b> <code>falls … dann … sonst …</code></li></ul>',
      '<ul><li><b>Sequence:</b> instructions one after the other.</li><li><b>Repetition (loop):</b> <code>repeat 4 times</code> or <code>repeat until …</code></li><li><b>Selection (condition):</b> <code>if … then … else …</code></li></ul>') },
    { h: T('Variablen', 'Variables'), p: T(
      '<p>Eine <b>Variable</b> ist ein Speicherplatz mit Namen, z. B. <code>Punkte</code>.</p><ul><li><code>setze Punkte auf 0</code> – Wert festlegen</li><li><code>ändere Punkte um 1</code> – Wert erhöhen</li></ul>',
      '<p>A <b>variable</b> is a named storage place, e.g. <code>score</code>.</p><ul><li><code>set score to 0</code> – assign a value</li><li><code>change score by 1</code> – increase the value</li></ul>') },
    { h: T('Testen und Fehler finden', 'Testing and debugging'), p: T(
      '<p>Gehe ein Programm Schritt für Schritt durch und notiere, was passiert. Typische Fehler: falsche Reihenfolge, falsche Zahl in der Schleife, <code>&gt;</code> statt <code>≥</code>.</p>',
      '<p>Go through a program step by step and note what happens. Typical bugs: wrong order, wrong number in a loop, <code>&gt;</code> instead of <code>≥</code>.</p>') }
  ],
  stations: [
    { id: 'bl-maze', type: 'maze', merk: 1,
      title: T('Roboter-Labyrinth', 'Robot maze'), desc: T('Programmiere den Weg zum Stern', 'Program the way to the star'),
      how: T('Tippe Befehle an, um sie ins Programm zu setzen. Ein Befehl im Programm verschwindet, wenn du ihn antippst. Eine Wiederholung nimmt die folgenden Befehle auf, bis du wieder „Hauptprogramm“ antippst. Die Zahl in der Wiederholung änderst du durch Antippen. Mit „Start“ läuft der Roboter los.',
        'Tap commands to add them to the program. Tap a command in the program to remove it. A repeat block takes the next commands until you tap “Main program” again. Tap the number in the repeat block to change it. “Run” starts the robot.'),
      stages: [
        { map: ['S...Z'], dir: 'E', sol: ['f', 'f', 'f', 'f'], goal: T('Bring den Roboter zum Stern.', 'Get the robot to the star.'), hint: T('Der Roboter schaut nach rechts. Wie viele Schritte sind es bis zum Stern?', 'The robot faces right. How many steps to the star?') },
        { map: ['S..##', '##.##', '##..Z'], dir: 'E', sol: ['f', 'f', 'r', 'f', 'f', 'l', 'f', 'f'], goal: T('Jetzt mit Kurven. Drehen bewegt den Roboter nicht – er dreht sich nur auf der Stelle.', 'Now with turns. Turning does not move the robot – it only turns on the spot.'), hint: T('Zwei vor, rechts drehen, zwei vor, links drehen, zwei vor.', 'Two forward, turn right, two forward, turn left, two forward.') },
        { map: ['S.###', '#..##', '##..#', '###.Z'], dir: 'E', loops: true, limit: 6, sol: ['f', { rep: 3, body: ['r', 'f', 'l', 'f'] }],
          goal: T('Eine Treppe! Du hast höchstens 6 Blöcke – nutze eine Wiederholung.', 'A staircase! You have at most 6 blocks – use a repeat.'), hint: T('Ein Schritt vor, dann 3-mal: rechts, vor, links, vor.', 'One step forward, then 3 times: right, forward, left, forward.') },
        { map: ['S.......Z'], dir: 'E', loops: true, limit: 2, sol: [{ rep: 8, body: ['f'] }], goal: T('Ein langer Gang – aber nur 2 Blöcke erlaubt.', 'A long corridor – but only 2 blocks allowed.'), hint: T('Eine Wiederholung mit einem einzigen „vorwärts“ darin. Wie oft?', 'One repeat with a single “forward” inside. How many times?') },
        { map: ['S....', '####.', 'Z....'], dir: 'E', loops: true, limit: 8, sol: [{ rep: 4, body: ['f'] }, 'r', { rep: 2, body: ['f'] }, 'r', { rep: 4, body: ['f'] }],
          goal: T('Einmal um die Mauer herum – mit höchstens 8 Blöcken.', 'Once round the wall – with at most 8 blocks.'), hint: T('Drei kurze Wiederholungen, dazwischen zweimal rechts drehen.', 'Three short repeats, with two right turns in between.') },
        { map: ['S####', '..###', '#..##', '##..#', '###.Z'], dir: 'S', loops: true, limit: 5, sol: [{ rep: 4, body: ['f', 'l', 'f', 'r'] }],
          goal: T('Die Treppe abwärts – der Roboter schaut nach unten. Höchstens 5 Blöcke!', 'Down the stairs – the robot faces down. At most 5 blocks!'), hint: T('Eine Wiederholung mit vier Befehlen: vor, links, vor, rechts.', 'One repeat with four commands: forward, left, forward, right.') }
      ] },
    { id: 'bl-predict', type: 'quiz', merk: 2,
      title: T('Was kommt heraus?', 'What is the result?'), desc: T('Programme im Kopf ausführen', 'Run programs in your head'),
      how: T('Gehe das Programm Schritt für Schritt durch. Schreib dir die Werte der Variable auf.', 'Go through the program step by step. Write down the values of the variable.'),
      items: [
        { q: T('Welchen Wert hat x am Ende?', 'What is the value of x at the end?'), code: [B(T('setze x auf 3', 'set x to 3'), 'var'), B(T('ändere x um 2', 'change x by 2'), 'var'), B(T('ändere x um 2', 'change x by 2'), 'var')],
          opts: ['7', '5', '3', '2'], a: 0, why: T('3 → 5 → 7', '3 → 5 → 7') },
        { q: T('Welchen Wert hat n am Ende?', 'What is the value of n at the end?'), code: [B(T('setze n auf 0', 'set n to 0'), 'var'), B(T('wiederhole 4 mal', 'repeat 4 times'), 'control'), B(T('ändere n um 3', 'change n by 3'), 'var', 1)],
          opts: ['12', '7', '4', '3'], a: 0, why: T('Viermal 3 dazu: 0 → 3 → 6 → 9 → 12', 'Add 3 four times: 0 → 3 → 6 → 9 → 12') },
        { q: T('Welchen Wert hat a am Ende?', 'What is the value of a at the end?'), code: [B(T('setze a auf 10', 'set a to 10'), 'var'), B(T('falls a > 5 dann', 'if a > 5 then'), 'control'), B(T('setze a auf a − 5', 'set a to a − 5'), 'var', 1), B(T('sonst', 'else'), 'control'), B(T('setze a auf 0', 'set a to 0'), 'var', 1)],
          opts: ['5', '0', '10', '15'], a: 0, why: T('10 > 5 ist wahr, also wird der „dann“-Teil ausgeführt: 10 − 5 = 5.', '10 > 5 is true, so the “then” part runs: 10 − 5 = 5.') },
        { q: T('Welchen Wert hat s am Ende?', 'What is the value of s at the end?'), code: [B(T('setze s auf 1', 'set s to 1'), 'var'), B(T('wiederhole 3 mal', 'repeat 3 times'), 'control'), B(T('setze s auf s · 2', 'set s to s × 2'), 'var', 1)],
          opts: ['8', '6', '7', '3'], a: 0, why: T('Verdoppeln: 1 → 2 → 4 → 8', 'Doubling: 1 → 2 → 4 → 8') },
        { q: T('Welchen Wert hat z am Ende?', 'What is the value of z at the end?'), code: [B(T('setze z auf 0', 'set z to 0'), 'var'), B(T('wiederhole bis z > 10', 'repeat until z > 10'), 'control'), B(T('ändere z um 4', 'change z by 4'), 'var', 1)],
          opts: ['12', '10', '8', '16'], a: 0, why: T('0 → 4 → 8 → 12. Erst bei 12 ist z > 10, dann stoppt die Schleife.', '0 → 4 → 8 → 12. Only at 12 is z > 10, then the loop stops.'), hint: T('Prüfe die Bedingung jedes Mal, bevor die Schleife weiterläuft.', 'Check the condition each time before the loop continues.') }
      ] },
    { id: 'bl-order', type: 'order', merk: 1,
      title: T('Blöcke ordnen', 'Order the blocks'), desc: T('Bring das Programm in die richtige Reihenfolge', 'Put the program in the right order'),
      how: T('Tippe die Blöcke in der richtigen Reihenfolge an. Ein Block im Programm geht beim Antippen zurück. Die Einrückung zeigt dir, was zu einer Schleife oder Bedingung gehört.',
        'Tap the blocks in the right order. Tap a block in the program to send it back. The indentation shows what belongs inside a loop or condition.'),
      tasks: [
        { goal: T('Eine Ampel schaltet von Rot über Rot-Gelb auf Grün.', 'A traffic light changes from red via red-amber to green.'),
          blocks: [B(T('schalte Rot an', 'switch red on'), 'look'), B(T('warte 3 Sekunden', 'wait 3 seconds'), 'control'), B(T('schalte Gelb an', 'switch amber on'), 'look'), B(T('warte 1 Sekunde', 'wait 1 second'), 'control'), B(T('schalte Rot und Gelb aus', 'switch red and amber off'), 'look'), B(T('schalte Grün an', 'switch green on'), 'look')],
          why: T('Reihenfolge ist entscheidend – sonst wäre die Ampel gefährlich.', 'Order matters – otherwise the traffic light would be dangerous.'), hint: T('Rot leuchtet zuerst allein, dann kommt Gelb dazu.', 'Red is on alone first, then amber joins.') },
        { goal: T('Ein Quiz zählt die richtigen Antworten auf 5 Fragen und sagt am Ende die Punktzahl.', 'A quiz counts the correct answers to 5 questions and tells the score at the end.'),
          blocks: [B(T('setze Punkte auf 0', 'set score to 0'), 'var'), B(T('wiederhole 5 mal', 'repeat 5 times'), 'control'), B(T('frage nach der Antwort', 'ask for the answer'), 'sense', 1), B(T('falls Antwort richtig dann', 'if answer is correct then'), 'control', 1), B(T('ändere Punkte um 1', 'change score by 1'), 'var', 2), B(T('sage Punkte', 'say score'), 'look')],
          why: T('Erst die Variable auf 0 setzen, dann in der Schleife fragen und zählen, am Ende ausgeben.', 'First set the variable to 0, then ask and count inside the loop, finally output.'), hint: T('Was muss vor der Schleife passieren, was danach?', 'What has to happen before the loop, what after it?') },
        { goal: T('Ein Programm berechnet den Mittelwert von Zahlen.', 'A program calculates the average of some numbers.'),
          blocks: [B(T('setze Summe auf 0', 'set sum to 0'), 'var'), B(T('wiederhole für jede Zahl', 'repeat for each number'), 'control'), B(T('ändere Summe um Zahl', 'change sum by number'), 'var', 1), B(T('setze Mittelwert auf Summe / Anzahl', 'set average to sum / count'), 'op'), B(T('sage Mittelwert', 'say average'), 'look')],
          why: T('Erst alles aufsummieren, danach einmal teilen.', 'First add everything up, then divide once.') }
      ] },
    { id: 'bl-bug', type: 'bug', merk: 3,
      title: T('Fehlersuche', 'Bug hunt'), desc: T('Finde den falschen Block', 'Find the wrong block'),
      how: T('Lies, was das Programm tun soll. Tippe dann auf den Block, der den Fehler verursacht.', 'Read what the program should do. Then tap the block that causes the bug.'),
      tasks: [
        { goal: T('Die Figur soll ein Quadrat zeichnen.', 'The sprite should draw a square.'),
          blocks: [B(T('Stift runter', 'pen down'), 'look'), B(T('wiederhole 4 mal', 'repeat 4 times'), 'control'), B(T('gehe 100 Schritte', 'move 100 steps'), 'motion', 1), B(T('drehe dich um 60 Grad', 'turn 60 degrees'), 'motion', 1)], bug: 3,
          why: T('Ein Quadrat hat rechte Winkel – die Figur muss sich um 90 Grad drehen.', 'A square has right angles – the sprite must turn 90 degrees.'), hint: T('Welche Winkel hat ein Quadrat?', 'What angles does a square have?') },
        { goal: T('Ein Countdown soll von 10 bis 1 herunterzählen.', 'A countdown should count from 10 down to 1.'),
          blocks: [B(T('setze z auf 10', 'set z to 10'), 'var'), B(T('wiederhole 10 mal', 'repeat 10 times'), 'control'), B(T('sage z', 'say z'), 'look', 1), B(T('ändere z um 1', 'change z by 1'), 'var', 1)], bug: 3,
          why: T('Zum Herunterzählen muss z um −1 geändert werden.', 'To count down, z has to change by −1.') },
        { goal: T('Ab 50 Punkten soll „bestanden“ erscheinen – also auch bei genau 50.', 'From 50 points on, “passed” should appear – including exactly 50.'),
          blocks: [B(T('frage nach den Punkten', 'ask for the points'), 'sense'), B(T('falls Punkte > 50 dann', 'if points > 50 then'), 'control'), B(T('sage „bestanden“', 'say “passed”'), 'look', 1), B(T('sonst', 'else'), 'control'), B(T('sage „nicht bestanden“', 'say “not passed”'), 'look', 1)], bug: 1,
          why: T('Bei genau 50 ist „> 50“ falsch. Richtig wäre „≥ 50“ (oder „> 49“).', 'At exactly 50, “> 50” is false. It should be “≥ 50” (or “> 49”).'), hint: T('Was passiert bei genau 50 Punkten?', 'What happens with exactly 50 points?') },
        { goal: T('Das Programm soll 1 + 2 + 3 + 4 + 5 addieren.', 'The program should add 1 + 2 + 3 + 4 + 5.'),
          blocks: [B(T('setze s auf 0', 'set s to 0'), 'var'), B(T('setze i auf 1', 'set i to 1'), 'var'), B(T('wiederhole 5 mal', 'repeat 5 times'), 'control'), B(T('ändere s um 1', 'change s by 1'), 'var', 1), B(T('ändere i um 1', 'change i by 1'), 'var', 1)], bug: 3,
          why: T('s muss jedes Mal um i wachsen, nicht um 1 – sonst kommt 5 statt 15 heraus.', 's has to grow by i each time, not by 1 – otherwise the result is 5 instead of 15.') }
      ] }
  ]
},

/* ======================= 4 Verschlüsselung ======================= */
{
  id: 'krypto', color: '#0E93A8', icon: 'lock',
  title: T('Verschlüsselung', 'Encryption'),
  sub: T('Caesar, Knacken und Vigenère', 'Caesar, cracking and Vigenère'),
  intro: T('Schon vor 2000 Jahren wurden Nachrichten verschlüsselt. Probiere die Verfahren aus – und knacke selbst eine Geheimbotschaft.',
    'Messages were encrypted more than 2000 years ago. Try out the methods – and crack a secret message yourself.'),
  kc: T('Jg. 10 – Aufbau des Internets: Schutzmaßnahmen (Verschlüsselung), einfache Verfahren anwenden und ihre Sicherheit beurteilen.', 'Year 10 – structure of the internet: protection (encryption), applying simple methods and judging how secure they are.'),
  merk: [
    { h: T('Fachbegriffe', 'Key terms'), p: T('<ul><li><b>Klartext:</b> die lesbare Nachricht</li><li><b>Geheimtext:</b> die verschlüsselte Nachricht</li><li><b>Schlüssel:</b> die geheime Information, mit der ver- und entschlüsselt wird</li></ul>',
      '<ul><li><b>Plaintext:</b> the readable message</li><li><b>Ciphertext:</b> the encrypted message</li><li><b>Key:</b> the secret information used to encrypt and decrypt</li></ul>') },
    { h: T('Caesar-Verfahren', 'Caesar cipher'), p: T('<p>Jeder Buchstabe wird um dieselbe Zahl im Alphabet verschoben. Mit Schlüssel 3 wird aus A ein D, aus B ein E … und aus X wieder ein A.</p><p>Es gibt nur 25 sinnvolle Schlüssel – man kann sie einfach alle ausprobieren.</p>',
      '<p>Every letter is shifted by the same number in the alphabet. With key 3, A becomes D, B becomes E … and X wraps round to A.</p><p>There are only 25 useful keys – you can simply try them all.</p>') },
    { h: T('Häufigkeitsanalyse', 'Frequency analysis'), p: T('<p>Im Deutschen ist <b>E</b> der häufigste Buchstabe (etwa 17 %), dann N, I, S, R. Der häufigste Buchstabe im Geheimtext steht also vermutlich für E – daraus ergibt sich der Schlüssel.</p>',
      '<p>In English, <b>E</b> is the most common letter (about 12 %), followed by T, A, O. So the most frequent letter in the ciphertext probably stands for E – and that gives away the key.</p>') },
    { h: T('Vigenère-Verfahren', 'Vigenère cipher'), p: T('<p>Hier gibt es ein <b>Schlüsselwort</b>. Jeder Buchstabe des Schlüsselworts gibt eine eigene Verschiebung an (A = 0, B = 1 … Z = 25). Das Schlüsselwort wird wiederholt.</p><p>Weil derselbe Buchstabe unterschiedlich verschlüsselt wird, funktioniert die einfache Häufigkeitsanalyse nicht mehr.</p>',
      '<p>This uses a <b>keyword</b>. Each letter of the keyword gives its own shift (A = 0, B = 1 … Z = 25). The keyword is repeated.</p><p>Because the same letter is encrypted differently, simple frequency analysis no longer works.</p>') },
    { h: T('Und heute?', 'And today?'), p: T('<p>Im Internet sorgt z. B. <code>https</code> (Schloss-Symbol im Browser) dafür, dass Daten verschlüsselt übertragen werden. Moderne Verfahren nutzen riesige Schlüssel – Durchprobieren würde Milliarden Jahre dauern.</p>',
      '<p>On the internet, <code>https</code> (the padlock in the browser) makes sure data is sent encrypted. Modern methods use huge keys – trying them all would take billions of years.</p>') }
  ],
  stations: [
    { id: 'kr-caesar', type: 'caesar', merk: 1,
      title: T('Caesar-Scheibe', 'Caesar wheel'), desc: T('Ver- und entschlüsseln', 'Encrypt and decrypt'),
      how: T('Drehe die innere Scheibe mit − und + auf den Schlüssel. Außen steht der Klartext, innen der Geheimtext. Die Leiste darunter zeigt dasselbe noch einmal nebeneinander.',
        'Turn the inner wheel to the key with − and +. The outer ring is the plaintext, the inner ring the ciphertext. The strip below shows the same side by side.'),
      rounds: [
        { mode: 'enc', text: T('HALLO', 'HELLO'), key: 3 },
        { mode: 'dec', text: T('INFORMATIK', 'COMPUTER'), key: 3 },
        { mode: 'enc', text: T('GEHEIM', 'SECRET'), key: 5 },
        { mode: 'dec', text: T('SCHULE', 'SCHOOL'), key: 13 }
      ] },
    { id: 'kr-crack', type: 'crack', merk: 2,
      title: T('Code knacken', 'Crack the code'), desc: T('Den Schlüssel herausfinden', 'Find the key'),
      how: T('Verschiebe den Regler, bis der Text unten lesbar wird. Das Balkendiagramm zeigt, wie oft jeder Buchstabe im Geheimtext vorkommt.',
        'Move the slider until the text below becomes readable. The bar chart shows how often each letter appears in the ciphertext.'),
      rounds: [
        { text: T('DIE PIZZA KOMMT UM ACHT', 'THE PIZZA ARRIVES AT EIGHT'), key: 7 },
        { text: T('TREFFPUNKT IST DER SCHULHOF', 'MEET ME IN THE SCHOOL YARD'), key: 11 },
        { text: T('JEDER BUCHSTABE WIRD UM DIESELBE ZAHL VERSCHOBEN', 'EVERY LETTER IS SHIFTED BY THE SAME NUMBER'), key: 19 }
      ] },
    { id: 'kr-vig', type: 'vig', merk: 3,
      title: T('Vigenère', 'Vigenère'), desc: T('Mit einem Schlüsselwort', 'With a keyword'),
      how: T('Unter jedem Buchstaben steht der passende Buchstabe des Schlüsselworts und seine Verschiebung (A = 0, B = 1 …). Verschiebe jeden Buchstaben einzeln und trage das Ergebnis ein. Die Alphabet-Leiste hilft beim Zählen.',
        'Under each letter you see the matching keyword letter and its shift (A = 0, B = 1 …). Shift each letter on its own and type the result. The alphabet strip helps with counting.'),
      rounds: [
        { mode: 'enc', text: T('SONNE', 'SUNNY'), key: 'AB' },
        { mode: 'enc', text: T('SCHULE', 'SCHOOL'), key: 'BIT' },
        { mode: 'dec', text: T('GEHEIM', 'SECRET'), key: 'LUX' }
      ] }
  ]
},

/* ======================= 5 Mikrocontroller ======================= */
{
  id: 'mikro', color: '#E0434F', icon: 'chip',
  title: T('Mikrocontroller', 'Microcontrollers'),
  sub: T('Sensoren, Aktoren und die LED-Matrix', 'Sensors, actuators and the LED matrix'),
  intro: T('Ein Mikrocontroller ist ein kleiner Computer auf einer Platine. Er liest Sensoren aus und steuert Lampen, Lautsprecher oder Motoren.',
    'A microcontroller is a small computer on a circuit board. It reads sensors and controls lights, speakers or motors.'),
  kc: T('Jg. 9 – Einstieg in das Algorithmische Problemlösen mit Sensor-Aktor-Systemen: Sensoren auslesen, Aktoren ansteuern, EVA-Prinzip.', 'Year 9 – introduction to algorithmic problem solving with sensor–actuator systems: reading sensors, controlling actuators, input–process–output.'),
  merk: [
    { h: T('EVA-Prinzip', 'Input – process – output'), p: T('<ul><li><b>Eingabe:</b> Sensoren und Tasten liefern Daten (Licht, Temperatur, Lage, Taste gedrückt).</li><li><b>Verarbeitung:</b> Das Programm wertet die Daten aus und entscheidet.</li><li><b>Ausgabe:</b> Aktoren tun etwas (LEDs leuchten, Lautsprecher piept, Motor dreht sich).</li></ul>',
      '<ul><li><b>Input:</b> sensors and buttons deliver data (light, temperature, tilt, button pressed).</li><li><b>Process:</b> the program evaluates the data and decides.</li><li><b>Output:</b> actuators do something (LEDs light up, a speaker beeps, a motor turns).</li></ul>') },
    { h: T('Die LED-Matrix', 'The LED matrix'), p: T('<p>Viele Lern-Platinen haben 5 × 5 LEDs. Jede LED hat Koordinaten: <b>x</b> zählt von links nach rechts (0 bis 4), <b>y</b> von oben nach unten (0 bis 4). Die LED oben links ist (0|0).</p>',
      '<p>Many learning boards have 5 × 5 LEDs. Each LED has coordinates: <b>x</b> counts from left to right (0 to 4), <b>y</b> from top to bottom (0 to 4). The top-left LED is (0|0).</p>') },
    { h: T('Wenn – dann – sonst', 'If – then – else'), p: T('<p>Mit einer Bedingung reagiert der Mikrocontroller auf Sensorwerte: <code>falls Helligkeit &lt; 50 dann LEDs an sonst LEDs aus</code>. Der Grenzwert (hier 50) heißt <b>Schwellenwert</b>.</p><p>Das Programm läuft in einer <b>Endlosschleife</b> und prüft die Sensoren immer wieder.</p>',
      '<p>With a condition the microcontroller reacts to sensor values: <code>if light &lt; 50 then LEDs on else LEDs off</code>. The limit (here 50) is called the <b>threshold</b>.</p><p>The program runs in an <b>endless loop</b> and keeps checking the sensors.</p>') }
  ],
  stations: [
    { id: 'mc-eva', type: 'sort', merk: 0,
      title: T('Eingabe, Verarbeitung, Ausgabe', 'Input, process, output'), desc: T('Bauteile einordnen', 'Sort the components'),
      how: T('Ordne jedes Bauteil oder jeden Vorgang einer Stufe des EVA-Prinzips zu.', 'Assign each component or step to one stage of input – process – output.'),
      task: T('Gehört das zur Eingabe, Verarbeitung oder Ausgabe?', 'Is this input, processing or output?'),
      buckets: [{ id: 'e', t: T('Eingabe', 'Input'), sub: T('Sensor', 'sensor') }, { id: 'v', t: T('Verarbeitung', 'Process'), sub: T('Programm', 'program') }, { id: 'a', t: T('Ausgabe', 'Output'), sub: T('Aktor', 'actuator') }],
      items: [
        { t: T('Lichtsensor', 'Light sensor'), b: 'e', why: T('Er misst die Helligkeit – ein Sensor liefert Eingaben.', 'It measures brightness – a sensor provides input.') },
        { t: T('LED-Matrix', 'LED matrix'), b: 'a', why: T('Die LEDs zeigen etwas an – das ist Ausgabe.', 'The LEDs display something – that is output.') },
        { t: T('Taste A', 'Button A'), b: 'e', why: T('Ein Tastendruck ist eine Eingabe.', 'A button press is input.') },
        { t: T('Lautsprecher', 'Speaker'), b: 'a', why: T('Er gibt Töne aus.', 'It outputs sounds.') },
        { t: T('Programm vergleicht die Temperatur mit 30 °C', 'Program compares the temperature with 30 °C'), b: 'v', why: T('Vergleichen und Entscheiden ist Verarbeitung.', 'Comparing and deciding is processing.') },
        { t: T('Temperatursensor', 'Temperature sensor'), b: 'e', why: T('Er misst die Temperatur.', 'It measures the temperature.') },
        { t: T('Motor', 'Motor'), b: 'a', why: T('Ein Motor ist ein Aktor – er bewegt etwas.', 'A motor is an actuator – it moves something.') },
        { t: T('Lagesensor (Neigung)', 'Tilt sensor'), b: 'e', why: T('Er misst, wie das Gerät gehalten wird.', 'It measures how the device is held.') },
        { t: T('Programm zählt die Schritte hoch', 'Program counts up the steps'), b: 'v', why: T('Rechnen und Zählen passiert in der Verarbeitung.', 'Calculating and counting happen in processing.') },
        { t: T('Farbige RGB-LED', 'Coloured RGB LED'), b: 'a', why: T('Sie leuchtet – Ausgabe.', 'It lights up – output.') }
      ] },
    { id: 'mc-matrix', type: 'matrix', merk: 1,
      title: T('LED-Matrix', 'LED matrix'), desc: T('Koordinaten und Muster', 'Coordinates and patterns'),
      how: T('Tippe auf die LEDs, um sie ein- oder auszuschalten. x zählt nach rechts, y nach unten – beide beginnen bei 0.',
        'Tap the LEDs to switch them on or off. x counts to the right, y downwards – both start at 0.'),
      rounds: [
        { mode: 'xy', x: 3, y: 1 },
        { mode: 'xy', x: 0, y: 4, hint: T('y = 4 ist die unterste Reihe.', 'y = 4 is the bottom row.') },
        { mode: 'copy', pattern: ['.#.#.', '#####', '#####', '.###.', '..#..'] },
        { mode: 'code', pattern: ['#...#', '.#.#.', '..#..', '.#.#.', '#...#'], hint: T('Gehe die Befehle einzeln durch: erst nach rechts zählen (x), dann nach unten (y).', 'Go through the commands one at a time: count right first (x), then down (y).') },
        { mode: 'copy', pattern: ['.....', '.#.#.', '.....', '#...#', '.###.'] }
      ] },
    { id: 'mc-if', type: 'ifthen', merk: 2,
      title: T('Wenn – dann', 'If – then'), desc: T('Sensoren steuern Aktoren', 'Sensors control actuators'),
      how: T('Stelle den Sensor, den Vergleich, den Grenzwert und die Aktionen so ein, wie es die Aufgabe verlangt. Mit dem Schieberegler kannst du dein Programm testen.',
        'Set the sensor, the comparison, the threshold and the actions as the task asks. Use the slider to test your program.'),
      rounds: [
        { spec: T('Nachtlicht: Ist es dunkel (Helligkeit kleiner als 50), sollen alle LEDs leuchten, sonst sind sie aus.', 'Night light: if it is dark (light level less than 50), all LEDs should be on, otherwise off.'),
          sensor: 'light', cmp: '<', val: 50, then: 'ledOn', else: 'ledOff', why: T('Teste mit dem Regler: unter 50 leuchtet alles.', 'Test with the slider: below 50 everything lights up.') },
        { spec: T('Hitzewarner: Ist die Temperatur größer als 30 °C, soll ein Warnton erklingen, sonst passiert nichts.', 'Heat alarm: if the temperature is greater than 30 °C, a warning tone should sound, otherwise nothing happens.'),
          sensor: 'temp', cmp: '>', val: 30, then: 'tone', else: 'none', why: T('Ein Lautsprecher ist der Aktor für den Warnton.', 'A speaker is the actuator for the warning tone.') },
        { spec: T('Wasserwaage: Ist die Neigung kleiner als 5°, liegt das Gerät gerade – zeige ein Häkchen, sonst ein X.', 'Spirit level: if the tilt is less than 5°, the device is level – show a tick, otherwise an X.'),
          sensor: 'tilt', cmp: '<', val: 5, then: 'check', else: 'cross', why: T('So wird aus der Platine ein Messgerät.', 'This turns the board into a measuring tool.') },
        { spec: T('Klingel: Ist Taste A gedrückt, spiele einen Ton, sonst tue nichts.', 'Doorbell: if button A is pressed, play a tone, otherwise do nothing.'),
          sensor: 'btnA', then: 'tone', else: 'none', why: T('Eine Taste ist der einfachste Sensor: gedrückt oder nicht.', 'A button is the simplest sensor: pressed or not.') }
      ] }
  ]
},

/* ======================= 6 Codierung ======================= */
{
  id: 'code', color: '#2F6FE0', icon: 'binary',
  title: T('Daten codieren', 'Encoding data'),
  sub: T('Binärzahlen, ASCII und RGB-Farben', 'Binary numbers, ASCII and RGB colours'),
  intro: T('Ein Computer kennt nur 0 und 1. Trotzdem speichert er Zahlen, Texte und Bilder – weil alles nach festen Regeln codiert wird.',
    'A computer only knows 0 and 1. Still, it stores numbers, text and pictures – because everything is encoded by fixed rules.'),
  kc: T('Jg. 9 – Grundlagen der Datenverarbeitung: Daten mit einem vorgegebenen Verfahren codieren (Binärzahlen, ASCII, RGB).', 'Year 9 – basics of data processing: encoding data with a given method (binary numbers, ASCII, RGB).'),
  merk: [
    { h: T('Bits und Bytes', 'Bits and bytes'), p: T('<p>Ein <b>Bit</b> ist 0 oder 1. Acht Bits sind ein <b>Byte</b> – damit lassen sich 2<sup>8</sup> = 256 verschiedene Werte (0 bis 255) darstellen.</p>',
      '<p>A <b>bit</b> is 0 or 1. Eight bits make a <b>byte</b> – that can represent 2<sup>8</sup> = 256 different values (0 to 255).</p>') },
    { h: T('Binärzahlen', 'Binary numbers'), p: T('<p>Jede Stelle hat einen Wert: von rechts 1, 2, 4, 8, 16, 32, 64, 128. Man addiert die Werte, wo eine 1 steht:</p><p><code>10110</code> = 16 + 4 + 2 = 22</p>',
      '<p>Each place has a value: from the right 1, 2, 4, 8, 16, 32, 64, 128. Add the values where there is a 1:</p><p><code>10110</code> = 16 + 4 + 2 = 22</p>') },
    { h: T('Texte: ASCII', 'Text: ASCII'), p: T('<p>Im <b>ASCII-Code</b> hat jedes Zeichen eine Nummer: A = 65, B = 66 … Z = 90. Diese Nummer wird als Byte gespeichert: A = <code>01000001</code>. Heute wird meist Unicode genutzt – für A gilt dort dieselbe Nummer.</p>',
      '<p>In <b>ASCII</b> every character has a number: A = 65, B = 66 … Z = 90. The number is stored as a byte: A = <code>01000001</code>. Today Unicode is mostly used – A has the same number there.</p>') },
    { h: T('Bilder: RGB', 'Pictures: RGB'), p: T('<p>Ein Bildschirm-Pixel mischt rotes, grünes und blaues Licht. Jeder Anteil geht von 0 bis 255 (ein Byte). Lichtfarben mischen sich anders als Malfarben: Rot + Grün = <b>Gelb</b>, alle drei voll = <b>Weiß</b>.</p>',
      '<p>A screen pixel mixes red, green and blue light. Each part goes from 0 to 255 (one byte). Light mixes differently from paint: red + green = <b>yellow</b>, all three at full = <b>white</b>.</p>') }
  ],
  stations: [
    { id: 'cd-bin', type: 'binary', merk: 1,
      title: T('Binärkarten', 'Binary cards'), desc: T('Zahlen aus 0 und 1', 'Numbers from 0 and 1'),
      how: T('Jede Karte hat einen Wert. Umgedreht (sichtbar) bedeutet 1, verdeckt bedeutet 0. Drehe die Karten so, dass ihre Summe die Zahl ergibt.',
        'Each card has a value. Face up means 1, face down means 0. Turn the cards so that their sum gives the number.'),
      rounds: [
        { mode: 'make', bits: 5, value: 9 }, { mode: 'make', bits: 5, value: 22 }, { mode: 'make', bits: 5, value: 31 },
        { mode: 'read', bits: 5, value: 13 }, { mode: 'make', bits: 8, value: 100 }, { mode: 'read', bits: 8, value: 182 }
      ] },
    { id: 'cd-ascii', type: 'ascii', merk: 2,
      title: T('Geheimnachricht in Bits', 'Secret message in bits'), desc: T('Buchstaben als Bytes', 'Letters as bytes'),
      how: T('Rechne jedes Byte in eine Zahl um und suche den Buchstaben in der ASCII-Tabelle. Beim Codieren schaltest du die passenden Bits ein.',
        'Convert each byte into a number and look up the letter in the ASCII table. When encoding, switch on the right bits.'),
      rounds: [
        { mode: 'dec', word: 'OK' }, { mode: 'enc', ch: 'K' }, { mode: 'dec', word: T('JA', 'YES') }, { mode: 'enc', ch: 'Z' }
      ] },
    { id: 'cd-rgb', type: 'rgb', merk: 3, tolerance: 30,
      title: T('RGB-Mischpult', 'RGB mixer'), desc: T('Farben aus Licht mischen', 'Mix colours from light'),
      how: T('Mische mit den drei Reglern die Zielfarbe. Ganz genau musst du nicht sein – jeder Wert darf um bis zu 30 abweichen.',
        'Use the three sliders to mix the target colour. You do not have to be exact – each value may be off by up to 30.'),
      rounds: [
        { target: [255, 255, 0], name: T('Gelb', 'Yellow'), hint: T('Gelb entsteht aus Rot und Grün – ohne Blau.', 'Yellow comes from red and green – without blue.'), why: T('Rot + Grün = Gelb. Bei Licht addieren sich die Farben!', 'Red + green = yellow. With light, colours add up!') },
        { target: [255, 0, 255], name: T('Magenta', 'Magenta'), hint: T('Rot und Blau voll, kein Grün.', 'Red and blue at full, no green.') },
        { target: [255, 140, 0], name: T('Orange', 'Orange'), hint: T('Rot voll, Grün ungefähr halb, kein Blau.', 'Red at full, green about half, no blue.') },
        { target: [128, 128, 128], name: T('Grau', 'Grey'), hint: T('Grau entsteht, wenn alle drei Werte gleich sind.', 'Grey appears when all three values are equal.'), why: T('Gleiche Werte ergeben Grautöne – von Schwarz (0, 0, 0) bis Weiß (255, 255, 255).', 'Equal values give shades of grey – from black (0, 0, 0) to white (255, 255, 255).') },
        { target: [0, 128, 128], name: T('Petrol', 'Teal'), hint: T('Kein Rot, Grün und Blau jeweils etwa halb.', 'No red, green and blue each about half.') }
      ] }
  ]
},

/* ======================= 7 Internet ======================= */
{
  id: 'netz', color: '#0C9C6E', icon: 'globe',
  title: T('Wie das Internet funktioniert', 'How the internet works'),
  sub: T('Client, Server, Router und DNS', 'Client, server, router and DNS'),
  intro: T('Wenn du eine Webseite aufrufst, reisen kleine Datenpakete über viele Stationen – und finden auch dann ans Ziel, wenn eine ausfällt.',
    'When you open a web page, small data packets travel through many stations – and still arrive when one of them fails.'),
  kc: T('Jg. 10 – Aufbau des Internets: dezentraler Aufbau, Funktion von Client, Server, Router und DNS.', 'Year 10 – structure of the internet: decentralised design, roles of client, server, router and DNS.'),
  merk: [
    { h: T('Client und Server', 'Client and server'), p: T('<p>Dein Gerät ist ein <b>Client</b>: Es stellt eine Anfrage. Ein <b>Server</b> ist ein Rechner, der Dienste anbietet und antwortet, z. B. mit einer Webseite.</p>',
      '<p>Your device is a <b>client</b>: it sends a request. A <b>server</b> is a computer that offers services and answers, e.g. with a web page.</p>') },
    { h: T('IP-Adressen und DNS', 'IP addresses and DNS'), p: T('<p>Jedes Gerät im Netz hat eine <b>IP-Adresse</b>, z. B. <code>192.168.0.17</code> (vier Zahlen von 0 bis 255). Das <b>DNS</b> funktioniert wie ein Telefonbuch: Es übersetzt Namen wie <code>schule.de</code> in IP-Adressen.</p>',
      '<p>Every device on the network has an <b>IP address</b>, e.g. <code>192.168.0.17</code> (four numbers from 0 to 255). <b>DNS</b> works like a phone book: it translates names such as <code>school.org</code> into IP addresses.</p>') },
    { h: T('Pakete und Router', 'Packets and routers'), p: T('<p>Daten werden in kleine <b>Pakete</b> zerlegt. <b>Router</b> leiten jedes Paket Richtung Ziel weiter. Weil das Netz <b>dezentral</b> aufgebaut ist, gibt es viele Wege – fällt ein Router aus, nehmen die Pakete einen anderen.</p>',
      '<p>Data is split into small <b>packets</b>. <b>Routers</b> forward each packet towards its destination. Because the network is <b>decentralised</b>, there are many routes – if a router fails, the packets take another one.</p>') }
  ],
  stations: [
    { id: 'nt-match', type: 'match', merk: 0,
      title: T('Wer macht was?', 'Who does what?'), desc: T('Begriffe zuordnen', 'Match the terms'),
      how: T('Tippe links einen Begriff und rechts die passende Beschreibung an.', 'Tap a term on the left and the matching description on the right.'),
      task: T('Ordne jedem Begriff seine Aufgabe zu.', 'Match each term to its job.'),
      final: T('Alle Begriffe richtig zugeordnet!', 'All terms matched correctly!'),
      pairs: [
        { a: 'Client', b: T('stellt Anfragen, z. B. dein Handy oder Laptop', 'sends requests, e.g. your phone or laptop') },
        { a: 'Server', b: T('bietet Dienste an und beantwortet Anfragen', 'offers services and answers requests') },
        { a: 'Router', b: T('leitet Datenpakete in Richtung Ziel weiter', 'forwards data packets towards their destination') },
        { a: 'DNS', b: T('übersetzt Namen wie schule.de in IP-Adressen', 'translates names like school.org into IP addresses') },
        { a: T('IP-Adresse', 'IP address'), b: T('eindeutige Nummer eines Geräts im Netz', 'unique number of a device on the network') },
        { a: T('Datenpaket', 'Data packet'), b: T('kleines Stück einer größeren Nachricht', 'small piece of a larger message') }
      ] },
    { id: 'nt-route', type: 'route', merk: 2,
      title: T('Paketreise', 'Packet journey'), desc: T('Schicke ein Paket zum Server', 'Send a packet to the server'),
      how: T('Tippe nacheinander die Router an, über die das Paket reisen soll – nur direkt verbundene. Rot markierte Router sind ausgefallen. Tippst du auf einen Router im Weg, geht es von dort weiter.',
        'Tap the routers the packet should travel through, one after another – only directly connected ones. Routers marked red are down. Tap a router on your path to continue from there.'),
      rounds: [
        { broken: [], q: T('Schicke das Paket von deinem Gerät zum Server.', 'Send the packet from your device to the server.') },
        { broken: ['R5'], q: T('Router R5 ist ausgefallen. Finde einen anderen Weg.', 'Router R5 is down. Find another route.'), why: T('Genau dafür ist das Internet dezentral aufgebaut.', 'That is exactly why the internet is decentralised.') },
        { broken: ['R2', 'R4', 'R5', 'R8'], q: T('Jetzt sind sogar vier Router ausgefallen. Kommt das Paket trotzdem an?', 'Now four routers are down. Can the packet still get through?') },
        { broken: ['R8'], shortest: true, q: T('Finde den kürzesten Weg – mit so wenigen Schritten wie möglich.', 'Find the shortest route – with as few hops as possible.'), why: T('Router suchen ständig nach guten Wegen.', 'Routers keep looking for good routes.') }
      ] },
    { id: 'nt-quiz', type: 'quiz', merk: 1,
      title: T('Netz-Quiz', 'Network quiz'), desc: T('IP, DNS und https', 'IP, DNS and https'),
      how: T('Wähle die richtige Antwort.', 'Choose the correct answer.'),
      items: [
        { q: T('Welche IP-Adresse ist ungültig?', 'Which IP address is invalid?'), opts: ['192.168.1.300', '192.168.1.30', '10.0.0.1', '172.16.5.4'], a: 0, why: T('Jede der vier Zahlen geht nur bis 255. 300 ist zu groß.', 'Each of the four numbers only goes up to 255. 300 is too big.') },
        { q: T('Du tippst eine Webadresse ein. Was passiert zuerst?', 'You type a web address. What happens first?'),
          opts: [T('Das DNS sucht die passende IP-Adresse.', 'DNS looks up the matching IP address.'), T('Der Server schickt sofort die Seite.', 'The server immediately sends the page.'), T('Der Router löscht alte Pakete.', 'The router deletes old packets.')], a: 0,
          why: T('Ohne IP-Adresse weiß dein Gerät nicht, wohin die Anfrage gehen soll.', 'Without an IP address your device does not know where to send the request.') },
        { q: T('Was zeigt das Schloss-Symbol mit https an?', 'What does the padlock with https tell you?'),
          opts: [T('Die Verbindung zur Webseite ist verschlüsselt.', 'The connection to the website is encrypted.'), T('Die Webseite ist garantiert seriös.', 'The website is guaranteed to be trustworthy.'), T('Die Webseite ist kostenlos.', 'The website is free.')], a: 0,
          why: T('https verschlüsselt den Transport. Auch Betrüger können aber https nutzen – prüfe trotzdem die Adresse!', 'https encrypts the connection. But scammers can use https too – always check the address!') },
        { q: T('Warum werden große Dateien in viele Pakete zerlegt?', 'Why are large files split into many packets?'),
          opts: [T('Pakete können getrennt reisen; geht eins verloren, wird nur dieses neu geschickt.', 'Packets can travel separately; if one is lost, only that one is resent.'), T('Damit die Datei kleiner wird.', 'To make the file smaller.'), T('Damit niemand die Datei lesen kann.', 'So that nobody can read the file.')], a: 0,
          why: T('Das macht die Übertragung robust und teilt die Leitungen fair auf.', 'This makes transfer robust and shares the lines fairly.') },
        { q: T('Was bedeutet „dezentral“ beim Internet?', 'What does “decentralised” mean for the internet?'),
          opts: [T('Es gibt keinen zentralen Rechner, ohne den alles ausfällt.', 'There is no central computer without which everything fails.'), T('Das Internet gehört einer einzigen Firma.', 'The internet belongs to one single company.'), T('Alle Daten liegen an einem Ort.', 'All data is stored in one place.')], a: 0,
          why: T('Viele Wege und viele Knoten machen das Netz ausfallsicher.', 'Many routes and many nodes make the network resilient.') }
      ] }
  ]
},

/* ======================= 8 Daten & Recht ======================= */
{
  id: 'daten', color: '#D2367A', icon: 'shield',
  title: T('Daten & Recht', 'Data & rights'),
  sub: T('Phishing, persönliche Daten, deine Rechte', 'Phishing, personal data, your rights'),
  intro: T('Deine Daten sind wertvoll – für dich und für andere. Lerne, Betrugsversuche zu erkennen und deine Rechte zu nutzen.',
    'Your data is valuable – to you and to others. Learn to spot scams and use your rights.'),
  kc: T('Jg. 10 – Formen des Datenmissbrauchs; rechtliche Rahmenbedingungen für persönliche Daten: informationelle Selbstbestimmung, AGB, Datenschutz.', 'Year 10 – forms of data misuse; legal framework for personal data: informational self-determination, terms and conditions, data protection.'),
  merk: [
    { h: T('Phishing erkennen', 'Spotting phishing'), p: T('<ul><li>Absender-Adresse passt nicht zur Firma</li><li>unpersönliche Anrede („Hallo Kunde“)</li><li>Zeitdruck und Drohungen („innerhalb von 24 Stunden“)</li><li>Links zu fremden Adressen</li><li>Bitte um Passwort, PIN oder Bezahlung</li><li>zu schön, um wahr zu sein („Du hast gewonnen!“)</li></ul>',
      '<ul><li>Sender address does not match the company</li><li>impersonal greeting (“Dear customer”)</li><li>time pressure and threats (“within 24 hours”)</li><li>links to unfamiliar addresses</li><li>requests for a password, PIN or payment</li><li>too good to be true (“You have won!”)</li></ul>') },
    { h: T('Personenbezogene Daten', 'Personal data'), p: T('<p>Das sind alle Angaben, mit denen man eine Person erkennen kann – direkt (Name, Foto) oder indirekt (IP-Adresse, Standort, Benutzername).</p>',
      '<p>This is any information that identifies a person – directly (name, photo) or indirectly (IP address, location, user name).</p>') },
    { h: T('Deine Rechte', 'Your rights'), p: T('<ul><li><b>Informationelle Selbstbestimmung:</b> Du entscheidest grundsätzlich selbst, wer was über dich erfährt.</li><li>Die <b>DSGVO</b> gibt dir ein Recht auf Auskunft, Berichtigung und Löschung.</li><li><b>Recht am eigenen Bild:</b> Fotos von anderen nur mit deren Erlaubnis veröffentlichen.</li><li>In Deutschland kannst du ab 16 Jahren selbst in die Datenverarbeitung bei Online-Diensten einwilligen, vorher müssen die Eltern zustimmen.</li></ul>',
      '<ul><li><b>Informational self-determination:</b> in principle you decide who learns what about you.</li><li>The <b>GDPR</b> gives you the right to access, correct and delete your data.</li><li><b>Right to your own image:</b> only publish photos of others with their permission.</li><li>In Germany you can consent to data processing by online services yourself from age 16; before that, parents must agree.</li></ul>') },
    { h: T('AGB lesen lohnt sich', 'Read the terms'), p: T('<p>In den <b>Allgemeinen Geschäftsbedingungen</b> steht, was ein Dienst mit deinen Daten und Inhalten machen darf. Achte z. B. auf Rechte an deinen Fotos und die Weitergabe an Dritte.</p>',
      '<p>The <b>terms and conditions</b> say what a service may do with your data and content. Look out for rights to your photos and data being passed on to third parties.</p>') }
  ],
  stations: [
    { id: 'dt-phish', type: 'phish', merk: 0,
      title: T('Phishing-Postfach', 'Phishing inbox'), desc: T('Verdächtige Stellen finden', 'Find the suspicious parts'),
      how: T('Tippe alle Stellen an, die dir verdächtig vorkommen. Nochmal antippen hebt die Markierung auf. Dann „Prüfen“.',
        'Tap every part that looks suspicious. Tap again to remove the mark. Then tap “Check”.'),
      mails: [
        { from: { t: 'Paketblitz Service <support@paketblitz-zustellung.co>', sus: true, why: T('Die Absender-Adresse gehört nicht zur echten Firma.', 'The sender address does not belong to the real company.') },
          subject: { t: T('Ihr Paket konnte nicht zugestellt werden', 'Your parcel could not be delivered'), sus: false },
          body: [
            { t: T('Hallo Kunde,', 'Dear customer,'), sus: true, why: T('Unpersönliche Anrede – der Absender kennt deinen Namen nicht.', 'Impersonal greeting – the sender does not know your name.') },
            { t: T('Ihr Paket liegt in unserem Lager.', 'Your parcel is in our warehouse.'), sus: false },
            { t: T('Zahlen Sie innerhalb von 24 Stunden eine Gebühr von 1,99 €,', 'Pay a fee of €1.99 within 24 hours,'), sus: true, why: T('Zeitdruck und eine Zahlung – typische Tricks.', 'Time pressure and a payment – typical tricks.') },
            { t: T('sonst wird das Paket vernichtet.', 'or the parcel will be destroyed.'), sus: true, why: T('Eine Drohung soll dich zu schnellem Handeln bringen.', 'A threat is meant to make you act quickly.') },
            { t: T('Hier bezahlen: http://paketblitz.zahlung-sicher.info', 'Pay here: http://paketblitz.payment-safe.info'), sus: true, why: T('Der Link führt zu einer fremden Adresse.', 'The link leads to an unfamiliar address.') },
            { t: T('Ihr Paketblitz-Team', 'Your Paketblitz team'), sus: false }
          ] },
        { from: { t: T('Spieleplanet <noreply@spieleplanet-game.de>', 'Gameplanet <noreply@gameplanet-play.com>'), sus: false },
          subject: { t: T('Du hast 5000 Diamanten gewonnen!!!', 'You have won 5000 diamonds!!!'), sus: true, why: T('Zu schön, um wahr zu sein – dazu viele Ausrufezeichen.', 'Too good to be true – plus lots of exclamation marks.') },
          body: [
            { t: T('Glückwunsch! Du wurdest zufällig ausgewählt.', 'Congratulations! You have been chosen at random.'), sus: true, why: T('„Zufällig ausgewählt“ ist ein typischer Köder.', '“Chosen at random” is a typical bait.') },
            { t: T('Melde dich hier mit Benutzername und Passwort an,', 'Log in here with your user name and password'), sus: true, why: T('Niemals Zugangsdaten über einen Link aus einer E-Mail eingeben.', 'Never enter login details via a link in an email.') },
            { t: T('damit wir die Diamanten gutschreiben können.', 'so that we can credit the diamonds.'), sus: false },
            { t: T('Viel Spaß beim Spielen!', 'Have fun playing!'), sus: false }
          ] },
        { from: { t: T('Wolkenbank <sicherheit@wolkenbank.de>', 'Cloudbank <security@cloudbank.com>'), sus: false },
          subject: { t: T('Wichtig: Ihr Konto wurde gesperrt', 'Important: your account has been blocked'), sus: true, why: T('Panikmache im Betreff soll dich unter Druck setzen.', 'Scaremongering in the subject line puts you under pressure.') },
          body: [
            { t: T('Sehr geehrte Frau Weber,', 'Dear Ms Weber,'), sus: false },
            { t: T('wir haben ungewöhnliche Aktivitäten festgestellt.', 'we have noticed unusual activity.'), sus: false },
            { t: T('Bitte bestätigen Sie Ihre PIN und TAN per Antwort auf diese E-Mail.', 'Please confirm your PIN and TAN by replying to this email.'), sus: true, why: T('Keine Bank fragt jemals per E-Mail nach PIN oder TAN.', 'No bank ever asks for a PIN or TAN by email.') },
            { t: T('Mit freundlichen Grüßen, Ihre Wolkenbank', 'Kind regards, your Cloudbank'), sus: false }
          ] }
      ] },
    { id: 'dt-pers', type: 'sort', merk: 1,
      title: T('Persönlich oder nicht?', 'Personal or not?'), desc: T('Personenbezogene Daten erkennen', 'Recognise personal data'),
      how: T('Entscheide, ob man mit der Angabe eine bestimmte Person erkennen kann.', 'Decide whether the information can identify a particular person.'),
      task: T('Sind das personenbezogene Daten?', 'Is this personal data?'),
      buckets: [{ id: 'yes', t: T('Ja, personenbezogen', 'Yes, personal') }, { id: 'no', t: T('Nein', 'No') }],
      items: [
        { t: T('deine Wohnadresse', 'your home address'), b: 'yes', why: T('Damit findet man dich direkt.', 'It leads straight to you.') },
        { t: T('ein Foto, auf dem du erkennbar bist', 'a photo in which you can be recognised'), b: 'yes', why: T('Dein Gesicht identifiziert dich.', 'Your face identifies you.') },
        { t: T('die Temperatur in Berlin heute', 'today’s temperature in Berlin'), b: 'no', why: T('Diese Angabe sagt nichts über eine Person.', 'This says nothing about a person.') },
        { t: T('die IP-Adresse deines Geräts', 'your device’s IP address'), b: 'yes', why: T('Über die IP-Adresse kann man einen Anschluss und damit Personen ermitteln.', 'An IP address can be traced to a connection and so to people.') },
        { t: T('die Einwohnerzahl einer Stadt', 'the population of a town'), b: 'no', why: T('Eine Statistik ohne Bezug zu einer einzelnen Person.', 'A statistic with no link to a single person.') },
        { t: T('deine Zeugnisnoten', 'your school report grades'), b: 'yes', why: T('Noten gehören zu dir – sie sind sogar besonders schützenswert.', 'Grades belong to you – they deserve special protection.') },
        { t: T('dein Standortverlauf im Handy', 'your phone’s location history'), b: 'yes', why: T('Er zeigt, wo du wohnst, zur Schule gehst und deine Freizeit verbringst.', 'It shows where you live, go to school and spend your free time.') },
        { t: T('die Formel für den Flächeninhalt eines Kreises', 'the formula for the area of a circle'), b: 'no', why: T('Allgemeines Wissen, keine Person.', 'General knowledge, not a person.') },
        { t: T('dein Benutzername in einem Spiel', 'your user name in a game'), b: 'yes', why: T('Auch ein Spitzname kann einer Person zugeordnet werden.', 'Even a nickname can be linked to a person.') }
      ] },
    { id: 'dt-law', type: 'quiz', merk: 2,
      title: T('Deine Rechte', 'Your rights'), desc: T('Was ist erlaubt?', 'What is allowed?'),
      how: T('Wähle die richtige Antwort. Das ist keine Rechtsberatung, sondern Grundwissen.', 'Choose the correct answer. This is not legal advice, just basic knowledge.'),
      items: [
        { q: T('Du hast ein lustiges Foto von deinem Freund gemacht. Darfst du es in deiner Story posten?', 'You took a funny photo of your friend. May you post it in your story?'),
          opts: [T('Nur wenn er einverstanden ist.', 'Only if he agrees.'), T('Ja, ich habe es ja fotografiert.', 'Yes, I took the photo.'), T('Ja, wenn ich ihn markiere.', 'Yes, if I tag him.')], a: 0,
          why: T('Das Recht am eigenen Bild: Jede Person entscheidet selbst über Veröffentlichungen.', 'Right to your own image: everyone decides about publication themselves.') },
        { q: T('Du möchtest wissen, welche Daten eine App über dich gespeichert hat. Was kannst du tun?', 'You want to know what data an app has stored about you. What can you do?'),
          opts: [T('Auskunft verlangen – das Recht gibt dir die DSGVO.', 'Request access – the GDPR gives you this right.'), T('Nichts, das ist geheim.', 'Nothing, it is secret.'), T('Nur die Polizei darf das fragen.', 'Only the police may ask.')], a: 0,
          why: T('Nach der DSGVO muss der Anbieter dir Auskunft geben.', 'Under the GDPR the provider has to tell you.') },
        { q: T('In den AGB einer Foto-App steht: „Wir dürfen hochgeladene Bilder weltweit für Werbung nutzen.“ Was bedeutet das?', 'An app’s terms say: “We may use uploaded pictures worldwide for advertising.” What does that mean?'),
          opts: [T('Deine Fotos könnten in Werbung auftauchen.', 'Your photos could appear in adverts.'), T('Nichts – AGB gelten nicht.', 'Nothing – terms do not apply.'), T('Die App bezahlt dich dafür.', 'The app pays you for it.')], a: 0,
          why: T('Mit der Zustimmung zu den AGB gibst du Rechte ab. Darum lohnt sich ein Blick hinein.', 'By accepting the terms you give away rights. That is why they are worth a look.') },
        { q: T('Ab welchem Alter kannst du in Deutschland selbst in die Datenverarbeitung eines Online-Dienstes einwilligen?', 'From what age can you consent to an online service processing your data yourself in Germany?'),
          opts: ['16', '12', '14', '18'], a: 0, why: T('In Deutschland gilt 16 Jahre. Vorher müssen die Eltern zustimmen.', 'In Germany it is 16. Before that, parents have to agree.') },
        { q: T('Du findest im Internet ein tolles Bild und möchtest es auf deiner eigenen Webseite zeigen. Was gilt?', 'You find a great picture online and want to show it on your own website. What applies?'),
          opts: [T('Nur mit Erlaubnis oder passender Lizenz, z. B. einer freien Lizenz mit Namensnennung.', 'Only with permission or a suitable licence, e.g. a free licence with attribution.'), T('Alles im Internet ist frei.', 'Everything on the internet is free.'), T('Wenn ich die Quelle nenne, ist es immer erlaubt.', 'It is always allowed if I name the source.')], a: 0,
          why: T('Bilder sind urheberrechtlich geschützt. Freie Lizenzen erlauben die Nutzung unter Bedingungen.', 'Pictures are protected by copyright. Free licences allow use under conditions.') }
      ] }
  ]
}
];
