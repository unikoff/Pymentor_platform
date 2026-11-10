# Build context: repository root. CI migration is a separate, currently frozen action.
FROM python:3.12.16-slim-trixie AS dependencies
ARG PROFILE=legacy_sqlite
ENV VIRTUAL_ENV=/opt/venv
RUN python -m venv "$VIRTUAL_ENV"
ENV PATH="$VIRTUAL_ENV/bin:$PATH"
WORKDIR /build
COPY requirements.txt ./requirements.txt
COPY backend/requirements*.txt ./backend/
RUN pip install --no-cache-dir --requirement requirements.txt
RUN case "$PROFILE" in postgres_redis) pip install --no-cache-dir -r backend/requirements-dual-local.txt ;; legacy_sqlite) ;; *) exit 2 ;; esac

FROM python:3.12.16-slim-trixie AS runtime
ARG PROFILE=legacy_sqlite
ENV PATH="/opt/venv/bin:$PATH" \
    PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PYMENTOR_LOG_TO_STDOUT=1 \
    PYMENTOR_REQUIRE_DATABASE_URL=1 PYMENTOR_LOCAL_NOTIFICATIONS=0 \
    PYTHONPATH=/app/services/core-api:/app/backend PYMENTOR_PROFILE=$PROFILE
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
