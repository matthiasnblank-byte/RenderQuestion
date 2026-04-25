import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

function emptyQuestionState() {
  return {
    gameCode: "",
    status: "idle",
    question: null,
    answerCounts: [0, 0, 0, 0],
    answeredPlayerIds: []
  };
}

function App() {
  const [role, setRole] = useState("teacher");
  const [socket, setSocket] = useState(null);
  const [gameCode, setGameCode] = useState("");
  const [studentCode, setStudentCode] = useState("");
  const [studentName, setStudentName] = useState("");
  const [players, setPlayers] = useState([]);
  const [scores, setScores] = useState([]);
  const [questionState, setQuestionState] = useState(emptyQuestionState);
  const [feedback, setFeedback] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [message, setMessage] = useState("");
  const [isCreatingGame, setIsCreatingGame] = useState(false);

  const activeGameCode = role === "teacher" ? gameCode : studentCode;

  useEffect(() => {
    const nextSocket = io(BACKEND_URL, {
      transports: ["websocket", "polling"]
    });

    setSocket(nextSocket);

    nextSocket.on("players-updated", ({ players: nextPlayers }) => {
      setPlayers(nextPlayers || []);
    });

    nextSocket.on("question-updated", (payload) => {
      setQuestionState(payload || emptyQuestionState());
      setFeedback(null);
      setSelectedAnswer(null);
      setIsEnded(false);
    });

    nextSocket.on("scores-updated", ({ scores: nextScores }) => {
      setScores(nextScores || []);
    });

    nextSocket.on("game-ended", ({ scores: finalScores }) => {
      setScores(finalScores || []);
      setQuestionState((current) => ({ ...current, status: "ended" }));
      setIsEnded(true);
      setFeedback(null);
      setSelectedAnswer(null);
    });

    nextSocket.on("answer-feedback", (payload) => {
      setFeedback(payload);
    });

    nextSocket.on("error-message", (text) => {
      setMessage(text);
      window.setTimeout(() => setMessage(""), 3500);
    });

    return () => {
      nextSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    setFeedback(null);
    setSelectedAnswer(null);
    setMessage("");
  }, [role]);

  const ownScore = useMemo(() => {
    if (!studentName.trim()) return null;
    return scores.find((entry) => entry.name === studentName.trim())?.score ?? 0;
  }, [scores, studentName]);

  async function createGame() {
    setIsCreatingGame(true);
    setMessage("");

    try {
      const response = await fetch(`${BACKEND_URL}/api/games`, {
        method: "POST"
      });

      if (!response.ok) {
        throw new Error("Spiel konnte nicht erstellt werden.");
      }

      const data = await response.json();
      setGameCode(data.gameCode);
      setQuestionState(emptyQuestionState());
      setPlayers([]);
      setScores([]);
      setIsEnded(false);

      if (socket) {
        socket.emit("join-game", {
          gameCode: data.gameCode,
          name: "Dozent",
          role: "teacher"
        });
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsCreatingGame(false);
    }
  }

  function startGame() {
    if (!socket || !gameCode) return;
    socket.emit("start-game", { gameCode });
  }

  function nextQuestion() {
    if (!socket || !gameCode) return;
    socket.emit("next-question", { gameCode });
  }

  function joinGame(event) {
    event.preventDefault();
    if (!socket) return;

    const normalizedCode = studentCode.trim();
    const normalizedName = studentName.trim();

    if (!normalizedCode || !normalizedName) {
      setMessage("Bitte Spielcode und Namen eingeben.");
      return;
    }

    socket.emit("join-game", {
      gameCode: normalizedCode,
      name: normalizedName
    });
    setStudentCode(normalizedCode);
    setStudentName(normalizedName);
    setIsJoined(true);
    setIsEnded(false);
  }

  function submitAnswer(answerIndex) {
    if (!socket || feedback || selectedAnswer !== null) return;
    setSelectedAnswer(answerIndex);
    socket.emit("submit-answer", {
      gameCode: studentCode,
      answerIndex
    });
  }

  const question = questionState.question;

  return (
    <main className="app-shell">
      <section className="topbar">
        <div>
          <p className="eyebrow">Live Quiz</p>
          <h1>Kahoot-aehnliche Lehrveranstaltung</h1>
        </div>
        <div className="role-switch" aria-label="Ansicht wechseln">
          <button className={role === "teacher" ? "active" : ""} onClick={() => setRole("teacher")}>
            Dozent
          </button>
          <button className={role === "student" ? "active" : ""} onClick={() => setRole("student")}>
            Studierende
          </button>
        </div>
      </section>

      {message ? <div className="notice">{message}</div> : null}

      {role === "teacher" ? (
        <TeacherView
          gameCode={gameCode}
          players={players}
          scores={scores}
          question={question}
          questionState={questionState}
          isEnded={isEnded}
          isCreatingGame={isCreatingGame}
          onCreateGame={createGame}
          onStartGame={startGame}
          onNextQuestion={nextQuestion}
        />
      ) : (
        <StudentView
          studentCode={studentCode}
          studentName={studentName}
          setStudentCode={setStudentCode}
          setStudentName={setStudentName}
          isJoined={isJoined}
          question={question}
          feedback={feedback}
          selectedAnswer={selectedAnswer}
          scores={scores}
          ownScore={ownScore}
          isEnded={isEnded}
          onJoinGame={joinGame}
          onSubmitAnswer={submitAnswer}
        />
      )}

      <footer>
        Backend: <code>{BACKEND_URL}</code>
        {activeGameCode ? (
          <>
            {" "}
            | Spielcode: <code>{activeGameCode}</code>
          </>
        ) : null}
      </footer>
    </main>
  );
}

function TeacherView({
  gameCode,
  players,
  scores,
  question,
  questionState,
  isEnded,
  isCreatingGame,
  onCreateGame,
  onStartGame,
  onNextQuestion
}) {
  return (
    <div className="grid two-columns">
      <section className="panel">
        <h2>Dozentenansicht</h2>
        <div className="actions">
          <button onClick={onCreateGame} disabled={isCreatingGame}>
            {isCreatingGame ? "Erstelle..." : "Spiel erstellen"}
          </button>
          <button onClick={onStartGame} disabled={!gameCode}>
            Spiel starten
          </button>
          <button onClick={onNextQuestion} disabled={!gameCode || !question || isEnded}>
            Naechste Frage
          </button>
        </div>

        {gameCode ? (
          <div className="game-code">
            <span>Spielcode</span>
            <strong>{gameCode}</strong>
          </div>
        ) : (
          <p className="muted">Erstelle ein Spiel, um einen sechsstelligen Code zu erhalten.</p>
        )}

        <CurrentQuestion question={question} questionState={questionState} showCounts />
      </section>

      <section className="panel">
        <h2>Teilnehmer live</h2>
        <PlayerList players={players} />
      </section>

      <section className="panel span-two">
        <h2>{isEnded ? "Endergebnis" : "Punktestand"}</h2>
        <Scoreboard scores={scores} />
      </section>
    </div>
  );
}

function StudentView({
  studentCode,
  studentName,
  setStudentCode,
  setStudentName,
  isJoined,
  question,
  feedback,
  selectedAnswer,
  scores,
  ownScore,
  isEnded,
  onJoinGame,
  onSubmitAnswer
}) {
  return (
    <div className="grid two-columns">
      <section className="panel">
        <h2>Studierendenansicht</h2>
        <form className="join-form" onSubmit={onJoinGame}>
          <label>
            Spielcode
            <input
              value={studentCode}
              onChange={(event) => setStudentCode(event.target.value)}
              placeholder="123456"
              maxLength={6}
            />
          </label>
          <label>
            Name
            <input
              value={studentName}
              onChange={(event) => setStudentName(event.target.value)}
              placeholder="Dein Name"
              maxLength={40}
            />
          </label>
          <button type="submit">Spiel beitreten</button>
        </form>

        {isJoined ? (
          <div className="status-row">
            <span>Beigetreten als {studentName}</span>
            <strong>{ownScore ?? 0} Punkte</strong>
          </div>
        ) : null}
      </section>

      <section className="panel">
        <h2>Aktuelle Frage</h2>
        {isEnded ? (
          <p className="muted">Das Spiel ist beendet.</p>
        ) : (
          <StudentQuestion
            question={question}
            feedback={feedback}
            selectedAnswer={selectedAnswer}
            onSubmitAnswer={onSubmitAnswer}
          />
        )}
      </section>

      <section className="panel span-two">
        <h2>{isEnded ? "Endergebnis" : "Aktueller Punktestand"}</h2>
        <Scoreboard scores={scores} />
      </section>
    </div>
  );
}

function CurrentQuestion({ question, questionState, showCounts = false }) {
  if (!question) {
    return <p className="muted">Noch keine Frage aktiv.</p>;
  }

  return (
    <div className="question-block">
      <p className="question-progress">
        Frage {question.index + 1} von {question.total}
      </p>
      <h3>{question.text}</h3>
      <div className="answers">
        {question.options.map((option, index) => (
          <div className="answer-row" key={option}>
            <span>{option}</span>
            {showCounts ? <strong>{questionState.answerCounts[index]} Antworten</strong> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function StudentQuestion({ question, feedback, selectedAnswer, onSubmitAnswer }) {
  if (!question) {
    return <p className="muted">Warte, bis die naechste Frage gestartet wird.</p>;
  }

  return (
    <div className="question-block">
      <p className="question-progress">
        Frage {question.index + 1} von {question.total}
      </p>
      <h3>{question.text}</h3>
      <div className="answer-buttons">
        {question.options.map((option, index) => {
          const isSelected = selectedAnswer === index;
          const isCorrect = feedback?.correctAnswerIndex === index;
          const className = [
            isSelected ? "selected" : "",
            feedback && isCorrect ? "correct" : "",
            feedback && isSelected && !feedback.isCorrect ? "wrong" : ""
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <button
              key={option}
              className={className}
              onClick={() => onSubmitAnswer(index)}
              disabled={Boolean(feedback) || selectedAnswer !== null}
            >
              {option}
            </button>
          );
        })}
      </div>

      {feedback ? (
        <div className={feedback.isCorrect ? "feedback correct-text" : "feedback wrong-text"}>
          {feedback.isCorrect ? "Richtig. +100 Punkte." : "Leider falsch."}
        </div>
      ) : null}
    </div>
  );
}

function PlayerList({ players }) {
  if (!players.length) {
    return <p className="muted">Noch keine Teilnehmer beigetreten.</p>;
  }

  return (
    <ul className="simple-list">
      {players.map((player) => (
        <li key={player.id}>{player.name}</li>
      ))}
    </ul>
  );
}

function Scoreboard({ scores }) {
  if (!scores.length) {
    return <p className="muted">Noch keine Punkte vorhanden.</p>;
  }

  return (
    <ol className="scoreboard">
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

export default App;
