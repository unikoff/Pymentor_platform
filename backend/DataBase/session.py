import json
import uuid
import redis.asyncio as redis
import os
from dotenv import load_dotenv

load_dotenv()
REDIS_URL = os.environ.get("REDIS_URL")
SESSION_TTL_SECONDS = 365 * 24 * 3600  # 1 год

redis_client = redis.from_url(
    REDIS_URL,
    encoding="utf-8",
    decode_responses=True
)


async def create_session(user_id: int) -> str:
    """Создает новый токен сессии, сохраняет его в Redis и возвращает строку токена."""
    token = str(uuid.uuid4())
    payload = {"user_id": user_id}

    await redis_client.set(
        f"session:{token}",
        json.dumps(payload),
        ex=SESSION_TTL_SECONDS
    )
    return token


async def get_session(token: str) -> dict[str, str] | None:
    """Получает данные сессии по токену из Redis и продлевает TTL."""
    key = f"session:{token}"
    data = await redis_client.get(key)
    if not data:
        return None
    await redis_client.expire(key, SESSION_TTL_SECONDS)
    return json.loads(data)


async def delete_session(token: str) -> None:
    """Удаляет сессию по токену."""
    await redis_client.delete(f"session:{token}")

async def view_sessions(user_id: int) -> list[dict[str, str]]:
    """Возвращает список всех активных сессий."""
    keys = await redis_client.keys("session:*")
    sessions = []
    for key in keys:
        data = await redis_client.get(key)
        if data:
            session_data = json.loads(data)
            if session_data.get("user_id") == user_id:
                sessions.append(session_data)
    return sessions