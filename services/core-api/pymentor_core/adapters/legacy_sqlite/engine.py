"""SQLite connection options for the legacy storage adapter."""


def sqlite_connect_args():
    return {"check_same_thread": False}


def build_engine(url, factory):
    """Create only the compatibility SQLite engine; no policy/schema work."""
    return factory(url=url, connect_args=sqlite_connect_args(), echo=False)
