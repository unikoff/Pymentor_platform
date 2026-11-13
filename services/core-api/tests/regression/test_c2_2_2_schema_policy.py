import pytest

from pymentor_core.app.schema_policy import should_run_legacy_bootstrap


def test_postgres_defaults_to_externally_managed_schema():
    assert should_run_legacy_bootstrap("postgresql", None) is False


def test_managed_schema_never_runs_bootstrap():
    assert should_run_legacy_bootstrap("postgresql", "managed") is False
    with pytest.raises(RuntimeError):
        should_run_legacy_bootstrap("sqlite", "managed")


@pytest.mark.parametrize("backend,mode", [("postgresql", "typo"), ("postgresql", "legacy"), ("sqlite", "typo")])
def test_unsupported_configuration_fails_closed(backend, mode):
    with pytest.raises(RuntimeError):
        should_run_legacy_bootstrap(backend, mode)
