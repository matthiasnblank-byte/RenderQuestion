# Architecture

Final Questions is a classroom quiz application packaged as a single GitHub monorepo.

The repository contains two independently deployed services:

- `frontend/`: a React and Vite application deployed as a Render Static Site.
- `backend/`: a Node.js, Express, and Socket.io application deployed as a Render Web Service.

Both services are built from the same GitHub repository. Render is configured with different root directories so each service installs and runs only the code it needs.

## Runtime Model

The backend keeps all active game state in memory using `const games = new Map()`. A game entry stores the game code, connected players, current question index, submitted answers, scores, timing metadata, status, and timeout handles.

There is intentionally no database, Redis instance, cache layer, or external persistence service. This keeps the app simple for a classroom session with about 30 students and 15 questions.

## Restart Behavior

Because the backend state exists only in RAM, active games are lost when the backend process restarts or redeploys. That tradeoff is acceptable for this course use case. A new game can be created immediately after a restart.

## Frontend and Backend Communication

The frontend uses HTTP to create games and Socket.io for live gameplay updates. The backend is the source of truth for game state, question timing, answer acceptance, and scoring.
