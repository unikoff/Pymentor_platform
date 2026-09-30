from typing import Any

MANUAL_PRACTICE: dict[int, list[dict[str, Any]]] = {
    195: [{'title': 'Реализуйте Course vertical slice',
        'task': 'Добавьте Course от migration до integration tests. owner_id всегда берётся из current user, а не из '
                'request body.',
        'steps': ['Создайте Course ORM model с id, owner_id, title, slug, description, status, created_at и '
                  'updated_at.',
                  'Добавьте foreign key owner_id на users.id.',
                  'Добавьте unique constraint или index для выбранной политики slug.',
                  'Создайте Alembic revision add courses и проверьте upgrade и downgrade на disposable database.',
                  'Создайте CourseCreate, CourseUpdate и CourseRead без owner_id во входной schema.',
                  'Реализуйте POST /api/v1/courses только для active teacher.',
                  'Реализуйте GET /api/v1/courses/{course_id} для owner и admin; public access пока не добавляйте.',
                  'Реализуйте PATCH /api/v1/courses/{course_id} для owner-teacher и admin.',
                  'Возвращайте 403 для student, 404 для скрытого foreign course и 409 для duplicate slug.',
                  'Добавьте tests create, read, update, student forbidden, foreign teacher, duplicate slug и '
                  'inactive user.',
                  'Проверьте, что body с owner_id другого пользователя не меняет фактического owner.',
                  'Создайте Git-коммит feat: add Course vertical slice.'],
        'result': 'Готово, если Course создаётся и изменяется через role/ownership rules, migration воспроизводима, '
                  'duplicate slug защищён database, а response не доверяет owner_id клиента.'}],
    196: [{'title': 'Добавьте Modules, Lessons и атомарный reorder',
        'task': 'Реализуйте вложенную структуру Course с устойчивыми positions. Перестановка двух элементов должна '
                'завершаться целиком либо полностью откатываться.',
        'steps': ['Создайте Module и Lesson ORM models.',
                  'Module должен иметь course_id, title и position; Lesson — module_id, title, position и published '
                  'flag.',
                  'Добавьте unique constraints для course_id + position и module_id + position.',
                  'Создайте Alembic revision и проверьте чистый upgrade.',
                  'Реализуйте POST /courses/{course_id}/modules и POST /modules/{module_id}/lessons.',
                  'При добавлении без position помещайте элемент в конец через явный query max position.',
                  'Реализуйте GET course structure с ORDER BY position для modules и lessons.',
                  'Реализуйте reorder двух modules через временную безопасную position либо другой transaction-safe '
                  'алгоритм.',
                  'При конфликте position выполните rollback.',
                  'Проверяйте ownership через parent Course.',
                  'Добавьте tests ordering, duplicate position, foreign course, reorder success и forced rollback.',
                  'Проверьте число SQL statements и отсутствие N+1 при чтении structure.'],
        'result': 'Готово, если структура Course всегда возвращается в стабильном порядке, duplicate positions '
                  'отклоняются, reorder атомарен, а ownership наследуется через Course.'}],
    198: [{'title': 'Реализуйте Enrollment с защитой от race condition',
        'task': 'Добавьте idempotent enrollment для опубликованного Course. Python-проверка должна дополняться '
                'database unique constraint.',
        'steps': ['Создайте Enrollment model с student_id, course_id, status и enrolled_at.',
                  'Добавьте unique constraint student_id + course_id.',
                  'Создайте Alembic revision и примените её на чистой PostgreSQL.',
                  'Реализуйте POST /api/v1/courses/{course_id}/enrollments для active student.',
                  'Проверьте существование и status published Course.',
                  'Не принимайте student_id из body.',
                  'Выберите и документируйте повторный contract: вернуть existing enrollment либо 409.',
                  'Перехватите IntegrityError для конкурентного duplicate и выполните rollback.',
                  'Реализуйте GET /api/v1/me/enrollments.',
                  'Добавьте tests first enrollment, repeated request, draft course, teacher forbidden и foreign '
                  'student.',
                  'Добавьте concurrency test двух почти одновременных requests к одной паре.',
                  'Проверьте, что database содержит ровно одну enrollment row.'],
        'result': 'Готово, если повторные и конкурентные requests не создают duplicate, identity берётся из auth '
                  'context, draft course недоступен, а rollback проверен.'}],
    199: [{'title': 'Добавьте Completion и вычисляемый Progress',
        'task': 'Реализуйте завершение Lesson только через active Enrollment и вычисляйте progress из PostgreSQL '
                'facts.',
        'steps': ['Создайте LessonCompletion с enrollment_id, lesson_id и completed_at.',
                  'Добавьте unique constraint enrollment_id + lesson_id.',
                  'Создайте migration и проверьте upgrade/downgrade.',
                  'Реализуйте POST /api/v1/lessons/{lesson_id}/complete.',
                  'Проверьте active enrollment student в Course, которому принадлежит Lesson.',
                  'Повторный completion должен быть идемпотентным по выбранному contract.',
                  'Реализуйте GET /api/v1/me/courses/{course_id}/progress.',
                  'Считайте total только по published lessons.',
                  'Считайте completed по уникальным completion rows этого enrollment.',
                  'При total=0 возвращайте percent 0.0.',
                  'Добавьте tests no enrollment, foreign lesson, duplicate completion, 0%, partial и 100%.',
                  'Добавьте SQL/query test, что response не строится через один query на каждый Lesson.'],
        'result': 'Готово, если Completion защищён enrollment и unique constraint, progress воспроизводимо даёт 0%, '
                  'частичное и 100%, а клиент не передаёт percent.'}],
    200: [{'title': 'Автоматизируйте полный teacher/student flow',
        'task': 'Соберите LMS Core в один end-to-end сценарий и минимум десять отрицательных cases. Новая '
                'инфраструктура в этом занятии не добавляется.',
        'steps': ['Создайте fixtures teacher, second_teacher, student, second_student и admin.',
                  'Автоматизируйте teacher login и создание Course.',
                  'Добавьте два Modules и не меньше трёх Lessons.',
                  'Реализуйте и вызовите publish endpoint с проверкой готовности Course.',
                  'Проверьте public catalog: draft отсутствует, published Course присутствует.',
                  'Запишите student на Course.',
                  'Завершите Lessons последовательно и проверьте progress после каждого шага.',
                  'Добавьте admin read/audit scenario.',
                  'Добавьте отрицательные tests: student create Course, foreign teacher update, publish empty '
                  'Course, enroll draft, duplicate enrollment, completion without enrollment, foreign Lesson, '
                  'duplicate completion, inactive user и unknown Course.',
                  'Запустите полный scenario на чистой database.',
                  'Сохраните Postman collection или curl script того же flow.',
                  'Обновите ER-диаграмму и LMS contract table.'],
        'result': 'Готово, если teacher публикует Course, student enrolls и достигает 100%, десять запрещённых '
                  'действий имеют точные statuses, а сценарий проходит из чистой database.'}]
}
