export const questions = [
  {
    text: "Was ist die Hauptaufgabe von React?",
    options: [
      "Datenbanken verwalten",
      "Benutzeroberflaechen bauen",
      "Server konfigurieren",
      "Betriebssysteme installieren"
    ],
    correctAnswerIndex: 1
  },
  {
    text: "Wofuer wird Vite in diesem Projekt genutzt?",
    options: [
      "Als Build-Tool und Dev-Server",
      "Als Datenbank",
      "Als CSS-Framework",
      "Als Authentifizierungsdienst"
    ],
    correctAnswerIndex: 0
  },
  {
    text: "Welche Aufgabe hat Express im Backend?",
    options: [
      "PDF-Dateien rendern",
      "HTTP-Routen bereitstellen",
      "React-Komponenten kompilieren",
      "Bilder komprimieren"
    ],
    correctAnswerIndex: 1
  },
  {
    text: "Warum nutzt der Server process.env.PORT?",
    options: [
      "Damit Render den Port vorgeben kann",
      "Damit der Browser schneller laedt",
      "Damit Socket.io deaktiviert wird",
      "Damit Fragen gespeichert werden"
    ],
    correctAnswerIndex: 0
  },
  {
    text: "Was bedeutet RAM-only State in dieser App?",
    options: [
      "Der Zustand liegt nur im Backend-Speicher",
      "Der Zustand liegt in einer SQL-Datenbank",
      "Der Zustand wird in Redis gespeichert",
      "Der Zustand wird im GitHub-Repo gespeichert"
    ],
    correctAnswerIndex: 0
  },
  {
    text: "Welches Socket.io-Event sendet eine Antwort ab?",
    options: [
      "join-game",
      "submit-answer",
      "scores-updated",
      "game-ended"
    ],
    correctAnswerIndex: 1
  },
  {
    text: "Wie viele Punkte gibt es pro richtiger Antwort?",
    options: [
      "10",
      "50",
      "100",
      "1000"
    ],
    correctAnswerIndex: 2
  },
  {
    text: "Was verhindert die App pro Frage?",
    options: [
      "Mehr als eine Antwort pro Teilnehmer",
      "Mehr als vier Teilnehmer",
      "Mehr als eine Frage insgesamt",
      "Mehr als einen Dozenten"
    ],
    correctAnswerIndex: 0
  },
  {
    text: "Welche Environment Variable braucht das Frontend?",
    options: [
      "DATABASE_URL",
      "REDIS_URL",
      "VITE_BACKEND_URL",
      "FRONTEND_URL"
    ],
    correctAnswerIndex: 2
  },
  {
    text: "Welche Environment Variable braucht das Backend fuer CORS?",
    options: [
      "FRONTEND_URL",
      "VITE_BACKEND_URL",
      "CACHE_URL",
      "QUIZ_SECRET"
    ],
    correctAnswerIndex: 0
  },
  {
    text: "Welcher Render-Service passt zum Frontend?",
    options: [
      "PostgreSQL",
      "Static Site",
      "Redis",
      "Cron Job"
    ],
    correctAnswerIndex: 1
  },
  {
    text: "Welcher Render-Service passt zum Backend?",
    options: [
      "Web Service",
      "Static Site",
      "Private Service ohne Port",
      "Disk Storage"
    ],
    correctAnswerIndex: 0
  },
  {
    text: "Was ist ein Monorepo in diesem Kontext?",
    options: [
      "Ein Repo mit Frontend und Backend",
      "Ein Repo nur fuer Bilder",
      "Ein Repo ohne package.json",
      "Ein Repo fuer genau eine Datei"
    ],
    correctAnswerIndex: 0
  },
  {
    text: "Was macht das Event next-question?",
    options: [
      "Es zeigt die naechste Frage an",
      "Es loescht alle Teilnehmer",
      "Es erstellt ein neues GitHub-Repo",
      "Es installiert Abhaengigkeiten"
    ],
    correctAnswerIndex: 0
  },
  {
    text: "Was passiert bei einem Backend-Neustart?",
    options: [
      "Laufende Spiele gehen verloren",
      "Alle Spiele werden aus Redis geladen",
      "Alle Punkte bleiben in einer Datenbank",
      "Render startet automatisch ein Frontend-Spiel"
    ],
    correctAnswerIndex: 0
  }
];
