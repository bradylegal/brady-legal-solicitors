# Brady Legal — Backend

Flask + SQLite API powering the contact form, client reviews and the admin panel.

## Run locally

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

The API runs on http://127.0.0.1:8000 and the admin panel at http://127.0.0.1:8000/admin.

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET  | `/api/health` | Health check |
| GET  | `/api/reviews` | Public approved reviews |
| POST | `/api/reviews` | Submit a review (goes to moderation) |
| POST | `/api/contact` | Submit a contact form enquiry |
| POST | `/api/admin/login` | Admin sign in (session cookie) |
| POST | `/api/admin/logout` | Sign out |
| GET  | `/api/admin/session` | Check sign-in state |
| GET  | `/api/admin/messages` | List enquiries |
| DELETE | `/api/admin/messages/<id>` | Delete an enquiry |
| GET  | `/api/admin/reviews` | List all reviews |
| POST | `/api/admin/reviews/<id>/approve` | Approve a review |
| DELETE | `/api/admin/reviews/<id>` | Delete a review |
| GET  | `/admin` | Admin panel |

## Admin credentials

Defaults: `admin` / `admin123`. Set the environment variables `ADMIN_USER`,
`ADMIN_PASS` and `SECRET_KEY` in production (Render dashboard → Environment).

## Data

SQLite database stored at `backend/data/app.db` (auto-created). The ten seeded
reviews from the website are inserted as approved on first run.

## Deploy on Render (free)

1. Push this repository to GitHub (already done).
2. In Render: **New → Blueprint**, pick this repo. `render.yaml` configures
   everything automatically.
3. Set `ADMIN_PASS` (and optionally `ADMIN_USER`) under Environment once created.
4. In `js/main.js` set `API_BASE` to your service URL, e.g.
   `https://brady-legal-api.onrender.com`.

Note: free Render instances sleep after 15 minutes of inactivity; the first
request after waking takes about a minute.
