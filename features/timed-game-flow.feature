Feature: Timed automatic game flow
  Scenario: Host starts a game
    Given a host has created a game
    And students have joined the game
    When the host starts the game
    Then question 1 should start automatically
    And the question timer should run for 30 seconds

  Scenario: Question closes automatically
    Given a question is running
    When 30 seconds pass
    Then the backend should close the question
    And late answers should be rejected
    And the app should enter a transition state

  Scenario: Next question starts after transition
    Given the app is in the transition state
    When approximately 3 seconds pass
    Then the backend should start the next question automatically

  Scenario: Final results appear automatically
    Given the final question has closed
    When the transition finishes
    Then the game should finish
    And the final leaderboard should be shown
