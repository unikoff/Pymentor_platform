from typing import Any

MANUAL_PRACTICE: dict[int, list[dict[str, Any]]] = {
    165: [{'title': 'Запустите StudyHub из корректной Linux-директории',
        'task': 'Разверните учебную копию проекта в Linux-подобной среде и докажите, как current working directory '
                'влияет на относительные paths.',
        'steps': ['Создайте отдельную директорию ~/studyhub-stage8 и скопируйте туда project без .venv и local data.',
                  'Выполните pwd и сохраните абсолютный path.',
                  'Через ls -la найдите app/main.py, .env.example, alembic.ini и tests.',
                  'Создайте scripts/show_runtime_path.py, который выводит Path.cwd(), path текущего файла и '
                  'вычисленный project root.',
                  'Запустите script из корня проекта и из parent directory.',
                  'Создайте временный файл data/path-check.txt и прочитайте его сначала через ненадёжный '
                  'относительный path.',
                  'Воспроизведите FileNotFoundError при запуске из другой cwd.',
                  'Исправьте код через path, вычисленный от __file__, а не от cwd.',
                  'Добавьте test, который запускает функцию с другой cwd через monkeypatch.chdir.',
                  'Создайте docs/linux-paths.md с командами, ошибкой и исправлением.'],
        'result': 'Готово, если project запускается из указанной директории, ошибка относительного path '
                  'воспроизводится, исправленный код не зависит от cwd, а test это доказывает.'}],
    170: [{'title': 'Создайте Linux-runbook запуска и диагностики',
        'task': 'Соберите занятия 165–169 в одну инструкцию, по которой другой разработчик запускает StudyHub и '
                'исправляет четыре типовых сбоя без подсказки автора.',
        'steps': ['Создайте docs/runbook-linux.md.',
                  'Добавьте prerequisites, clone, virtual environment, dependencies, .env и migrations.',
                  'Добавьте команды запуска PostgreSQL, Redis и Uvicorn.',
                  'Добавьте проверки cwd, Python version, process PID, listening port, /health и /ready.',
                  'Добавьте команду фильтрации logs по request_id.',
                  'Добавьте graceful shutdown через SIGTERM и ожидаемые shutdown logs.',
                  'Создайте четыре incident cards: неверная cwd, occupied port, missing environment variable и '
                  'недоступная database.',
                  'Для каждой карты укажите symptom, diagnostic command, expected evidence и fix.',
                  'Передайте runbook другому человеку либо выполните его в чистой shell session без history.',
                  'Зафиксируйте фактические corrections после проверки.'],
        'result': 'Готово, если чистый запуск проходит только по runbook, четыре failures диагностируются '
                  'предсказуемо, а документ содержит конкретные commands и ожидаемый output.'}]
}
