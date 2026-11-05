import pytest
from c222_pg_guard import validate_test_url


@pytest.mark.parametrize("url", [
    "postgresql+asyncpg://pymentor_test:p@127.0.0.1:57152/pymentor_test",
    "postgresql+asyncpg://pymentor_test:p@localhost:57152/pymentor_test",
])
def test_guard_accepts_only_disposable_local_configuration(url):
    assert validate_test_url(url).database == "pymentor_test"


@pytest.mark.parametrize("url", [
    "postgresql+asyncpg://pymentor_test:p@127.0.0.1:5432/pymentor_test",
    "postgresql+asyncpg://other:p@127.0.0.1:57152/pymentor_test",
    "postgresql+asyncpg://pymentor_test:p@127.0.0.1:57152/other",
    "postgresql+asyncpg://pymentor_test:p@example.com:57152/pymentor_test",
    "postgresql+asyncpg://pymentor_test:p@127.0.0.1:57152/pymentor_test?sslmode=require",
    "sqlite:///:memory:",
])
def test_guard_rejects_any_other_database(url):
    with pytest.raises(ValueError):
        validate_test_url(url)
