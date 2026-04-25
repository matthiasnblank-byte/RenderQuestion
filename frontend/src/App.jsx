import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

const initialGameState = {
  gameCode: "",
  status: "idle",
  players: [],
  scores: [],
  currentQuestionIndex: -1,
  question: null,
  questionStartedAt: null,
  questionEndsAt: null,
  transitionEndsAt: null,
  questionDurationMs: 30000,
  transitionDurationMs: 3000,
  answerCounts: [0, 0, 0, 0],
  submittedAnswers: 0,
  totalQuestions: 15,
  correctAnswerIndex: null
};

function App() {
  const [view, setView] = useState("student");
  const [socket, setSocket] = useState(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");
  const [gameCode, setGameCode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [studentName, setStudentName] = useState("");
  const [joinedStudent, setJoinedStudent] = useState(null);
  const [gameState, setGameState] = useState(initialGameState);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answerResult, setAnswerResult] = useState(null);
  const [message, setMessage] = useState("");
  const [lastQuestionIndex, setLastQuestionIndex] = useState(-1);

  useEffect(() => {
    const nextSocket = io(BACKEND_URL, {
      transports: ["websocket", "polling"]
    });

    setSocket(nextSocket);

    nextSocket.on("admin-auth-success", () => {
      setIsAdminAuthenticated(true);
      setAdminError("");
      setAdminPassword("");
    });

    nextSocket.on("admin-auth-failed", ({ message: errorMessage } = {}) => {
      setIsAdminAuthenticated(false);
      setAdminError(errorMessage || "Incorrect admin password.");
    });

    nextSocket.on("game-created", ({ gameCode: createdCode }) => {
      setGameCode(createdCode);
      setMessage("");
    });

    nextSocket.on("joined-game", ({ gameCode: joinedCode, name, playerId }) => {
      setJoinedStudent({ gameCode: joinedCode, name, playerId });
      setJoinCode(joinedCode);
      setStudentName(name);
      setMessage("");
    });

    nextSocket.on("game-state-updated", (state) => {
      setGameState({ ...initialGameState, ...state });
      if (state?.gameCode) {
        setGameCode((current) => current || state.gameCode);
      }
    });

    nextSocket.on("question-started", (state) => {
      setGameState({ ...initialGameState, ...state });
      setSelectedAnswer(null);
      setAnswerResult(null);
    });

    nextSocket.on("question-ended", (state) => {
      setGameState({ ...initialGameState, ...state });
    });

    nextSocket.on("transition-started", (state) => {
      setGameState({ ...initialGameState, ...state });
    });

    nextSocket.on("scores-updated", ({ scores } = {}) => {
      setGameState((current) => ({ ...current, scores: scores || [] }));
    });

    nextSocket.on("players-updated", ({ players } = {}) => {
      setGameState((current) => ({ ...current, players: players || [] }));
    });

    nextSocket.on("answer-result", (result) => {
      setAnswerResult(result);
    });

    nextSocket.on("game-ended", (state) => {
      setGameState({ ...initialGameState, ...state, status: "finished" });
      setSelectedAnswer(null);
    });

    nextSocket.on("error-message", (errorMessage) => {
      setMessage(errorMessage);
      window.setTimeout(() => setMessage(""), 4000);
    });

    return () => {
      nextSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    const nextIndex = gameState.currentQuestionIndex;
    if (nextIndex !== lastQuestionIndex && gameState.status === "running") {
      setSelectedAnswer(null);
      setAnswerResult(null);
      setLastQuestionIndex(nextIndex);
    }
  }, [gameState.currentQuestionIndex, gameState.status, lastQuestionIndex]);

  const activeCode = view === "admin" ? gameCode : joinedStudent?.gameCode || joinCode;

  function submitAdminPassword(event) {
    event.preventDefault();
    setAdminError("");
    socket?.emit("validate-admin-password", {
      password: adminPassword
    });
  }

  function createGame() {
    socket?.emit("create-game");
  }

  function startGame() {
    socket?.emit("start-game", { gameCode });
  }

  function forceNextQuestion() {
    socket?.emit("force-next-question", { gameCode });
  }

  function endGame() {
    socket?.emit("end-game", { gameCode });
  }

  function resetGame() {
    socket?.emit("reset-game", { gameCode });
    setJoinedStudent(null);
    setSelectedAnswer(null);
    setAnswerResult(null);
  }

  function joinGame(event) {
    event.preventDefault();

    const normalizedCode = joinCode.trim();
    const normalizedName = studentName.trim();

    if (!normalizedCode || !normalizedName) {
      setMessage("Enter a game code and your name.");
      return;
    }

    socket?.emit("join-game", {
      gameCode: normalizedCode,
      name: normalizedName
    });
  }

  function submitAnswer(answerIndex) {
    if (!joinedStudent || gameState.status !== "running" || answerResult) {
      return;
    }

    setSelectedAnswer(answerIndex);
    socket?.emit("submit-answer", {
      gameCode: joinedStudent.gameCode,
      answerIndex
    });
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Live classroom quiz</p>
          <h1>Final Questions</h1>
        </div>
        <div className="view-switch" aria-label="Choose view">
          <button className={view === "student" ? "active" : ""} onClick={() => setView("student")}>
            Student
          </button>
          <button className={view === "admin" ? "active" : ""} onClick={() => setView("admin")}>
            Host
          </button>
        </div>
      </header>

      {message ? <div className="notice">{message}</div> : null}

      {view === "admin" ? (
        isAdminAuthenticated ? (
          <AdminDashboard
            gameCode={gameCode}
            gameState={gameState}
            onCreateGame={createGame}
            onStartGame={startGame}
            onForceNextQuestion={forceNextQuestion}
            onEndGame={endGame}
            onResetGame={resetGame}
          />
        ) : (
          <AdminLogin
            password={adminPassword}
            setPassword={setAdminPassword}
            error={adminError}
            onSubmit={submitAdminPassword}
          />
        )
      ) : joinedStudent ? (
        <StudentGame
          joinedStudent={joinedStudent}
          gameState={gameState}
          selectedAnswer={selectedAnswer}
          answerResult={answerResult}
          onSubmitAnswer={submitAnswer}
        />
      ) : (
        <StudentJoin
          joinCode={joinCode}
          setJoinCode={setJoinCode}
          studentName={studentName}
          setStudentName={setStudentName}
          onJoinGame={joinGame}
        />
      )}

      <footer>
        Backend: <code>{BACKEND_URL}</code>
        {activeCode ? (
          <>
            {" "}
            | Game code: <code>{activeCode}</code>
          </>
        ) : null}
      </footer>
    </main>
  );
}

function AdminLogin({ password, setPassword, error, onSubmit }) {
  return (
    <section className="auth-panel">
      <div>
        <p className="eyebrow">Host access</p>
        <h2>Enter the admin password</h2>
        <p className="muted">Students do not need this password to join a game.</p>
      </div>
      <form className="login-form" onSubmit={onSubmit}>
        <label>
          Admin password
          <input
            value={password}
            type="password"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter password"
          />
        </label>
        {error ? <div className="inline-error">{error}</div> : null}
        <button type="submit">Unlock host dashboard</button>
      </form>
    </section>
  );
}

function AdminDashboard({
  gameCode,
  gameState,
  onCreateGame,
  onStartGame,
  onForceNextQuestion,
  onEndGame,
  onResetGame
}) {
  const canStart = gameCode && (gameState.status === "waiting" || gameState.status === "finished");
  const isRunning = gameState.status === "running" || gameState.status === "transition";

  return (
    <div className="admin-layout">
      <section className="hero-panel">
        <div className="host-meta">
          <StatusBadge status={gameState.status} />
          <span>{gameState.players.length} connected students</span>
          <span>{gameState.submittedAnswers || 0} submitted answers</span>
        </div>

        {gameCode ? (
          <div className="game-code">
            <span>Game code</span>
            <strong>{gameCode}</strong>
          </div>
        ) : (
          <div className="empty-stage">
            <h2>Create a game</h2>
            <p>Start by creating a six-digit code for your class.</p>
          </div>
        )}

        <ProjectedQuestion gameState={gameState} />

        <div className="controls">
          <button onClick={onCreateGame}>Create game</button>
          <button onClick={onStartGame} disabled={!canStart}>
            Start game
          </button>
          <button onClick={onForceNextQuestion} disabled={!isRunning}>
            Force next question
          </button>
          <button className="danger" onClick={onEndGame} disabled={!gameCode || gameState.status === "finished"}>
            End game
          </button>
          <button className="secondary" onClick={onResetGame} disabled={!gameCode}>
            Reset game
          </button>
        </div>
      </section>

      <aside className="side-panel">
        <h2>Live leaderboard</h2>
        <Leaderboard scores={gameState.scores} />
      </aside>

      <aside className="side-panel">
        <h2>Connected students</h2>
        <PlayerList players={gameState.players} />
      </aside>
    </div>
  );
}

function ProjectedQuestion({ gameState }) {
  const question = gameState.question;

  if (gameState.status === "transition" && gameState.currentQuestionIndex < 0) {
    return (
      <div className="ready-screen pulse">
        <p>Game starting</p>
        <h2>Get ready</h2>
        <Timer targetTime={gameState.transitionEndsAt} label="First question starts in" />
      </div>
    );
  }

  if (gameState.status === "waiting") {
    return (
      <div className="empty-stage">
        <h2>Waiting for players</h2>
        <p>Share the game code, then start when the class is ready.</p>
      </div>
    );
  }

  if (gameState.status === "finished") {
    return <VictoryCeremony scores={gameState.scores} />;
  }

  if (!question) {
    return (
      <div className="empty-stage">
        <h2>No active question</h2>
        <p>The next question will appear here.</p>
      </div>
    );
  }

  const isTransition = gameState.status === "transition";

  return (
    <div className={`projected-question ${isTransition ? "closed" : "active-question"}`}>
      <div className="question-header">
        <span>
          Question {question.index + 1} of {question.total}
        </span>
        {isTransition ? (
          <Timer targetTime={gameState.transitionEndsAt} label="Next question in" />
        ) : (
          <Timer targetTime={gameState.questionEndsAt} label="Time left" urgentAt={8000} />
        )}
      </div>
      <h2>{question.text}</h2>
      <div className="option-grid">
        {question.options.map((option, index) => (
          <div
            className={gameState.correctAnswerIndex === index ? "option correct-option" : "option"}
            key={option}
          >
            <span>{String.fromCharCode(65 + index)}</span>
            <strong>{option}</strong>
            <em>{gameState.answerCounts[index]} answers</em>
          </div>
        ))}
      </div>
      {isTransition ? <div className="closed-banner">Question closed. Answers are locked.</div> : null}
    </div>
  );
}

function StudentJoin({ joinCode, setJoinCode, studentName, setStudentName, onJoinGame }) {
  return (
    <section className="student-entry">
      <div className="entry-copy">
        <p className="eyebrow">Student entry</p>
        <h2>Join Final Questions</h2>
        <p>Enter the code from your host and your display name.</p>
      </div>
      <form className="join-form" onSubmit={onJoinGame}>
        <label>
          Game code
          <input
            value={joinCode}
            onChange={(event) => setJoinCode(event.target.value)}
            placeholder="123456"
            maxLength={6}
            inputMode="numeric"
          />
        </label>
        <label>
          Your name
          <input
            value={studentName}
            onChange={(event) => setStudentName(event.target.value)}
            placeholder="Your name"
            maxLength={40}
          />
        </label>
        <button type="submit">Join game</button>
      </form>
    </section>
  );
}

function StudentGame({ joinedStudent, gameState, selectedAnswer, answerResult, onSubmitAnswer }) {
  const ownScore = useMemo(() => {
    return gameState.scores.find((entry) => entry.id === joinedStudent.playerId)?.score ?? 0;
  }, [gameState.scores, joinedStudent.playerId]);

  if (gameState.status === "finished") {
    return <VictoryCeremony scores={gameState.scores} ownScore={ownScore} playerId={joinedStudent.playerId} />;
  }

  if (gameState.status === "waiting" || gameState.status === "idle") {
    return <StudentWaiting joinedStudent={joinedStudent} ownScore={ownScore} />;
  }

  if (gameState.status === "transition" && gameState.currentQuestionIndex < 0) {
    return (
      <section className="student-stage ready-screen pulse">
        <p>You have joined the game.</p>
        <h2>Get ready</h2>
        <Timer targetTime={gameState.transitionEndsAt} label="First question starts in" />
      </section>
    );
  }

  if (gameState.status === "transition") {
    return (
      <div className="student-layout">
        <section className="student-stage">
          <p className="eyebrow">Question closed</p>
          <h2>Waiting for the next question</h2>
          {answerResult ? (
            <AnswerResult result={answerResult} />
          ) : (
            <p className="muted">No answer was submitted for this question.</p>
          )}
          <Timer targetTime={gameState.transitionEndsAt} label="Next question starts in" />
        </section>
        <section className="side-panel">
          <h2>Your class leaderboard</h2>
          <Leaderboard scores={gameState.scores} />
        </section>
      </div>
    );
  }

  return (
    <div className="student-layout">
      <section className="student-stage">
        <div className="question-header">
          <span>
            Question {gameState.question.index + 1} of {gameState.question.total}
          </span>
          <Timer targetTime={gameState.questionEndsAt} label="Time left" urgentAt={8000} />
        </div>
        <h2>{gameState.question.text}</h2>
        <div className="answer-grid">
          {gameState.question.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrect = answerResult?.correctAnswerIndex === index;
            const className = [
              "answer-button",
              isSelected ? "selected" : "",
              answerResult && isCorrect ? "correct" : "",
              answerResult && isSelected && !answerResult.isCorrect ? "wrong" : ""
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <button
                className={className}
                disabled={Boolean(answerResult) || selectedAnswer !== null}
                key={option}
                onClick={() => onSubmitAnswer(index)}
              >
                <span>{String.fromCharCode(65 + index)}</span>
                {option}
              </button>
            );
          })}
        </div>
        {answerResult ? <AnswerResult result={answerResult} /> : null}
      </section>

      <section className="side-panel">
        <h2>Your score</h2>
        <p className="large-score">{ownScore}</p>
        <Leaderboard scores={gameState.scores} />
      </section>
    </div>
  );
}

