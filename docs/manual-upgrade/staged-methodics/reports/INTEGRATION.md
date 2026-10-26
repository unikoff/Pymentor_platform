# Интеграция стадийных методичек Pymentor

**STATUS: DOCS_INTEGRATED (2026-10-25).** Девять рабочих инструкций доступны: P1–P4, M1–M5; две новые карты маршрутов и три совместимых навигационных файла записаны. Проектное основание: [ARCHITECTURE.md](../ARCHITECTURE.md), зафиксированный `baseline.json` и `COMPATIBILITY_HEADINGS.json`. Исторические файлы COURSE, BLOCK, REVIEW, StudyHub и PROJECT_CONTEXT не менялись.

## Выполненные изменения

- `LES_PLAN/README.md`: один канонический MD, точный маршрут P1 → P4, статусы A, паспортные диапазоны, сохранение YouTube/ID, локальная и полная приёмка, продолжение с первой неподтверждённой части. Концептуальная сверка и принятие объединены в P4, отдельного P5 нет.
- `LES_MAIN/README.md`: полный безверхнеограниченный M1/M2, содержательная редактура M3 с точным подсчётом видимой TSX-теории, полезные визуалы и ритм M4, четыре уровня фактической приёмки M5. Для практики квота слов не введена. Ровно две стандартные connected-группы (00 + финал), максимум шесть групп; ритм ≤2 читаемых абзацев без содержательного интерактива **или** учебного визуала. Статический содержательный визуал допускается.
- `LESSON_PLAN_GUIDE.md` и `LESSON_AUTHORING_GUIDE.md`: бывшие операционные монолиты заменены диспетчерами со всеми прежними заголовками и адресацией каждого к новой методичке. Полный запрос проходит до P4/M5, точечный запрос — только Pn/Mn, без автоматического создания чатов и повторения принятых стадий.
- `docs/manual/README.md`: добавлены маршруты PLAN/MAIN с сохранением общей последовательности COURSE → BLOCK → PLAN → AUTHORING → REVIEW и отдельного StudyHub. Сквозные этапы 1 (COURSE+BLOCK), 2 (PLAN), 3 (AUTHORING), 4 (REVIEW) не перенумерованы. Общие файлы одного или нескольких занятий имеют последовательную запись/единого владельца.

## Совместимость заголовков: oldanchor → newdoc

Полная матрица **8 PLAN + 27 AUTHORING = 35** сохранённых заголовков. Ссылки слева ведут к старым реальным якорям, справа — к соответствующей рабочей инструкции. Прежние файлы используются только для входа и навигации.

