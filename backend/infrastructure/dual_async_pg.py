"""Opt-in async PostgreSQL adapter for isolated local development."""

from __future__ import annotations

import asyncio
import math
from typing import Any

from sqlalchemy.engine import make_url
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine


class AsyncUnitOfWork:
    """Own one session; commits are explicit and uncommitted work is rolled back."""

    def __init__(self, factory: async_sessionmaker[AsyncSession]) -> None:
        self._factory = factory
        self.session: AsyncSession | None = None

    async def __aenter__(self) -> "AsyncUnitOfWork":
        if self.session is not None:
            raise RuntimeError("A unit of work cannot be entered twice")
        self.session = self._factory()
        return self

    async def commit(self) -> None:
        if self.session is None:
            raise RuntimeError("Unit of work is not active")
        await self.session.commit()

    async def rollback(self) -> None:
        if self.session is None:
            raise RuntimeError("Unit of work is not active")
        await self.session.rollback()

    async def __aexit__(self, exc_type: Any, exc: Any, traceback: Any) -> None:
        session = self.session
        if session is None:
            raise RuntimeError("Unit of work is not active")

        async def cleanup() -> None:
            try:
                if session.in_transaction():
                    await session.rollback()
            finally:
                await session.close()

        # Preserve cleanup even if another cancellation arrives during rollback.
        task = asyncio.create_task(cleanup())
        interrupted = False
        try:
            while True:
                try:
                    await asyncio.shield(task)
                    break
                except asyncio.CancelledError:
                    if task.cancelled():
                        raise
                    interrupted = True
            if interrupted:
                raise asyncio.CancelledError
        finally:
            self.session = None


class AsyncDatabase:
    """Create a bounded pool explicitly; never consult the legacy DATABASE_URL."""

    def __init__(self, url: str, *, pool_size: int = 5, max_overflow: int = 5,
                 pool_timeout: float = 10.0, connect_timeout: float = 10.0,
                 command_timeout: float = 30.0) -> None:
        parsed = make_url(url)
        if (parsed.drivername != "postgresql+asyncpg"
                or parsed.host not in {"localhost", "127.0.0.1", "::1"}
                or parsed.query):
            raise ValueError("The local async profile requires a loopback PostgreSQL asyncpg URL")
        if type(pool_size) is not int or not 1 <= pool_size <= 20:
            raise ValueError("pool_size must be an integer between 1 and 20")
        if type(max_overflow) is not int or not 0 <= max_overflow <= 10:
            raise ValueError("max_overflow must be an integer between 0 and 10")
        for value in (pool_timeout, connect_timeout, command_timeout):
            if isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(value) or value <= 0:
                raise ValueError("timeouts must be finite positive numbers")
        self.engine = create_async_engine(
            url,
            pool_size=pool_size,
            max_overflow=max_overflow,
            pool_timeout=pool_timeout,
            pool_pre_ping=True,
            hide_parameters=True,
            isolation_level="READ COMMITTED",
            connect_args={"timeout": connect_timeout, "command_timeout": command_timeout},
        )
        self._factory = async_sessionmaker(self.engine, expire_on_commit=False, autoflush=False)
        self._disposed = False

    def unit_of_work(self) -> AsyncUnitOfWork:
        if self._disposed:
            raise RuntimeError("AsyncDatabase has been disposed")
        return AsyncUnitOfWork(self._factory)

    async def dispose(self) -> None:
        if not self._disposed:
            await self.engine.dispose()
            self._disposed = True
