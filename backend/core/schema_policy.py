"""Choose legacy SQLite bootstrap or externally managed migrations explicitly."""

DUAL_LOCAL_SCHEMA_REVISION = "c216_import_marker"


def should_run_legacy_bootstrap(database_backend: str, mode: str | None) -> bool:
    selected = (mode or "legacy").strip().lower()
    if selected not in {"legacy", "managed"}:
        raise RuntimeError("PYMENTOR_SCHEMA_MODE must be legacy or managed")
    if selected == "legacy":
        if database_backend != "sqlite":
            raise RuntimeError("Legacy schema bootstrap is only available for SQLite")
        return True
    if database_backend not in {"sqlite", "postgresql"}:
        raise RuntimeError("Managed schema mode supports SQLite or PostgreSQL only")
    return False
