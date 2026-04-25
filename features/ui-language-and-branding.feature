Feature: UI language and branding
  Scenario: Application uses the Final Questions name
    Given a user opens the application
    Then the visible app name should be "Final Questions"

  Scenario: Application text is English
    Given a user interacts with the application
    Then all visible UI labels should be in English
    And all visible error messages should be in English

  Scenario: Previous brand wording is absent
    Given the repository is searched
    Then no previous brand wording should remain in code, UI, README, documentation, comments, package names, or feature files
