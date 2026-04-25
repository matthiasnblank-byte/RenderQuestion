Feature: Admin access protection
  Scenario: Host enters the correct password
    Given the host is on the admin login screen
    When the host enters the password "123456"
    Then the host should see the admin dashboard

  Scenario: Host enters an incorrect password
    Given the host is on the admin login screen
    When the host enters an incorrect password
    Then the host should see an English error message
    And the admin dashboard should remain inaccessible

  Scenario: Student joins without an admin password
    Given a game exists
    When a student enters the game code and a name
    Then the student should join the game without entering the admin password
