# Final Questions

Final Questions is a simple classroom quiz application for an English-language university course. It supports about 30 students and 15 timed questions.

The app is deployed from one GitHub monorepo:

```text
final-questions/
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
  docs/
  features/
  README.md
```

## Technical Overview

- Frontend: React, Vite, socket.io-client
- Backend: Node.js, Express, Socket.io, CORS
- Deployment: Render Static Site for `frontend/`, Render Web Service for `backend/`
- Persistence: no database, no Redis, no cache, no external persistence service
- Game state: stored only in backend RAM with `const games = new Map()`
- Restart behavior: active games are lost when the backend restarts

## Local Development

Use two terminals: one for the backend and one for the frontend.

### Start the Backend

```bash
cd backend
npm install
npm run dev
```

Or without Nodemon:

```bash
cd backend
npm install
npm start
```

The backend runs locally at:

```text
http://localhost:3000
```

### Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs locally at:

```text
http://localhost:5173
```

## Environment Variables

### Backend

```text
FRONTEND_URL=http://localhost:5173
ADMIN_PASSWORD=123456
PORT=3000
```

`ADMIN_PASSWORD` is optional. If it is not set, the backend uses `123456`.

`PORT` does not need to be set locally because the server falls back to `3000`. On Render, `PORT` is provided automatically and the backend reads it from `process.env.PORT`.

Example:

```bash
cd backend
FRONTEND_URL=http://localhost:5173 ADMIN_PASSWORD=123456 npm run dev
```

### Frontend

```text
VITE_BACKEND_URL=http://localhost:3000
```

The frontend has `http://localhost:3000` as a local fallback. On Render, set `VITE_BACKEND_URL` to the backend Web Service URL and redeploy the Static Site.

## Gameplay

1. The host opens the Host view.
2. The host enters the admin password. The default password is `123456`.
3. The host creates a game and receives a six-digit game code.
4. Students open the Student view, enter the game code and their name, and join without a password.
5. Joined students see a waiting screen until the host starts the game.
6. The host starts the game once.
7. Questions run automatically with 30-second timers.
8. After each question closes, the app shows a short transition for about 3 seconds.
9. The next question starts automatically.
10. Final results appear automatically after the last question.

## Scoring

Correct answers receive speed-based points:

```text
remainingRatio = remainingMilliseconds / totalQuestionMilliseconds
points = round(300 + remainingRatio * 700)
```

- Immediate correct answer: about 1000 points
- Correct answer halfway through: about 650 points
- Correct answer near the end: about 300 points
- Incorrect answer: 0 points
- Late answer: rejected and 0 points

Each student can answer each question only once.

## API and Socket.io Events

REST:

- `GET /api/health`
- `POST /api/admin/validate`
- `POST /api/games`

`POST /api/games` requires the admin password via `x-admin-password` or `adminPassword` in the JSON body.

Client-to-server Socket.io events:

- `validate-admin-password`
- `create-game`
- `join-game`
- `start-game`
- `submit-answer`
- `force-next-question`
- `next-question` legacy alias for `force-next-question`
- `end-game`
- `reset-game`

Server-to-client Socket.io events:

- `admin-auth-success`
- `admin-auth-failed`
- `game-created`
- `joined-game`
- `players-updated`
- `game-state-updated`
- `game-starting`
- `question-updated`
- `question-started`
- `question-ended`
- `transition-started`
- `scores-updated`
- `answer-result`
- `answer-feedback` legacy feedback event
- `game-ended`
- `error-message`

## Render Deployment

Both Render services use the same GitHub repository. Configure different root directories.

### Backend Render Web Service

```text
Root Directory: backend
Build Command: npm install
Start Command: npm start
```

Environment variables:

```text
FRONTEND_URL=https://your-frontend-static-site.onrender.com
ADMIN_PASSWORD=123456
```

Do not set `PORT` manually.

### Frontend Render Static Site

```text
Root Directory: frontend
Build Command: npm install && npm run build
Publish Directory: dist
```

Environment variable:

```text
VITE_BACKEND_URL=https://your-backend-web-service.onrender.com
```

After changing `VITE_BACKEND_URL`, redeploy the frontend because Vite embeds this value during the build.

## Creating Two Render Services From One Repo

1. Connect the GitHub repository to Render.
2. Create the backend as a Web Service.
3. Set backend Root Directory to `backend`.
4. Set backend Build Command to `npm install`.
5. Set backend Start Command to `npm start`.
6. Create the frontend as a Static Site from the same repository.
7. Set frontend Root Directory to `frontend`.
8. Set frontend Build Command to `npm install && npm run build`.
9. Set frontend Publish Directory to `dist`.
10. Set frontend `VITE_BACKEND_URL` to the backend Web Service URL.
11. Set backend `FRONTEND_URL` to the frontend Static Site URL.
12. Redeploy both services after environment variables are saved.

For active classroom games, keep the backend as a single instance. Horizontal scaling would create separate in-memory game states.

## Additional Documentation

- [Architecture](docs/architecture.md)
- [Game flow](docs/game-flow.md)
- [Render deployment](docs/deployment-render.md)
- [Scoring](docs/scoring.md)
- [Admin access](docs/admin-access.md)
