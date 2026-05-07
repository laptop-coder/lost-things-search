# LostThingsSearch

Lost and found service for educational institutions.

## User roles

| ID | Role |
| --- | --- |
| 1 | Superadmin |
| 2 | Admin |
| 3 | Institution Administrator |
| 4 | Staff |
| 5 | Teacher |
| 6 | Parent |
| 7 | Student |

**Superadmin** role is the system entrypoint. This account is created manually and there can be only one. `Superadmin` creates tokens for `admin` users registration, can assign/unassign `admin` role. In turn, **admins** manage the system (users, content). They can create tokens for all other users registration.

## Tech Stack

- **Backend:** Go, GORM, PostgreSQL, Valkey
- **Frontend:** SolidJS, TailwindCSS
- **Deploy:** Docker, Docker Compose, Nginx

## Getting Started
```bash
# Clone the repository
git clone https://github.com/laptop-coder/lost-things-search.git
cd ./lost-things-search
# Set up env variables
cp .env.example .env
vi .env
# First run (migrate + deploy + enable CI/CD)
make first-run
```

## Available `make` commands

| Command | Description |
| --- | --- |
| `migrate` | Run migrations |
| `cron` | Add cron CI/CD schedule (automatically download updates at night) |
| `deploy` | Start the app |
| `first-run` | `migrate` + `deploy` + `cron` |
| `logs` | See logs |
| `down` | Stop the app |
| `dev` | Run app in the development mode (with migrations) |

