# LostThingsSearch

Lost and found service for educational institutions.

[![License: MIT](https://img.shields.io/badge/license-MIT-green?style=flat-square)](https://github.com/laptop-coder/lost-things-search/blob/main/LICENSE) [![Latest](https://img.shields.io/github/v/release/laptop-coder/lost-things-search?style=flat-square&label=latest)](https://github.com/laptop-coder/lost-things-search/releases) [![Release](https://img.shields.io/github/actions/workflow/status/laptop-coder/lost-things-search/release.yaml?branch=main&style=flat-square&label=release)](https://github.com/laptop-coder/lost-things-search/actions/workflows/release.yaml) [![Tests](https://img.shields.io/github/actions/workflow/status/laptop-coder/lost-things-search/test.yaml?style=flat-square&label=tests)](https://github.com/laptop-coder/lost-things-search/actions/workflows/test.yaml)

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
- **ML:** Python (`apanc/russian-inappropriate-messages`, `sergeyzh/rubert-mini-sts`, YOLO)
- **Frontend:** SolidJS, TailwindCSS
- **Android/iOS/Linux/Windows/macOS app**: Flutter (Dart)
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
| `help` | Display available `make` commands |

## Contributing
Please read [CONTRIBUTING.md](https://github.com/laptop-coder/lost-things-search/blob/main/CONTRIBUTING.md) before submitting a Pull Request.

## More information

### User types

| Type  | Description                                |
| ----- | ------------------------------------------ |
| human | A regular account belonging to a person    |
| bot   | Used to automatically moderate posts, e.g. |

### Posts moderation statuses

| Status        | Description                                                                                    |
| ------------- | ---------------------------------------------------------------------------------------------- |
| pending       | Awaiting verification                                                                          |
| in_progress   | Currently being checked                                                                        |
| auto_approved | Automatically approved by a bot                                                                |
| auto_rejected | Automatically rejected by a bot                                                                |
| approved      | Approved by a human                                                                            |
| rejected      | Rejected by a human                                                                            |
| needs_review  | The bot does not know whether to approve or reject the post, verification by human is required |
