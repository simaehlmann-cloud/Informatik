/* Thema „Computer & Hardware“ – wird als erstes Thema eingefügt */
'use strict';

const HW_ITEM = (dev, b, de, en) => ({ dev, b, why: T(de, en) });

CHAPTERS.unshift({
  id: 'hardware', color: '#5B5FE0', icon: 'monitor',
  title: T('Computer & Hardware', 'Computers & hardware'),
  sub: T('EVA, Bauteile, Speicher und PC bauen', 'Input–process–output, parts, storage and building a PC'),
  intro: T('Was steckt in einem Computer, und wie arbeiten die Teile zusammen? Sortiere Geräte, finde Fehler – und baue deinen eigenen PC, der wirklich startet.',
    'What is inside a computer, and how do the parts work together? Sort devices, find faults – and build your own PC that really starts.'),
  kc: T('Grundlagen der Datenverarbeitung: EVA(S)-Prinzip, Hardwarekomponenten und ihre Funktion, Speichermedien und Speicherorte, Betriebssystem und Anwendungsprogramme.',
    'Basics of data processing: input–process–output–storage, hardware components and their functions, storage media and locations, operating system and applications.'),
  merk: [
    { h: T('Das EVA-Prinzip', 'Input – process – output'), p: T(
      '<p>Jeder Computer arbeitet nach demselben Muster:</p><ul><li><b>E</b>ingabe: Daten kommen hinein (Tastatur, Maus, Mikrofon, Scanner)</li><li><b>V</b>erarbeitung: Der Prozessor rechnet und entscheidet</li><li><b>A</b>usgabe: Ergebnisse kommen heraus (Bildschirm, Drucker, Lautsprecher)</li></ul><p>Oft kommt noch ein <b>S</b> für <b>Speichern</b> dazu (EVAS): Daten werden aufbewahrt, z. B. auf einer SSD.</p>',
      '<p>Every computer works to the same pattern:</p><ul><li><b>Input</b>: data comes in (keyboard, mouse, microphone, scanner)</li><li><b>Process</b>: the processor calculates and decides</li><li><b>Output</b>: results come out (monitor, printer, speakers)</li></ul><p>Often <b>storage</b> is added: data is kept, e.g. on an SSD.</p>') },
    { h: T('Was steckt im Gehäuse?', 'What is inside the case?'), p: T(
      '<ul><li><b>Mainboard:</b> verbindet alle Teile</li><li><b>Prozessor (CPU):</b> rechnet – braucht einen <b>Kühler</b></li><li><b>Arbeitsspeicher (RAM):</b> schneller Kurzzeitspeicher</li><li><b>SSD/HDD:</b> Langzeitspeicher für Programme und Dateien</li><li><b>Grafikkarte:</b> berechnet das Bild</li><li><b>Netzteil:</b> versorgt alles mit Strom</li></ul><p>Geräte, die man außen anschließt, heißen <b>Peripheriegeräte</b>.</p>',
      '<ul><li><b>Motherboard:</b> connects all parts</li><li><b>Processor (CPU):</b> calculates – needs a <b>cooler</b></li><li><b>Memory (RAM):</b> fast short-term memory</li><li><b>SSD/HDD:</b> long-term storage for programs and files</li><li><b>Graphics card:</b> computes the picture</li><li><b>Power supply:</b> powers everything</li></ul><p>Devices plugged in from outside are called <b>peripherals</b>.</p>') },
    { h: T('Speicher im Vergleich', 'Storage compared'), p: T(
      '<ul><li><b>RAM:</b> sehr schnell, aber beim Ausschalten leer</li><li><b>SSD:</b> schnell, robust, ohne bewegliche Teile</li><li><b>HDD:</b> günstig und groß, aber langsamer und stoßempfindlich (Scheibe dreht sich)</li><li><b>USB-Stick/Speicherkarte:</b> klein und tragbar</li><li><b>Cloud:</b> überall erreichbar, braucht Internet</li></ul><p><b>Backup-Regel 3-2-1:</b> 3 Kopien, auf 2 verschiedenen Speichern, 1 davon an einem anderen Ort.</p>',
      '<ul><li><b>RAM:</b> very fast, but empty when switched off</li><li><b>SSD:</b> fast, tough, no moving parts</li><li><b>HDD:</b> cheap and large, but slower and sensitive to knocks (a disk spins)</li><li><b>USB stick/memory card:</b> small and portable</li><li><b>Cloud:</b> reachable anywhere, needs internet</li></ul><p><b>3-2-1 backup rule:</b> 3 copies, on 2 different media, 1 of them somewhere else.</p>') },
    { h: T('Einheiten', 'Units'), p: T(
      '<p>1 Byte = 8 Bit. Danach immer etwa mal 1000:</p><p><code>Byte → Kilobyte (KB) → Megabyte (MB) → Gigabyte (GB) → Terabyte (TB)</code></p><p>Eine Textnachricht hat etwa 100 Byte, ein Handyfoto etwa 3 MB, ein Film etwa 4 GB.</p>',
      '<p>1 byte = 8 bits. After that, roughly times 1000 each step:</p><p><code>byte → kilobyte (KB) → megabyte (MB) → gigabyte (GB) → terabyte (TB)</code></p><p>A text message is about 100 bytes, a phone photo about 3 MB, a film about 4 GB.</p>') },
    { h: T('Betriebssystem und Anwendungen', 'Operating system and applications'), p: T(
      '<p>Das <b>Betriebssystem</b> ist die Grundsoftware: Es verwaltet Dateien, Speicher, Benutzer und Geräte und startet Programme. <b>Anwendungsprogramme</b> erledigen deine Aufgaben: schreiben, rechnen, surfen, Bilder bearbeiten.</p>',
      '<p>The <b>operating system</b> is the basic software: it manages files, memory, users and devices and starts programs. <b>Applications</b> do your tasks: writing, calculating, browsing, editing pictures.</p>') }
  ],
  stations: [
    { id: 'hw-io', type: 'sort', merk: 0,
      title: T('Eingabe oder Ausgabe?', 'Input or output?'), desc: T('Geräte sortieren', 'Sort the devices'),
      how: T('Ziehe das Gerät in die passende Kiste oder tippe die Kiste an. Mit dem i-Knopf erfährst du, was das Gerät macht.', 'Drag the device into the right box or tap the box. The i button tells you what the device does.'),
      task: T('Wohin gehört dieses Gerät?', 'Where does this device belong?'),
      hint: T('Kommt etwas in den Computer hinein (Eingabe) oder kommt etwas heraus (Ausgabe)?', 'Does something go into the computer (input) or come out of it (output)?'),
      buckets: [{ id: 'e', t: T('Eingabe', 'Input'), sub: T('hinein in den PC', 'into the PC') }, { id: 'a', t: T('Ausgabe', 'Output'), sub: T('heraus aus dem PC', 'out of the PC') }, { id: 'b', t: T('Beides', 'Both'), sub: T('hinein und heraus', 'in and out') }],
      items: [
        HW_ITEM('keyboard', 'e', 'Mit der Tastatur gibst du etwas ein.', 'You type things in with the keyboard.'),
        HW_ITEM('mouse', 'e', 'Die Maus gibt Bewegungen und Klicks ein.', 'The mouse inputs movements and clicks.'),
        HW_ITEM('scanner', 'e', 'Der Scanner bringt ein Blatt als Bild in den Computer.', 'The scanner brings a sheet into the computer as a picture.'),
        HW_ITEM('mic', 'e', 'Das Mikrofon nimmt Töne auf – Eingabe.', 'The microphone records sound – input.'),
        HW_ITEM('webcam', 'e', 'Die Webcam liefert Bilder an den Computer.', 'The webcam sends pictures to the computer.'),
        HW_ITEM('printer', 'a', 'Der Drucker gibt Texte und Bilder auf Papier aus.', 'The printer outputs text and pictures on paper.'),
        HW_ITEM('speaker', 'a', 'Lautsprecher geben Töne aus.', 'Speakers output sound.'),
        HW_ITEM('monitor', 'a', 'Der Bildschirm zeigt die Ergebnisse an.', 'The monitor shows the results.'),
        HW_ITEM('beamer', 'a', 'Der Beamer gibt das Bild groß an der Wand aus.', 'The projector outputs the picture large on the wall.'),
        HW_ITEM('touch', 'b', 'Ein Touchscreen zeigt an und erkennt Berührungen – beides.', 'A touchscreen displays and detects touches – both.'),
        HW_ITEM('headset', 'b', 'Kopfhörer geben aus, das Mikrofon nimmt auf – beides.', 'Headphones output, the microphone records – both.')
      ],
      levels: {
        1: { buckets: [{ id: 'e', t: T('Eingabe', 'Input'), sub: T('hinein in den PC', 'into the PC') }, { id: 'a', t: T('Ausgabe', 'Output'), sub: T('heraus aus dem PC', 'out of the PC') }],
          pick: { items: [0, 1, 3, 4, 5, 6, 7] } },
        3: { task: T('Eingabe, Verarbeitung, Ausgabe oder Speicher?', 'Input, processing, output or storage?'),
          hint: T('Speicher bewahrt Daten auf. Verarbeitung rechnet. Eingabe und Ausgabe verbinden den Computer mit dir.', 'Storage keeps data. Processing calculates. Input and output connect the computer with you.'),
          buckets: [{ id: 'e', t: T('Eingabe', 'Input') }, { id: 'v', t: T('Verarbeitung', 'Process') }, { id: 'a', t: T('Ausgabe', 'Output') }, { id: 's', t: T('Speicher', 'Storage') }],
          items: [
            HW_ITEM('keyboard', 'e', 'Eingabe von Zeichen.', 'Input of characters.'),
            HW_ITEM('scanner', 'e', 'Eingabe eines Bildes.', 'Input of a picture.'),
            HW_ITEM('mic', 'e', 'Eingabe von Tönen.', 'Input of sound.'),
            HW_ITEM('cpu', 'v', 'Der Prozessor verarbeitet die Daten.', 'The processor processes the data.'),
            HW_ITEM('gpu', 'v', 'Die Grafikkarte berechnet das Bild – Verarbeitung.', 'The graphics card computes the picture – processing.'),
            HW_ITEM('monitor', 'a', 'Ausgabe des Bildes.', 'Output of the picture.'),
            HW_ITEM('printer', 'a', 'Ausgabe auf Papier.', 'Output on paper.'),
            HW_ITEM('ssd', 's', 'Die SSD speichert dauerhaft.', 'The SSD stores data permanently.'),
            HW_ITEM('usbstick', 's', 'Der USB-Stick speichert zum Mitnehmen.', 'The USB stick stores data to carry around.'),
            HW_ITEM('ram', 's', 'Der Arbeitsspeicher speichert kurzzeitig, solange der PC läuft.', 'Memory stores data short-term while the PC is running.')
          ] }
      } },
    { id: 'hw-inside', type: 'sort', merk: 1,
      title: T('Drinnen oder draußen?', 'Inside or outside?'), desc: T('Bauteile und Peripherie', 'Components and peripherals'),
      how: T('Ist das Teil im Gehäuse eingebaut oder wird es von außen angeschlossen? Ziehe es in die passende Kiste.', 'Is the part built into the case or plugged in from outside? Drag it into the right box.'),
      task: T('Ist das im Gehäuse oder wird es außen angeschlossen?', 'Is this inside the case or plugged in outside?'),
      buckets: [{ id: 'in', t: T('Im Gehäuse', 'Inside the case') }, { id: 'out', t: T('Außen angeschlossen', 'Plugged in outside') }],
      items: [
        HW_ITEM('cpu', 'in', 'Der Prozessor sitzt auf dem Mainboard im Gehäuse.', 'The processor sits on the motherboard inside the case.'),
        HW_ITEM('ram', 'in', 'Der Arbeitsspeicher steckt auf dem Mainboard.', 'Memory plugs into the motherboard.'),
        HW_ITEM('psu', 'in', 'Das Netzteil ist im Gehäuse eingebaut.', 'The power supply is built into the case.'),
        HW_ITEM('monitor', 'out', 'Der Bildschirm wird mit einem Kabel angeschlossen.', 'The monitor is connected with a cable.'),
        HW_ITEM('printer', 'out', 'Der Drucker steht außen – ein Peripheriegerät.', 'The printer stands outside – a peripheral.'),
        HW_ITEM('mouse', 'out', 'Die Maus wird außen angeschlossen.', 'The mouse is plugged in outside.'),
        HW_ITEM('board', 'in', 'Das Mainboard ist die Hauptplatine im Gehäuse.', 'The motherboard is the main board inside the case.'),
        HW_ITEM('gpu', 'in', 'Die Grafikkarte steckt auf dem Mainboard.', 'The graphics card plugs into the motherboard.'),
        HW_ITEM('keyboard', 'out', 'Die Tastatur ist ein Peripheriegerät.', 'The keyboard is a peripheral.'),
        HW_ITEM('usbstick', 'out', 'Den USB-Stick steckst du außen ein.', 'You plug the USB stick in outside.')
      ],
      levels: {
        1: { pick: { items: [0, 1, 2, 3, 4, 5] } },
        3: { add: { items: [
          HW_ITEM('cooler', 'in', 'Der Kühler sitzt auf dem Prozessor.', 'The cooler sits on the processor.'),
          HW_ITEM('netcard', 'in', 'Die Netzwerkkarte ist eingebaut (oft schon auf dem Mainboard).', 'The network card is built in (often already on the motherboard).'),
          HW_ITEM('router', 'out', 'Der Router ist ein eigenes Gerät im Netzwerk.', 'The router is a separate device on the network.')
        ] } }
      } },
    { id: 'hw-ports', type: 'match', merk: 1,
      title: T('Welcher Anschluss?', 'Which port?'), desc: T('Stecker und Geräte zuordnen', 'Match plugs and devices'),
      how: T('Tippe links einen Anschluss und rechts das passende Gerät an.', 'Tap a port on the left and the matching device on the right.'),
      task: T('Welches Gerät steckst du wo ein?', 'Which device plugs in where?'),
      final: T('Alles richtig verkabelt!', 'Everything wired up correctly!'),
      pairs: [
        { a: 'USB', b: T('Maus, Tastatur, USB-Stick', 'mouse, keyboard, USB stick') },
        { a: 'HDMI', b: T('Bildschirm oder Beamer (Bild und Ton)', 'monitor or projector (picture and sound)') },
        { a: T('Netzwerk (LAN)', 'Network (LAN)'), b: T('Kabel zum Router', 'cable to the router') },
        { a: T('Klinke (Audio)', 'Jack (audio)'), b: T('Kopfhörer', 'headphones') },
        { a: 'USB-C', b: T('Handy laden – der Stecker passt in beide Richtungen', 'charging a phone – the plug fits either way round') },
        { a: T('Stromkabel', 'Power cable'), b: T('Netzteil mit der Steckdose verbinden', 'connecting the power supply to the socket') }
      ],
      levels: {
        1: { pick: { pairs: [0, 1, 2, 3] } },
        3: { add: { pairs: [
          { a: 'DisplayPort', b: T('Bildschirm, oft für sehr schnelle Bildwechsel', 'monitor, often for very high refresh rates') },
          { a: T('WLAN', 'Wi-Fi'), b: T('Funkverbindung zum Router – ganz ohne Kabel', 'wireless connection to the router – no cable at all') }
        ] } }
      } },
    { id: 'hw-build', type: 'pcbuild', merk: 1,
      title: T('PC-Werkstatt', 'PC workshop'), desc: T('Baue einen PC, der startet', 'Build a PC that starts'),
      how: T('Tippe ein Bauteil an und dann den passenden Steckplatz – oder ziehe es hinein. Ein eingebautes Teil nimmst du durch Antippen wieder heraus. Drücke dann den Einschaltknopf.',
        'Tap a part and then the matching slot – or drag it in. Tap a fitted part to take it out again. Then press the power button.'),
      hint: T('Der Kühler kommt auf den Prozessor. Ohne Netzteil passiert gar nichts. Lies die i-Karten der Bauteile!', 'The cooler goes on the processor. Without a power supply nothing happens. Read the parts’ i cards!'),
      task: T('Baue den PC zusammen und schalte ihn ein. Achtung: Nicht alles gehört ins Gehäuse!', 'Assemble the PC and switch it on. Careful: not everything belongs in the case!'),
      final: T('Der PC startet! Netzteil, Mainboard, Prozessor mit Kühler, Arbeitsspeicher, SSD und Grafikkarte arbeiten zusammen.', 'The PC starts! Power supply, motherboard, processor with cooler, memory, SSD and graphics card work together.'),
      withBoard: true, withCables: true,
      parts: [
        { dev: 'board', where: T('Das Mainboard kommt als Erstes ins Gehäuse – die große Fläche oben.', 'The motherboard goes in first – the large area at the top.') },
        { dev: 'cpu', where: T('Der Prozessor gehört in den quadratischen Sockel.', 'The processor belongs in the square socket.') },
        { dev: 'cooler', where: T('Der Kühler kommt direkt auf den Prozessor.', 'The cooler goes right on top of the processor.') },
        { dev: 'ram', where: T('RAM gehört in den langen, schmalen Steckplatz.', 'RAM goes into the long, narrow slot.') },
        { dev: 'ssd', where: T('Die SSD kommt in den kurzen flachen Steckplatz.', 'The SSD goes into the short, flat slot.') },
        { dev: 'gpu', where: T('Die Grafikkarte gehört in den langen Steckplatz unten auf dem Mainboard.', 'The graphics card goes into the long slot at the bottom of the motherboard.') },
        { dev: 'psu', where: T('Das Netzteil sitzt unten im Gehäuse.', 'The power supply sits at the bottom of the case.') },
        { dev: 'cable24', where: T('Das breite Stromkabel kommt an den Anschluss rechts am Mainboard.', 'The wide power cable goes to the connector on the right of the motherboard.') },
        { dev: 'cable8', where: T('Das kleine Stromkabel versorgt den Prozessor – oben neben dem Sockel.', 'The small power cable supplies the processor – at the top next to the socket.') },
        { dev: 'printer', outside: true },
        { dev: 'mouse', outside: true }
      ],
      levels: {
        1: { withBoard: false, withCables: false, labels: true,
          task: T('Baue die Teile in den PC ein und schalte ihn ein. Der passende Platz leuchtet gelb.', 'Fit the parts into the PC and switch it on. The matching slot lights up yellow.'),
          pick: { parts: [1, 2, 3, 4, 5, 6] } },
        3: { how: T('Wähle in jeder Zeile ein Bauteil aus. Achte auf den Auftrag, das Budget, den passenden Sockel und darauf, dass das Netzteil genug Leistung hat. Dann „Zusammenbauen & starten“.',
          'Choose one part in each row. Watch the brief, the budget, the matching socket and whether the power supply is strong enough. Then “Build & start”.'),
          catalog: {
            base: 75,
            cpu: [{ id: 'c1', n: T('Prozessor Eco', 'Processor Eco'), d: T('4 Kerne · Sockel A · Grafik eingebaut · 65 W', '4 cores · socket A · built-in graphics · 65 W'), socket: 'A', igpu: true, watt: 65, cores: 4, price: 90 },
              { id: 'c2', n: T('Prozessor Pro', 'Processor Pro'), d: T('8 Kerne · Sockel B · ohne Grafik · 120 W', '8 cores · socket B · no graphics · 120 W'), socket: 'B', igpu: false, watt: 120, cores: 8, price: 230 }],
            board: [{ id: 'b1', n: T('Mainboard A', 'Motherboard A'), d: T('für Sockel A', 'for socket A'), socket: 'A', price: 80 },
              { id: 'b2', n: T('Mainboard B', 'Motherboard B'), d: T('für Sockel B', 'for socket B'), socket: 'B', price: 130 }],
            ram: [{ id: 'r8', n: '8 GB RAM', d: T('reicht für Schule und Surfen', 'enough for school and browsing'), gb: 8, price: 25 },
              { id: 'r16', n: '16 GB RAM', d: T('für Spiele', 'for games'), gb: 16, price: 45 },
              { id: 'r32', n: '32 GB RAM', d: T('für Videoschnitt', 'for video editing'), gb: 32, price: 90 }],
            ssd: [{ id: 's1', n: 'SSD 500 GB', d: T('für Programme und Dokumente', 'for programs and documents'), gb: 500, price: 35 },
              { id: 's2', n: 'SSD 1 TB', d: T('für Spiele', 'for games'), gb: 1000, price: 60 },
              { id: 's3', n: 'SSD 2 TB', d: T('für viele Videos', 'for lots of video'), gb: 2000, price: 110 }],
            gpu: [{ id: 'g0', n: T('Keine Grafikkarte', 'No graphics card'), d: T('nutzt die Grafik im Prozessor – falls vorhanden', 'uses the graphics built into the processor – if there is one'), watt: 0, power: 0, price: 0 },
              { id: 'g1', n: T('Grafikkarte Mittel', 'Graphics card Mid'), d: T('für einfache Spiele · 150 W', 'for simple games · 150 W'), watt: 150, power: 1, price: 250 },
              { id: 'g2', n: T('Grafikkarte Stark', 'Graphics card Strong'), d: T('für Videoschnitt und Spiele · 300 W', 'for video editing and games · 300 W'), watt: 300, power: 2, price: 600 }],
            psu: [{ id: 'p4', n: T('Netzteil 400 W', 'Power supply 400 W'), d: T('reicht für sparsame PCs', 'enough for efficient PCs'), watt: 400, price: 50 },
              { id: 'p7', n: T('Netzteil 750 W', 'Power supply 750 W'), d: T('für leistungsstarke PCs', 'for powerful PCs'), watt: 750, price: 100 }]
          },
          missions: [
            { task: T('Auftrag 1: Ein Schul-PC für Texte, Internet und Videos. Budget: 400 €.', 'Brief 1: a school PC for documents, internet and videos. Budget: €400.'), budget: 400, req: [],
              solution: { cpu: 'c1', board: 'b1', ram: 'r8', ssd: 's1', gpu: 'g0', psu: 'p4' },
              hint: T('Der Prozessor Eco hat schon eine Grafik eingebaut – dann brauchst du keine Grafikkarte.', 'The Eco processor has built-in graphics – then you do not need a graphics card.'),
              why: T('Sparsam und günstig: Die eingebaute Grafik reicht für die Schule.', 'Efficient and cheap: the built-in graphics are enough for school.') },
            { task: T('Auftrag 2: Ein PC für einfache Spiele – mindestens 16 GB RAM, Grafikkarte Mittel oder besser, 1 TB SSD. Budget: 700 €.', 'Brief 2: a PC for simple games – at least 16 GB RAM, Mid graphics card or better, 1 TB SSD. Budget: €700.'), budget: 700,
              req: [{ id: 'ram', cat: 'ram', prop: 'gb', min: 16, msg: T('Für Spiele braucht es mindestens 16 GB RAM.', 'Games need at least 16 GB RAM.') },
                { id: 'gpu', cat: 'gpu', prop: 'power', min: 1, msg: T('Für Spiele brauchst du mindestens die Grafikkarte Mittel.', 'Games need at least the Mid graphics card.') },
                { id: 'ssd', cat: 'ssd', prop: 'gb', min: 1000, msg: T('Spiele sind groß – nimm mindestens 1 TB.', 'Games are big – take at least 1 TB.') }],
              solution: { cpu: 'c1', board: 'b1', ram: 'r16', ssd: 's2', gpu: 'g1', psu: 'p4' },
              hint: T('Mit dem Prozessor Eco bleibt genug Geld für die Grafikkarte übrig.', 'With the Eco processor there is enough money left for the graphics card.'),
              why: T('Gespart wird beim Prozessor, investiert in Grafik und Speicher.', 'You save on the processor and invest in graphics and storage.') },
            { task: T('Auftrag 3: Ein Videoschnitt-PC – 8 Kerne, 32 GB RAM, starke Grafikkarte, 2 TB SSD. Budget: 1400 €.', 'Brief 3: a video editing PC – 8 cores, 32 GB RAM, strong graphics card, 2 TB SSD. Budget: €1400.'), budget: 1400,
              req: [{ id: 'cores', cat: 'cpu', prop: 'cores', min: 8, msg: T('Videoschnitt braucht 8 Kerne.', 'Video editing needs 8 cores.') },
                { id: 'ram', cat: 'ram', prop: 'gb', min: 32, msg: T('Für Videoschnitt sind 32 GB RAM gefordert.', 'Video editing requires 32 GB RAM.') },
                { id: 'gpu', cat: 'gpu', prop: 'power', min: 2, msg: T('Gefordert ist die starke Grafikkarte.', 'The strong graphics card is required.') },
                { id: 'ssd', cat: 'ssd', prop: 'gb', min: 2000, msg: T('Videos brauchen viel Platz – 2 TB sind gefordert.', 'Videos need lots of space – 2 TB are required.') }],
              solution: { cpu: 'c2', board: 'b2', ram: 'r32', ssd: 's3', gpu: 'g2', psu: 'p7' },
              hint: T('Rechne die Leistung zusammen: Prozessor + Grafikkarte + 60 W für den Rest. Reicht das Netzteil?', 'Add up the power: processor + graphics card + 60 W for the rest. Is the power supply enough?'),
              why: T('Starke Teile brauchen viel Strom: 480 W – dafür ist das 750-W-Netzteil nötig.', 'Powerful parts need lots of power: 480 W – so the 750 W supply is needed.') }
          ] }
      } },
    { id: 'hw-doctor', type: 'quiz', merk: 1,
      title: T('PC-Doktor', 'PC doctor'), desc: T('Welches Teil ist schuld?', 'Which part is to blame?'),
      how: T('Lies, was mit dem Computer los ist, und tippe auf das Bauteil, das wahrscheinlich kaputt ist oder fehlt.', 'Read what is wrong with the computer and tap the part that is probably broken or missing.'),
      items: [
        { q: T('Nach dem Einschalten passiert gar nichts – kein Licht, kein Lüfter.', 'When switched on nothing happens – no light, no fan.'), opts: [{ dev: 'psu' }, { dev: 'monitor' }, { dev: 'ram' }, { dev: 'mouse' }], a: 0, why: T('Ohne Strom vom Netzteil bleibt alles dunkel.', 'Without power from the supply everything stays dark.') },
        { q: T('Der PC startet, dann erscheint: „Kein Betriebssystem gefunden“.', 'The PC starts, then shows: “No operating system found”.'), opts: [{ dev: 'ssd' }, { dev: 'gpu' }, { dev: 'psu' }, { dev: 'keyboard' }], a: 0, why: T('Das Betriebssystem liegt auf der SSD. Fehlt sie oder ist sie kaputt, findet der PC nichts zum Starten.', 'The operating system is on the SSD. If it is missing or broken, the PC finds nothing to start.') },
        { q: T('Der Mauszeiger bewegt sich nicht mehr. Alles andere geht.', 'The mouse pointer no longer moves. Everything else works.'), opts: [{ dev: 'mouse' }, { dev: 'cpu' }, { dev: 'monitor' }], a: 0, why: T('Erst das Einfachste prüfen: Kabel, Batterie oder die Maus selbst.', 'Check the simplest thing first: cable, battery or the mouse itself.') },
        { q: T('Beim Spielen geht der PC nach ein paar Minuten einfach aus. Er ist sehr heiß.', 'While gaming the PC suddenly switches off after a few minutes. It is very hot.'), opts: [{ dev: 'cooler' }, { dev: 'printer' }, { dev: 'usbstick' }, { dev: 'speaker' }], a: 0, why: T('Der Kühler schafft die Wärme nicht weg. Zum Schutz schaltet der PC ab.', 'The cooler is not removing the heat. The PC switches off to protect itself.') },
        { q: T('Die Lüfter drehen, es piept dreimal, der Bildschirm bleibt schwarz.', 'The fans spin, it beeps three times, the screen stays black.'), opts: [{ dev: 'ram' }, { dev: 'ssd' }, { dev: 'webcam' }, { dev: 'mouse' }], a: 0, why: T('Piepen beim Start ist oft ein Zeichen für Probleme mit dem Arbeitsspeicher.', 'Beeping at start-up often means a problem with the memory.') },
        { q: T('Texte schreiben klappt super, aber Spiele ruckeln stark.', 'Writing documents works fine, but games stutter badly.'), opts: [{ dev: 'gpu' }, { dev: 'keyboard' }, { dev: 'printer' }, { dev: 'psu' }], a: 0, why: T('Für Spiele ist vor allem die Grafikkarte zuständig.', 'Games depend mainly on the graphics card.') }
      ],
      levels: {
        1: { pick: { items: [0, 2, 3, 1] }, maxOpts: 3 },
        3: { add: { items: [
          { q: T('Mit vielen offenen Programmen wird der PC extrem langsam. Mit wenigen ist er schnell.', 'With many programs open the PC becomes extremely slow. With few it is fast.'), opts: [{ dev: 'ram' }, { dev: 'psu' }, { dev: 'monitor' }, { dev: 'cooler' }], a: 0, why: T('Der Arbeitsspeicher ist zu klein: Der PC muss ständig Daten auslagern.', 'Memory is too small: the PC has to keep swapping data out.') },
          { q: T('Der Start dauert ewig und man hört ein Klackern aus dem Gehäuse.', 'Start-up takes forever and you hear clicking from the case.'), opts: [{ dev: 'hdd' }, { dev: 'ssd' }, { dev: 'gpu' }, { dev: 'ram' }], a: 0, why: T('Klackern kommt vom Lesekopf einer HDD – sie könnte bald kaputtgehen. Schnell ein Backup machen!', 'Clicking comes from an HDD’s read head – it may fail soon. Make a backup quickly!') }
        ] } }
      } },
    { id: 'hw-storage', type: 'quiz', merk: 2,
      title: T('Speicher-Duell', 'Storage duel'), desc: T('SSD, HDD, RAM, USB oder Cloud?', 'SSD, HDD, RAM, USB or cloud?'),
      how: T('Welcher Speicher gewinnt? Tippe auf das passende Gerät. Mit dem i-Knopf im Merkkasten siehst du die Unterschiede.', 'Which storage wins? Tap the right device. The key facts show the differences.'),
      items: [
        { q: T('Welcher Speicher ist schneller?', 'Which storage is faster?'), opts: [{ dev: 'ssd' }, { dev: 'hdd' }], a: 0, why: T('Die SSD hat keine beweglichen Teile – sie ist viel schneller als eine HDD.', 'The SSD has no moving parts – it is much faster than an HDD.') },
        { q: T('Welcher Speicher ist nach dem Ausschalten leer?', 'Which storage is empty after switching off?'), opts: [{ dev: 'ram' }, { dev: 'ssd' }, { dev: 'usbstick' }], a: 0, why: T('Der Arbeitsspeicher braucht Strom, um Daten zu behalten.', 'Memory needs power to keep data.') },
        { q: T('Du willst dein Referat zur Schule mitnehmen – ohne Internet.', 'You want to take your presentation to school – without internet.'), opts: [{ dev: 'usbstick' }, { dev: 'ram' }, { dev: 'cloud' }], a: 0, why: T('Der USB-Stick ist tragbar und braucht kein Internet.', 'The USB stick is portable and needs no internet.') },
        { q: T('Deine Fotos sollen sicher sein, auch wenn das Handy verloren geht.', 'Your photos should be safe even if you lose your phone.'), opts: [{ dev: 'cloud' }, { dev: 'sdcard' }, { dev: 'ram' }], a: 0, why: T('Eine Kopie in der Cloud liegt woanders – sie geht mit dem Handy nicht verloren.', 'A copy in the cloud is somewhere else – it is not lost with the phone.') },
        { q: T('Du brauchst sehr viel Platz für wenig Geld, z. B. für eine Filmsammlung.', 'You need a lot of space for little money, e.g. for a film collection.'), opts: [{ dev: 'hdd' }, { dev: 'ssd' }, { dev: 'ram' }], a: 0, why: T('HDDs kosten pro Gigabyte am wenigsten.', 'HDDs cost the least per gigabyte.') },
        { q: T('Der Laptop fällt vom Tisch. Welcher Speicher übersteht das eher?', 'The laptop falls off the table. Which storage is more likely to survive?'), opts: [{ dev: 'ssd' }, { dev: 'hdd' }], a: 0, why: T('In der HDD dreht sich eine Scheibe – Stöße können sie beschädigen. Die SSD ist robust.', 'An HDD has a spinning disk – knocks can damage it. The SSD is tough.') }
      ],
      levels: {
        1: { pick: { items: [0, 1, 2, 5] } },
        3: { add: { items: [
          { q: T('Wo liegen Programme, während sie gerade laufen?', 'Where are programs while they are running?'), opts: [{ dev: 'ram' }, { dev: 'hdd' }, { dev: 'cloud' }, { dev: 'usbstick' }], a: 0, why: T('Zum Arbeiten werden Programme von der SSD in den schnellen Arbeitsspeicher geladen.', 'To run, programs are loaded from the SSD into fast memory.') },
          { q: T('Welche Sicherung folgt der 3-2-1-Regel?', 'Which backup follows the 3-2-1 rule?'), opts: [T('Original auf dem Laptop, Kopie auf einer externen Festplatte, Kopie in der Cloud', 'original on the laptop, copy on an external drive, copy in the cloud'), T('Drei Kopien im selben Ordner', 'three copies in the same folder'), T('Eine Kopie auf einem USB-Stick, der am Laptop hängt', 'one copy on a USB stick attached to the laptop')], a: 0,
            why: T('3 Kopien, 2 verschiedene Speicher, 1 an einem anderen Ort – so übersteht man auch Diebstahl oder Brand.', '3 copies, 2 different media, 1 somewhere else – that survives even theft or fire.') }
        ] } }
      } },
    { id: 'hw-size', type: 'order', merk: 3, plain: true,
      title: T('Größen-Treppe', 'Size staircase'), desc: T('Einheiten und Dateigrößen ordnen', 'Order units and file sizes'),
      how: T('Tippe die Karten von klein nach groß an. Eine Karte in deiner Reihe geht beim Antippen zurück.', 'Tap the cards from small to large. Tap a card in your row to send it back.'),
      tasks: [
        { goal: T('Ordne die Einheiten von klein nach groß.', 'Order the units from small to large.'), blocks: [B('Byte', 'var'), B('Kilobyte (KB)', 'var'), B('Megabyte (MB)', 'var'), B('Gigabyte (GB)', 'var'), B('Terabyte (TB)', 'var')],
          why: T('Jede Stufe ist etwa 1000-mal so groß wie die vorige.', 'Each step is about 1000 times the one before.'), hint: T('Kilo = tausend, Mega = Million, Giga = Milliarde, Tera = Billion.', 'Kilo = thousand, mega = million, giga = billion, tera = trillion.') },
        { goal: T('Ordne die Dateien nach ihrer Größe – die kleinste zuerst.', 'Order the files by size – smallest first.'), blocks: [B(T('Textnachricht', 'Text message'), 'op'), B(T('Handyfoto', 'Phone photo'), 'op'), B(T('Film (2 Stunden)', 'Film (2 hours)'), 'op'), B(T('Ganze Festplatte voll', 'Whole hard disk full'), 'op')],
          why: T('Etwa 100 Byte → 3 MB → 4 GB → 2 TB.', 'About 100 bytes → 3 MB → 4 GB → 2 TB.') }
      ],
      levels: {
        1: { tasks: [
          { goal: T('Ordne die Einheiten von klein nach groß.', 'Order the units from small to large.'), blocks: [B('Byte', 'var'), B('Kilobyte (KB)', 'var'), B('Megabyte (MB)', 'var'), B('Gigabyte (GB)', 'var')],
            why: T('Byte ist am kleinsten, Gigabyte am größten.', 'Byte is the smallest, gigabyte the largest.'), hint: T('Kilo ist klein, Mega größer, Giga am größten.', 'Kilo is small, mega bigger, giga the biggest.') },
          { goal: T('Was ist am kleinsten? Ordne von klein nach groß.', 'What is smallest? Order from small to large.'), blocks: [B(T('Textnachricht', 'Text message'), 'op'), B(T('Handyfoto', 'Phone photo'), 'op'), B(T('Film', 'Film'), 'op')],
            why: T('Text ist winzig, ein Foto größer, ein Film riesig.', 'Text is tiny, a photo bigger, a film huge.') }
        ] },
        3: { tasks: [
          { goal: T('Ordne von klein nach groß.', 'Order from small to large.'), blocks: [B('Bit', 'var'), B('Byte', 'var'), B('Kilobyte (KB)', 'var'), B('Megabyte (MB)', 'var'), B('Gigabyte (GB)', 'var'), B('Terabyte (TB)', 'var'), B('Petabyte (PB)', 'var')],
            why: T('8 Bit = 1 Byte, danach jeweils etwa mal 1000.', '8 bits = 1 byte, then about times 1000 each step.') },
          { goal: T('Ordne nach der Größe – die kleinste zuerst.', 'Order by size – smallest first.'), blocks: [B(T('Ein Buchstabe (1 Byte)', 'One letter (1 byte)'), 'op'), B(T('Eine Seite Text (≈ 3 KB)', 'One page of text (≈ 3 KB)'), 'op'), B(T('Ein Handyfoto (≈ 3 MB)', 'A phone photo (≈ 3 MB)'), 'op'), B(T('Ein Spiel (≈ 50 GB)', 'A game (≈ 50 GB)'), 'op'), B(T('Eine große Festplatte (≈ 4 TB)', 'A large hard disk (≈ 4 TB)'), 'op')],
            why: T('Von Byte über KB, MB und GB bis TB.', 'From bytes via KB, MB and GB to TB.') },
          { goal: T('Ordne die Speicher nach der Zugriffsgeschwindigkeit – den schnellsten zuerst.', 'Order the storage by access speed – fastest first.'), blocks: [B(T('Arbeitsspeicher (RAM)', 'Memory (RAM)'), 'var'), B('SSD', 'var'), B(T('Festplatte (HDD)', 'Hard disk (HDD)'), 'var'), B(T('Cloud über das Internet', 'Cloud over the internet'), 'var')],
            why: T('RAM ist am schnellsten, die Cloud hängt von der Internetverbindung ab.', 'RAM is fastest, the cloud depends on the internet connection.') }
        ] }
      } },
    { id: 'hw-os', type: 'sort', merk: 4,
      title: T('Betriebssystem oder Anwendung?', 'Operating system or application?'), desc: T('Wer erledigt welche Aufgabe?', 'Which software does which job?'),
      how: T('Ziehe die Aufgabe zu der Software, die sie erledigt.', 'Drag the task to the software that does it.'),
      task: T('Wer erledigt diese Aufgabe?', 'Who does this job?'),
      buckets: [{ id: 'os', t: T('Betriebssystem', 'Operating system'), sub: T('Grundsoftware', 'basic software') }, { id: 'app', t: T('Anwendung', 'Application'), sub: T('Programm für deine Aufgabe', 'program for your task') }],
      items: [
        { t: T('Dateien und Ordner verwalten', 'Manage files and folders'), b: 'os', why: T('Ordnen, kopieren, löschen – das macht das Betriebssystem.', 'Sorting, copying, deleting – the operating system does that.') },
        { t: T('Einen Brief schreiben', 'Write a letter'), b: 'app', why: T('Dafür nutzt du eine Textverarbeitung – ein Anwendungsprogramm.', 'You use a word processor for that – an application.') },
        { t: T('Arbeitsspeicher an Programme verteilen', 'Share out memory between programs'), b: 'os', why: T('Das Betriebssystem teilt die Hardware auf.', 'The operating system shares out the hardware.') },
        { t: T('Webseiten anzeigen', 'Show web pages'), b: 'app', why: T('Das macht der Browser, ein Anwendungsprogramm.', 'The browser does that – an application.') },
        { t: T('Benutzerkonten mit Passwort verwalten', 'Manage user accounts with passwords'), b: 'os', why: T('Wer sich anmelden darf, regelt das Betriebssystem.', 'The operating system controls who may log in.') },
        { t: T('Fotos bearbeiten', 'Edit photos'), b: 'app', why: T('Dafür gibt es Bildbearbeitungsprogramme.', 'There are photo editing programs for that.') },
        { t: T('Den Drucker ansteuern', 'Control the printer'), b: 'os', why: T('Das Betriebssystem spricht über Treiber mit den Geräten.', 'The operating system talks to devices through drivers.') },
        { t: T('Eine Präsentation erstellen', 'Create a presentation'), b: 'app', why: T('Ein Präsentationsprogramm ist eine Anwendung.', 'A presentation program is an application.') }
      ],
      levels: {
        1: { pick: { items: [0, 1, 3, 4, 5, 7] } },
        3: { add: { items: [
          { t: T('Programme starten und beenden', 'Start and close programs'), b: 'os', why: T('Starten und Beenden von Programmen organisiert das Betriebssystem.', 'The operating system organises starting and closing programs.') },
          { t: T('Sicherheitsupdates für das ganze System einspielen', 'Install security updates for the whole system'), b: 'os', why: T('Systemupdates schließen Sicherheitslücken des Betriebssystems.', 'System updates close security holes in the operating system.') },
          { t: T('Noten in einer Tabelle berechnen', 'Calculate grades in a spreadsheet'), b: 'app', why: T('Eine Tabellenkalkulation ist ein Anwendungsprogramm.', 'A spreadsheet is an application.') }
        ] } }
      } }
  ]
});
