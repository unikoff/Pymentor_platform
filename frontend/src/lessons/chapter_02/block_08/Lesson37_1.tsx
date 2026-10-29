import { useState, type ReactNode } from "react";
import { Boxes, ChevronLeft, ChevronRight, SearchCheck } from "lucide-react";
import {
  BugHunt,
  Callout,
  CompareSolutions,
  Diagram,
  DiagramArrow,
  DiagramFlow,
  DiagramLane,
  DiagramNode,
  Lead,
  LinkedNotes,
  MatchPairs,
  PredictOutput,
  RichHero,
} from "../../shared";

function LessonSection({ number, title, children }: { number: string; title: string; children: ReactNode }) {
  return (
    <section className="rich-section" style={{ width: "100%", minWidth: 0, gridTemplateColumns: "minmax(0, 1fr)" }}>
      <div className="rich-section-title" style={{ minWidth: 0 }}>
        <span>{number}</span>
        <h2 style={{ minWidth: 0 }}>{title}</h2>
      </div>
      {children}
    </section>
  );
}

function LessonStepThrough({ code, steps }: { code: string; steps: { line: number; note: string; vars?: Record<string, string> }[] }) {
  const [index, setIndex] = useState(0);
  const lines = code.split("\n");
  const step = steps[index];

  return (
    <div className="tracer" style={{ gridTemplateColumns: "minmax(0, 1fr)" }}>
      <div className="tracer-code" style={{ minWidth: 0, maxWidth: "100%" }}>
        {lines.map((line, lineIndex) => (
          <div className={`tracer-line${lineIndex === step.line ? " is-current" : ""}`} key={lineIndex}>
            <span className="tracer-ln">{lineIndex + 1}</span>
            <code>{line || " "}</code>
          </div>
        ))}
      </div>
      <div className="tracer-panel">
        <p className="tracer-note">{step.note}</p>
        {step.vars && (
          <div className="tracer-vars">
            {Object.entries(step.vars).map(([name, value]) => (
              <span key={name}>
                <b>{name}</b> = {value}
              </span>
            ))}
          </div>
        )}
        <div className="tracer-nav" style={{ flexWrap: "wrap" }}>
          <button type="button" disabled={index === 0} onClick={() => setIndex(index - 1)}>
            <ChevronLeft size={14} /> Назад
          </button>
          <span>шаг {index + 1} из {steps.length}</span>
          <button type="button" disabled={index === steps.length - 1} onClick={() => setIndex(index + 1)}>
            Дальше <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function Lesson37_1({ module }: { module?: string }) {
  return (
    <div className="rich-lesson" style={{ width: "100%", maxWidth: "var(--content-width)", minWidth: 0, gridTemplateColumns: "minmax(0, 1fr)" }}>
      <RichHero
        variant="project"
        chip={module ?? "Блок 8 · Интеграция и сервис"}
        title="PlannerService и перенос чтения"
        intro="Мы соберём уже знакомые чтения Planner в одном сервисе. Хранилище останется владельцем данных, CLI сохранит ввод и показ, а чтение не начнёт запись."
        tags={[
          { icon: <Boxes size={14} />, label: "один сценарий" },
          { icon: <SearchCheck size={14} />, label: "актуальные данные" },
        ]}
      />

      <LessonSection number="00" title="От двух storage к одному маршруту чтения">
        <Lead>
          В предыдущем проектном шаге мы подготовили два варианта хранения с общими действиями: файл и память. Теперь
          разберём, кто использует их для сценария Planner и как результат возвращается к команде.
        </Lead>
        <LinkedNotes
          variant="connected"
          items={[
            {
              title: "Точка старта",
              description: "Мы знаем Task, JsonStorage, MemoryStorage и переходные операции, получающие storage.",
            },
            {
              title: "Новый вопрос",
              description: "Как собрать чтение в одной роли, не смешивая его с CLI и владением данными?",
            },
            {
              title: "Результат",
              description: "PlannerService получает один storage и предоставляет четыре согласованных чтения.",
            },
          ]}
        />
        <p>
          Сначала мы проследим один вызов и уточним обязанности объектов. Затем перенесём список, получение, поиск и
          статистику, подключим к сервису читающие команды и проверим, что обе реализации storage продолжают работать.
          Добавление и завершение пока останутся на прежних переходных функциях.
        </p>
      </LessonSection>

      <LessonSection number="01" title="Сервис связывает действие и хранилище">
        <Lead>
          Раньше мы передавали функциям Planner список задач. Теперь список приходит из storage: это объект,
          умеющий загружать и сохранять задачи. Осталось выбрать, кто будет отвечать на запросы пользователя.
        </Lead>
        <p>
          <code>PlannerService</code> мы называем сервисом, потому что он выполняет действия с задачами по запросу
          других частей программы. Он знает правила списка, поиска, получения по id и статистики. <code>Task</code>
          описывает одну задачу; storage выдаёт набор задач; CLI (командная строка) спрашивает человека и печатает ответ.
          Сервис связывает эти роли и возвращает результат, не вызывая <code>input()</code> и <code>print()</code>.
        </p>
        <CompareSolutions
          question="Какой конструктор оставляет выбор хранилища точке сборки приложения?"
          left={{
            title: "Конкретное хранилище внутри",
            code: "class PlannerService:\n    def __init__(self):\n        self.storage = JsonStorage(path)",
            note: "Сервис сам выбирает файл и скрывает зависимость от вызывающего кода.",
          }}
          right={{
            title: "Переданный объект",
            code: "class PlannerService:\n    def __init__(self, storage):\n        self.storage = storage",
            note: "Сборка выбирает реализацию, а сервис работает через общий договор.",
          }}
          preferred="right"
          explanation="Справа вызывающий код выбирает уже созданный storage. self.storage запоминает ссылку на этот объект; создание сервиса не вызывает load и не заводит новый список. Слева выбор файла спрятан внутри сервиса, поэтому подставить MemoryStorage трудно."
        />
        <p>
          Представим библиотеку: посетитель обращается к сотруднику, сотрудник ищет запись в каталоге и сообщает
          результат. Посетитель здесь CLI, сотрудник сервис, каталог storage, запись об одной книге похожа на Task.
          Каталог не решает, что сказать посетителю. Аналогия помогает распределить обязанности, но в коде вместо
          беседы работают точные вызовы методов. Сервис <em>использует</em> storage: это композиция, а не наследование.
        </p>
        <p>
          Когда мы записываем <code>service = PlannerService(storage)</code>, справа передаём сам объект, а не его
          название и не путь к файлу. <code>self.storage = storage</code> оставляет эту ссылку у сервиса.
          Позже вызов <code>self.storage.load()</code> пойдёт к тому же экземпляру. Если мы заменим JsonStorage на
          MemoryStorage при сборке, тело читающих методов останется прежним: оба предоставляют <code>load()</code>.
          Это удобно и для проверки: в небольшом примере можно передать память, а в рабочем запуске использовать файл.
          В обоих случаях сервис возвращает значения, а решение, как их показать, остаётся у вызывающего кода.
        </p>
      </LessonSection>

      <LessonSection number="02" title="Один вызов проходит туда и обратно">
        <Lead>
          Теперь мы проследим не только состав объектов, но и направление работы. Для команды списка запрос уходит к
          storage, а найденные задачи возвращаются через сервис в CLI.
        </Lead>
        <Diagram caption="CLI получает данные через PlannerService и выбранный storage">
          <DiagramLane title="Путь запроса">
            <DiagramFlow label="CLI передаёт сервису команду чтения, сервис запрашивает хранилище">
              <DiagramNode title="CLI">
                <p>Принимает команду и показывает результат</p>
              </DiagramNode>
              <DiagramArrow label="вызывает метод" />
              <DiagramNode title="PlannerService" shape="subprocess">
                <p>Координирует сценарий чтения</p>
              </DiagramNode>
              <DiagramArrow label="вызывает load()" />
              <DiagramNode title="Выбранный storage" shape="database">
                <p>JsonStorage или MemoryStorage</p>
              </DiagramNode>
            </DiagramFlow>
          </DiagramLane>
          <DiagramLane title="Путь результата">
            <DiagramFlow label="Хранилище возвращает список задач сервису и CLI">
              <DiagramNode title="Список Task">
                <p>Текущие данные выбранного storage</p>
              </DiagramNode>
              <DiagramArrow label="load() возвращает" />
              <DiagramNode title="PlannerService" shape="subprocess">
                <p>Фильтрует, находит или считает</p>
              </DiagramNode>
              <DiagramArrow label="возвращает результат" />
              <DiagramNode title="CLI">
                <p>Форматирует и показывает</p>
              </DiagramNode>
            </DiagramFlow>
          </DiagramLane>
        </Diagram>
        <p>
          Верхняя дорожка показывает запрос: CLI вызывает метод сервиса, тот вызывает <code>load()</code>.
          Нижняя показывает ответ: storage отдаёт <code>list[Task]</code>, сервис находит нужное или подсчитывает,
          CLI показывает результат. Стрелки не означают создание новых объектов. Мы выбираем либо JsonStorage,
          либо MemoryStorage и передаём его сервису.
        </p>
        <p>
          Сам <code>PlannerService(storage)</code> лишь соединяет объекты. Он не загружает данные и не создаёт
          хранилище внутри себя. Выбранный storage существует до конструктора; список задач появляется только при
          запросе. Это различие важно, когда между двумя запросами пользователь завершит задачу. Если бы сервис
          запомнил список в конструкторе, дальнейший вызов <code>list_tasks()</code> мог бы показывать состояние
          из прошлого. В схеме нет второй стрелки сохранения: обычный просмотр не должен переписывать файл.
        </p>
        <Callout tone="info">
          На чтении схема обрывается на возврате данных. Вызова <code>save()</code> в этом маршруте нет: сохранение
          относится к успешному изменению и остаётся у переходных операций до следующего шага.
        </Callout>
        <PredictOutput
          code={`class Shelf:
    def __init__(self):
        self.titles = ["Python", "История"]

    def load_titles(self):
        return list(self.titles)

class CountCard:
    def __init__(self, shelf):
        self.shelf = shelf

    def count(self):
        return len(self.shelf.load_titles())

shared_shelf = Shelf()
card = CountCard(shared_shelf)
print(card.count())
shared_shelf.titles.append("География")
print(card.count())`}
          output={'2\n3'}
          hint="Сколько названий вернёт load_titles() во второй раз? CountCard хранит ссылку на полку, а не список из первого вызова."
        />
        <p>
          Сначала получаем <code>2</code>. Затем изменяем названия на той же полке, и следующий <code>count()</code>
          возвращает <code>3</code>. <code>CountCard</code> не копирует список в конструкторе, а читает при вызове.
          Представим обратный вариант: если бы в <code>__init__</code> мы записали
          <code>self.titles = shelf.load_titles()</code>, после добавления «Географии» ответ остался бы <code>2</code>.
          Такой код хранит снимок названий, сделанный при создании карточки. В Planner нам нужен первый вариант:
          сервис держит ссылку на storage и читает заново; изменять задачи пока будет переходная функция.
        </p>
      </LessonSection>

      <LessonSection number="03" title="Сервис читает актуальное состояние один раз">
        <Lead>
          Один запрос пользователя означает один снимок набора задач: мы вызываем <code>load()</code> в читающем методе
          и дальше работаем с его локальным результатом. Следующий запрос получит новый набор.
        </Lead>
        <p>
          Вокзальное табло помогает понять правило. Дежурный смотрит актуальное расписание, когда пассажир задаёт
          вопрос; вчерашняя запись в блокноте могла устареть. Так и сервис не должен хранить <code>self.tasks</code>
          с момента создания. Это только сравнение: storage хранит данные по своим правилам, а не обновляет табло в
          реальном времени; каждый новый запрос требует отдельного <code>load()</code>.
        </p>
        <LessonStepThrough
          code={`def count_tasks(storage):
    tasks = storage.load()
    return len(tasks)`}
          steps={[
            { line: 0, note: "В функцию передан storage. Вызов функции сам по себе ещё не означает загрузку.", vars: { storage: "выбранный экземпляр" } },
            { line: 1, note: "Мы вызываем load() ровно один раз и запоминаем его ответ в локальной переменной.", vars: { tasks: "список для одного запроса" } },
            { line: 2, note: "Длина вычисляется по уже полученному списку. Новых вызовов load() здесь нет.", vars: { result: "число элементов tasks" } },
          ]}
        />
        <p>
          На один вызов списка, получения, поиска или статистики достаточно одной загрузки. Полученную переменную
          <code>tasks</code> используем внутри метода, затем возвращаем ответ. Повторять <code>load()</code> в цикле
          по задачам не нужно. Такой локальный список не становится вторым постоянным хранилищем. Например,
          <code>search_tasks()</code> сначала получает список, затем перебирает его элементы: для каждого заголовка
          достаточно сравнения строк. Если задач сто, это сто сравнений, но всё ещё один вызов <code>load()</code>.
          Благодаря этому один ответ составляется по одному полученному набору, даже если следующим вызовом набор
          изменится.
        </p>
        <p>
          Если другая команда завершила задачу после первого списка, следующий запрос статистики должен увидеть новое
          <code>is_done</code>. Старое <code>self.tasks</code> может этого не показать. Поэтому сервис запрашивает
          storage снова для следующего действия; при этом сам ничего не сохраняет. Например, до изменения одна
          из двух задач завершена, после <code>done</code> завершены обе. Значит, два последовательных запроса
          статистики могут вернуть сначала <code>done=1</code>, а затем <code>done=2</code>, даже если объект
          сервиса между вызовами никто не пересоздавал.
        </p>
        <Callout tone="info">
          Важно не перепутать чтение с безопасной копией всего состояния: <code>MemoryStorage.load()</code> может
          вернуть новый список с теми же объектами <code>Task</code> внутри. Если поменять <code>task.is_done</code>,
          мы изменим сам объект, даже если контейнер скопирован. Читающие методы только смотрят на поля задач,
          не вызывают <code>save()</code> и не редактируют <code>Task</code>.
        </Callout>
      </LessonSection>

      <LessonSection number="04" title="Пустой список, неизвестный id и ошибка типа">
        <Lead>
          Читающие методы дают разные ответы на разные вопросы. Список и поиск могут естественно оказаться пустыми; при
          обязательном получении существующей задачи отсутствие становится прикладной ошибкой.
        </Lead>
        <p>
          <code>list_tasks()</code> возвращает список, даже если он пуст: <code>[]</code> означает «задач нет».
          <code>search_tasks(query)</code> тоже возвращает список совпадений. Пробелы по краям запроса убираем,
          регистр при сравнении игнорируем, но исходное название в <code>Task</code> не меняем. Пустой после очистки
          запрос и отсутствие совпадений означают <code>[]</code>, а не ошибку. При этом
          <code>get_task(task_id)</code> обещает вернуть одну конкретную <code>Task</code>. Сначала проверяем
          допустимость номера: тип <code>int</code> и положительное значение по уже знакомому валидатору.
          Неправильный номер приводит к <code>ValueError</code> <em>до поиска</em>. Если номер правильный, но задачи
          с таким id нет, поднимается <code>TaskNotFoundError</code>. Это разные причины неудачи. Например, запрос
          <code>get_task(0)</code> надо остановить на проверке номера; для <code>get_task(15)</code> мы сначала
          разрешаем номер, а затем можем не найти задачу. Неудачные случаи тоже часть публичного договора метода.
        </p>
        <PredictOutput
          code={`print(isinstance(True, int))
print(type(True) is int)`}
          output={'True\nFalse'}
          hint="В Python bool считается подклассом int. Что сравнивает вторая строка?"
        />
        <p>
          Здесь <code>isinstance(True, int)</code> даёт <code>True</code>: в Python <code>bool</code> связан с
          <code>int</code> наследованием. Но настоящий id должен быть целым числом, а не ответом «да/нет».
          Проверка <code>type(task_id) is int</code> отвергает <code>True</code>, затем валидатор проверяет знак.
          Иначе запрос <code>True</code> мог бы ошибочно найти задачу № 1.
        </p>
        <MatchPairs
          prompt="Сопоставим ситуацию с договором результата."
          leftTitle="Запрос"
          rightTitle="Результат"
          pairs={[
            { left: "Показать задачи в пустом storage", right: "list_tasks() возвращает []" },
            { left: "Искать пустой очищенный фрагмент", right: "search_tasks() возвращает []" },
            { left: "Получить положительный отсутствующий id", right: "TaskNotFoundError" },
            { left: "Передать True вместо id", right: "ValueError до поиска" },
          ]}
          explanation="Списки допускают пустой ответ. Получение по id сначала проверяет форму номера, затем ищет существующую Task. Поэтому отсутствие допустимого id отличается от ValueError для True."
        />
        <p>
          CLI перехватывает ожидаемый <code>TaskNotFoundError</code> и показывает знакомое сообщение о ненайденной
          задаче. Ошибка значения обрабатывается по уже существующей границе ввода. Сервис не решает, как именно
          формулировать текст для человека, и не ловит широкий <code>Exception</code>, который мог бы скрыть дефект кода.
        </p>
      </LessonSection>

      <LessonSection number="05" title="Поиск и статистика сохраняют понятный договор">
        <Lead>
          Теперь мы перенесём не новую бизнес-логику, а уже работающие алгоритмы в новую роль. На этом шаге важно
          согласовать публичный результат всех потребителей.
        </Lead>
        <p>
          Для поиска по названию мы сравниваем очищенный фрагмент с каждым <code>title</code> без учёта регистра.
          Запрос <code>"  PYTHON "</code> найдёт <code>"Курс Python"</code>; результат сохранит исходное
          написание. Пустая строка после <code>strip()</code> означает «не искать», поэтому ответ <code>[]</code>.
          Так правила поиска не зависят от того, память или файл предоставляет список задач.
          Для статистики сервис возвращает словарь с тремя договорёнными ключами: <code>all</code> (всего),
          <code>open</code> (не выполнено) и <code>done</code> (выполнено). Каждая задача в одном из двух состояний,
          поэтому <code>all = open + done</code>. CLI может отдельно вычислить процент выполненных; если задач нет,
          он выводит <code>0.0</code> вместо деления на ноль.
        </p>
        <PredictOutput
          code={`finished = [False, True, False]
all_count = len(finished)
done_count = sum(finished)
open_count = all_count - done_count
percent = 0.0 if all_count == 0 else round(done_count / all_count * 100, 1)
print(all_count, open_count, done_count)
print(percent)`}
          output={'3 2 1\n33.3'}
          hint="True прибавляет единицу в sum(). Сначала найди число завершённых, затем оставшихся."
        />
        <p>
          У трёх задач получаем <code>3 2 1</code> и <code>33.3</code>. Это независимый расчёт по отметкам
          завершения, без готового кода сервиса. При пустом наборе вышло бы <code>0 0 0</code> и <code>0.0</code>.
          В прежнем CLI встречались ключи <code>total/completed/left</code>. После перехода на
          <code>all/open/done</code> нужно обновить <em>все места чтения этих ключей</em>, иначе получим KeyError.
          При этом статистика возвращает только числа: она не печатает проценты и не формирует строку «Выполнено».
          Так вывод можно поменять независимо от расчёта. После исправления CLI его подписи должны показывать
          <code>all</code> как «всего», <code>done</code> как «выполнено», <code>open</code> как «осталось».
        </p>
        <BugHunt
          code={`statistics = service.get_statistics()
print(f"Всего: {statistics['total']}")
print(f"Выполнено: {statistics['completed']}")
print(f"Осталось: {statistics['left']}")`}
          question="Что сломается после перехода сервиса на all/open/done?"
          options={[
            "CLI запросит ключи, которых больше нет в новом словаре",
            "storage автоматически пересчитает старые ключи",
            "чтение вызовет save и вернёт новый набор",
          ]}
          correctIndex={0}
          explanation="Метод вернул словарь с ключами all/open/done, поэтому обращение к total вызывает KeyError. Исправляем получателя вместе с источником данных; storage не отвечает за подписи CLI."
          fix={`statistics = service.get_statistics()
print(f"Всего: {statistics['all']}")
print(f"Выполнено: {statistics['done']}")
print(f"Осталось: {statistics['open']}")`}
        />
      </LessonSection>

      <LessonSection number="06" title="Переходный CLI использует общий storage">
        <Lead>
          Читающие методы готовы, но перенос изменений ещё не закончен. Мы отметим эту границу явно, чтобы временный
          этап не превратился в две независимые базы.
        </Lead>
        <p>
          Команды <code>list</code>, <code>find</code>, <code>search</code> и <code>stats</code> вызывают
          <code>PlannerService</code>. Сервис получает результаты и отдаёт их CLI; форматирование и сообщения
          остаются у CLI. Команды <code>add</code> и <code>done</code> пока выполняются прежними переходными
          функциями, которым тоже передаётся тот же объект storage.
        </p>
        <BugHunt
          code={`service = PlannerService(MemoryStorage(seed))
transition_done(MemoryStorage(seed), task_id=1)
print(service.get_statistics())`}
          question="Почему команда может не увидеть завершённую задачу?"
          options={[
            "Для чтения и изменения созданы разные storage с разным состоянием",
            "PlannerService обязан наследовать MemoryStorage",
            "Метод статистики не должен читать список",
          ]}
          correctIndex={0}
          explanation="В двух выражениях MemoryStorage(seed) созданы разные экземпляры. Изменение второго не попадёт в первый. Выбираем storage один раз и передаём одну ссылку и сервису, и функции done."
        />
        <p>
          Два вызова <code>MemoryStorage(seed)</code> создают два отдельных хранилища. Выбранный экземпляр нужно
          создать однажды и передать сервису и переходным функциям. Для JsonStorage обе стороны также должны работать
          с одним выбранным файлом. Теперь читающие команды возвращают актуальные результаты без <code>save()</code>,
          а <code>add/done</code> работают прежним путём. Перенос изменений в сервис относится к следующему этапу. Проверка
          на этом этапе: показать список, выполнить прежнюю команду <code>done</code>, снова показать список и увидеть
          новый статус той же задачи. Это подтверждает согласованность чтения и записи. Затем повторим тест с файлом:
          читающая команда сама файл не изменит, но увидит запись переходной команды. При пустом файле просмотр
          вернёт пустой список и нулевую сводку, не создавая фиктивную задачу.
        </p>
      </LessonSection>

      <LessonSection number="07" title="Что мы будем делать в практике">
        <Lead>
          На входе у нас Task, оба варианта storage и переходные операции с единым договором. В практике мы перенесём
          чтение по одному связанному маршруту и сравним его результаты с прежним поведением.
        </Lead>
        <LinkedNotes
          variant="connected"
          items={[
            {
              title: "Найдём места переноса",
              description: "Сравним до правки ответы существующих list и done, чтобы было с чем сверять результат.",
            },
            {
              title: "Свяжем объекты",
              description: "Создадим сервис с выбранным storage и убедимся, что второй список не появился.",
            },
            {
              title: "Перенесём список и id",
              description: "Проверим пустой набор, найденную задачу, неизвестный id и неправильный тип.",
            },
            {
              title: "Добавим поиск и сводку",
              description: "Сверим регистр названий, три ключа статистики и нулевой набор.",
            },
            {
              title: "Переключим читающие команды",
              description: "CLI покажет ответ сервиса, а add/done изменят тот же storage прежним способом.",
            },
            {
              title: "Сравним оба хранения",
              description: "Прогоним пустые и заполненные случаи на памяти и JSON и проверим отсутствие save при чтении.",
            },
          ]}
        />
        <p>
          Так мы применим композицию к реальной роли, переиспользуем прежние алгоритмы и увидим переходное состояние
          до переноса изменений в следующем занятии. В результате список, поиск и статистика будут читать актуальные
          данные из одной зависимости, а прежние команды продолжат работать через согласованные storage.
        </p>
      </LessonSection>
    </div>
  );
}
