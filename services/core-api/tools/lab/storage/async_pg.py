"""Opt-in asynchronous PostgreSQL unit-of-work adapter.

Constructing AsyncDatabase does not connect or create tables. Each
unit_of_work() call owns a new AsyncSession; never share it across tasks.
"""

from __future__ import annotations

import math
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from sqlalchemy.engine import make_url
from sqlalchemy.exc import ArgumentError
from sqlalchemy.ext.asyncio import AsyncEngine
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.ext.asyncio import async_sessionmaker
from sqlalchemy.ext.asyncio import create_async_engine


class AsyncUnitOfWork:
    """One session and transaction with explicit commit/rollback control."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def commit(self) -> None:
        await self.session.commit()

    async def rollback(self) -> None:
        await self.session.rollback()


class AsyncDatabase:
    """Explicit asyncpg engine factory with a bounded connection pool.

    The caller must close all units of work before awaiting dispose().
    No transactions are committed automatically when leaving a unit of work.
    """

    def __init__(
        self,
        url: str,
        *,
        pool_size: int = 5,
        max_overflow: int = 5,
        pool_timeout: float = 10.0,
        connect_timeout: float = 10.0,
        command_timeout: float = 30.0,
    ) -> None:
        try:
            dialect = make_url(url).drivername
        except (ArgumentError, TypeError, AttributeError):
            raise ValueError("Invalid PostgreSQL URL") from None

        if dialect != "postgresql+asyncpg":
            raise ValueError("URL must use the postgresql+asyncpg dialect")

        if (
            type(pool_size) is not int
            or not 1 <= pool_size <= 20
            or type(max_overflow) is not int
            or not 0 <= max_overflow <= 10
        ):
            raise ValueError("pool_size must be 1..20 and max_overflow 0..10")

        for name, timeout in (
            ("pool_timeout", pool_timeout),
            ("connect_timeout", connect_timeout),
            ("command_timeout", command_timeout),
        ):
            if (
                isinstance(timeout, bool)
                or not isinstance(timeout, (int, float))
                or not math.isfinite(timeout)
                or timeout <= 0
            ):
                raise ValueError(f"{name} must be a finite positive number")

        self._engine: AsyncEngine = create_async_engine(
            url,
            pool_size=pool_size,
            max_overflow=max_overflow,
            pool_timeout=pool_timeout,
            connect_args={
                "timeout": connect_timeout,
                "command_timeout": command_timeout,
            },
        )
        self._sessions: async_sessionmaker[AsyncSession] = async_sessionmaker(
            self._engine, expire_on_commit=False
        )

    @asynccontextmanager
    async def unit_of_work(self) -> AsyncIterator[AsyncUnitOfWork]:
        """Yield a fresh session; roll back anything not explicitly committed."""
        session = self._sessions()
        try:
            yield AsyncUnitOfWork(session)
        except BaseException:
            # Includes asyncio.CancelledError; close runs even if rollback fails.
            await session.rollback()
            raise
        else:
            if session.in_transaction():
                await session.rollback()
        finally:
            await session.close()

    async def dispose(self) -> None:
        """Release the async engine pool at application shutdown."""
        await self._engine.dispose()
