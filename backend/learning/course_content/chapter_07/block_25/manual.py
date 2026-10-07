from typing import Any

MANUAL_PRACTICE: dict[int, list[dict[str, Any]]] = {
    143: [{'title': 'Запустите первую coroutine через event loop',
        'task': 'Создайте отдельную лабораторию без FastAPI. Нужно увидеть создание coroutine object, запуск через '
                'asyncio.run и suspend/resume в точке await.',
        'steps': ['Создайте async-lab/143_event_loop.py.',
                  'Объявите async def load_profile(user_id), которая логирует profile:start, ожидает '
                  'asyncio.sleep(0.05), затем логирует profile:resume и возвращает словарь.',
                  'В обычной функции вызовите load_profile(7) без await и выведите type и repr созданного object.',
                  'Не оставляйте этот object потерянным: закройте его либо создайте отдельный object внутри main.',
                  'Создайте async def main и внутри выполните result = await load_profile(7).',
                  'Запустите только main через asyncio.run(main()).',
                  'Добавьте logs main:start, main:done и сохраните ожидаемый порядок до запуска.',
                  'Запустите script и сравните фактический порядок.',
                  'Добавьте README лаборатории с определениями coroutine function, coroutine object, event loop и '
                  'await.'],
        'result': 'Готово, если script не оставляет RuntimeWarning, тело load_profile не выполняется при простом '
                  'вызове, а asyncio.run запускает main и logs подтверждают suspend/resume.'}],
    145: [{'title': 'Найдите forgotten await и blocked event loop',
        'task': 'Создайте два намеренно сломанных async-сценария, зафиксируйте наблюдаемое поведение и исправьте их.',
        'steps': ['Создайте async-lab/145_async_errors.py.',
                  'Сценарий A: вызовите async function без await и получите coroutine object вместо данных.',
                  'Запустите Python с warnings enabled и зафиксируйте RuntimeWarning.',
                  'Исправьте сценарий A через await и добавьте assert на тип результата.',
                  'Сценарий B: запустите heartbeat coroutine с периодом 0.02 секунды.',
                  'В другой coroutine выполните time.sleep(0.1) и зафиксируйте паузу heartbeat.',
                  'Замените time.sleep на await asyncio.sleep и повторите trace.',
                  'Добавьте test, который обнаруживает слишком большой gap между heartbeat events в broken-варианте.',
                  'Запишите в docs/async-errors.md symptom, cause, evidence и fix для обеих ошибок.'],
        'result': 'Готово, если forgotten await воспроизводится warning, blocking sleep останавливает heartbeat, '
                  'исправленные варианты проходят asserts и причина подтверждена timeline.'}],
    146: [{'title': 'Соберите последовательный async-loader',
        'task': 'Создайте учебный loader профиля StudyHub. Он намеренно использует последовательные await и должен '
                'иметь полностью объяснимый timeline.',
        'steps': ['Создайте async-lab/146_profile_loader.py.',
                  'Реализуйте async load_user, load_tasks и load_statistics через asyncio.sleep с разными delays.',
                  'В build_profile вызывайте три functions последовательными await.',
                  'Добавьте operation id и logs start, wait и done.',
                  'Измерьте elapsed через time.perf_counter.',
                  'До запуска запишите ожидаемый total как сумму delays.',
                  'Верните единый словарь user, tasks и statistics.',
                  'Добавьте pytest-asyncio test результата и отдельный test порядка logs.',
                  'Создайте README с вопросом: почему код async, но ещё не concurrent.'],
        'result': 'Готово, если loader возвращает точную структуру, elapsed близок сумме delays, tests фиксируют '
                  'порядок, а ученик объясняет отсутствие concurrency.'}]
}
