Feature: Speed-based scoring
  Scenario: Correct answer receives speed-based points
    Given a question is running
    When a student answers correctly before the timer expires
    Then the student should receive points based on remaining time
    And the updated leaderboard should be emitted live

  Scenario: Incorrect answer receives zero points
    Given a question is running
    When a student answers incorrectly
    Then the student should receive 0 points
    And the student should receive immediate feedback

  Scenario: Duplicate answer is rejected
    Given a student has already answered the current question
    When the student submits another answer for the same question
    Then the backend should reject the duplicate answer

  Scenario: Late answer is rejected
    Given the question timer has expired
    When a student submits an answer
    Then the backend should reject the answer
    And no points should be awarded