function StudentWaiting({ joinedStudent, ownScore }) {
  return (
    <section className="student-waiting">
      <p className="eyebrow">Joined successfully</p>
      <h2>You have joined the game.</h2>
      <p className="waiting-text">Waiting for the host to start...</p>
      <div className="waiting-details">
        <span>Name</span>
        <strong>{joinedStudent.name}</strong>
        <span>Game code</span>
        <strong>{joinedStudent.gameCode}</strong>
        <span>Current score</span>
        <strong>{ownScore}</strong>
      </div>
    </section>
  );
}

function AnswerResult({ result }) {
  return (
    <div className={result.isCorrect ? "answer-result correct-result" : "answer-result wrong-result"}>
      <strong>{result.isCorrect ? "Correct" : "Incorrect"}</strong>
      <span>{result.pointsAwarded} points awarded</span>
      <small>{result.message || "Waiting for the next question."}</small>
    </div>
  );
}

function Timer({ targetTime, label, urgentAt = 0 }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(interval);
  }, []);

  const remainingMs = Math.max(0, Number(targetTime || 0) - now);
  const seconds = Math.ceil(remainingMs / 1000);
  const isUrgent = urgentAt > 0 && remainingMs <= urgentAt;

  return (
    <div className={isUrgent ? "timer urgent" : "timer"}>
      <span>{label}</span>
      <strong>{seconds}s</strong>
    </div>
  );
}

