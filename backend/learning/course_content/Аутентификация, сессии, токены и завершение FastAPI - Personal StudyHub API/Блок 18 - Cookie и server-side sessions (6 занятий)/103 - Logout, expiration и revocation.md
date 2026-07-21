# 103 — Logout, expiration и revocation

## Паспорт занятия

- **Блок:** 18 · Cookie и серверные сессии
- **Проект:** Personal StudyHub API
- **Продолжительность:** 60–90 минут
- **До занятия:** CurrentSession и CurrentUser определяются через cookie
- **После занятия:** StudyHub умеет завершать один или все входы и тестировать независимые устройства
- **Главная модель:** logout = server-side revocation + client-side delete_cookie; expiration и cleanup имеют отдельные роли

## Результат занятия

Вы реализуете logout, logout-all, rollback при ошибке и тесты с двумя TestClient.

## Введение

Удалить cookie в браузере недостаточно. Источником решения остаётся server-side запись, поэтому logout должен прекратить доверие к token на сервере.

## 1. Две половины logout

`delete_cookie` очищает конкретный клиент. `revoked_at` прекращает принятие token любым клиентом.

User и password_hash не изменяются: завершается экземпляр входа.

### Сравнение

| Действие | Где меняется состояние |
| --- | --- |
| `revoked_at = now` | база сервера |
| `delete_cookie` | браузер |
| удаление User | не является logout |

## 2. CurrentSession

Logout нужен объект конкретной session. Поэтому dependency current session выделяется отдельно, а CurrentUser строится поверх неё.

В одном request resolved dependency не нужно искать повторно.

### Пример

```python
CurrentSession = Annotated[UserSessionModel, Depends(get_current_session)]

def get_current_session(raw_token: SessionToken, db: SessionDep):
    return require_active_session(db, raw_token)
```

## 3. Logout текущего устройства

Service устанавливает revoked_at и commit. Endpoint после успешного commit удаляет cookie и возвращает 204 без body.

Повторный request со старым token получает 401.

### Пример

```python
def revoke_session(db, session):
    session.revoked_at = utc_now()
    db.commit()

@router.post("/logout", status_code=204)
def logout(response: Response, current_session: CurrentSession, db: SessionDep):
    revoke_session(db, current_session)
    response.delete_cookie(key=settings.session_cookie_name, path="/")
```

## 4. Expiration, revocation, cleanup

Expiration прекращает доступ автоматически после expires_at. Revocation прекращает его раньше. Cleanup физически удаляет старые строки позднее.

Authentication не должна зависеть от запуска cleanup.

### Задание: проверьте

Нужно ли DELETE строку, чтобы expires_at перестал работать?

**Ответ:** Нет. Проверка времени уже отклоняет session; cleanup управляет объёмом таблицы.

## 5. Logout всех устройств

Операция обновляет все активные rows пользователя по `user_id`. Другие браузеры сохранят cookie до следующего request, но сервер уже ответит 401.

Текущему клиенту также отправляется delete_cookie.

### Пример

```python
statement = (
    update(UserSessionModel)
    .where(
        UserSessionModel.user_id == current_user.id,
        UserSessionModel.revoked_at.is_(None),
    )
    .values(revoked_at=utc_now())
)
db.execute(statement)
db.commit()
```

## 6. Rollback при ошибке

Revocation — транзакционная операция. После SQLAlchemyError выполняется rollback и наружу передаётся service error.

Нельзя скрывать ошибку базы, удалив только cookie: server-side token останется активным.

### Пример

```python
try:
    db.commit()
except SQLAlchemyError as error:
    db.rollback()
    raise SessionRevocationError from error
```

## 7. Явный cleanup

Для учебного проекта достаточно вызываемой вручную функции, удаляющей строки старше cutoff. Планировщики и distributed jobs не требуются.

Функция не вызывается внутри get_current_user.

### Пример

```python
def cleanup_old_sessions(db, cutoff):
    result = db.execute(
        delete(UserSessionModel).where(
            UserSessionModel.expires_at < cutoff
        )
    )
    db.commit()
    return result.rowcount
```

## 8. Два клиента

Laptop и phone — два TestClient с независимыми cookie jar. Обычный logout завершает laptop, phone остаётся active. Logout-all завершает оба.

Тест после logout обязательно выполняет защищённый request старым клиентом.

### Пример

```python
laptop = TestClient(app)
phone = TestClient(app)
login(laptop, user)
login(phone, user)

assert laptop.post("/auth/session/logout").status_code == 204
assert laptop.get("/users/me").status_code == 401
assert phone.get("/users/me").status_code == 200
```

## Итоговый квиз

### Вопрос 1

Почему delete_cookie недостаточно?

- A. server session остаётся active
- B. удалится User
- C. истечёт password

**Правильный ответ:** A. server session остаётся active

**Почему:** Скопированный token продолжит работать.

### Вопрос 2

Что меняет обычный logout?

- A. CurrentSession
- B. все users
- C. все tasks

**Правильный ответ:** A. CurrentSession

**Почему:** Отзывается один вход.

### Вопрос 3

Что делает cleanup?

- A. удаляет старые rows
- B. принимает пароль
- C. создаёт token

**Правильный ответ:** A. удаляет старые rows

**Почему:** Это housekeeping.

### Вопрос 4

Как моделировать два устройства?

- A. два TestClient
- B. один body
- C. два path

**Правильный ответ:** A. два TestClient

**Почему:** Нужны независимые cookie jars.

## Основные выводы

- Logout имеет серверную и клиентскую части.
- CurrentSession представляет конкретный вход.
- revoked_at прекращает доступ раньше срока.
- Expiration работает без DELETE.
- Logout-all обновляет sessions пользователя.
- Database error требует rollback.
- Два TestClient доказывают область revocation.

## Практическая работа

Реализуйте logout и logout-all. Напишите тесты current device, second device, old token, all devices и transaction rollback.

### Критерии проверки

- [ ] Logout возвращает 204 без JSON.
- [ ] Session получает revoked_at.
- [ ] Cookie удаляется с правильным path.
- [ ] Старый token даёт 401.
- [ ] Второй device остаётся active после обычного logout.
- [ ] Logout-all завершает оба клиента.

## Что намеренно отложено

Автоматический scheduler cleanup, Redis и distributed sessions относятся к будущим этапам.
