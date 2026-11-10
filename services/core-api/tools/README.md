# Operator tools

Пакет tools не входит в production image и не импортируется runtime.
Запускать из services/core-api через `python -m tools.migration.NAME` / `tools.lab.NAME`.
Сохраняются локальные allowlist, контроль labels/volumes/ACL, writer checks и запрет
автоматического повтора после неизвестного исхода. Чужие journals/volumes не удаляются.
Maintenance требует явную БД и выбор --dry-run/--apply. Подробности — ../README.md.
