# 101 — Session login

## Паспорт занятия

- **Блок:** 18 · Cookie и серверные сессии
- **Проект:** Personal StudyHub API
- **Продолжительность:** 60–90 минут
- **До занятия:** authenticate_user проверяет credentials, create_session создаёт серверную запись
- **После занятия:** успешный login создаёт session, устанавливает HttpOnly-cookie и возвращает безопасный UserRead
- **Главная модель:** endpoint координирует validation → authenticate_user → create_session → Set-Cookie → response schema

## Результат занятия

Вы реализуете POST /auth/session/login, единый 401, безопасную транзакцию и интеграционные тесты.

## Введение

Login не должен заново реализовывать password hashing. Он связывает готовые контракты и отвечает за HTTP-результат.

## 1. Login как orchestration

Endpoint принимает credentials, но передаёт проверку `authenticate_user`. После успеха session service фиксирует состояние, а Response получает cookie.

Такое разделение делает каждую часть независимо тестируемой.

### Порядок

1. Pydantic validation
2. authenticate_user
3. create_session
4. set_session_cookie
5. return UserRead

> **Профессиональная граница:** Endpoint не пишет SQL и не вызывает password hasher напрямую.

## 2. Request и response schemas

`SessionLoginRequest` содержит email и password. `UserRead` содержит только публичные поля.

Response model является явным allow-list и защищает от случайной выдачи password_hash.

### Пример

```python
class SessionLoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)

class UserRead(BaseModel):
    id: int
    email: EmailStr
    username: str
    is_active: bool
    model_config = {"from_attributes": True}
```

## 3. Единый 401

Неизвестный email и неверный пароль получают одинаковое сообщение. Иначе API помогает перечислять зарегистрированные адреса.

Пароль никогда не записывается в лог.

### Пример

```python
def require_authenticated_user(db, data):
    user = authenticate_user(db, str(data.email), data.password)
    if user is None:
        raise HTTPException(status_code=401, detail="Неверные данные для входа")
    return user
```

## 4. Endpoint login

Сначала подтверждается User, затем создаётся session, и только после commit устанавливается cookie.

Успех возвращает 200: учётная запись уже существует.

### Пример

```python
@router.post("/login", response_model=UserRead)
def session_login(data: SessionLoginRequest, response: Response, db: SessionDep):
    user = require_authenticated_user(db, data)
    raw_token = create_session(db, user.id)
    set_session_cookie(response, raw_token)
    return user
```

## 5. Transaction failure

Если commit session завершился ошибкой, service выполняет rollback и не возвращает raw token. Следовательно endpoint не формирует Set-Cookie.

Нельзя сначала установить cookie, а потом пытаться сохранить server-side запись.

### Пример

```python
def create_session(db, model, raw_token):
    try:
        db.add(model)
        db.commit()
    except SQLAlchemyError as error:
        db.rollback()
        raise SessionCreationError from error

    return raw_token
```

## 6. Повторный login

StudyHub создаёт новую session на каждый успешный login. Это поддерживает несколько устройств и не завершает старый вход скрыто.

Политика должна быть документирована; одно устройство на пользователя — другое бизнес-правило.

### Сравнение

| Политика | Результат |
| --- | --- |
| новая session | несколько устройств |
| revoke current + create | ротация одного входа |
| revoke all + create | только одно активное устройство |

## 7. Интеграционные тесты

Успешный тест проверяет status, cookie, отсутствие hash в JSON и строку в базе. Негативный тест проверяет 401, отсутствие cookie и отсутствие новой session.

В базе сравнивается digest cookie, а не raw token.

### Пример

```python
response = client.post("/auth/session/login", json={
    "email": user.email,
    "password": "correct-password",
})
assert response.status_code == 200
assert "studyhub_session" in response.cookies
assert "password_hash" not in response.json()
```

## 8. Контроль полного flow

В ручном сценарии выполните регистрацию, успешный login, неверный login и второй login отдельным клиентом.

Две успешные попытки одного User должны дать два разных token_digest.

### Задание: объясните

Почему границей успеха считается commit, а не генерация token?

**Ответ:** Без сохранённой server-side записи token не имеет действующего значения и не должен выдаваться клиенту.

## Итоговый квиз

### Вопрос 1

Кто проверяет password?

- A. authenticate_user
- B. set_cookie
- C. UserRead

**Правильный ответ:** A. authenticate_user

**Почему:** Login переиспользует готовый сервис.

### Вопрос 2

Когда устанавливается cookie?

- A. после commit
- B. до validation
- C. при импорте

**Правильный ответ:** A. после commit

**Почему:** Только для сохранённой session.

### Вопрос 3

Что исключает hash из ответа?

- A. UserRead response model
- B. Cookie
- C. expires_at

**Правильный ответ:** A. UserRead response model

**Почему:** Публичная схема фильтрует поля.

### Вопрос 4

Что делает повторный login?

- A. создаёт новую session
- B. удаляет User
- C. выдаёт JWT

**Правильный ответ:** A. создаёт новую session

**Почему:** Выбрана multi-device политика.

## Основные выводы

- Login координирует готовые сервисы.
- Request и response имеют разные схемы.
- Invalid credentials получают единый 401.
- Session фиксируется до cookie.
- Ошибка commit приводит к rollback.
- Повторный login создаёт независимый вход.
- Тест проверяет HTTP, cookie и базу.

## Практическая работа

Реализуйте POST /auth/session/login и тесты valid password, invalid password, unknown email, absence of hash и двух независимых входов.

### Критерии проверки

- [ ] Password проверяется только через authenticate_user.
- [ ] UserRead не содержит password_hash.
- [ ] 401 одинаков для неизвестного email и неверного password.
- [ ] Cookie появляется только после commit.
- [ ] Ошибка базы выполняет rollback.
- [ ] Второй клиент получает отдельную session.

## Что намеренно отложено

CurrentUser и защищённые endpoint появятся в уроке 102. JWT и refresh token относятся к блоку 19.

<!-- youtube: -->
