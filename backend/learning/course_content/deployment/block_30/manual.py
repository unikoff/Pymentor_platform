from typing import Any

MANUAL_PRACTICE: dict[int, list[dict[str, Any]]] = {
    172: [{'title': 'Соберите первый Dockerfile StudyHub',
        'task': 'Создайте прозрачный рабочий image без преждевременной оптимизации. Цель — один FastAPI process, '
                'доступный с host.',
        'steps': ['Создайте Dockerfile в корне проекта.',
                  'Используйте фиксированный minor tag Python slim image.',
                  'Установите WORKDIR /app.',
                  'Скопируйте dependency file и установите dependencies.',
                  'Скопируйте app, alembic files и остальные runtime modules.',
                  'Задайте CMD в exec-form для Uvicorn с host 0.0.0.0 и container port 8000.',
                  'Соберите image с tag studyhub:lesson172.',
                  'Запустите container с --rm, опубликовав host port 8080 на container port 8000.',
                  'Передайте минимальные environment variables через отдельный учебный env-file.',
                  'Проверьте /health и /docs с host.',
                  'Остановите container и сохраните команды build/run в docs/docker-first-image.md.'],
        'result': 'Готово, если image собирается из чистого context, container отвечает на host:8080, CMD использует '
                  'exec-form, а инструкция воспроизводит build и run.'}],
    174: [{'title': 'Проверьте ports, environment и ephemeral filesystem',
        'task': 'Запустите один image в двух разных runtime-конфигурациях и докажите, что host port, environment и '
                'container filesystem принадлежат запуску, а не image.',
        'steps': ['Запустите studyhub image на host port 8081 с APP_ENV=development.',
                  'Запустите второй container того же image на host port 8082 с APP_ENV=test.',
                  'Добавьте диагностический endpoint или startup log, который безопасно показывает APP_ENV без '
                  'secrets.',
                  'Проверьте, что оба containers отвечают независимо.',
                  'Попробуйте запустить третий container на уже занятом host port 8081 и зафиксируйте ошибку.',
                  'Через docker exec создайте /tmp/runtime-marker в первом container.',
                  'Остановите и удалите первый container.',
                  'Создайте новый container из того же image и проверьте отсутствие marker.',
                  'Запишите различие image filesystem, container writable layer, bind mount и named volume.',
                  'Не храните PostgreSQL data в writable layer API-container.'],
        'result': 'Готово, если один image запускается с двумя configs и ports, port conflict воспроизводится, '
                  'runtime-marker исчезает после recreate, а граница постоянных данных объяснена.'}],
    175: [{'title': 'Очистите build context и запустите API не от root',
        'task': 'Добавьте .dockerignore, исключите secret/local artifacts и настройте отдельного runtime user.',
        'steps': ['Создайте .dockerignore.',
                  'Исключите .git, .venv, __pycache__, .pytest_cache, .mypy_cache, coverage files, local databases, '
                  'uploads test data и .env.',
                  'Не исключайте .env.example.',
                  'Соберите список runtime-файлов, которые действительно нужны API и Alembic.',
                  'Добавьте в Dockerfile создание group/user appuser с фиксированным uid.',
                  'Скопируйте runtime files с корректным ownership либо выполните chown только для нужных '
                  'directories.',
                  'Переключитесь на USER appuser до CMD.',
                  'Соберите image studyhub:lesson175.',
                  'Проверьте через docker run id, что uid не равен 0.',
                  'Проверьте, что API читает config и migrations, но не может записывать в запрещённую системную '
                  'директорию.',
                  'Поищите внутри image .env, .git и local database; их не должно быть.'],
        'result': 'Готово, если build context не содержит secrets и мусор, process работает не от root, runtime '
                  'files доступны, а проверка image не находит .env и .git.'}],
    176: [{'title': 'Диагностируйте четыре container failures',
        'task': 'Создайте release candidate Dockerfile и выполните controlled failures, отделяя build error, startup '
                'error, port error и health failure.',
        'steps': ['Создайте docs/runbook-container.md с таблицей failure stage, command, evidence и fix.',
                  'Сломайте имя dependency file и получите build failure.',
                  'Верните build и укажите неверный import module в CMD, затем получите stopped container.',
                  'Найдите exit code через docker ps -a и причину через docker logs.',
                  'Верните CMD и запустите без обязательной environment variable.',
                  'Исправьте config и запустите с неправильным host/container port mapping.',
                  'Проверьте docker inspect для Config, State и Health.',
                  'Используйте docker exec только для running container и зафиксируйте его границу.',
                  'Добавьте HEALTHCHECK либо внешний health probe по принятой архитектуре.',
                  'Соберите финальный local tag studyhub:stage8-rc.',
                  'Повторите build/run/health по runbook из чистой директории.'],
        'result': 'Готово, если четыре failures имеют разные evidence и fixes, release candidate запускается '
                  'non-root, проходит healthcheck и воспроизводится по runbook.'}]
}
