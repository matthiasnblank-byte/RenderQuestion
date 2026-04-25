# Scoring

Final Questions uses speed-based scoring for correct answers.

## Formula

Each question lasts 30 seconds.

```text
remainingRatio = remainingMilliseconds / totalQuestionMilliseconds
points = round(300 + remainingRatio * 700)
```

The maximum score for a correct answer is about 1000 points. The minimum score for a correct in-time answer is 300 points.

## Examples

- Immediate correct answer: approximately 1000 points.
- Correct answer halfway through: approximately 650 points.
- Correct answer near the end: approximately 300 points.
- Incorrect answer: 0 points.
- Late answer after the question closes: rejected and 0 points.

## Answer Rules

Each student can answer each question only once. The backend stores the answer timestamp and awarded points for every submitted answer. Scores are emitted live to connected clients after each accepted answer.
