# Original User Request

## 2026-09-02T14:38:15Z

Digitalizzazione integrale, popolamento del database MongoDB e presentazione frontend del menù reale e completo di "Il Veliero — Ristorante & Pizzeria dal Campione del Mondo" (Bassano del Grappa), trascritto fedelmente dalle 29 fotografie in `materiale_utile/menu/` (Pesce, Carne, Piatti Estivi, Contorni e Coperto, Pizze del Campione con Pizze di Stagione in evidenza, Insalatone Gourmet dedicate, Caffetteria, Bibite, Birre Artigianali, Distillati e Carta dei Vini completa con note enologiche e allergeni ufficiali 1-14).

Working directory: c:/Users/borto/Documents/SitoVeliero
Integrity mode: development

## Requirements

### R1. Trascrizione Integrale & Dati Reali da Foto (`materiale_utile/menu/`)
- Trascrivere e strutturare fedelmente nel seed e nel database ogni voce delle 29 fotografie:
  1. **Specialità Pesce**:
     - *Antipasti*: Schie fritte e polenta (€10), Sardine dell'Adriatico fritte (€8), Alici marinate in Olio EVO (€9), Cozze nostrane e vongole alla tarantina (€20), Impepata di cozze nostrane (€14), Capesante nostrane al brandy 3pz (€15), Vassoio di Mare (€20), Insalata di mare (€17).
     - *Crudo di Pesce*: 6/12 Scampetti (€14/28), Tartare di tonno pinne gialle (€15/28), Tartare di gambero rosso (€16), Gambero rosso di Mazara del Vallo (€3,50 al pezzo), Ostriche nostrane (€4 al pezzo), Carpaccio di salmone norvegese pescato (€16), Carpaccio di pesce spada (€14).
     - *Primi di Pesce*: Spaghetti con vongole veraci (€18), Linguine allo scoglio (€22), Risotto alla pescatora con capasanta reale min. 2 pers (€23 a persona).
     - *Secondi di Pesce*: Fritto misto reale (€22), Tris Il Veliero (€18), Piatto "De Chioggia" (€36), Filetto di branzino pescato alla griglia con patate (€20), Grigliata di pesce per 2 persone (€46), Calamari nostrani in umido con polenta morbida (€18).
     - *Pescato della Settimana (foglio a mano)*: Crostoni pane pizza con crema di dentice (€9), 6 canocce crude (€7), Paccheri freschi al pesto con mazzancolle e ricotta affumicata (€16,50), Tagliata di tonno pinne gialle con patate al forno (€24), Soaso intero pescato alla griglia con patate al forno (€30).
  2. **Tradizione Carne**:
     - *Antipasti*: Filetto di bresaola petto d'anca con rucola e grana (€10), Antipasto all'italiana con affettati misti, formaggio stagionato e sott'aceti (€12).
     - *Primi*: Tagliolini all'uovo con sugo di pomodoro o ragù di manzo (€10), Spaghetti alla carbonara (€12), Gnocchi di patate al ragù o pomodoro (€10).
     - *Secondi*: Tagliata di manzo al rosmarino con patate e polenta abbrustolita (€24), Braccioline d'agnello scalzate alla griglia con patate (€18), Cotoletta di maiale con patate (€10), Petto di pollo alla griglia (€10).
  3. **Piatti Estivi**:
     - Cous cous con verdure e mazzancolle (€14), Roast-beef di Black Angus all'inglese o con rucola e grana (€16), Caprese con pomodori cuore di bue e mozzarelline fior di latte (€13).
  4. **Contorni & Coperto**:
     - Patate al forno (€4,50), Patate fritte (€5), Macedonia di verdure cotte al forno (€5), Contorno di stagione (€6 - €8), Insalata mista (€5), Coperto (€3,00). Nota: *Non si effettuano modifiche*.
  5. **Insalatone Gourmet** (Sezione dedicata):
     - #CINZIA (€12), #MARA (€12), #FABIOLA (€14), #MELODY con 250g Burrata Pugliese (€14), #RAFFAELLA (€14), #IRENE con salmone marinato (€15).
  6. **Pizze del Campione**:
     - *Pizze di Stagione - Finferli freschi* (Sezione in evidenza al primo posto): #70, #71, #72, #73, #74, #75, #76, #77, #78, #79, #80 (€13,50 - €16,00).
     - *Pizze Classiche*: Margherita (€6), Romana (€8,50), Diavola (€9), Capricciosa (€12), Rustica (€10), Prateria (€12), Siciliana (€12), Bufalona (€9), 4 Formaggi (€13), Estiva (€13).
     - *Pizze della Casa / Ricercate*: Palladio (€13), Ariete (€12), Mazzancolle (€11), Frutti di Mare (€18), Nemo (€15), Speciale (€15), La Classica (€14), Valtellina (€17), Silvia (€9), Parmigiana (€14), Latis (€13), Burratina (€14), Altopiano (€14), Totti (€14), Barbie (€13), Lupen (€13), Taiti (€12), Zorro (€10,50), Zola (€10,50), Cassiopea (€14).
     - *Pizze Speciali*: Atomica (€17), Buongustaia (€16), Pifferaia (€13), Giulia (€13), Tropea (€14), Vesuvio (€14), Greca (€14), Billy (€14), Campione (€14,50) + Speciali a penna (W385 €15, 2024 €12,50, 2025 €12, 2026 €12, 2027 €13).
     - *Pizze Bianche*: Montecarlo (€14,50), Odissea (€13), Bianca (€13), Sara (€11), Barbarossa (€11).
     - *Verdure*: Porcini (€9,50), Verdure ai ferri (€13), Zucchine (€9), Melanzane (€9), Peperoni (€9).
  7. **Vini & Bevande**:
     - *Caffetteria & Bibite*: Espresso (€1,30), Macchiato, Corretto, Cappuccino, Macchiatone, Decaffeinato, Orzo, Ginseng; Acqua Levico 75cl (€2,50), Coca, Lemonsoda, Fanta, The pesca/limone, Birra Beck's 0.20L/0.40L (€3/€6).
     - *Birre Artigianali*: Leffe Rossa 0.33L (€4), Valdesteiner Rossa 0.5L (€7), Valdesteiner Keller 0.5L (€7), Schinner Edel-Weisse 0.5L (€7), Leffe Ambrata 0.75L (€9).
     - *Vino della Casa*: Chardonnay/Cabernet alla spina (1/4L €3, 1/2L €5, 1L €10), Cuvée extra dry (1/4L €4,50, 1/2L €9), Glera (1/4L €3, 1/2L €6, 1L €12).
     - *Amari & Grappe Venete*: Braulio, Averna, Unicum, Montenegro, Fernet, Brancamenta, Lucano, Sambuca, Prugna Ciemme, Vecchia Romagna, Stravecchio, Grand Marnier, S.Marzano, Liquirizia, Limoncello (€4); Grappa Nardini (€4), Nardini Riserva (€4,50), Tagliatella (€4), Sarpa Poli (€4), Sarpa Oro (€4,50), Prime Uve (€4,50), Storica Nera (€5,50).
     - *Carta dei Vini Completa*:
       - Bollicine Metodo Charmat: Bortoluz Prosecco Valdobbiadene Brut (€20), Extra Dry (€20), Bonato Il Veliero Cuvée Extra Dry (€14); Charles de Courcelle Champagne Brut (€50).
       - Bollicine Metodo Classico Italiano: Altinum Trento DOC Brut 2021 (€30), Pas Dosè (€30); Romantica Franciacorta Brut 2021 (€35); Freccianera Saten 2021 (€36), Nature 2021 (€40); Luca Bellani Sessanta (€40).
       - Bianchi: Lugana DOC Tenuta Soraighe (€20), Custoza Monte Zovo (€14), Soave DOC (€14), Pinot Grigio Delle Venezie (€14); Gewurztraminer Aldeno (€22), Muller Thurgau Aldeno (€20); Ribolla Gialla Reguta (€22), Sauvignon Reguta (€22); Ca Brusade Chardonnay 2023 (€18); Emilio Primo IGT Toscana (€25/S.Q.), Papeo 2023 IGT Toscana (€25/S.Q.); Renadoro Vermentino di Gallura (€26); Grillo Sicilia Nino Gandolfo (€22); Alice Verdeca Manduria (€20).
       - Rossi: Col Dovigo Bragetti 2018 Merlot (€30); Monte Zovo Valpolicella DOC (€18).
       - Rosati: Aka Salento Primitivo Rosato (€22); Bonato Rosato frizzante (€15).

