"""Preview an administrator permission change against an explicitly selected database."""

import argparse
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from pymentor_core.adapters.sql import models


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("email")
    parser.add_argument("--revoke", action="store_true")
    parser.add_argument("--database-url", required=True)
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--dry-run", action="store_true")
    mode.add_argument("--apply", action="store_true")
    args = parser.parse_args()
    engine = create_engine(args.database_url, hide_parameters=True)
    try:
        with sessionmaker(bind=engine)() as db:
            user = db.query(models.User).filter(models.User.email == args.email).first()
            if user is None:
                parser.exit(1, "Account not found.\n")
            if args.apply:
                user.is_admin = not args.revoke
                db.commit()
            else:
                db.rollback()
            print(
                ("Applied: " if args.apply else "Preview: ")
                + "administrator access "
                + ("revoked." if args.revoke else "granted.")
            )
    finally:
        engine.dispose()


if __name__ == "__main__":
    main()
