# 102 — get_current_user через session

## Паспорт занятия

- **Блок:** 18 · Cookie и серверные сессии
- **Проект:** Personal StudyHub API
- **Продолжительность:** 60–90 минут
- **До занятия:** login устанавливает cookie и сохраняет session
- **После занятия:** защищённые endpoint получают CurrentUser через dependency chain
- **Главная модель:** Cookie → raw token → digest → active session → current User → endpoint

## Результат занятия

Вы создадите get_session_token, require_active_session, get_current_user, CurrentUser и GET /users/me с негативной тестовой матрицей.

## Введение

Проверки аутентификации нельзя копировать по endpoint. Dependency chain превращает слабый вход — необязательную cookie — в сильную гарантию: активный пользователь.

## 1. Зачем единый pipeline

Ручное чтение cookie в каждом endpoint приводит к расхождению проверок. Один маршрут забудет expires_at, другой — is_active.

Dependency делает обязательный контекст частью сигнатуры.

### Порядок

1. get_session_token
2. find session by digest
3. check revoked and expired
4. load User
5. check is_active
6. call endpoint

## 2. Чтение optional cookie

Параметр имеет тип `str | None`, чтобы отсутствие не превращалось в 422. Функция сама возвращает 401.

401 означает отсутствие действующей аутентификации; 403 понадобится для недостатка прав уже известного пользователя.

### Пример

```python
SessionCookie = Annotated[str | None, Cookie(alias="studyhub_session")]

def get_session_token(raw_token: SessionCookie = None) -> str:
    if raw_token is None:
        raise HTTPException(status_code=401, detail="Требуется вход")
    return raw_token
```

## 3. Поиск по digest

Raw token из cookie преобразуется в SHA-256 digest. SQLAlchemy ищет `token_digest`, а не user_id и не открытый token.

Одинаковый raw token детерминированно даёт одинаковый digest.

### Пример

```python
def find_session_by_token(db: Session, raw_token: str):
    statement = select(UserSessionModel).where(
        UserSessionModel.token_digest == digest_session_token(raw_token)
    )
    return db.scalar(statement)
```

## 4. Проверка lifecycle

Строка действительна, только если существует, `revoked_at is None` и `expires_at > now`. Все невалидные состояния дают единый 401.

Просроченная строка может оставаться в базе; это не делает её активной.

### Пример

```python
def require_active_session(db, raw_token):
    session = find_session_by_token(db, raw_token)
    if session is None:
        raise unauthorized()
    if session.revoked_at is not None:
        raise unauthorized()
    if session.expires_at <= utc_now():
        raise unauthorized()
    return session
```

## 5. Загрузка актуального User

Session хранит user_id, но не должна становиться копией User. Учётная запись могла быть удалена или деактивирована после login.

Поэтому User загружается заново и проверяется `is_active`.

### Пример

```python
def get_current_user(raw_token: SessionToken, db: SessionDep) -> UserModel:
    session = require_active_session(db, raw_token)
    user = db.get(UserModel, session.user_id)
    if user is None or not user.is_active:
        raise unauthorized()
    return user

CurrentUser = Annotated[UserModel, Depends(get_current_user)]
```

## 6. Короткий /users/me

Endpoint объявляет `current_user: CurrentUser` и не знает устройство cookie или SQL session lookup.

Короткое тело остаётся прозрачным, если dependency разбита на именованные этапы.

### Пример

```python
@router.get("/me", response_model=UserRead)
def read_current_user(current_user: CurrentUser):
    return current_user
```

## 7. Единый внешний 401

Missing, unknown, revoked, expired и inactive должны давать стабильный authentication contract. Внутреннюю причину можно учитывать в безопасной диагностике.

Не отправляйте разные detail, которые раскрывают таблицу sessions.

### Пример

```python
def unauthorized() -> HTTPException:
    return HTTPException(
        status_code=401,
        detail="Требуется действующая session",
    )
```

## 8. Тестовая матрица

Отдельно проверяются active, missing cookie, unknown token, revoked, expired и inactive User.

Время контролируется fixture через явный expires_at; `sleep` не нужен.

### Сравнение

| Сценарий | Ожидание |
| --- | --- |
| active session | 200 |
| missing cookie | 401 |
| unknown token | 401 |
| revoked_at set | 401 |
| expires_at in past | 401 |
| user inactive | 401 |

### Задание: регрессия

Что доказывает тест inactive User после успешного login?

**Ответ:** Dependency загружает актуального User при каждом запросе, а не доверяет старому snapshot.

## Итоговый квиз

### Вопрос 1

Что гарантирует get_session_token?

- A. token существует или 401
- B. User существует
- C. task принадлежит User

**Правильный ответ:** A. token существует или 401

**Почему:** Это первая граница pipeline.

### Вопрос 2

По какому полю ищется session?

- A. token_digest
- B. password_hash
- C. title

**Правильный ответ:** A. token_digest

**Почему:** Raw token сначала хешируется.

### Вопрос 3

Почему User загружается заново?

- A. проверить актуальный is_active
- B. обновить Cookie
- C. создать миграцию

**Правильный ответ:** A. проверить актуальный is_active

**Почему:** Состояние учётной записи меняется независимо от session.

### Вопрос 4

Что получает /users/me?

- A. CurrentUser
- B. сырой Header
- C. password

**Правильный ответ:** A. CurrentUser

**Почему:** Pipeline разрешается до endpoint.

## Основные выводы

- Authentication checks централизованы в dependencies.
- Отсутствующая cookie даёт 401, не 422.
- Session ищется по digest.
- revoked_at и expires_at проверяются каждый request.
- User загружается заново.
- CurrentUser выражает контракт endpoint.
- Негативные ветки тестируются отдельно.

## Практическая работа

Реализуйте dependency chain и GET /users/me. Создайте fixtures для unknown, revoked, expired session и inactive User.

### Критерии проверки

- [ ] Cookie optional до собственной проверки.
- [ ] Все failure-сценарии дают 401.
- [ ] Raw token не сравнивается с user_id.
- [ ] User.is_active проверяется.
- [ ] Endpoint /me не повторяет SQL и cookie parsing.
- [ ] Тесты не используют sleep.

## Что намеренно отложено

Logout использует CurrentSession в уроке 103. Ownership использует CurrentUser в уроке 104. Роли и JWT пока не вводятся.

<!-- youtube: -->
