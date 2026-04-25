import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import { questions } from "./questions.js";

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 4000;
const FRONTEND_URL = process.env.FRONTEND_URL;

const allowedOrigins = [
  FRONTEND_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173"
].filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST"]
};

app.use(cors(corsOptions));
app.use(express.json());

const io = new Server(server, {
  cors: corsOptions
});

export const games = new Map();

function createGameCode() {
  let code;
  do {
    code = String(Math.floor(100000 + Math.random() * 900000));
  } while (games.has(code));
  return code;
}

function publicQuestion(game) {
  if (game.currentQuestionIndex < 0 || game.currentQuestionIndex >= questions.length) {
    return null;
  }

  const question = questions[game.currentQuestionIndex];
  return {
    index: game.currentQuestionIndex,
    total: questions.length,
    text: question.text,
    options: question.options
  };
}

function answerCounts(game) {
  const answers = game.answersByQuestion.get(game.currentQuestionIndex) || new Map();
  const counts = [0, 0, 0, 0];

  for (const answer of answers.values()) {
    if (typeof answer.answerIndex === "number") {
      counts[answer.answerIndex] += 1;
    }
  }

  return counts;
}

function leaderboard(game) {
  return [...game.players]
    .map((player) => ({
      id: player.id,
      name: player.name,
      score: game.scores[player.id] || 0
    }))
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
}

function emitPlayers(game) {
  io.to(game.gameCode).emit("players-updated", {
    gameCode: game.gameCode,
    players: game.players
  });
}

function emitScores(game) {
  io.to(game.gameCode).emit("scores-updated", {
    gameCode: game.gameCode,
    scores: leaderboard(game)
  });
}

function emitQuestion(game) {
  const question = publicQuestion(game);
  io.to(game.gameCode).emit("question-updated", {
    gameCode: game.gameCode,
    status: game.status,
    question,
    answerCounts: question ? answerCounts(game) : [0, 0, 0, 0],
    answeredPlayerIds: question
      ? [...(game.answersByQuestion.get(game.currentQuestionIndex) || new Map()).keys()]
      : []
  });
}

function endGame(game) {
  game.status = "ended";
  io.to(game.gameCode).emit("game-ended", {
    gameCode: game.gameCode,
    scores: leaderboard(game)
  });
}

function getGameOrEmit(socket, gameCode) {
  const normalizedCode = String(gameCode || "").trim();
  const game = games.get(normalizedCode);

  if (!game) {
    socket.emit("error-message", "Spiel wurde nicht gefunden.");
    return null;
  }

  return game;
}

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.post("/api/games", (req, res) => {
  const gameCode = createGameCode();
  const game = {
    gameCode,
    players: [],
    currentQuestionIndex: -1,
    answersByQuestion: new Map(),
    scores: {},
    status: "lobby"
  };

  games.set(gameCode, game);

  res.status(201).json({
    gameCode,
    totalQuestions: questions.length
  });
});

