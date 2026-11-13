# Build context: repository root. Default target is the single serving runtime.
FROM python:3.12.16-slim-trixie AS dependencies
ENV VIRTUAL_ENV=/opt/venv
RUN python -m venv "$VIRTUAL_ENV"
ENV PATH="$VIRTUAL_ENV/bin:$PATH"
WORKDIR /build
COPY services/core-api/requirements-runtime.txt ./requirements.txt
RUN pip install --no-cache-dir --requirement requirements.txt

FROM dependencies AS migration-dependencies
COPY services/core-api/requirements-migration.txt ./requirements-migration.txt
RUN pip install --no-cache-dir --requirement requirements-migration.txt

FROM python:3.12.16-slim-trixie AS runtime-base
ENV PATH="/opt/venv/bin:$PATH" \
    PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PYMENTOR_LOG_TO_STDOUT=1 \
    PYTHON_DOTENV_DISABLED=1 PYMENTOR_LOCAL_NOTIFICATIONS=0 \
    PYTHONPATH=/app/services/core-api:/app/backend
RUN addgroup --system --gid 10001 app && adduser --system --uid 10001 --ingroup app --no-create-home app
COPY --from=dependencies /opt/venv /opt/venv
COPY --chown=app:app backend/content /app/backend/content
COPY --chown=app:app services/core-api/pymentor_core /app/services/core-api/pymentor_core
RUN mkdir -p /app/data/core-api && chown app:app /app/data/core-api
ENV PYMENTOR_STATE_DIR=/app/data/core-api
WORKDIR /app
USER 10001:10001
EXPOSE 8001
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 CMD python -c "from urllib.request import urlopen; urlopen('http://127.0.0.1:8001/health/live', timeout=2)" || exit 1
CMD ["uvicorn", "pymentor_core.app.asgi:create_app", "--factory", "--host", "0.0.0.0", "--port", "8001"]

FROM runtime-base AS migrations
COPY --from=migration-dependencies /opt/venv /opt/venv
COPY --chown=app:app services/core-api/migrations /app/services/core-api/migrations
COPY --chown=app:app services/core-api/alembic-runtime.ini /app/services/core-api/alembic-runtime.ini
ENTRYPOINT ["python", "-m", "alembic", "-c", "/app/services/core-api/alembic-runtime.ini"]
CMD ["upgrade", "head"]

FROM runtime-base AS runtime
