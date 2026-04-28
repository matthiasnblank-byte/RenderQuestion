import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import { getQuestionSet, questionDecks } from "./questions.js";

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "123456";

const QUESTION_DURATION_MS = 30_000;
const TRANSITION_DURATION_MS = 10_000;
const MAX_POINTS = 1000;
const MIN_CORRECT_POINTS = 300;

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

function createGame(questionSetId = "day1") {
  const questionSet = getQuestionSet(questionSetId);
  const gameCode = createGameCode();
  const game = {
    gameCode,
    questionSet: questionSet.id,
    questionSetLabel: questionSet.label,
    players: [],
    currentQuestionIndex: -1,
    questionStartedAt: null,
    questionEndsAt: null,
    transitionEndsAt: null,
    answersByQuestion: new Map(),
    scores: {},
    status: "waiting",
    timers: {
      questionTimeout: null,
      transitionTimeout: null
    }
  };

  games.set(gameCode, game);
  return game;
}

function gameQuestions(game) {
  return getQuestionSet(game.questionSet).questions;
}

function isAdminPassword(value) {
  return String(value || "") === ADMIN_PASSWORD;
}

function requireAdmin(socket) {
  if (socket.data.isAdmin) {
    return true;
  }

  socket.emit("error-message", "Admin access is required.");
  return false;
}

function getGameOrEmit(socket, gameCode) {
  const normalizedCode = String(gameCode || "").trim();
  const game = games.get(normalizedCode);

  if (!game) {
    socket.emit("error-message", "Game not found.");
    return null;
  }

  return game;
}

function clearGameTimers(game) {
  if (game.timers.questionTimeout) {
    clearTimeout(game.timers.questionTimeout);
    game.timers.questionTimeout = null;
  }

  if (game.timers.transitionTimeout) {
    clearTimeout(game.timers.transitionTimeout);
    game.timers.transitionTimeout = null;
  }
}

