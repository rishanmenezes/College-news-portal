# MAHARAJA INSTITUTE OF TECHNOLOGY MYSORE — College News Porta

A colorful, responsive news/events portal for MAHARAJA INSTITUTE OF TECHNOLOGY MYSORE with a lightweight Node/Express backend that serves detailed event data.

Files:
- `index.html` — main page (student-facing)
- `styles.css` — styling (colorful glass look)
- `script.js` — fetches events from the backend, search, filters, and links to detail/registration pages
- `event.html` / `event.js` — standalone event detail view (read-only)
- `register.html` / `register.js` — dedicated registration page
- `admin.html` / `admin.js` — admin console for CRUD on events and registration approvals
- `server.js` — Express server exposing event and registration APIs
- `data/events.json` — canonical source for all news/event metadata
- `data/registrations.json` — submissions captured from the registration form

How to run

1. Install dependencies (first time only):
	```powershell
	cd c:\Users\91903\Desktop\M1PUNEET
	npm install
	```
2. Start the backend API:
	```powershell
	npm start
	```
	The Express server listens on `http://localhost:4000` and exposes:
	- `GET /api/events` (supports `?category=` and `?q=` filters)
	- `GET /api/events/:id`
	- `POST /api/events` — create new event (see `admin.js` for payload shape)
	- `DELETE /api/events/:id`
	- `GET /api/registrations` (supports `?eventId=`)
	- `POST /api/registrations` — body `{ eventId, name, email, department?, year?, phone?, notes? }`
	- `PATCH /api/registrations/:id` — update `{ status: 'pending' | 'accepted' | 'rejected' }`
3. New visitors should first open `signup.html`, pick their role (student or admin), complete the short form, and they'll be redirected to `login.html`. From there sign in as either **Student/Reader** (lands on `index.html`) or **Admin/Staff** (lands on `admin.html`). Keep the backend running the whole time.

	- Students can browse `index.html`, click **Read** for details, or **Register** to submit a form.
	- Admins can use `admin.html` to add/delete events and accept/reject registrations.
	- Credentials created during signup are stored in your browser's `localStorage`; login will fail if the email, password, and role combination does not match a saved account.

Optional static hosting: serve the `index.html` page via any static server if you prefer not to use `file://` URLs.

Next steps (optional):
- Persist events in a database (SQLite, MongoDB, etc.).
- Add pagination or infinite scroll for large feeds.
- Add authentication and dashboards for contributors.
- Pipe registrations to email/SMS notifications or sync with Google Sheets/Airtable.
