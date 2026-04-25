# Render Deployment

Final Questions is deployed to Render as two services from one GitHub repository.

## Frontend Static Site

Create a Render Static Site with:

```text
Root Directory: frontend
Build Command: npm install && npm run build
Publish Directory: dist
```

Environment variable:

```text
VITE_BACKEND_URL=https://your-backend-service.onrender.com
```

The frontend must be redeployed after changing `VITE_BACKEND_URL` because Vite embeds this value at build time.

## Backend Web Service

Create a Render Web Service with:

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

`ADMIN_PASSWORD` is optional. If it is not set, the backend uses `123456`.

Do not configure `PORT` manually. Render provides `PORT`, and the server reads it from `process.env.PORT`.

## One Repository, Two Services

Both Render services should point to the same GitHub repository and branch. The frontend service uses `frontend` as its root directory. The backend service uses `backend` as its root directory.
