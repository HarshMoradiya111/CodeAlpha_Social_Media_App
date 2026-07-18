# CodeAlpha_Social_Media_App

Full stack internship project for CodeAlpha.

## Repo layout
- `backend/` - Express + MongoDB API
- `frontend/` - React + Vite client

## Setup
Backend:
1. `cd backend`
2. `npm install`
3. Copy `.env.example` to `.env`
4. Fill in MongoDB and JWT values
5. Run `npm start`

Frontend:
1. `cd frontend`
2. `npm install`
3. Optionally set `VITE_API_BASE_URL`
4. Run `npm run dev`

## Environment variables
Backend:
- `PORT`
- `MONGO_URI`
- `JWT_SECRET`
- `CLIENT_URL`

Frontend:
- `VITE_API_BASE_URL`

## Current backend features
- Auth: register and login with bcrypt and JWT
- Users: profile fetch, profile update, follow, and unfollow
- Posts: create, feed, user posts, detail view, like toggle, delete
- Comments: create and list comments for a post

## Current frontend features
- Feed with create-post composer
- Profile page with follower/following counts
- Post detail view with comments
- Login and registration screens
- Local auth state with a responsive UI

## API summary
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/users/:id`
- `PUT /api/users/:id`
- `POST /api/users/:id/follow`
- `POST /api/users/:id/unfollow`
- `POST /api/posts`
- `GET /api/posts/feed`
- `GET /api/posts/user/:id`
- `GET /api/posts/:id`
- `POST /api/posts/:id/like`
- `POST /api/posts/:id/comments`
- `GET /api/posts/:id/comments`

## GitHub repository name
Use this exact repo name:

`CodeAlpha_Social_Media_App`

## Push flow
If you are setting up the repo yourself, use:

```bash
git init
git add .
git commit -m "Initial CodeAlpha Social Media App scaffold"
git branch -M main
git remote add origin https://github.com/<your-username>/CodeAlpha_Social_Media_App.git
git push -u origin main
```

## Submission checklist
1. Push source code to `CodeAlpha_Social_Media_App`.
2. Record a short demo video.
3. Post on LinkedIn tagging `@CodeAlpha` with the repo link.
4. Submit through the WhatsApp form.
5. Keep at least 2 to 3 completed tasks for certificate eligibility.

## Notes
- The frontend uses React Router, so install dependencies before running it locally.
- If you want image uploads later, you can replace the URL input with `multer`.
