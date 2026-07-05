project/
│
├── api/
│ ├── main.py # FastAPI application entry
│ │
│ ├── core/ # Application-wide configuration
│ │ ├── config.py
│ │ ├── logging.py
│ │ ├── settings.py
│ │ └── constants.py
│ │
│ ├── app/
│ │ ├── deps.py # Common dependencies
│ │ ├── router.py # Root API router
│ │ └── v1/
│ │ └── router.py
│ │
│ ├── modules/
│ │ ├── auth/
│ │ │ ├── router.py
│ │ │ ├── service.py
│ │ │ ├── repository.py
│ │ │ ├── models.py
│ │ │ ├── schemas.py
│ │ │ ├── dependencies.py
│ │ │ └── **init**.py
│ │ │
│ │ ├── users/
│ │ │ ├── router.py
│ │ │ ├── service.py
│ │ │ ├── repository.py
│ │ │ ├── models.py
│ │ │ ├── schemas.py
│ │ │ └── **init**.py
│ │ │
│ │ ├── products/
│ │ └── orders/
│ │
│ ├── shared/
│ │ ├── database/
│ │ │ ├── base.py
│ │ │ ├── session.py
│ │ │ ├── models.py
│ │ │ └── migrations.py
│ │ │
│ │ ├── security/
│ │ │ ├── jwt.py
│ │ │ ├── hashing.py
│ │ │ └── permissions.py
│ │ │
│ │ ├── exceptions/
│ │ │ ├── handlers.py
│ │ │ └── custom.py
│ │ │
│ │ ├── utils/
│ │ │ ├── pagination.py
│ │ │ ├── response.py
│ │ │ ├── validators.py
│ │ │ └── helpers.py
│ │ │
│ │ └── **init**.py
│ │
│ ├── middleware/
│ │ ├── auth.py
│ │ ├── logging.py
│ │ ├── cors.py
│ │ └── request_id.py
│ │
│ └── tests/
│ ├── unit/
│ ├── integration/
│ └── conftest.py
│
├── alembic/
├── scripts/
├── .env
├── .env.example
├── Dockerfile
├── docker-compose.yml
├── pyproject.toml
├── requirements.txt
├── README.md
└── .gitignore