function StatusBadge({ status }) {
  const labelByStatus = {
    idle: "Loading",
    waiting: "Waiting for players",
    running: "Question active",
    transition: "Transition",
    finished: "Finished"
  };

  return <span className={`status-badge ${status}`}>{labelByStatus[status] || status}</span>;
}

function PlayerList({ players }) {
  if (!players.length) {
    return <p className="muted">No students have joined yet.</p>;
  }

  return (
    <ul className="simple-list">
      {players.map((player) => (
        <li key={player.id}>{player.name}</li>
      ))}
    </ul>
  );
}

function Leaderboard({ scores }) {
  if (!scores.length) {
    return <p className="muted">No scores yet.</p>;
  }

  return (
    <ol className="leaderboard">
      {scores.map((entry, index) => (
        <li key={entry.id}>
          <span>
            <strong>{index + 1}.</strong> {entry.name}
          </span>
          <strong>{entry.score}</strong>
        </li>
      ))}
    </ol>
  );
}

const RANK_MEDALS = ["🥇", "🥈", "🥉"];
const RANK_CLASSES = ["rank-1", "rank-2", "rank-3"];

function VictoryCeremony({ scores, ownScore, playerId }) {
  const top3 = scores.slice(0, 3);
  const rest = scores.slice(3);

  // Podium order: 2nd left, 1st center, 3rd right
  const podiumSlots = top3[1]
    ? [{ entry: top3[1], rank: 1 }, { entry: top3[0], rank: 0 }, top3[2] ? { entry: top3[2], rank: 2 } : null]
    : [{ entry: top3[0], rank: 0 }];
  const podiumOrder = podiumSlots.filter(Boolean);

  return (
    <div className="victory-wrapper">
      <div className="victory-title">
        <p className="eyebrow">Game over</p>
        <h2>Siegerehrung</h2>
      </div>

      <div className="podium">
        {podiumOrder.map(({ entry, rank }) => (
          <div className={`podium-slot ${RANK_CLASSES[rank]}`} key={entry.id}>
            <div className="podium-avatar">{RANK_MEDALS[rank]}</div>
            <div className="podium-name">{entry.name}</div>
            <div className="podium-score">{entry.score} pts</div>
            <div className="podium-block">{rank + 1}</div>
          </div>
        ))}
      </div>

      {rest.length > 0 && (
        <div className="victory-rest">
          <p className="victory-rest-title">Weitere Ergebnisse</p>
          <Leaderboard scores={rest.map((e, i) => ({ ...e, _rank: i + 4 }))} startRank={4} />
        </div>
      )}

      {ownScore !== undefined && (
        <p className="muted" style={{ fontSize: "0.9rem" }}>
          Dein Ergebnis:{" "}
          <strong style={{ color: "#60a5fa" }}>{ownScore} Punkte</strong>
          {playerId && scores.findIndex((e) => e.id === playerId) >= 0
            ? ` · Platz ${scores.findIndex((e) => e.id === playerId) + 1}`
            : ""}
        </p>
      )}
    </div>
  );
}

export default App;
