import {
  CheckCircle2,
  ListChecks,
} from "lucide-react";
import {
  BugHunt,
  Callout,
  CodeBlock,
  KeyTakeaways,
  Lead,
  PracticeCta,
  PredictOutput,
  QuizCard,
  RecallCard,
  RichHero,
  RichLesson,
  Section,
  TrueFalse,
  TheoryBridge,
} from "../../shared";

export function Lesson41({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? "Месяц 2 · Блок 8"}
        title={"41. Первые тесты через pytest"}
        intro={"In-memory ядро уже умеет создавать и показывать задачи. Теперь pytest превратит правила Task, MemoryStorage и первых методов service в повторяемые проверки."}
        tags={[
          { icon: <CheckCircle2 size={14} />, label: "pytest и assert" },
          { icon: <ListChecks size={14} />, label: "in-memory ядро" },
        ]}
      />
      <TheoryBridge link={"In-memory ядро уже работает, поэтому pytest превращает договоры Task, MemoryStorage и add/list в повторяемые проверки."} boundary={"Тесты пока не проверяют JSON или CLI: эти слои ещё не реализованы."} />

      <Section number="00" title={"От ручной проверки к повторяемому договору"}>
        <Lead>
          {"Когда Task, MemoryStorage и PlannerService только появились, их можно было проверить вручную. Но после каждого изменения легко забыть край приоритета, независимость tags или то, что service обязан сохранить созданную задачу. Тест записывает одно ожидание и запускает его столько раз, сколько нужно."}
        </Lead>
        <RecallCard
          question={"Что должен доказывать один небольшой тест?"}
          hint={"Выберите границу, которая объяснит причину падения."}
          answer={<p>{"Одно наблюдаемое поведение. Большой пользовательский сценарий появится позже, когда проект получит JSON и CLI."}</p>}
        />
      </Section>

      <Section number="01" title={"AAA делает сценарий читаемым"}>
        <Lead>
          {"Arrange готовит данные и зависимость. Act выполняет одно действие. Assert проверяет результат. Эта форма похожа на короткий эксперимент: сначала условия, затем опыт, затем наблюдение."}
        </Lead>
        <CodeBlock
          caption={"проверка добавления"}
          code={"def test_add_task_saves_created_task():\n    storage = MemoryStorage()       # Arrange\n    service = PlannerService(storage)\n\n    created = service.add_task(\"Python\", priority=3)  # Act\n\n    assert storage.load() == [created]  # Assert"}
        />
        <QuizCard
          question={"Что делает assert в этом сценарии?"}
          options={["Фиксирует ожидаемый результат", "Создаёт задачу", "Запускает pytest"]}
          correctIndex={0}
          explanation={"Создание происходит в Act. Assert сравнивает наблюдаемый итог с договором."}
        />
      </Section>

      <Section number="02" title={"Модель тестируется отдельно"}>
        <Lead>
          {"Task владеет собственными правилами, поэтому тесты модели не создают storage и не запускают сервис. Они проверяют нормализацию, границы priority, пустой заголовок, tags и mark_done."}
        </Lead>
        <CodeBlock
          caption={"границы priority"}
          code={"@pytest.mark.parametrize(\"priority\", [0, 6])\ndef test_rejects_invalid_priority(priority):\n    with pytest.raises(ValueError):\n        Task(1, \"Python\", priority=priority)"}
        />
        <TrueFalse
          statement={<>{"Аннотация priority: int сама отклоняет строку во время выполнения."}</>}
          isTrue={false}
          explanation={"Аннотация описывает ожидание. Проверка и ошибка должны жить в модели."}
        />
      </Section>

      <Section number="03" title={"Storage защищает собственное состояние"}>
        <Lead>
          {"MemoryStorage хранит список в памяти. Его договор включает защитные копии: внешний код может изменить список, который получил от load, но не должен изменить внутреннее состояние без save."}
        </Lead>
        <PredictOutput
          code={"tasks = storage.load()\ntasks.clear()\nlen(storage.load())"}
          output={"Исходное количество задач"}
          hint={"load возвращает копию, а не внутренний список."}
        />
      </Section>

      <Section number="04" title={"Service проверяется через MemoryStorage"}>
        <Lead>
          {"Service получает зависимость снаружи, поэтому его можно проверить без диска. В этом занятии достаточно add_task и list_tasks. Они доказывают первый прикладной путь и не требуют будущего JSON."}
        </Lead>
        <Callout tone="info">
          {"Не добавляйте в этот набор JSON, CLI, persistence после перезапуска или полный CRUD. Эти обещания проект ещё не реализовал."}
        </Callout>
      </Section>

      <Section number="05" title={"Имена и ошибки помогают искать причину"}>
        <Lead>
          {"Имя test_rejects_empty_title сразу говорит, что именно сломалось. pytest.raises проверяет ожидаемую ошибку, а не прячет исключение. Падение assert и ошибка импорта требуют разного поиска."}
        </Lead>
        <BugHunt
          code={"try:\n    Task(1, \"   \", priority=3)\nexcept Exception:\n    pass"}
          question={"Почему это не тест правила модели?"}
          options={["Он скрывает тип и факт ошибки", "В нём нельзя создавать Task", "pytest запрещает try"]}
          correctIndex={0}
          explanation={"Нужно явно ожидать согласованный тип ошибки через pytest.raises."}
          fix={"with pytest.raises(ValueError):\n    Task(1, \"   \", priority=3)"}
        />
      </Section>

      <Section number="06" title={"Fixture готовит зависимость, не скрывая смысл"}>
        <Lead>
          {"Fixture полезна, когда несколько тестов начинают с одинаковой подготовки. Она может вернуть новый MemoryStorage или service. Каждый тест получает своё состояние и не зависит от порядка запуска."}
        </Lead>
        <CodeBlock
          caption={"простая fixture"}
          code={"@pytest.fixture\ndef service():\n    return PlannerService(MemoryStorage())"}
        />
      </Section>

      <Section number="07" title={"Файловая изоляция появится на следующей границе"}>
        <Lead>
          {"Когда появится JsonStorage, файловым тестам понадобится tmp_path. Он создаёт отдельную временную папку и защищает рабочий файл пользователя. Сейчас мы не пишем такой тест, потому что файловое хранилище ещё не является частью проекта."}
        </Lead>
        <p>{"Принцип уже важен: тест не должен брать скрытое состояние из окружения. Для текущей работы эту изоляцию даёт новый MemoryStorage в каждом сценарии."}</p>
      </Section>

      <Section number="08" title={"Что мы будем делать в практике"}>
        <Lead>
          {"Практика закрепит проверенное in-memory ядро. Она не просит написать JSON или CLI раньше времени."}
        </Lead>
        <div className="lesson-practice-steps">
          <h3>Task</h3>
          <p>{"Проверить нормализацию, инварианты, независимые tags и mark_done."}</p>
          <h3>MemoryStorage</h3>
          <p>{"Проверить защитные копии и явное сохранение."}</p>
          <h3>PlannerService</h3>
          <p>{"Проверить add_task и list_tasks через новое in-memory состояние."}</p>
        </div>
        <PracticeCta text={"Защитите Task, MemoryStorage и первые методы PlannerService небольшими самостоятельными тестами."} />
      </Section>

      <Section number="09" title={"Самопроверка перед практикой"}>
        <div className="lesson-check-group">
          <QuizCard question={"Зачем нужен pytest.raises?"} options={["Проверить ожидаемую ошибку", "Скрыть ошибку", "Запустить CLI"]} correctIndex={0} explanation={"Ошибка является частью публичного договора модели."} />
          <QuizCard question={"Почему service тестируется через MemoryStorage?"} options={["Нет файловой зависимости", "JSON уже реализован", "Так не нужен assert"]} correctIndex={0} explanation={"Тест получает управляемое состояние и проверяет только прикладной сценарий."} />
          <QuizCard question={"Что пока не входит в тесты?"} options={["JSON и CLI", "Task", "add_task"]} correctIndex={0} explanation={"Эти слои появятся после архитектурной и файловой работы."} />
        </div>
        <KeyTakeaways points={[<>{"Один тест защищает одно наблюдаемое обещание."}</>, <>{"AAA делает сценарий читаемым."}</>, <>{"MemoryStorage даёт изолированное состояние без диска."}</>, <>{"Текущий набор становится опорой для следующих слоёв."}</>]} />
      </Section>
    </RichLesson>
  );
}

// 42. Финальный проект 1: архитектура Persistent Planner
