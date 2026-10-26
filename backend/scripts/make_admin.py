"""Выдаёт (или снимает) права администратора аккаунту по email.

Запуск из папки backend:
    python -m scripts.make_admin user@example.com          # выдать права
    python -m scripts.make_admin user@example.com --revoke # снять права
"""

import sys

from db.engine import SessionLocal
from db import models as models


def main() -> None:
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    email = sys.argv[1]
    revoke = "--revoke" in sys.argv[2:]

    db = SessionLocal()
    try:
        user = db.query(models.User).filter(models.User.email == email).first()
        if user is None:
            print(f"Аккаунт с email {email!r} не найден.")
            sys.exit(1)

        user.is_admin = not revoke
        db.commit()
        state = "снят с" if revoke else "выдан"
        print(f"Готово: доступ администратора {state} {user.username} <{user.email}> (id={user.id}).")
    finally:
        db.close()


if __name__ == "__main__":
    main()