io.on("connection", (socket) => {
  socket.on("join-game", ({ gameCode, name, role } = {}) => {
    const game = getGameOrEmit(socket, gameCode);
    const playerName = String(name || "").trim().slice(0, 40);

    if (!game) return;

    if (role === "teacher") {
      socket.join(game.gameCode);
      socket.data.gameCode = game.gameCode;
      socket.data.role = "teacher";

      socket.emit("players-updated", {
        gameCode: game.gameCode,
        players: game.players
      });
      socket.emit("scores-updated", {
        gameCode: game.gameCode,
        scores: leaderboard(game)
      });

      if (game.status === "active") {
        emitQuestion(game);
      }

      if (game.status === "ended") {
        socket.emit("game-ended", {
          gameCode: game.gameCode,
          scores: leaderboard(game)
        });
      }

      return;
    }

    if (!playerName) {
      socket.emit("error-message", "Bitte gib einen Namen ein.");
      return;
    }

    const existingPlayer = game.players.find((player) => player.id === socket.id);
    if (existingPlayer) {
      existingPlayer.name = playerName;
    } else {
      game.players.push({ id: socket.id, name: playerName });
      game.scores[socket.id] = game.scores[socket.id] || 0;
    }

    socket.join(game.gameCode);
    socket.data.gameCode = game.gameCode;
    socket.data.playerName = playerName;

    emitPlayers(game);
    emitScores(game);

    if (game.status === "active") {
      emitQuestion(game);
    }

    if (game.status === "ended") {
      socket.emit("game-ended", {
        gameCode: game.gameCode,
        scores: leaderboard(game)
      });
    }
  });

  socket.on("start-game", ({ gameCode } = {}) => {
    const game = getGameOrEmit(socket, gameCode);
    if (!game) return;

    game.status = "active";
    game.currentQuestionIndex = 0;
    if (!game.answersByQuestion.has(0)) {
      game.answersByQuestion.set(0, new Map());
    }

    emitQuestion(game);
    emitScores(game);
  });

  socket.on("next-question", ({ gameCode } = {}) => {
    const game = getGameOrEmit(socket, gameCode);
    if (!game) return;

    if (game.status !== "active") {
      socket.emit("error-message", "Das Spiel laeuft noch nicht.");
      return;
    }

    const nextIndex = game.currentQuestionIndex + 1;
    if (nextIndex >= questions.length) {
      endGame(game);
      return;
    }

    game.currentQuestionIndex = nextIndex;
    if (!game.answersByQuestion.has(nextIndex)) {
      game.answersByQuestion.set(nextIndex, new Map());
    }

    emitQuestion(game);
    emitScores(game);
  });

  socket.on("submit-answer", ({ gameCode, answerIndex } = {}) => {
    const game = getGameOrEmit(socket, gameCode);
    if (!game) return;

    if (game.status !== "active" || game.currentQuestionIndex < 0) {
      socket.emit("error-message", "Aktuell ist keine Frage aktiv.");
      return;
    }

    const player = game.players.find((entry) => entry.id === socket.id);
    if (!player) {
      socket.emit("error-message", "Du bist diesem Spiel noch nicht beigetreten.");
      return;
    }

    const normalizedAnswerIndex = Number(answerIndex);
    if (!Number.isInteger(normalizedAnswerIndex) || normalizedAnswerIndex < 0 || normalizedAnswerIndex > 3) {
      socket.emit("error-message", "Ungueltige Antwort.");
      return;
    }

    const answers = game.answersByQuestion.get(game.currentQuestionIndex) || new Map();
    if (answers.has(socket.id)) {
      socket.emit("error-message", "Du hast diese Frage bereits beantwortet.");
      return;
    }

    const question = questions[game.currentQuestionIndex];
    const isCorrect = normalizedAnswerIndex === question.correctAnswerIndex;

    answers.set(socket.id, {
      playerId: socket.id,
      answerIndex: normalizedAnswerIndex,
      isCorrect
    });
    game.answersByQuestion.set(game.currentQuestionIndex, answers);

    if (isCorrect) {
      game.scores[socket.id] = (game.scores[socket.id] || 0) + 100;
    }

    socket.emit("answer-feedback", {
      isCorrect,
      correctAnswerIndex: question.correctAnswerIndex,
      score: game.scores[socket.id] || 0
    });

    emitQuestion(game);
    emitScores(game);
  });

  socket.on("disconnect", () => {
    const gameCode = socket.data.gameCode;
    if (!gameCode) return;

    const game = games.get(gameCode);
    if (!game) return;

    if (socket.data.role === "teacher") {
      return;
    }

    game.players = game.players.filter((player) => player.id !== socket.id);
    delete game.scores[socket.id];

    for (const answers of game.answersByQuestion.values()) {
      answers.delete(socket.id);
    }

    emitPlayers(game);
    emitQuestion(game);
    emitScores(game);
  });
});

server.listen(PORT, () => {
  console.log(`Quiz backend listening on port ${PORT}`);
});
