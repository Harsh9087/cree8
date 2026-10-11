# Study Library Seat Management System

A full-stack starter project for managing a 51-seat study library.

## Stack
- Frontend: React + Vite
- Backend: Django + Django REST Framework
- Database: SQLite (included with Django; no separate database server required)

## Features
- Admin login using Django authentication
- Register students with contact, chair preference, education, and membership details
- Digital seat map with the original 1–51 numbering arrangement
- Green seats are available; red seats are occupied
- Click an available seat to allocate it to a registered student
- Chair type automatically sets the price: Normal ₹1,390; Executive ₹1,590
- Record duration, payment mode, amount paid, and pending balance
- Occupied seat details and release-seat action
- Dashboard counts and active membership tracking
- SQLite persistence

> This is a development-ready starter. Change the default admin password before deployment. It does not perform real UPI transactions; UPI is recorded as a payment method only.

## Project structure
```
study_library_seat_management/
  backend/
    manage.py
    requirements.txt
    library_project/
    library/
  frontend/
    package.json
    index.html
    src/
```

## 1. Backend setup
Requires Python 3.10+.

```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver 8000
```

API: `http://127.0.0.1:8000/api/`
Django admin: `http://127.0.0.1:8000/admin/`

## 2. Frontend setup
Requires Node.js 18+.

In another terminal:
```bash
cd frontend
npm install
npm run dev
```
Open the Vite URL shown in the terminal (usually `http://localhost:5173`).

Log in with the Django superuser username and password.

## 3. Running with Docker (Containerized Setup)

You can run both frontend and backend seamlessly using Docker and Docker Compose:

```bash
# Build and start all services
docker compose up --build

# Or run in detached/background mode:
docker compose up -d --build
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000/api/`
- Django Admin: `http://localhost:8000/admin/`

To create a superuser in the running Docker container:
```bash
docker compose exec backend python manage.py createsuperuser
```

To stop containers:
```bash
docker compose down
```

## 4. API endpoints
- `POST /api/auth/login/` — session login
- `POST /api/auth/logout/` — logout
- `GET /api/auth/me/` — current session user
- `GET/POST /api/students/` — list/register students
- `GET /api/seats/` — all seats and occupancy
- `POST /api/seats/<seat_number>/allocate/` — allocate seat
- `POST /api/seats/<seat_number>/release/` — release seat
- `GET /api/allocations/` — allocation history
- `GET /api/dashboard/` — counts and revenue/payment summary

## Notes
- Seat layout is represented by the original seat-number groups:
  - left upper column: 1–5 (displayed top to bottom as 5,4,3,2,1)
  - upper middle column: 6–11
  - upper horizontal row: 12–20
  - middle two-row block: 29–21 over 30–38
  - lower horizontal row: 47–39
  - left lower column: 51–48
- If you deploy this on a VPS that already hosts other applications, deploy it on a separate port/domain and inspect existing Nginx/Docker/services before changing anything. Do not overwrite existing configuration.
