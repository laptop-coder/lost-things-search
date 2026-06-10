FROM python:3.12-slim

# Install uv.
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app
COPY pyproject.toml uv.lock ./

# Install the application dependencies.
RUN apt-get update && \
    apt-get install -y gcc g++ meson wget && \
    rm -rf /var/lib/apt/lists/* && \
    uv sync --frozen # --no-cache

# Copy the application into the container.
COPY app app

# Run the application.
CMD ["/app/.venv/bin/fastapi", "run", "app/main.py", "--port", "4746", "--host", "0.0.0.0"]
