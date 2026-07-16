FROM python:3.12-slim AS builder
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/
WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-cache

FROM python:3.12-slim
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/
WORKDIR /app
COPY --from=builder /app/.venv /app/.venv
COPY app app
ADD https://huggingface.co/Ultralytics/YOLO26/resolve/main/yolo26n.pt app/models/yolo26n.pt
RUN apt-get update && \
    apt-get install -y wget && \
    rm -rf /var/lib/apt/lists/*
CMD ["/app/.venv/bin/fastapi", "run", "app/main.py", "--port", "4746", "--host", "0.0.0.0"]
