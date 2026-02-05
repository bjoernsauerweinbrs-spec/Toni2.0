# Module — TONI 2.0

Dieses Dokument beschreibt alle Hauptmodule von TONI 2.0, ihre Aufgaben, Grenzen und Verantwortlichkeiten.

---

## Arena

Das Arena‑Modul bildet das Taktikboard ab.

**Funktionen**
- Spielfeldvarianten (Standard, Funino, Halle, Training)
- Spieler platzieren und bewegen
- Linien, Pfeile, Marker
- Zonen und Formen
- Animationen (optional)
- Exportfunktionen (optional)

**Ziel**
Schnelles, intuitives taktisches Arbeiten.

---

## Team

Das Team‑Modul verwaltet alle Spieler und Mannschaften.

**Funktionen**
- Spielerlisten
- Setcards
- Attribute, Rollen, Positionen
- Medienverwaltung
- Kaderübersichten
- Sortierung & Filter

**Ziel**
Klare, strukturierte Teamorganisation.

---

## Training

Das Trainingsmodul bildet Übungen und Trainingspläne ab.

**Funktionen**
- Übungen anlegen
- Kategorien & Tags
- Trainingspläne erstellen
- Drag & Drop Planung
- Medien & Zeichnungen
- Exportfunktionen (optional)

**Ziel**
Schnelle Planung und Dokumentation von Trainingseinheiten.

---

## Analyse

Das Analyse‑Modul dient der Auswertung von Spielszenen.

**Funktionen**
- Szenen importieren
- Sequenzen erstellen
- Marker setzen
- Kategorien & Tags
- Exportfunktionen

**Ziel**
Strukturierte Analyse von Spielsituationen.

---

## Assets

Das Asset‑Modul stellt Medien bereit.

**Struktur**
- icons/
- fields/
- demo-players/
- placeholders/

**Ziel**
Saubere Trennung aller Medien.

---

## Services

Services kapseln Logik und Datenhaltung.

**Beispiele**
- storage.service
- seed.service
- team.service
- analysis.service

**Ziel**
UI und Logik strikt trennen.

---

## Utils

Kleine Hilfsfunktionen.

**Beispiele**
- ID‑Generator
- Formatierungen
- Validierungen

**Ziel**
Wiederverwendbare Logik ohne Abhängigkeiten.
