"""Legacy WSGI hosting: a2wsgi is HTTP-only and never drives ASGI lifespan."""

from threading import Lock


def create_wsgi_application(app):
    if app.state.profile != "legacy_sqlite":
        raise RuntimeError(
            "Passenger entrypoint only supports legacy_sqlite; use ASGI for postgres_redis"
        )
    from a2wsgi import ASGIMiddleware

    transport = ASGIMiddleware(app)
    lock = Lock()
    initialized = False

    def application(environ, start_response):
        nonlocal initialized
        if not initialized:
            with lock:
                if not initialized:
                    from pymentor_core.app.wiring import initialize_legacy_schema

                    initialize_legacy_schema()
                    initialized = True
        return transport(environ, start_response)

    return application
