import pytest

from pymentor_core.app.schema_policy import should_run_legacy_bootstrap


def test_legacy_sqlite_defaults_to_the_existing_bootstrap():
    assert should_run_legacy_bootstrap("sqlite", None) is True


def test_managed_schema_never_runs_bootstrap():
    assert should_run_legacy_bootstrap("postgresql", "managed") is False
    assert should_run_legacy_bootstrap("sqlite", "managed") is False


@pytest.mark.parametrize("backend,mode", [("postgresql", None), ("postgresql", "legacy"), ("sqlite", "typo")])
def test_unsupported_configuration_fails_closed(backend, mode):
    with pytest.raises(RuntimeError):
        should_run_legacy_bootstrap(backend, mode)
