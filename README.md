# Study Library Seat Management System

A full-stack starter project for managing a 64-seat study library.

## Stack
- Frontend: React + Vite
- Backend: Django + Django REST Framework
- Database: SQLite (included with Django; no separate database server required)

## Features
- Admin login using Django authentication
- Register students with contact, chair preference, education, and membership details
- Digital seat map with the original 1–64 numbering arrangement
- Green seats are available; red/orange seats are occupied (Normal/Executive)
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
- `POST /api/seats/<seat_number>/upgrade/` — upgrade Normal chair to Executive chair (₹50/week for remaining weeks)
- `POST /api/seats/<seat_number>/release/` — release seat
- `GET /api/allocations/` — allocation history
- `GET /api/dashboard/` — counts and revenue/payment summary

## Notes
- Seat layout is represented by the 64-table architectural arrangement:
  - top-left vertical column: 7–1 (top to bottom)
  - top-middle vertical column: 8–16 (top to bottom, meeting table 19)
  - upper horizontal row: 17–25 (left to right)
  - middle vertical column: 34–36 (top to bottom)
  - middle two-row block: 33–26 over 37–44
  - lower horizontal row: 53–45 (left to right)
  - bottom alcove: 64–60 (left), 59 (center bottom), 54–58 (right)
- If you deploy this on a VPS that already hosts other applications, deploy it on a separate port/domain and inspect existing Nginx/Docker/services before changing anything. Do not overwrite existing configuration.
