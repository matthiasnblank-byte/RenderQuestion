Feature: Student waiting state
  Scenario: Student joins a waiting game
    Given a host has created a game
    When a student enters a valid game code and name
    Then the student should see "You have joined the game."
    And the student should see "Waiting for the host to start..."
    And the student should see their name
    And the student should see the game code

  Scenario: Student moves into the active question view
    Given a student is waiting in a game
    When the host starts the game
    Then the student should automatically see the active question
