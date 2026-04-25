export const questions = [
  {
    text: "What is the main purpose of React?",
    options: [
      "Managing operating systems",
      "Building user interfaces",
      "Hosting databases",
      "Sending email campaigns"
    ],
    correctAnswerIndex: 1
  },
  {
    text: "What is Vite used for in this project?",
    options: [
      "A build tool and local development server",
      "A database engine",
      "A payment provider",
      "A monitoring dashboard"
    ],
    correctAnswerIndex: 0
  },
  {
    text: "What does Express provide in the backend?",
    options: [
      "HTTP routes and middleware",
      "Browser rendering",
      "CSS animations",
      "Static image editing"
    ],
    correctAnswerIndex: 0
  },
  {
    text: "Why does the backend read process.env.PORT?",
    options: [
      "So Render can provide the runtime port",
      "So students can choose a port",
      "So questions are stored permanently",
      "So React can compile faster"
    ],
    correctAnswerIndex: 0
  },
  {
    text: "What does in-memory game state mean?",
    options: [
      "Game state is stored only in the backend process RAM",
      "Game state is stored in PostgreSQL",
      "Game state is stored in Redis",
      "Game state is stored in the browser URL"
    ],
    correctAnswerIndex: 0
  },
  {
    text: "Which Socket.io event submits a student answer?",
    options: [
      "join-game",
      "submit-answer",
      "players-updated",
      "game-ended"
    ],
    correctAnswerIndex: 1
  },
  {
    text: "How long is each timed question?",
    options: [
      "10 seconds",
      "20 seconds",
      "30 seconds",
      "60 seconds"
    ],
    correctAnswerIndex: 2
  },
  {
    text: "What happens when a student answers correctly very quickly?",
    options: [
      "They receive more points than a slow correct answer",
      "They receive no points",
      "The game restarts",
      "The question is deleted"
    ],
    correctAnswerIndex: 0
  },
  {
    text: "What does the frontend environment variable configure?",
    options: [
      "The backend service URL",
      "The database password",
      "The browser language",
      "The Git branch"
    ],
    correctAnswerIndex: 0
  },
  {
    text: "What does the backend FRONTEND_URL variable help configure?",
    options: [
      "CORS access for the frontend",
      "The maximum question score",
      "The number of questions",
      "The package manager"
    ],
    correctAnswerIndex: 0
  },
  {
    text: "Which Render service type should host the frontend?",
    options: [
      "Static Site",
      "PostgreSQL",
      "Redis",
      "Background Worker only"
    ],
    correctAnswerIndex: 0
  },
  {
    text: "Which Render service type should host the backend?",
    options: [
      "Web Service",
      "Static Site",
      "Object Storage",
      "Cron Job only"
    ],
    correctAnswerIndex: 0
  },
  {
    text: "What is a monorepo in this project?",
    options: [
      "One repository containing both frontend and backend code",
      "One repository containing only screenshots",
      "One repository without package files",
      "One repository for a single HTML file"
    ],
    correctAnswerIndex: 0
  },
  {
    text: "What happens during the transition between questions?",
    options: [
      "Answers are closed and the next question is prepared",
      "Students can answer twice",
      "The game code changes",
      "The backend switches to a database"
    ],
    correctAnswerIndex: 0
  },
  {
    text: "What happens to active games if the backend restarts?",
    options: [
      "Active games are lost because state is only in memory",
      "Active games are restored from Redis",
      "Active games are restored from a database",
      "Active games move to the frontend automatically"
    ],
    correctAnswerIndex: 0
  }
];