### R2. Tabella Ufficiale Allergeni 1-14
- Mappare ogni piatto con i numeri esatti da 1 a 14 corrispondenti al cartello fotografato:
  `1: Pesce`, `2: Crostacei`, `3: Molluschi`, `4: Glutine`, `5: Uova`, `6: Latte`, `7: Sedano`, `8: Senape`, `9: Sesamo`, `10: Frutta a guscio`, `11: Arachidi`, `12: Solfiti`, `13: Lupini`, `14: Soia`.
- Mostrare i badge numerici e descrittivi in stile sobrio Dishoom.

### R3. Aggiornamento Backend, Seed e Database MongoDB
- Aggiornare `backend/src/models/MenuItem.ts` abilitando le categorie `['pesce', 'carne', 'contorni', 'pizze', 'vini', 'bevande', 'insalatone', 'piatti_estivi']`.
- Aggiornare il file di seed `backend/src/seed/seed.ts` sostituendo i vecchi piatti fittizi con l'intero catalogo reale.
- Eseguire il seed all'interno del container Docker `ilveliero-backend` per popolare MongoDB in modo idempotente.

### R4. Esperienza Utente & Frontend Menù Dishoom
- Aggiornare la barra categorie in `frontend/src/app/features/public/menu/menu.component.ts`:
  - `TUTTI I PIATTI`
  - `SPECIALITÀ PESCE`
  - `PIZZE DEL CAMPIONE` (con le Pizze di Stagione ai Finferli in evidenza all'inizio)
  - `INSALATONE` (sezione dedicata per le 6 insalatone gourmet)
  - `PIATTI ESTIVI`
  - `TRADIZIONE CARNE`
  - `CONTORNI`
  - `VINI & BEVANDE` (con filtri interni: Carta dei Vini, Birre Artigianali, Caffè & Bibite, Grappe & Amari)
- Garantire che la ricerca testuale, il filtro allergeni e il layout a doppia colonna con dot leaders funzionino istantaneamente su tutte le nuove voci.

## Acceptance Criteria

### Dati Menù Completi & Verificabili
- [ ] Il database MongoDB contiene tutte le voci reali fotografate (oltre 100 tra piatti, pizze, vini e bevande).
- [ ] Nessun piatto fittizio o residuo rimane nel database.
- [ ] Ogni piatto ha prezzo corretto in Euro, categoria, sottocategoria, descrizione dettagliata e lista allergeni coerente con la tabella 1-14.
- [ ] Le Pizze di Stagione ai Finferli sono visibili come prima sezione dentro 'Pizze del Campione'.
- [ ] Le Insalatone hanno la loro categoria dedicata 'Insalatone'.
- [ ] I filtri per categoria e allergeni nella pagina `/menu` filtrano correttamente i piatti reali senza errori nella console.
- [ ] Il frontend si compila in produzione (`docker compose build frontend`) senza alcun warning o errore TypeScript.

## 2026-09-03T18:45:25Z

Implementazione del restyling Dishoom per la Homepage de "Il Veliero":
1. **Hero Video con Animazione Scroll-Expansion a Tutto Schermo & 4 Angoli Perfetti**:
   - Sfondo unificato monocolore blu notte profondo (`#07192F`) senza linee bianche o separatori visibili tra navbar ed hero.
   - A sinistra: solo l'incisione dorata del Veliero (`app-veliero-ship`), priva di scritte e testi descrittivi sotto di essa.
   - A destra: riquadro video in formato rettangolare 16:9 proporzionato allo schermo, privo di cornici, bordi spessi o pulsanti/badge aggiuntivi, con solo la citazione d'autore.
   - Allo scroll (GSAP ScrollTrigger):
     - Il video si espande in modo fluido e non uniforme fino a far combaciare perfettamente i suoi 4 angoli con i 4 angoli dell'intera sezione hero / schermo (`x: leftOffset`, `y: topOffset`, `scaleX: fullWidth`, `scaleY: fullHeight`).
     - Il Veliero a sinistra si rimpicciolisce proporzionalmente mantenendo rigorosamente fisso il punto in basso a sinistra (`transformOrigin: 'bottom left'`).
     - La citazione poetica d'autore rimane **fissa, della stessa dimensione (non si ingrandisce o deforma)** e si autocentra elegantemente al centro del video espanso.
2. **Navbar Minimalista & Fissa**:
   - Fissa in cima allo schermo (`position: fixed; top: 0; left: 0; right: 0; z-index: 1000`) senza linee o bordi di stacco.
   - Logo *"Il Veliero"* in corsivo elegante.
   - Voci di navigazione senza duplicati: `MENÙ`, `PESCATO`, `STORIA`, `EVENTI`, `DOVE SIAMO`, oltre ad `Area Riservata` e pulsante rapido `[ Prenota Tavolo ]`.
3. **Sezione Editoriale Dishoom ("Dichiarazione d'Amore per il Mare")**:
   - Titolo centrato e introduzione in corsivo.
   - Composizione asimmetrica a 2 colonne con foto autentiche e didascalie vintage (`SOPRA: ...`, `A DESTRA: ...`).
   - 3 Card Archivio Dishoom per Menù, Diario di Bordo e Dove Siamo.

Working directory: `c:\Users\borto\Documents\SitoVeliero`

## Requirements

### R1. Rimozione Elementi Segnati con X Rossa
- [x] Eliminata la linea bianca di separazione tra navbar e sezione blu.
- [x] Eliminate tutte le scritte e il testo sotto il Veliero (rimasta solo l'incisione dorata).
- [x] Eliminati i bordi, l'outline e le ombre spesse dal riquadro video.
- [x] Eliminato il badge con stelle e i due pulsanti dentro il riquadro video (lasciata solo la citazione).

### R2. Animazione Video & Citazione Fissa
- [x] Video 16:9 con espansione fluida calcolata per far combaciare i suoi 4 angoli con i 4 angoli dell'intera schermata.
- [x] Citazione fissa a dimensione reale (`scale: 1`) con ricentratura fluida dinamica sopra il video espanso.
- [x] Veliero che si rimpicciolisce ancorato saldamente in basso a sinistra (`transformOrigin: 'bottom left'`).

## Acceptance Criteria
- [x] Zero errori di compilazione TypeScript/SCSS in produzione.
- [x] Tutti i container Docker attivi ed *healthy*.
