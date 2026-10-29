import { GitBranch, KeyRound } from "lucide-react";
import {
  BugHunt,
  Callout,
  CodeBlock,
  CodeSequence,
  Diagram,
  DiagramArrow,
  DiagramFlow,
  DiagramNode,
  DiagramNote,
  Lead,
  LinkedNotes,
  MatchPairs,
  MethodGrid,
  PracticeCta,
  QuizCard,
  RichHero,
  RichLesson,
  Section,
  TrueFalse,
} from "../../shared";

// Источник сохраняет компонент Lesson54, чтобы не менять идентичность урока.
// Каталог показывает этот материал под номером 48.1.
export function Lesson54({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        chip={module ?? "Блок 10 · HTTP к готовому Planner"}
        title={"Читаем задачу по id"}
        intro={"Научимся запросить одну задачу из существующего Planner и отличать неверный адрес от отсутствующей записи."}
        tags={[
          { icon: <KeyRound size={14} />, label: "id в path" },
          { icon: <GitBranch size={14} />, label: "200 · 404 · 422" },
        ]}
      />

      <Section number="00" title={"От списка к одной задаче"}>
        <Lead>
          {"В GET /tasks уже виден список задач. Теперь запросим одну запись по её id и разберём, почему разные ошибки получают разные ответы."}
        </Lead>
        <p>
          {"До практики проверим, что GET /tasks и GET /stats работают через общий PlannerService. Освоение предыдущего шага по одному плану не предполагаем: сверим его в проекте."}
        </p>
        <LinkedNotes
          variant="connected"
          items={[
            { title: "Точка старта", description: "В GET /tasks можно взять фактический id и публичные поля задачи." },
            { title: "Новый вопрос", description: "Как получить одну запись и различить неверный id и отсутствие задачи?" },
            { title: "Результат", description: "Один item-route возвращает 200, отклоняет неверный path с 422 и сообщает об отсутствии через 404." },
          ]}
        />
        <p>
          {"Сначала проследим путь id от URL до обработчика, затем передадим его уже настроенному сервису. В конце сравним данные до и после чтения."}
        </p>
      </Section>

      <Section number="01" title={"Path выбирает запись по id"}>
        <Lead>{"Часть URL после /tasks указывает на одну задачу, а не на её место в списке."}</Lead>
        <p>
          {"GET /tasks запрашивает коллекцию. GET /tasks/17 запрашивает запись с id 17. Число здесь условное: в практике возьмём id из фактического ответа Planner."}
        </p>
        <p>
          {"Представим библиотечный каталог: /books открывает весь каталог, а /books/17 указывает на книгу с идентификатором 17. Если книги переставить на полках, её id не изменится. Так же id задачи не равен номеру строки списка."}
        </p>
        <MatchPairs
          prompt={"Сопоставим адрес и запрошенные данные."}
          leftTitle={"Адрес"}
          rightTitle={"Запрос"}
          pairs={[
            { left: "GET /tasks", right: "Коллекция задач" },
            { left: "GET /tasks/17", right: "Одна задача с id 17" },
            { left: "GET /tasks?is_done=false", right: "Коллекция с условием" },
          ]}
          explanation={"Сегмент после /tasks/ задаёт id записи. Query меняет условия для списка, но не выбирает item."}
        />
        <p>
          {"Path является частью адреса до знака вопроса: /tasks/17 выбирает запись. Query начинается после вопросительного знака: /tasks?is_done=false задаёт условие для коллекции. Здесь мы работаем только с Path."}
        </p>
        <p>
          {"В шаблоне маршрута пишем /tasks/{task_id}: фигурные скобки обозначают переменную часть. Клиент отправляет конкретное значение, например /tasks/17, без скобок."}
        </p>
        <p>
          {"Идентификатор устойчив при сортировке: запись может оказаться на другой строке, но её адрес по id останется прежним. Поэтому для практической проверки мы копируем id из ответа API, а не вычисляем адрес по позиции."}
        </p>
      </Section>

      <Section number="02" title={"FastAPI проверяет значение до обработчика"}>
        <Lead>{"Значение URL приходит как текст; аннотация int задаёт его преобразование в целое число."}</Lead>
        <p>
          {"В маршруте /books/{book_id} FastAPI связывает сегмент адреса с аргументом book_id. Для /books/17 функция получает число 17. Если клиент отправит /books/abc, преобразование не удастся: FastAPI ответит 422 до вызова функции и PlannerService."}
        </p>
        <CodeBlock
          caption={"Небольшой независимый маршрут"}
          code={"@app.get(\"/books/{book_id}\")\ndef read_book(book_id: int):\n    return {\"requested_id\": book_id}"}
        />
        <CodeSequence
          title={"Путь запроса /books/17"}
          prompt={"Расположим этапы обработки."}
          pieces={[
            { id: "url", code: "Извлечь сегмент 17" },
            { id: "int", code: "Преобразовать и проверить int" },
            { id: "handler", code: "Вызвать read_book(17)" },
          ]}
          correctOrder={["url", "int", "handler"]}
          explanation={"Обработчик запускается только после успешного разбора значения."}
          incorrectExplanation={"Сначала извлекается сегмент, затем проверяется тип; при ошибке обработчик не запускается."}
        />
        <p>
          {"Тип int принимает также 0 и отрицательные числа. Для Planner требуется положительный id, поэтому добавим отдельное ограничение Path."}
        </p>
        <p>
          {"Тип и граница проверяют форму входа последовательно. Успех обеих проверок означает лишь, что обработчик получил положительное целое число. О существовании задачи на этом этапе ещё ничего не известно."}
        </p>
        <p>
          {"GET /books/17 возвращает 200 с id 17 и названием «Справочник». GET /books/81 даёт 404. Оба id проходят проверки до поиска; отличается только наличие ключа в словаре."}
        </p>
        <Callout tone="info">
          {"Не нужно вызывать int() вручную внутри функции. FastAPI выполняет преобразование до обработчика и формирует 422, если значение не подходит. Поэтому при таком отказе ни поиск в Planner, ни чтение хранилища не происходят."}
        </Callout>
      </Section>

      <Section number="03" title={"Path(gt=0) проверяет границу числа"}>
        <Lead>{"Аннотация связывает целое число с правилом: оно должно быть строго больше нуля."}</Lead>
        <p>
          {"Annotated позволяет записать рядом тип и дополнительное описание. В Annotated[int, Path(gt=0)] тип остаётся int, а Path задаёт правило для значения из URL. gt означает «больше чем». Annotated импортируется из typing, Path импортируется из fastapi."}
        </p>
        <CodeBlock
          caption={"Параметр положительного id"}
          code={"from typing import Annotated\nfrom fastapi import Path\n\ntask_id: Annotated[int, Path(gt=0)]"}
        />
        <p>
          {"FastAPI сначала получает сегмент, разбирает его как int и проверяет gt=0. Буквы не проходят разбор, а ноль и отрицательные числа не проходят границу. Все эти случаи дают 422 до обработчика."}
        </p>
        <p>
          {"Положительное число проходит проверку формы, но задача с таким id может отсутствовать. Как номер посылки: проверка, что номер положительный, ещё не подтверждает, что посылка есть в системе. В нашем API наличие проверяет PlannerService."}
        </p>
        <TrueFalse
          statement={<>Если task_id равен 17 и прошёл Path(gt=0), задача точно существует.</>}
          isTrue={false}
          explanation={"Path проверяет число и его границу. Запись ищет PlannerService.get_task."}
        />
        <p>
          {"Для независимого примера положительный id 17 есть в каталоге книг, а записи 81 нет. Первый запрос вернёт книгу, второй дойдёт до поиска и получит 404. Текст и ноль остановятся раньше с 422."}
        </p>
        <CodeBlock
          caption={"Поиск книги и предметное отсутствие"}
          code={"from typing import Annotated\nfrom fastapi import FastAPI, HTTPException, Path\n\napp = FastAPI()\nbooks = {17: \"Справочник\"}\n\n@app.get(\"/books/{book_id}\")\ndef read_book(book_id: Annotated[int, Path(gt=0)]):\n    title = books.get(book_id)\n    if title is None:\n        raise HTTPException(status_code=404, detail=\"Book not found\")\n    return {\"id\": book_id, \"title\": title}"}
        />
        <Callout tone="info">
          {"422 отвечает: «значение не подходит маршруту». 404 отвечает: «значение допустимо, но запись не найдена»."}
        </Callout>
        <p>
          {"Например, /books/81 имеет корректную форму: 81 разбирается как положительное целое. Только после проверки функция ищет ключ 81 в каталоге. Если ключа нет, это отсутствие ресурса, а не ошибка разбора адреса."}
        </p>
      </Section>

      <Section number="04" title={"Передаём поиск общему PlannerService"}>
        <Lead>{"После проверки FastAPI обработчик берёт настроенный сервис приложения и просит его найти задачу."}</Lead>
        <p>
          {"FastAPI передаёт обработчику объект Request. Через request.app.state.planner мы получаем уже настроенный PlannerService, тот же сервис, который используют GET /tasks и GET /stats. Это ссылка на общую зависимость, а не новая копия списка."}
        </p>
        <CodeBlock
          caption={"Доступ к прежнему сервису"}
          code={"def read_tasks(request: Request):\n    planner = request.app.state.planner\n    return planner.list_tasks()"}
        />
        <p>
          {"Для одной записи вместо list_tasks вызывается get_task(task_id). Поиск остаётся в сервисе: маршрут не читает JSON напрямую и не перебирает отдельный список. Так API и CLI обращаются к данным через одну точку."}
        </p>
        <p>
          {"Найденная Task проходит через _task_read_data(task). Эта функция возвращает четыре публичных поля: id, title, priority и is_done. Внутреннее поле tags не отправляется клиенту; выбор полей ответа не меняет сам объект и не сохраняет его."}
        </p>
      </Section>

      <Section number="05" title={"Только TaskNotFoundError становится 404"}>
        <Lead>{"Допустимый id может не соответствовать ни одной задаче. Это предметное отсутствие, а не ошибка формата."}</Lead>
        <p>
          {"Если get_task находит Task, маршрут возвращает её. Если записи нет, сервис поднимает TaskNotFoundError. В обработчике перехватим только это исключение и поднимем HTTPException со статусом 404 и detail='Task not found'."}
        </p>
        <p>
          {"Сервис не зависит от FastAPI: его могут вызывать и другие части приложения. Поэтому сервис сообщает предметную причину, а HTTP-маршрут переводит её в HTTP-ответ. Ошибка чтения JSON не означает, что задачи нет."}
        </p>
        <CodeBlock
          caption={"Узкая обработка отсутствующей задачи"}
          code={"try:\n    task = planner.get_task(task_id)\nexcept TaskNotFoundError as error:\n    raise HTTPException(\n        status_code=404,\n        detail=\"Task not found\",\n    ) from error\n\nreturn _task_read_data(task)"}
        />
        <p>
          {"Блок try охватывает только поиск. Если перехватить общий Exception, сбой файла тоже превратится в ложный 404. Поэтому оставляем остальные ошибки видимыми. Так отсутствие записи можно отличить от неисправности, требующей отдельной диагностики."}
        </p>
        <BugHunt
          code={"try:\n    task = planner.get_task(task_id)\nexcept Exception:\n    raise HTTPException(status_code=404, detail=\"Task not found\")"}
          question={"Что здесь ошибочно получит статус 404?"}
          options={["Только отсутствующая Task", "Любая ошибка, включая сбой чтения JSON", "Только отрицательный id"]}
          correctIndex={1}
          explanation={"Exception перехватывает и непредвиденные сбои. Ограничим обработку классом TaskNotFoundError."}
          fix={"except TaskNotFoundError as error:\n    raise HTTPException(status_code=404, detail=\"Task not found\") from error"}
        />
        <p>
          {"Так мы сохраняем границу ответственности: FastAPI проверяет вход, сервис ищет Task, а маршрут задаёт HTTP-статус и публичные поля."}
        </p>
      </Section>

      <Section number="06" title={"Сверяем ответ и место отказа"}>
        <Lead>{"Статус помогает понять, на каком этапе завершился запрос."}</Lead>
        <Diagram caption={"GET /tasks/{task_id}: от URL до ответа"}>
          <DiagramFlow label={"Проверка формы, затем поиск записи"}>
            <DiagramNode title={"URL"} shape={"process"}><code>/tasks/17</code></DiagramNode>
            <DiagramArrow label={"извлечь id"} />
            <DiagramNode title={"FastAPI"} shape={"decision"}><p>{"int и gt=0"}</p></DiagramNode>
            <DiagramArrow label={"если проверка пройдена"} />
            <DiagramNode title={"Обработчик"} shape={"process"}><p>{"get_task(task_id)"}</p></DiagramNode>
            <DiagramArrow label={"читает"} />
            <DiagramNode title={"PlannerService"} shape={"subprocess"}><p>{"Task или TaskNotFoundError"}</p></DiagramNode>
            <DiagramArrow label={"использует"} />
            <DiagramNode title={"Общее хранилище"} shape={"database"}><p>{"Planner JSON"}</p></DiagramNode>
          </DiagramFlow>
          <DiagramNote title={"Ветви результата"}>
            <ul>
              <li>{"Текст, ноль и отрицательное число: 422 до обработчика."}</li>
              <li>{"Найденная Task: 200 и четыре публичных поля."}</li>
              <li>{"TaskNotFoundError: 404; сбой хранилища не маскируется."}</li>
            </ul>
          </DiagramNote>
        </Diagram>
        <MethodGrid
          rows={[
            [<code>/tasks/abc</code>, "422: значение не разбирается как int."],
            [<><code>/tasks/0</code> или <code>/tasks/-1</code></>, "422: не выполнено gt=0."],
            [<code>/tasks/существующий_id</code>, "200: Task найдена, возвращены четыре поля."],
            [<code>/tasks/отсутствующий_id</code>, "404: допустимый положительный id не найден."],
            ["Сбой чтения JSON", "Не превращаем в 404; это другая ошибка."],
          ]}
        />
        <p>
          {"Для 404 возьмём число на единицу больше максимального id из текущего списка. Оно положительное, но отсутствует. Перед запросом заменим слова-пояснения в адресах реальными числами."}
        </p>
        <p>
          {"Проверим также тело успешного ответа: все четыре значения должны совпасть с записью того же id в GET /tasks, а tags не должно быть в публичной проекции. Повторные GET /tasks и GET /stats, CLI и настроенный JSON покажут, что маршрут только читает данные."}
        </p>
        <QuizCard
          question={"Положительный id прошёл Path, но get_task не нашёл запись. Какой ответ ожидаем?"}
          options={["422: число допустимо, но записи нет", "404: форма допустима, запись отсутствует", "200: вернуть первую задачу списка"]}
          correctIndex={1}
          explanation={"Валидация уже завершилась. Сервис сообщает об отсутствии, а маршрут переводит TaskNotFoundError в 404."}
        />
        <TrueFalse
          statement={<>Чтение JSON для поиска означает, что GET должен сохранить файл заново.</>}
          isTrue={false}
          explanation={"Чтение не вызывает сохранение. Список, статистика и JSON должны остаться прежними."}
        />
        <p>
          {"Существующий id проверим сравнением с той же записью в GET /tasks. После запросов повторим GET /tasks и GET /stats, а также сверим CLI и настроенный JSON: item-route не должен менять Planner."}
        </p>
      </Section>

      <Section number="07" title={"Что мы будем делать в практике"}>
        <Lead>{"Добавим один item-route к существующему Planner и проверим чтение на реальных данных."}</Lead>
        <LinkedNotes
          variant="connected"
          items={[
            { title: "Снимем исходные ответы", description: "Сохраним GET /tasks, GET /stats и id выбранной записи." },
            { title: "Подключим маршрут", description: "Проверим Path, вызовем общий get_task и применим публичную проекцию." },
            { title: "Различим ответы", description: "Проверим существующий id, три варианта 422 и отсутствующий положительный id для 404." },
            { title: "Подтвердим чтение", description: "Сравним список, статистику, CLI и JSON до и после запросов." },
          ]}
        />
        <p>
          {"Сначала убедимся, что прежний API и Planner готовы. Затем самостоятельно изменим app/api.py. Код не должен создавать второй сервис, поиск или хранилище."}
        </p>
        <p>
          {"Результат проверим на фактическом id, а не на числе из примера. Так мы увидим отдельно корректность ответа и отсутствие побочного изменения данных."}
        </p>
        <PracticeCta text={"Добавим GET /tasks/{task_id}, проверим 200, 422 и 404 и сравним Planner до и после."} />
      </Section>
    </RichLesson>
  );
}
