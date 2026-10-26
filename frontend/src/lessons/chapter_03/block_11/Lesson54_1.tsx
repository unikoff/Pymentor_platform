import { Braces, Filter } from "lucide-react";
import {
  BugHunt,
  Callout,
  CodeBlock,
  Diagram,
  DiagramArrow,
  DiagramFlow,
  DiagramNode,
  Lead,
  LinkedNotes,
  MatchPairs,
  MethodGrid,
  QuizCard,
  RichHero,
  RichLesson,
  Section,
  StepThrough,
  TrueFalse,
} from "../../shared";

export function Lesson54_1({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        chip={module ?? "Глава 3 · Блок 11 · Контракт PATCH"}
        title="Пропуск поля в TaskPatch"
        intro="В занятии 54 мы проверили, как patch_task применяет переданные изменения. Теперь разберём, как TaskPatch отличает пропущенное поле от явного значения и собирает словарь changes. В 54.2 этот словарь подключится к HTTP-маршруту."
        tags={[
          { icon: <Braces size={14} />, label: "Pydantic и поля" },
          { icon: <Filter size={14} />, label: "model_dump и PATCH" },
        ]}
      />

      <Section number="00" title="От сервиса к форме запроса">
        <Lead>
          Сервис уже готов. Подготовим для него словарь и сохраним сведения о том, какие поля пришли во входе.
        </Lead>
        <LinkedNotes
          variant="connected"
          items={[
            {
              title: "Точка A · сервис",
              description: "В 54 мы проверили: patch_task меняет переданные поля, а пустой набор не сохраняет данные.",
            },
            {
              title: "Переход 54.1",
              description: "Разберём TaskPatch и выясним, какие поля пришли во входе, чтобы собрать changes.",
            },
            {
              title: "Цель B · готовые changes",
              description: "После проверки TaskPatch получим словарь changes. В 54.2 маршрут передаст его готовому сервису.",
            },
          ]}
        />
        <p>
          При частичном обновлении важны два факта: значение поля и то, было ли оно во входе. Если поле пропустить,
          Pydantic всё равно подставит default. Поэтому одного чтения атрибута мало: нужно проверить, было ли имя во входе.
        </p>
      </Section>

      <Section number="01" title="Что уже делает сервис">
        <Lead>
          Метод patch_task из занятия 54 готов. Здесь мы только подготовим для него данные.
        </Lead>
        <p>
          Сервис получает обычный словарь. Нет ключа — прежнее значение остаётся. Есть ключ со значением False — сервис
          применяет False. Пустой словарь означает «изменений нет», поэтому save не вызывается. TaskPatch должна сохранить
          эту разницу при сборке словаря.
        </p>
        <p>
          Представим бланк с настройками карточки. Заполняем только нужные строки. Пустая строка означает «оставить как есть»,
          а не «стереть значение». Сервис не угадывает, почему строка пустая: схеме нужно передать это явно.
        </p>
        <MatchPairs
          prompt="Кто за что отвечает?"
          pairs={[
            { left: "TaskPatch", right: "Проверяет форму и запоминает явно переданные поля" },
            { left: "model_dump", right: "Преобразует модель в словарь для следующего слоя" },
            { left: "patch_task", right: "Применяет изменения к найденной задаче" },
            { left: "HTTP PATCH в 54.2", right: "Передаёт тело запроса в готовую схему и сервис" },
          ]}
          explanation="TaskPatch проверяет вход, model_dump собирает словарь, а сервис применяет изменения. В 54.2 маршрут соединит эти шаги."
        />
        <p>
          Схема не ищет задачу и не сохраняет файл. Сервис не разбирает JSON. В 54.2 маршрут создаст TaskPatch, соберёт
          changes и передаст их сервису.
        </p>
      </Section>

      <Section number="02" title="Тип, default и пропуск поля">
        <Lead>
          Тип показывает, какие значения допустимы. <code>= None</code> задаёт default и разрешает пропустить поле.
        </Lead>
        <p>
          <code>str | None</code> принимает строку или None. Но в Pydantic 2 такое поле всё ещё обязательно, если у него
          нет default. Запись <code>= None</code> позволяет не передавать ключ. JSON <code>null</code> при разборе становится
          Python-значением <code>None</code>.
        </p>
        <p>
          Тип и default отвечают на разные вопросы. Сами атрибуты этого не показывают: при пропуске и при явном null
          значение может быть None. Поэтому модель отдельно хранит имена полей, которые пришли во входе.
        </p>
        <MethodGrid
          rows={[
            ["caption: str | None = None", "Строка или null допустимы; поле можно пропустить."],
            ["visible: bool | None = None", "True, False или null допустимы; поле можно пропустить."],
            ["pinned: bool | None = None", "True, False или null допустимы; поле можно пропустить."],
          ]}
        />
        <p>
          Ограничения <code>Field</code> проверяют значение: <code>min_length</code> и <code>max_length</code> задают длину
          строки, а <code>ge</code> и <code>le</code> — границы числа. Валидатор с <code>mode="before"</code> запускается
          раньше этих проверок. Если он обрезает пробелы, длина проверяется уже после очистки. Этот порядок мы проходили в
          51 и 51.1; в карточке 1 найдём его в TaskPatch.
        </p>
        <Diagram caption="От тела запроса к словарю изменений" orientation="vertical">
          <DiagramFlow label="Подготавливаем частичное изменение" orientation="vertical">
            <DiagramNode title="JSON body" shape="process">
              <p>Набор присланных полей</p>
            </DiagramNode>
            <DiagramArrow label="валидация" />
            <DiagramNode title="TaskPatch" shape="process">
              <p>Значения и сведения о присутствии</p>
            </DiagramNode>
            <DiagramArrow label="model_dump с фильтрами" />
            <DiagramNode title="changes" shape="process">
              <p>Только нужные ключи</p>
            </DiagramNode>
            <DiagramArrow label="в 54.2 передадим" />
            <DiagramNode title="patch_task" shape="process">
              <p>Применение к сохранённой задаче</p>
            </DiagramNode>
          </DiagramFlow>
        </Diagram>
        <p>
          Сравним три случая. Пропуск: атрибут получает None, имени нет в <code>model_fields_set</code>. Явный null:
          значение тоже None, но имя есть. Явный False: имя есть, значение — False. В карточке 2 проверим эти различия
          на настоящей TaskPatch.
        </p>
        <p>
          Сначала Pydantic проверяет значения, затем мы собираем словарь. Если проверка не пройдена, модель не создаётся.
          Фильтры model_dump не исправляют ошибку и не ослабляют ограничения.
        </p>
        <p>
          Здесь разбираем поля внутри JSON-объекта. Пропущенное поле отличается от отсутствующего body и от body, равного
          null. Эти HTTP-случаи останутся следующему занятию.
        </p>
        <TrueFalse
          statement={<>Если <code>CardPatch.visible</code> равен None, это само по себе доказывает, что клиент пропустил поле.</>}
          isTrue={false}
          explanation="Нет. В обоих случаях значение None. Сравните model_fields_set: он покажет, было ли поле во входе."
        />
      </Section>

      <Section number="03" title="Узнаем, какие поля передали">
        <Lead>
          <code>exclude_unset=True</code> убирает поля, которых не было во входе.
        </Lead>
        <p>
          После создания модели <code>model_fields_set</code> содержит имена полей из входа. Если передали
          <code>caption: null</code>, имя есть в наборе. Если поле пропустили, default доступен как атрибут, но имени в наборе нет.
        </p>
        <p>
          <code>exclude_unset=True</code> сохраняет все переданные поля, включая явный null. По договору Planner null
          ничего не меняет, поэтому дальше удалим значения None вторым фильтром.
        </p>
        <StepThrough
          code={'from pydantic import BaseModel\n\nclass CardPatch(BaseModel):\n    caption: str | None = None\n    visible: bool | None = None\n    pinned: bool | None = None\n\npayload = {"visible": False, "caption": None}\npatch = CardPatch.model_validate(payload)\npatch.model_fields_set\npatch.model_dump(exclude_unset=True)\npatch.model_dump(exclude_unset=True, exclude_none=True)'}
          steps={[
            { line: 2, note: "Объявляем три поля. Их можно пропустить, и они допускают None.", vars: { "CardPatch": "caption, visible, pinned" } },
            { line: 7, note: "Передали visible=False и caption=None. pinned пропустили.", vars: { payload: "{'visible': False, 'caption': None}" } },
            { line: 8, note: "Для пропущенного pinned Pydantic подставляет None.", vars: { patch: "CardPatch(caption=None, visible=False, pinned=None)" } },
            { line: 9, note: "Здесь только имена переданных полей.", vars: { "model_fields_set": "{'visible', 'caption'}" } },
            { line: 10, note: "exclude_unset оставляет оба значения, включая caption=None.", vars: { "exclude_unset": "{'caption': None, 'visible': False}" } },
            { line: 11, note: "exclude_none убирает null, но сохраняет visible=False.", vars: { "changes": "{'visible': False}" } },
          ]}
        />
        <p>
          У пропущенного <code>pinned</code> есть default, но <code>exclude_unset</code> убирает его. Явный
          <code>caption: null</code> пока остаётся. В следующем шаге удалим null.
        </p>
        <p>
          Читайте <code>model_fields_set</code> сразу после создания модели. Если потом менять атрибуты вручную, это уже новое
          действие кода. В практике мы создадим модель из входа и сразу соберём changes.
        </p>
      </Section>

      <Section number="04" title="Уберём null, сохраним False">
        <Lead>
          <code>exclude_none=True</code> убирает значения None. False остаётся.
        </Lead>
        <p>
          Объединим фильтры: <code>model_dump(exclude_unset=True, exclude_none=True)</code>. Первый убирает пропущенные
          поля, второй — переданные поля со значением None. По договору Planner явный null означает «не менять это поле».
        </p>
        <p>
          False тоже полноценное значение. Например, так можно выключить настройку. Фильтр убирает None, а False сохраняет.
          Поэтому проверяйте наличие ключа или самого changes, а не истинность значения.
        </p>
        <QuizCard
          question="Какое значение останется в changes после двух фильтров?"
          options={['{"visible": false}', '{"caption": null, "visible": false}', "{}"]}
          correctIndex={0}
          explanation="caption=null удаляется, потому что это None. visible=False остаётся: False не равно None."
        />
        <p>
          Фильтры отвечают на разные вопросы. <code>exclude_none</code> смотрит на значение; <code>exclude_unset</code> —
          было ли поле во входе. Если default равен False, один <code>exclude_none</code> оставит пропущенное поле как ложное
          изменение. Поэтому нужны оба условия: поле передали и его значение не None.
        </p>
        <p>
          <code>exclude_defaults</code> сравнивает значение с default. Явный False может совпасть с default=False и исчезнуть,
          хотя поле передали. Нам важно присутствие поля, поэтому этот фильтр не заменяет <code>exclude_unset</code>.
        </p>
        <p>
          Если клиент повторно прислал текущее значение, поле всё равно считается переданным. Решение о сохранении принимает
          сервис. На входе оставляем все переданные значения, кроме None.
        </p>
        <TrueFalse
          statement={<>При <code>model_dump(exclude_unset=True, exclude_none=True)</code> явно переданный <code>False</code> сохраняется в словаре.</>}
          isTrue={true}
          explanation="Да. False не равно None, поэтому visible остаётся в словаре и настройку можно выключить."
        />
      </Section>

      <Section number="05" title="Проверим changes, а не значение">
        <Lead>
          Проверяйте, пустой ли словарь. Не проверяйте значение внутри него на истинность.
        </Lead>
        <p>
          В занятии 54 пустой словарь означает «работы нет». Словарь <code>{'{"visible": false}'}</code> не пустой, даже
          когда его значение — False. Если проверять само значение, код ошибочно решит, что изменений нет.
        </p>
        <p>
          Сравните список покупок: список может содержать товар с количеством 0. Наличие записи и её значение — разные вещи.
          В changes ключ показывает, что поле передали; значение показывает, что записать.
        </p>
        <p>
          В сигнатуре метода знак <code>*</code> делает параметры после него именованными. Запись <code>**changes</code>
          передаёт ключи словаря как имена этих параметров. Например, <code>visible: False</code> станет аргументом
          <code>visible=False</code>. Пустой словарь не добавит аргументов. В карточке 3 применим это правило к patch_task.
        </p>
        <CodeBlock code={'def save_card(card_id, *, visible=None):\n    ...\n\nchanges = {"visible": False}\nsave_card(7, **changes)'} />
        <BugHunt
          code={'changes = patch.model_dump(exclude_unset=True, exclude_none=True)\nif changes.get("visible"):\n    apply_card_changes(**changes)'}
          question="Почему этот фрагмент теряет запрос выключить настройку?"
          options={[
            "get возвращает False, поэтому ветка не запускается",
            "exclude_none автоматически удаляет False",
            "model_dump возвращает список, а не словарь",
          ]}
          correctIndex={0}
          explanation="При visible=False ключ есть в changes, но get возвращает False. Условие не срабатывает. Проверьте словарь целиком и передайте его пары именованными аргументами."
          fix={'changes = patch.model_dump(exclude_unset=True, exclude_none=True)\nif changes:\n    apply_card_changes(**changes)'}
        />
        <p>
          Словарь с False не пустой, поэтому проверка <code>if changes</code> сработает. Распаковка передаст False без
          изменений. В карточке 3 сверим это с реальной сигнатурой Planner.
        </p>
        <p>
          Сервис также проверяет, что задача с таким id существует. TaskPatch не создаёт новую задачу и не заменяет эту
          проверку. В 54.2 HTTP-маршрут переведёт ошибку сервиса в ответ. Сейчас мы только готовим данные.
        </p>
      </Section>

      <Section number="06" title="Форма TaskPatch в нашем Planner">
        <Lead>
          Соединим правила с реальной схемой проекта. Это точечный входной контракт, а не новая модель задачи целиком.
        </Lead>
        <p>
          В <code>app/routers/tasks/schemas.py</code> уже есть TaskPatch. Это отдельная входная форма для частичного
          изменения, а не новая модель сохранённой задачи. В практике мы сверим её точные поля, аннотации, значения по
          умолчанию и валидаторы прямо с текущим исходным кодом.
        </p>
        <p>
          Валидация значения и фильтрация присутствия отвечают за разные этапы. Pydantic проверяет вход по объявленным
          правилам, а <code>model_dump</code> затем формирует словарь для следующего слоя. Нормализация или отказ из-за
          некорректного значения происходит до фильтрации; фильтры не заменяют валидатор и не меняют его ограничений.
        </p>
        <p>
          Полная входная схема и схема частичного изменения имеют разные задачи: первая описывает полный набор полей для
          замены, вторая разрешает передавать выбранные изменения. TaskRead остаётся отдельным публичным представлением
          результата. Точный контраст между моделями мы проверим по исходному файлу, а не будем выводить из их названий.
        </p>
        <p>
          Название PATCH подсказывает намерение HTTP-операции, но само по себе не задаёт семантику каждого поля.
          Конкретный договор получается из формы TaskPatch, правил сериализации и метода сервиса вместе. Поэтому явный
          null в этом Planner означает no-op, хотя другой API мог бы использовать null для очистки. Чтобы поддержать
          очистку здесь, пришлось бы отдельно выбрать представление команды и изменить сервисный контракт. В текущей
          последовательности мы сохраняем уже подготовленное правило и проверяем его, не расширяя задачу.
        </p>
        <Callout tone="info">
          Явный null не очищает поле задачи. В этом учебном контракте null означает отсутствие изменения после фильтрации.
          Пустой body и body, где все переданные значения равны null, дают пустой changes и не вызывают сохранение. Другой
          контракт мог бы разрешить очистку отдельного поля, но для этого потребовалось бы отдельное решение, а не случайное
          поведение Pydantic.
        </Callout>
        <p>
          Мы не добавляем здесь маршрут и не отправляем HTTP-запрос. После этой схемы 54.2 примет path с id и body с
          TaskPatch, возьмёт только переданные и не-null значения и распакует их в именованные аргументы
          <code>patch_task</code>. Каждая пара словаря становится именованным аргументом с тем же ключом; пустой словарь
          оставляет параметры по умолчанию и не вызывает save. Ответ будет публичной TaskRead. Такой порядок
          оставляет в каждом занятии одну понятную ответственность: сервис уже умеет применять изменения, сейчас схема
          их формирует, далее HTTP-маршрут свяжет части.
        </p>
      </Section>

      <Section number="07" title="Что мы будем делать в практике">
        <p>
          В локальном Python-интерпретаторе проекта мы найдём реальную TaskPatch из установленного окружения и проверим
          четыре ситуации: поле пропущено, пришло как null, содержит обычное значение или содержит False. Затем сравним
          обычный model_dump, фильтр по присутствию, фильтр по null и их комбинацию. Для результата будем смотреть ключи и
          значения, а не только атрибуты модели.
        </p>
        <LinkedNotes
          variant="connected"
          items={[
            {
              title: "Проверим схему",
              description: "В app/routers/tasks/schemas.py найдём уже существующую TaskPatch и выпишем её фактические поля, типы и правила валидации.",
            },
            {
              title: "Проверим происхождение",
              description: "В интерпретаторе увидим model_fields_set и сравним словари для пропуска, null, значения и False.",
            },
            {
              title: "Подготовим границу",
              description: "Сопоставим подготовленные changes с именованными параметрами сервиса, не вызывая метод и не сохраняя данные.",
            },
          ]}
        />
        <p>
          Результатом станет проверенная схема и объяснимый словарь изменений для каждого входа. Практика не изменяет
          сохранённый Planner и не реализует HTTP PATCH. В следующем занятии тот же результат появится внутри обработчика,
          где уже можно будет проследить path, тело запроса, сервис и ответ.
        </p>
      </Section>
    </RichLesson>
  );
}
