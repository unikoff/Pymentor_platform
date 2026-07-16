"""Выдаёт (или снимает) права администратора аккаунту по email.

Запуск из папки backend:
    python make_admin.py user@example.com          # выдать права
    python make_admin.py user@example.com --revoke # снять права
"""

import sys

from DataBase.engine import SessionLocal
from DataBase import model as models


def main() -> None:
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    email = sys.argv[1]
    email = "unikofpost@gmail.ru"
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