function publicQuestion(game) {
  const questions = gameQuestions(game);
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

function currentAnswers(game) {
  if (game.currentQuestionIndex < 0) {
    return new Map();
  }

  return game.answersByQuestion.get(game.currentQuestionIndex) || new Map();
}

function answerCounts(game) {
  const counts = [0, 0, 0, 0];

  for (const answer of currentAnswers(game).values()) {
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

function gameState(game) {
  const question = publicQuestion(game);
  const questions = gameQuestions(game);
  const includeCorrectAnswer =
    question && (game.status === "transition" || game.status === "finished");

  return {
    gameCode: game.gameCode,
    questionSet: game.questionSet,
    questionSetLabel: game.questionSetLabel,
    availableQuestionSets: questionDecks,
    status: game.status,
    players: game.players,
    scores: leaderboard(game),
    currentQuestionIndex: game.currentQuestionIndex,
    question,
    questionStartedAt: game.questionStartedAt,
    questionEndsAt: game.questionEndsAt,
    transitionEndsAt: game.transitionEndsAt,
    questionDurationMs: QUESTION_DURATION_MS,
    transitionDurationMs: TRANSITION_DURATION_MS,
    answerCounts: question ? answerCounts(game) : [0, 0, 0, 0],
    submittedAnswers: question ? currentAnswers(game).size : 0,
    totalQuestions: questions.length,
    correctAnswerIndex: includeCorrectAnswer
      ? questions[game.currentQuestionIndex].correctAnswerIndex
      : null
  };
}

function emitGameState(game) {
  const state = gameState(game);
  io.to(game.gameCode).emit("game-state-updated", state);
  io.to(game.gameCode).emit("players-updated", {
    gameCode: game.gameCode,
    players: state.players
  });
  io.to(game.gameCode).emit("scores-updated", {
    gameCode: game.gameCode,
    scores: state.scores
  });
  io.to(game.gameCode).emit("question-updated", state);
}

function emitToSocket(socket, game) {
  const state = gameState(game);
  socket.emit("game-state-updated", state);
  socket.emit("players-updated", {
    gameCode: game.gameCode,
    players: state.players
  });
  socket.emit("scores-updated", {
    gameCode: game.gameCode,
    scores: state.scores
  });
  socket.emit("question-updated", state);
}

function startQuestion(game, questionIndex) {
  clearGameTimers(game);
  const questions = gameQuestions(game);

  if (questionIndex >= questions.length) {
    finishGame(game);
    return;
  }

  game.status = "running";
  game.currentQuestionIndex = questionIndex;
  game.questionStartedAt = Date.now();
  game.questionEndsAt = game.questionStartedAt + QUESTION_DURATION_MS;
  game.transitionEndsAt = null;

  if (!game.answersByQuestion.has(questionIndex)) {
    game.answersByQuestion.set(questionIndex, new Map());
  }

  io.to(game.gameCode).emit("question-started", gameState(game));
  emitGameState(game);

  game.timers.questionTimeout = setTimeout(() => {
    closeQuestion(game);
  }, QUESTION_DURATION_MS);
}

function closeQuestion(game) {
  if (game.status !== "running") {
    return;
  }

  if (game.timers.questionTimeout) {
    clearTimeout(game.timers.questionTimeout);
    game.timers.questionTimeout = null;
  }

  game.status = "transition";
  game.transitionEndsAt = Date.now() + TRANSITION_DURATION_MS;

  io.to(game.gameCode).emit("question-ended", gameState(game));
  io.to(game.gameCode).emit("transition-started", gameState(game));
  emitGameState(game);

  game.timers.transitionTimeout = setTimeout(() => {
    startQuestion(game, game.currentQuestionIndex + 1);
  }, TRANSITION_DURATION_MS);
}

function advanceQuestion(game) {
  const nextQuestionIndex = Math.max(0, game.currentQuestionIndex + 1);
  startQuestion(game, nextQuestionIndex);
}

function finishGame(game) {
  clearGameTimers(game);
  game.status = "finished";
  game.questionStartedAt = null;
  game.questionEndsAt = null;
  game.transitionEndsAt = null;

  const payload = {
    ...gameState(game),
    scores: leaderboard(game)
  };

  io.to(game.gameCode).emit("game-ended", payload);
  emitGameState(game);
}

function resetGame(game) {
  clearGameTimers(game);
  game.currentQuestionIndex = -1;
  game.questionStartedAt = null;
  game.questionEndsAt = null;
  game.transitionEndsAt = null;
  game.answersByQuestion = new Map();
  game.scores = Object.fromEntries(game.players.map((player) => [player.id, 0]));
  game.status = "waiting";
  emitGameState(game);
}

function scoreAnswer(game, answerIndex, answeredAt) {
  const question = gameQuestions(game)[game.currentQuestionIndex];
  const isCorrect = answerIndex === question.correctAnswerIndex;

  if (!isCorrect) {
    return { isCorrect, pointsAwarded: 0 };
  }

  const remainingMilliseconds = Math.max(0, game.questionEndsAt - answeredAt);
  const remainingRatio = remainingMilliseconds / QUESTION_DURATION_MS;
  const pointsAwarded = Math.round(
    MIN_CORRECT_POINTS + remainingRatio * (MAX_POINTS - MIN_CORRECT_POINTS)
  );

  return {
    isCorrect,
    pointsAwarded: Math.max(MIN_CORRECT_POINTS, Math.min(MAX_POINTS, pointsAwarded))
  };
}

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.post("/api/admin/validate", (req, res) => {
  if (!isAdminPassword(req.body?.password)) {
    res.status(401).json({ ok: false, message: "Incorrect admin password." });
    return;
  }

  res.json({ ok: true });
});

app.post("/api/games", (req, res) => {
  const providedPassword = req.header("x-admin-password") || req.body?.adminPassword;
  if (!isAdminPassword(providedPassword)) {
    res.status(401).json({ message: "Admin access is required." });
    return;
  }

  const game = createGame(req.body?.questionSet);
  res.status(201).json({
    gameCode: game.gameCode,
    questionSet: game.questionSet,
    questionSetLabel: game.questionSetLabel,
    totalQuestions: gameQuestions(game).length
  });
});

io.on("connection", (socket) => {
  socket.on("validate-admin-password", ({ password } = {}) => {
    if (!isAdminPassword(password)) {
      socket.data.isAdmin = false;
      socket.emit("admin-auth-failed", {
        message: "Incorrect admin password."
      });
      return;
    }

    socket.data.isAdmin = true;
    socket.emit("admin-auth-success");
  });

  socket.on("create-game", ({ questionSet } = {}) => {
    if (!requireAdmin(socket)) return;

    const game = createGame(questionSet);
    socket.join(game.gameCode);
    socket.data.gameCode = game.gameCode;
    socket.data.role = "admin";

    socket.emit("game-created", {
      gameCode: game.gameCode,
      questionSet: game.questionSet,
      questionSetLabel: game.questionSetLabel,
      totalQuestions: gameQuestions(game).length
    });
    emitToSocket(socket, game);
  });

  socket.on("join-game", ({ gameCode, name, role } = {}) => {
    const game = getGameOrEmit(socket, gameCode);
    if (!game) return;

    if (role === "admin") {
      if (!requireAdmin(socket)) return;

      socket.join(game.gameCode);
      socket.data.gameCode = game.gameCode;
      socket.data.role = "admin";
      emitToSocket(socket, game);
      return;
    }

    const playerName = String(name || "").trim().slice(0, 40);
    if (!playerName) {
      socket.emit("error-message", "Please enter your name.");
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
    socket.data.role = "student";

    socket.emit("joined-game", {
      gameCode: game.gameCode,
      name: playerName,
      playerId: socket.id
    });
    emitGameState(game);
  });

  socket.on("start-game", ({ gameCode } = {}) => {
    if (!requireAdmin(socket)) return;

    const game = getGameOrEmit(socket, gameCode);
    if (!game) return;

    if (game.status === "running" || game.status === "transition") {
      socket.emit("error-message", "The game is already running.");
      return;
    }

    game.answersByQuestion = new Map();
    game.scores = Object.fromEntries(game.players.map((player) => [player.id, 0]));
    io.to(game.gameCode).emit("game-starting", {
      gameCode: game.gameCode,
      startsAt: Date.now() + TRANSITION_DURATION_MS
    });

    clearGameTimers(game);
    game.status = "transition";
    game.currentQuestionIndex = -1;
    game.questionStartedAt = null;
    game.questionEndsAt = null;
    game.transitionEndsAt = Date.now() + TRANSITION_DURATION_MS;
    emitGameState(game);

    game.timers.transitionTimeout = setTimeout(() => {
      startQuestion(game, 0);
    }, TRANSITION_DURATION_MS);
  });

  socket.on("force-next-question", ({ gameCode } = {}) => {
    if (!requireAdmin(socket)) return;

    const game = getGameOrEmit(socket, gameCode);
    if (!game) return;

    if (game.status === "running" || game.status === "transition") {
      advanceQuestion(game);
      return;
    }

    socket.emit("error-message", "There is no active question to advance.");
  });

  socket.on("next-question", ({ gameCode } = {}) => {
    if (!requireAdmin(socket)) return;

    const game = getGameOrEmit(socket, gameCode);
    if (!game) return;

    if (game.status === "running" || game.status === "transition") {
      advanceQuestion(game);
      return;
    }

    socket.emit("error-message", "There is no active question to advance.");
  });

  socket.on("end-game", ({ gameCode } = {}) => {
    if (!requireAdmin(socket)) return;

    const game = getGameOrEmit(socket, gameCode);
    if (!game) return;

    finishGame(game);
  });

  socket.on("reset-game", ({ gameCode } = {}) => {
    if (!requireAdmin(socket)) return;

    const game = getGameOrEmit(socket, gameCode);
    if (!game) return;

    resetGame(game);
  });

  socket.on("submit-answer", ({ gameCode, answerIndex } = {}) => {
    const game = getGameOrEmit(socket, gameCode);
    if (!game) return;

    if (game.status !== "running" || game.currentQuestionIndex < 0) {
      socket.emit("error-message", "This question is closed.");
      socket.emit("answer-result", {
        accepted: false,
        isCorrect: false,
        pointsAwarded: 0,
        message: "This question is closed."
      });
      return;
    }

    const answeredAt = Date.now();
    if (!game.questionEndsAt || answeredAt > game.questionEndsAt) {
      socket.emit("error-message", "The answer window has closed.");
      socket.emit("answer-result", {
        accepted: false,
        isCorrect: false,
        pointsAwarded: 0,
        message: "The answer window has closed."
      });
      return;
    }

    const player = game.players.find((entry) => entry.id === socket.id);
    if (!player) {
      socket.emit("error-message", "Join the game before answering.");
      return;
    }

    const normalizedAnswerIndex = Number(answerIndex);
    if (!Number.isInteger(normalizedAnswerIndex) || normalizedAnswerIndex < 0 || normalizedAnswerIndex > 3) {
      socket.emit("error-message", "Invalid answer.");
      return;
    }

    const answers = currentAnswers(game);
    if (answers.has(socket.id)) {
      socket.emit("error-message", "You already answered this question.");
      return;
    }

    const { isCorrect, pointsAwarded } = scoreAnswer(game, normalizedAnswerIndex, answeredAt);
    const correctAnswerIndex = gameQuestions(game)[game.currentQuestionIndex].correctAnswerIndex;

    answers.set(socket.id, {
      playerId: socket.id,
      answerIndex: normalizedAnswerIndex,
      isCorrect,
      answeredAt,
      pointsAwarded
    });
    game.answersByQuestion.set(game.currentQuestionIndex, answers);
    game.scores[socket.id] = (game.scores[socket.id] || 0) + pointsAwarded;

    socket.emit("answer-result", {
      accepted: true,
      isCorrect,
      pointsAwarded,
      correctAnswerIndex,
      score: game.scores[socket.id] || 0,
      message: isCorrect ? "Correct. Waiting for the next question." : "Incorrect. Waiting for the next question."
    });

    socket.emit("answer-feedback", {
      isCorrect,
      correctAnswerIndex,
      score: game.scores[socket.id] || 0,
      pointsAwarded
    });

    emitGameState(game);
  });

  socket.on("disconnect", () => {
    const gameCode = socket.data.gameCode;
    if (!gameCode || socket.data.role !== "student") return;

    const game = games.get(gameCode);
    if (!game) return;

    game.players = game.players.filter((player) => player.id !== socket.id);
    delete game.scores[socket.id];

    for (const answers of game.answersByQuestion.values()) {
      answers.delete(socket.id);
    }

    emitGameState(game);
  });
});

server.listen(PORT, () => {
  console.log(`Final Questions backend listening on port ${PORT}`);
});
