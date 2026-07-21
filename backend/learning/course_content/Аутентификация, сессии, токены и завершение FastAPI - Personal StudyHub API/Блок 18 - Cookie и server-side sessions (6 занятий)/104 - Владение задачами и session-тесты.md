# 104 — Владение задачами и session-тесты

## Паспорт занятия

- **Блок:** 18 · Cookie и серверные сессии
- **Проект:** Personal StudyHub API
- **Продолжительность:** 60–90 минут
- **До занятия:** CurrentUser подтверждает пользователя
- **После занятия:** все CRUD-операции задач ограничены владельцем и доказаны тестами двух пользователей
- **Главная модель:** сервер назначает owner из CurrentUser, а SQLAlchemy query ограничивает данные одновременно по resource id и user id

## Результат занятия

Вы добавите Task.user_id, scoped queries, get_owned_task_or_404 и authorization regression suite.

## Введение

Аутентификация отвечает, кто отправил запрос. Authorization отвечает, разрешена ли операция с конкретной задачей. Для Personal StudyHub базовое правило — пользователь работает только со своими ресурсами.

## 1. Authentication и object-level authorization

Действующая session не даёт доступ ко всем строкам таблицы. Endpoint обязан применить правило владельца.

Для клиента чужая задача отсутствует в доступной области, поэтому ответ 404 не раскрывает её существование.

### Порядок

1. Resolve CurrentUser.
2. Build query with owner scope.
3. Return own resource or 404.
4. Perform business operation.

## 2. Task.user_id

Foreign key связывает задачу с User. `relationship` помогает ORM-навигации, но не выполняет authorization автоматически.

Колонка `nullable=False` подходит для чистой учебной базы; миграция существующих данных потребовала бы backfill strategy.

### Пример

```python
class TaskModel(Base):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    is_done: Mapped[bool] = mapped_column(default=False)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )
    owner: Mapped["UserModel"] = relationship(back_populates="tasks")
```

> **Профессиональная граница:** Foreign key гарантирует ссылочную целостность, но не запрет чужого доступа.

## 3. Server-controlled owner

`TaskCreate` не содержит user_id. Клиент передаёт title, а сервер назначает `current_user.id`.

Даже аутентифицированному клиенту нельзя разрешать выбирать произвольного владельца.

### Пример

```python
class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)

@router.post("", response_model=TaskRead, status_code=201)
def create_task(data: TaskCreate, current_user: CurrentUser, db: SessionDep):
    task = TaskModel(title=data.title, is_done=False, user_id=current_user.id)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task
```

## 4. Scoped collection query

GET /tasks добавляет `WHERE TaskModel.user_id == current_user.id`. Чужие строки не загружаются в Python.

Фильтрация после SELECT всех rows повышает риск утечки и расходует лишние ресурсы.

### Пример

```python
def list_owned_tasks(db, current_user):
    statement = (
        select(TaskModel)
        .where(TaskModel.user_id == current_user.id)
        .order_by(TaskModel.id)
    )
    return list(db.scalars(statement))
```

## 5. Scoped object query

Общий helper ищет задачу сразу по `id` и `user_id`. Missing и foreign resource возвращают одинаковый 404.

Такой query уменьшает шанс забыть отдельный `if task.user_id != current_user.id`.

### Пример

```python
def get_owned_task_or_404(db, task_id, user_id):
    task = db.scalar(
        select(TaskModel).where(
            TaskModel.id == task_id,
            TaskModel.user_id == user_id,
        )
    )
    if task is None:
        raise HTTPException(status_code=404, detail="Задача не найдена")
    return task
```

## 6. Update и delete

PATCH и DELETE сначала вызывают ownership helper, а затем выполняют обычную предметную операцию.

Authorization logic не копируется и не зависит от body.

### Пример

```python
task = get_owned_task_or_404(db, task_id, current_user.id)

for field, value in data.model_dump(exclude_unset=True).items():
    setattr(task, field, value)

db.commit()
db.refresh(task)
```

### Задание: найдите дефект

Почему `db.get(TaskModel, task_id)` без owner check опасен?

**Ответ:** Любой authenticated user сможет прочитать или изменить чужую строку по известному id.

## 7. Два пользователя и два клиента

Alice и Bob входят через независимые TestClient. Alice создаёт task. Bob получает 404 для GET, PATCH и DELETE.

После запрещённого PATCH Alice повторно читает задачу и подтверждает, что title не изменился. После запрещённого DELETE строка всё ещё существует.

### Пример

```python
created = alice.post("/tasks", json={"title": "Private task"})
task_id = created.json()["id"]

assert bob.get(f"/tasks/{task_id}").status_code == 404
assert bob.patch(f"/tasks/{task_id}", json={"title": "Hacked"}).status_code == 404
assert bob.delete(f"/tasks/{task_id}").status_code == 404

owner_view = alice.get(f"/tasks/{task_id}")
assert owner_view.status_code == 200
assert owner_view.json()["title"] == "Private task"
```

## 8. Итоговая security matrix

Проверка включает anonymous, owner и foreign user для collection и object operations.

Негативный тест обязан доказывать отсутствие побочного эффекта, а не только status code.

### Сравнение

| Сценарий | Ожидание |
| --- | --- |
| anonymous GET /tasks | 401 |
| owner GET own task | 200 |
| foreign GET | 404 |
| foreign PATCH | 404 + unchanged |
| foreign DELETE | 404 + still exists |
| body with user_id | ignored/rejected by schema |

### Задание: проследите решение

Как request становится ownership query?

**Ответ:** Cookie → active session → CurrentUser → current_user.id → WHERE task.id AND task.user_id.

## Итоговый квиз

### Вопрос 1

Откуда берётся owner новой task?

- A. CurrentUser
- B. request body
- C. cookie JSON

**Правильный ответ:** A. CurrentUser

**Почему:** Поле контролирует сервер.

### Вопрос 2

Где ограничивается список?

- A. в SQL WHERE
- B. во frontend
- C. после отправки response

**Правильный ответ:** A. в SQL WHERE

**Почему:** Чужие rows не должны загружаться.

### Вопрос 3

Что вернуть для foreign task?

- A. 404
- B. 200
- C. 500

**Правильный ответ:** A. 404

**Почему:** Ресурс отсутствует в доступной области.

### Вопрос 4

Что проверяется после forbidden PATCH?

- A. row unchanged
- B. cookie encrypted
- C. user deleted

**Правильный ответ:** A. row unchanged

**Почему:** Нужна гарантия отсутствия side effect.

## Основные выводы

- Authentication и authorization — разные этапы.
- Task.user_id хранит владельца.
- Owner назначается только сервером.
- Collection query содержит owner scope.
- Object query объединяет id и user_id.
- Missing и foreign получают 404.
- Two-user tests проверяют изоляцию и side effects.

## Практическая работа

Добавьте миграцию Task.user_id и примените ownership ко всем CRUD endpoint. Создайте tests для anonymous, owner и foreign user, включая проверку неизменности данных.

### Критерии проверки

- [ ] TaskCreate не принимает user_id.
- [ ] Create использует current_user.id.
- [ ] List возвращает только own rows.
- [ ] GET/PATCH/DELETE используют get_owned_task_or_404.
- [ ] Foreign operations возвращают 404.
- [ ] После отказа данные остаются неизменными.
- [ ] Два клиента имеют независимые session cookies.

## Что намеренно отложено

Роли user/admin, JWT access/refresh и более сложная RBAC-модель входят в следующие блоки. Ownership query останется применимым независимо от способа аутентификации.
