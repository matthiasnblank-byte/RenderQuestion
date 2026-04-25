# Admin Access

Final Questions uses simple classroom-level password protection for the host dashboard.

The default admin password is:

```text
123456
```

The backend can override this value with:

```text
ADMIN_PASSWORD=your-password
```

The frontend sends the entered password to the backend for validation. If the password is correct, the host dashboard becomes available. If it is incorrect, the user sees an English error message and the dashboard remains inaccessible.

Students do not need the admin password to join a game.

This is intentionally not production-grade authentication. It does not use a database, accounts, external identity providers, or JWT. It is sufficient for a controlled classroom session.