| Старый якорь PLAN | Новая инструкция |
| --- | --- |
| [Методичка: план занятия по концепту](../../../manual/LESSON_PLAN_GUIDE.md#методичка-план-занятия-по-концепту) | [LES_PLAN/README.md](../../../manual/LES_PLAN/README.md) |
| [Главный план работы](../../../manual/LESSON_PLAN_GUIDE.md#главный-план-работы) | [LES_PLAN/README.md](../../../manual/LES_PLAN/README.md) |
| [1. Вход запуска, задача и границы](../../../manual/LESSON_PLAN_GUIDE.md#1-вход-запуска-задача-и-границы) | [LES_PLAN/01_PLAN_FRAME.md](../../../manual/LES_PLAN/01_PLAN_FRAME.md) |
| [2. Источники и подтверждение опоры](../../../manual/LESSON_PLAN_GUIDE.md#2-источники-и-подтверждение-опоры) | [LES_PLAN/01_PLAN_FRAME.md](../../../manual/LES_PLAN/01_PLAN_FRAME.md) |
| [3. Теория](../../../manual/LESSON_PLAN_GUIDE.md#3-теория) | [LES_PLAN/02_THEORY_ROUTE.md](../../../manual/LES_PLAN/02_THEORY_ROUTE.md) |
| [4. Практика](../../../manual/LESSON_PLAN_GUIDE.md#4-практика) | [LES_PLAN/03_PRACTICE_ROUTE.md](../../../manual/LES_PLAN/03_PRACTICE_ROUTE.md) |
| [5. Приёмка и завершение](../../../manual/LESSON_PLAN_GUIDE.md#5-приёмка-и-завершение) | [LES_PLAN/04_PLAN_ACCEPTANCE.md](../../../manual/LES_PLAN/04_PLAN_ACCEPTANCE.md) |
| [Шаблон плана](../../../manual/LESSON_PLAN_GUIDE.md#шаблон-плана) | [LES_PLAN/01_PLAN_FRAME.md](../../../manual/LES_PLAN/01_PLAN_FRAME.md) |

| Старый якорь AUTHORING | Новая инструкция |
| --- | --- |
| [Создание и переработка занятий Pymentor](../../../manual/LESSON_AUTHORING_GUIDE.md#создание-и-переработка-занятий-pymentor) | [LES_MAIN/README.md](../../../manual/LES_MAIN/README.md) |
| [Главный план работы](../../../manual/LESSON_AUTHORING_GUIDE.md#главный-план-работы) | [LES_MAIN/README.md](../../../manual/LES_MAIN/README.md) |
| [1. Задача и границы](../../../manual/LESSON_AUTHORING_GUIDE.md#1-задача-и-границы) | [LES_MAIN/01_THEORY_DRAFT.md](../../../manual/LES_MAIN/01_THEORY_DRAFT.md) |
| [2. Контекст и порядок работы](../../../manual/LESSON_AUTHORING_GUIDE.md#2-контекст-и-порядок-работы) | [LES_MAIN/01_THEORY_DRAFT.md](../../../manual/LES_MAIN/01_THEORY_DRAFT.md) |
| [Что ученик уже знает](../../../manual/LESSON_AUTHORING_GUIDE.md#что-ученик-уже-знает) | [LES_MAIN/01_THEORY_DRAFT.md](../../../manual/LES_MAIN/01_THEORY_DRAFT.md) |
| [Сверка проекта по StudyHub](../../../manual/LESSON_AUTHORING_GUIDE.md#сверка-проекта-по-studyhub) | [LES_MAIN/01_THEORY_DRAFT.md](../../../manual/LES_MAIN/01_THEORY_DRAFT.md) |
| [Экономия контекста](../../../manual/LESSON_AUTHORING_GUIDE.md#экономия-контекста) | [LES_MAIN/01_THEORY_DRAFT.md](../../../manual/LES_MAIN/01_THEORY_DRAFT.md) |
| [Отдельный файл занятия и привязка](../../../manual/LESSON_AUTHORING_GUIDE.md#отдельный-файл-занятия-и-привязка) | [LES_MAIN/01_THEORY_DRAFT.md](../../../manual/LES_MAIN/01_THEORY_DRAFT.md) |
| [3. Теория: объяснение прежде применения](../../../manual/LESSON_AUTHORING_GUIDE.md#3-теория-объяснение-прежде-применения) | [LES_MAIN/01_THEORY_DRAFT.md](../../../manual/LES_MAIN/01_THEORY_DRAFT.md) |
| [Точность правил и различающих примеров](../../../manual/LESSON_AUTHORING_GUIDE.md#точность-правил-и-различающих-примеров) | [LES_MAIN/03_CONTENT_EDIT.md](../../../manual/LES_MAIN/03_CONTENT_EDIT.md) |
| [Теория для повторного обращения](../../../manual/LESSON_AUTHORING_GUIDE.md#теория-для-повторного-обращения) | [LES_MAIN/01_THEORY_DRAFT.md](../../../manual/LES_MAIN/01_THEORY_DRAFT.md) |
| [Два обязательных связанных раздела](../../../manual/LESSON_AUTHORING_GUIDE.md#два-обязательных-связанных-раздела) | [LES_MAIN/04_VISUAL_INTERACTIVE.md](../../../manual/LES_MAIN/04_VISUAL_INTERACTIVE.md) |
| [4. Объём](../../../manual/LESSON_AUTHORING_GUIDE.md#4-объём) | [LES_MAIN/03_CONTENT_EDIT.md](../../../manual/LES_MAIN/03_CONTENT_EDIT.md) |
| [5. Интерактивы и язык](../../../manual/LESSON_AUTHORING_GUIDE.md#5-интерактивы-и-язык) | [LES_MAIN/04_VISUAL_INTERACTIVE.md](../../../manual/LES_MAIN/04_VISUAL_INTERACTIVE.md) |
| [6. Списки и оформление](../../../manual/LESSON_AUTHORING_GUIDE.md#6-списки-и-оформление) | [LES_MAIN/04_VISUAL_INTERACTIVE.md](../../../manual/LES_MAIN/04_VISUAL_INTERACTIVE.md) |
| [7. Практика и подключение](../../../manual/LESSON_AUTHORING_GUIDE.md#7-практика-и-подключение) | [LES_MAIN/02_PRACTICE_DRAFT.md](../../../manual/LES_MAIN/02_PRACTICE_DRAFT.md) |
| [Условия и форматы](../../../manual/LESSON_AUTHORING_GUIDE.md#условия-и-форматы) | [LES_MAIN/02_PRACTICE_DRAFT.md](../../../manual/LES_MAIN/02_PRACTICE_DRAFT.md) |
| [Пути, ключи и реальная выдача](../../../manual/LESSON_AUTHORING_GUIDE.md#пути-ключи-и-реальная-выдача) | [LES_MAIN/05_LESSON_ACCEPTANCE.md](../../../manual/LES_MAIN/05_LESSON_ACCEPTANCE.md) |
| [Обязательная регистрация и end-to-end проверка](../../../manual/LESSON_AUTHORING_GUIDE.md#обязательная-регистрация-и-end-to-end-проверка) | [LES_MAIN/05_LESSON_ACCEPTANCE.md](../../../manual/LES_MAIN/05_LESSON_ACCEPTANCE.md) |
| [8. Учебные схемы в TSX и CSS](../../../manual/LESSON_AUTHORING_GUIDE.md#8-учебные-схемы-в-tsx-и-css) | [LES_MAIN/04_VISUAL_INTERACTIVE.md](../../../manual/LES_MAIN/04_VISUAL_INTERACTIVE.md) |
| [Общие компоненты схем](../../../manual/LESSON_AUTHORING_GUIDE.md#общие-компоненты-схем) | [LES_MAIN/04_VISUAL_INTERACTIVE.md](../../../manual/LES_MAIN/04_VISUAL_INTERACTIVE.md) |
| [Смысл и подписи](../../../manual/LESSON_AUTHORING_GUIDE.md#смысл-и-подписи) | [LES_MAIN/04_VISUAL_INTERACTIVE.md](../../../manual/LES_MAIN/04_VISUAL_INTERACTIVE.md) |
| [Непрерывные соединения](../../../manual/LESSON_AUTHORING_GUIDE.md#непрерывные-соединения) | [LES_MAIN/04_VISUAL_INTERACTIVE.md](../../../manual/LES_MAIN/04_VISUAL_INTERACTIVE.md) |
| [Раскладка, оформление и доступность](../../../manual/LESSON_AUTHORING_GUIDE.md#раскладка-оформление-и-доступность) | [LES_MAIN/04_VISUAL_INTERACTIVE.md](../../../manual/LES_MAIN/04_VISUAL_INTERACTIVE.md) |
| [Приёмка и обязательная перепроверка](../../../manual/LESSON_AUTHORING_GUIDE.md#приёмка-и-обязательная-перепроверка) | [LES_MAIN/04_VISUAL_INTERACTIVE.md](../../../manual/LES_MAIN/04_VISUAL_INTERACTIVE.md) |
| [9. Приёмка и завершение](../../../manual/LESSON_AUTHORING_GUIDE.md#9-приёмка-и-завершение) | [LES_MAIN/05_LESSON_ACCEPTANCE.md](../../../manual/LES_MAIN/05_LESSON_ACCEPTANCE.md) |
| [Основание формулировок и оценка эффективности](../../../manual/LESSON_AUTHORING_GUIDE.md#основание-формулировок-и-оценка-эффективности) | [LES_MAIN/05_LESSON_ACCEPTANCE.md](../../../manual/LES_MAIN/05_LESSON_ACCEPTANCE.md) |

## Хеши пяти навигационных файлов (SHA-256)

| Файл относительно `docs/manual/` | SHA-256 |
| --- | --- |
| `LES_PLAN/README.md` | `ECBE884A615B35964BE65373D01CC1419DE15F1E69EAE926220306095E70FC82` |
| `LES_MAIN/README.md` | `BBD47D11E1F24D2673AD5E25F0615F80717590A3B1B220EB26E902E82792CD15` |
| `LESSON_PLAN_GUIDE.md` | `F1C9AC9A1A6EAA5DC4FA8E0BB8C1483D001DF9912CB25AF94129AB6F4272B74F` |
| `LESSON_AUTHORING_GUIDE.md` | `924299A77639E42650E13ED92125FAF07EF2CE821E8CBBDF2895336B32EFB641` |
| `README.md` | `3201C2559BFB002BF1022A9A53EE1BD07306C1B21CC1B899DAB551133CBD0AF3` |

## Проверено

- Все **9 из 9** P/M-файлов доступны в канонических путях. Заголовки диспетчеров дословно совпадают с `COMPATIBILITY_HEADINGS.json`: **35 из 35**, включая `LESSON_AUTHORING_GUIDE.md#4-объём`.
- Проверка существования относительных Markdown-целей и якорей в **девяти стадийных файлах и пяти навигационных файлах**: **195 проверенных ссылок, 0 ошибок** до добавления этого отчёта. Старые входы из BLOCK/REVIEW/StudyHub ведут к сохранившимся путям/разделам. Новый маршрут ссылается на собственные стадии; единственное упоминание старого якоря шаблона из P1 — историческая навигация, шаблон уже находится в P1.
- Диспетчеры сокращены до **33 и 109 строк**; второго исполняемого монолита нет. `git diff --check` для трёх отслеживаемых навигационных файлов не выявил пробельных ошибок; предупреждения Git об LF/CRLF касаются будущей нормализации файлов.
- Изменения интеграции ограничены пятью назначенными файлами и этим отчётом; исходники курсов, TSX, практика, CSS, shared, реестр, YouTube и ID в учебном контенте не редактировались данным проходом.

## Независимые eval cases: NOT_RUN

1. **Нормальный маршрут:** действующий паспорт, подтверждённая A → единый принятый MD P4 → урок M5 с реальными проверками четырёх слоёв.
2. **Узкая стадия:** существующий принятый P1 и запрос только P2 или M3 → адресное редактирование, локальный статус без общего PASS.
3. **Неполный вход:** новый паспорт без диапазона и причины → независимая часть готовится, окончательная приёмка заблокирована конкретным полем, нет fallback.
4. **Конфликт источников:** исторический PROJECT_CONTEXT расходится с действующим BLOCK/исходником или планируемая A выдаётся за изученную → приоритет первичных фактов и явный статус.
5. **Конкурирующие правки:** два занятия требуют записи общего `manual.py`/реестра → последовательная интеграция; YouTube-комментарии и ID остаются неизменны.

**LIMITATIONS / PENDING:** сравнение поведения модели на прежней и новой методике, реальное написание уроков, запуск API/runner и браузерная проверка по eval cases **не выполнялись**. Документальная интеграция подтверждена структурно; прирост качества обучения не измерен. Исторически отмеченные 26 битых ссылок `PROJECT_CONTEXT` не исследовались и не исправлялись согласно границе задания; это не дефект новых маршрутов. Дополнительных навигационных правок по выполненной проверке не требуется.
