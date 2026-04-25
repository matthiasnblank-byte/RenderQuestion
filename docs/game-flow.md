# Game Flow

Final Questions uses a backend-authoritative game flow with four main states.

## Waiting

The game is created and students can join with a game code and name. The host can see the connected student list and start the game when ready.

## Running

A question is active. The backend sets `questionStartedAt` and `questionEndsAt`, then broadcasts the current question and timing values. Students can submit one answer during this window.

Each question lasts 30 seconds.

## Transition

When the 30-second question window expires, the backend closes the question and stops accepting answers. The app shows a short transition state for approximately 3 seconds. Students see that their answer was submitted or that the next question is coming.

After the transition, the backend automatically starts the next question.

## Finished

After the final question and transition, the backend marks the game as finished and broadcasts final results. The leaderboard remains visible to host and students.

## Automatic Progression

The host starts the game once. After that, questions progress automatically:

1. Question starts.
2. Timer runs for 30 seconds.
3. Question closes.
4. Transition runs for about 3 seconds.
5. Next question starts automatically.

The host may use an emergency manual next-question control, but normal gameplay does not require it.
