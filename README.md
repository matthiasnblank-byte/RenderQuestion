# RenderQuestion

Eine einfache Kahoot-aehnliche Web-App fuer eine Lehrveranstaltung mit ca. 30 Studierenden und 15 Beispiel-Fragen.

Das Projekt ist ein Monorepo mit zwei getrennten Apps:

```text
quiz-game/
  frontend/
    package.json
    index.html
    src/
      main.jsx
      App.jsx
      styles.css
  backend/
    package.json
    src/
      server.js
      questions.js
  README.md
```

## Technischer Aufbau

- Frontend: React, Vite, socket.io-client
- Backend: Node.js, Express, Socket.io, CORS
- Persistenz: keine Datenbank, kein Redis, kein Cache, kein externer Persistenzdienst
- Spielzustand: ausschliesslich im RAM des Backend-Prozesses in `const games = new Map()`
- Bei einem Backend-Neustart gehen laufende Spiele verloren

## Lokal starten

Oeffne zwei Terminals: eins fuer das Backend und eins fuer das Frontend.

### Backend lokal starten

```bash
cd backend
npm install
npm run dev
```

Alternativ ohne Nodemon:

```bash
cd backend
npm install
npm start
```

Das Backend laeuft lokal standardmaessig auf:

```text
http://localhost:4000
```

### Frontend lokal starten

```bash
cd frontend
npm install
npm run dev
```

Das Frontend laeuft lokal standardmaessig auf:

```text
http://localhost:5173
```

## Environment Variables

### Backend

Das Backend nutzt:

```text
FRONTEND_URL=http://localhost:5173
PORT=4000
```

`PORT` muss nicht lokal gesetzt werden, weil der Server automatisch `4000` als Fallback nutzt. Auf Render wird `PORT` automatisch gesetzt und vom Server ueber `process.env.PORT` verwendet.

Beispiel:

```bash
cd backend
FRONTEND_URL=http://localhost:5173 npm run dev
```

### Frontend

Das Frontend nutzt:

```text
VITE_BACKEND_URL=http://localhost:4000
```

Lokal ist dieser Wert bereits als Fallback im Code gesetzt. Optional kann im Ordner `frontend` eine `.env`-Datei angelegt werden:

```text
VITE_BACKEND_URL=http://localhost:4000
```

## Bedienung

1. Im Browser die Dozentenansicht oeffnen.
2. `Spiel erstellen` klicken.
3. Den sechsstelligen Spielcode an Studierende weitergeben.
4. Studierende wechseln in die Studierendenansicht, geben Spielcode und Namen ein und treten bei.
5. Dozent startet das Spiel.
6. Studierende waehlen pro Frage genau eine Antwort.
7. Dozent sieht Teilnehmer, Antwortzahlen, Punktestand und Endergebnis live.

## API und Socket.io Events

REST:

- `POST /api/games` erstellt ein neues Spiel und gibt einen sechsstelligen Spielcode zurueck.

Socket.io Events:

- `join-game`
- `start-game`
- `next-question`
- `submit-answer`
- `players-updated`
- `question-updated`
- `scores-updated`
- `game-ended`
- `error-message`

Zusaetzlich sendet das Backend `answer-feedback`, damit Studierende nach dem Antworten direkt Feedback bekommen.

## Render Deployment

Beide Render-Services verwenden dasselbe GitHub-Repository. Der Unterschied liegt in den Root Directories.

### Backend als Render Web Service

In Render einen neuen Web Service aus demselben GitHub-Repository anlegen:

```text
Root Directory: backend
Build Command: npm install
Start Command: npm start
```

Environment Variable:

```text
FRONTEND_URL = URL der Render Static Site
```

Beispiel:

```text
FRONTEND_URL=https://dein-quiz-frontend.onrender.com
```

### Frontend als Render Static Site

In Render eine neue Static Site aus demselben GitHub-Repository anlegen:

```text
Root Directory: frontend
Build Command: npm install && npm run build
Publish Directory: dist
```

Environment Variable:

```text
VITE_BACKEND_URL = URL des Render Web Service
```

Beispiel:

```text
VITE_BACKEND_URL=https://dein-quiz-backend.onrender.com
```

## Zwei Render Services aus demselben Repo

1. GitHub-Repository in Render verbinden.
2. Ersten Service als `Web Service` erstellen.
3. Als Root Directory `backend` setzen.
4. Build Command `npm install` setzen.
5. Start Command `npm start` setzen.
6. `FRONTEND_URL` nach Erstellung der Static Site eintragen.
7. Zweiten Service als `Static Site` erstellen.
8. Dasselbe GitHub-Repository auswaehlen.
9. Als Root Directory `frontend` setzen.
10. Build Command `npm install && npm run build` setzen.
11. Publish Directory `dist` setzen.
12. `VITE_BACKEND_URL` auf die Backend-Web-Service-URL setzen.

Wichtig: Da der gesamte Spielzustand nur im RAM des Backend-Prozesses liegt, sollte der Backend-Service fuer laufende Spiele nicht horizontal skaliert werden. Ein Neustart beendet laufende Spiele.
