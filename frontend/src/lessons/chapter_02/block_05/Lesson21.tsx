import { ListChecks } from "lucide-react";
import {
  BugHunt,
  Callout,
  Diagram,
  DiagramArrow,
  DiagramFlow,
  DiagramNode,
  DiagramNote,
  LinkedNotes,
  Lead,
  MatchPairs,
  PredictOutput,
  PracticeCta,
  RichHero,
  RichLesson,
  Section,
  StepThrough,
  TrueFalse,
} from "../../shared";

// 21. Обзор Console Planner
export function Lesson21({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? "Глава 2 · Блок 5"}
        title="Обзор Console Planner"
        intro="Сначала предскажем поведение семи команд, затем проверим ответы и данные в своём main.py. По результатам наметим изменение организации вызовов."
        tags={[
          { icon: <ListChecks size={14} />, label: "карта поведения" },
          { icon: <ListChecks size={14} />, label: "исходная точка" },
        ]}
      />

      <Section number="00" title="От знакомого Planner к исходной карте">
        <Lead>
          В первой главе мы собрали Console Planner. Теперь проверим его как исследователи: что происходит после команды, почему это происходит и какую часть кода можно будет изменить позже.
        </Lead>
        <LinkedNotes
          variant="connected"
          items={[
            {
              title: "Точка старта",
              description: "В Planner есть команды, список словарей и функции, с которыми мы уже работали.",
            },
            {
              title: "Новый вопрос",
              description: "Как подтвердить поведение программы и найти в исходном коде путь от команды к результату?",
            },
            {
              title: "Результат",
              description: "Мы получим проверенную карту текущих возможностей и обозначим одну точную границу для следующего занятия.",
            },
          ]}
        />
        <p>
          Откройте свой <code>main.py</code> после разбора меню и цикла ввода: запустите меню, найдите <code>run()</code> и список <code>tasks</code>. Если это пока сложно, повторите запуск меню и цикла ввода. Проверяйте результаты на своей версии.
        </p>
      </Section>

      <Section number="01" title="Пользовательский результат и устройство кода">
        <Lead>
          У команды есть наблюдаемое поведение: ответ и изменение задач. Устройство кода объясняет путь через функции, условия и данные. Нам нужно проверить обе стороны.
        </Lead>
        <p>
          Одно и то же сообщение ещё не гарантирует одинакового состояния списка. Например, повторное <code>done</code> подтверждает команду, но не завершает новую задачу.
        </p>
        <TrueFalse
          statement={<>Успешное сообщение команды <code>done</code> само по себе доказывает, что поле <code>is_done</code> изменилось.</>}
          isTrue={false}
          explanation="Мы проверяем и ответ, и состояние словаря: сообщение не заменяет наблюдение за данными."
        />
        <p>
          <code>print</code> выводит строку в терминал, <code>return</code> передаёт значение вызывающему коду, а <em>мутация</em> меняет существующие данные. Например, <code>append</code> удлиняет список, а <code>task["is_done"] = True</code> меняет поле словаря.
        </p>
        <PredictOutput
          code={'def plus_one(x):\n    return x + 1\n\nresult = plus_one(4)\nprint(result)'}
          output="5"
          hint="Сначала предскажите, что появится в терминале. Затем уберите print: значение result сохранится, но появится ли строка?"
        />
        <Callout tone="info">
          При проверке Planner записывайте <code>ввод → прогноз вывода → прогноз состояния → факт → источник в main.py</code>. Карточка показывает статус, но ключ <code>is_done</code> и его исходное значение проверяются в <code>create_task</code>. Если ваша версия отличается, сначала зафиксируйте расхождение.
        </Callout>
      </Section>

      <Section number="02" title="Наблюдаем сценарий до чтения кода">
        <Lead>
          До первого <code>list</code> и <code>stats</code> предскажите карточки и четыре числа. В исходной версии список пуст, статистика содержит нули и <code>0.0%</code>. После <code>add</code> сверьте прогноз с новой карточкой.
        </Lead>
        <p>
          Проверим семь команд: <code>add</code>, <code>list</code>, <code>find</code>, <code>done</code>, <code>search</code>, <code>stats</code>, <code>exit</code>. <code>run()</code> создаёт <code>tasks = []</code> при каждом запуске: задачи не сохраняются после выхода. Удаления здесь нет.
        </p>
        <PredictOutput
          code={'tasks = [{"id": 1, "is_done": False}, {"id": 2, "is_done": False}]\nfound = tasks[0]\nprint(len(tasks), tasks[0]["is_done"], tasks[1]["is_done"])\nfound["is_done"] = True\nprint(len(tasks), tasks[0]["is_done"], tasks[1]["is_done"])\nfound["is_done"] = True\nprint(len(tasks), tasks[0]["is_done"], tasks[1]["is_done"])'}
          output={"2 False False\n2 True False\n2 True False"}
          hint="tasks[0]: первый словарь, tasks[1]: второй. found: ещё одно имя первого словаря. Что меняется при повторном присваивании?"
        />
        <p>
          <code>found = tasks[0]</code> даёт ещё одно имя первому словарю, без копирования. Присваивание меняет его флаг, но не второй флаг и не длину списка. Повторное <code>True</code> ничего не меняет. Предскажите вывод для <code>found = tasks[1]</code>.
        </p>
        <Callout tone="info">
          При двух задачах с флагами <code>True</code> и <code>False</code> статистика покажет 2 всего, 1 выполнена, 1 осталась и 50.0%. Повторный <code>done</code> для первой оставит 2/1/1/50.0%: число завершённых зависит от флагов, а не от количества команд. Это прогноз для проверки в своей версии.
        </Callout>
        <p>
          Для каждого опыта сохраняйте точную команду и данные. <code>find</code> читает найденную задачу, а <code>done</code> меняет её состояние. Сверяйте вывод через <code>list</code>/<code>stats</code>, а место изменения: через код. Один только текст «готово» ещё не доказывает смену флага.
        </p>
      </Section>

      <Section number="03" title="Прослеживаем команду add">
        <Lead>
          <code>run()</code> получает команду, убирает внешние пробелы, приводит буквы к нижнему регистру и для <code>add</code> вызывает <code>handle_add(tasks)</code>. Так обработчик получает действующий список задач.
        </Lead>
        <p>
          Обработчик <code>handle_add</code> организует вызовы: <code>read_title()</code> через <code>normalize_title</code> получает непустое название, <code>read_priority()</code> проверяет число от 1 до 5. Ошибочный ввод не приводит к добавлению.
        </p>
        <Diagram caption="Путь команды add от выбора до новой задачи">
          <DiagramFlow label="Вызовы при добавлении задачи">
            <DiagramNode title="run()">
              <p>Выбирает ветку команды add</p>
            </DiagramNode>
            <DiagramArrow label="вызывает" />
            <DiagramNode title="handle_add(tasks)">
              <p>Связывает чтение ввода и добавление</p>
            </DiagramNode>
            <DiagramArrow label="читает значения" />
            <DiagramNode title="read_title() и read_priority()">
              <p>Возвращают проверенные title и priority</p>
            </DiagramNode>
            <DiagramArrow label="передаёт данные" />
            <DiagramNode title="add_task(tasks, ...)">
              <p>Получает id, создаёт и добавляет словарь</p>
            </DiagramNode>
          </DiagramFlow>
          <DiagramNote title="После добавления">
            <p>
              add_task возвращает словарь обработчику. Затем handle_add вызывает format_task и печатает карточку. Список tasks остаётся тем же объектом.
            </p>
          </DiagramNote>
        </Diagram>
        <p>
          В <code>add_task</code> функция <code>get_next_id(tasks)</code> выбирает id: 1 для пустого списка, иначе максимум плюс один. <code>create_task</code> собирает словарь с <code>id</code>, <code>title</code>, <code>priority</code> и <code>is_done=False</code>. Только <code>tasks.append(...)</code> удлиняет список.
        </p>
        <p>
          Обработчик использует тот же список <code>tasks</code>, что и <code>run()</code>, поэтому новая запись видна следующей команде. <code>add_task</code> возвращает словарь, <code>format_task</code> готовит строку, а обработчик печатает её.
        </p>
        <MatchPairs
          prompt="Сопоставим функции с тем, что они делают в этой цепочке."
          leftTitle="Функция"
          rightTitle="Результат её работы"
          pairs={[
            { left: "get_next_id(tasks)", right: "Находит следующий id" },
            { left: "create_task(...)", right: "Собирает словарь задачи" },
            { left: "add_task(...)", right: "Добавляет задачу в список и возвращает её" },
            { left: "format_task(task)", right: "Возвращает строку карточки" },
          ]}
          explanation="Мы разделили назначение id, создание словаря, изменение списка и подготовку строки для показа."
        />
        <p>
          Укажите на схеме, где вычислен id, а где изменился список. Затем найдите эти места в своей версии <code>main.py</code>. Ошибка приоритета оставляет список прежним.
        </p>
      </Section>

      <Section number="04" title="Находим и завершаем существующую задачу">
        <Lead>
          <code>handle_find</code> получает id через <code>read_task_id</code>, затем вызывает <code>find_task</code>. Результат: словарь либо <code>None</code> («не найдено»). Буквы и 0 отклоняются при чтении; положительный отсутствующий id доходит до поиска.
        </Lead>
        <p>
          <code>done</code> ищет запись внутри <code>mark_task_done</code>. Найденной задаче устанавливает <code>is_done=True</code> и возвращает <code>True</code>; при отсутствии возвращает <code>False</code>. Поиск возвращает существующий словарь, не создавая копию.
        </p>
        <StepThrough
          code={'def find_task(tasks, task_id):\n    for task in tasks:\n        if task["id"] == task_id:\n            return task\n    return None\n\ntasks = [{"id": 1}, {"id": 2}]\nfound = find_task(tasks, 2)'}
          steps={[
            { line: 8, note: "Мы передаём в функцию общий список и id 2.", vars: { task_id: "2", tasks: '[{"id": 1}, {"id": 2}]' } },
            { line: 2, note: "Мы рассматриваем первый словарь списка.", vars: { task: '{"id": 1}' } },
            { line: 3, note: "Мы сравниваем id 1 с искомым id 2: совпадения пока нет.", vars: { совпадение: "False" } },
            { line: 2, note: "Мы переходим к следующему словарю.", vars: { task: '{"id": 2}' } },
            { line: 3, note: "Мы видим совпадение с искомым id.", vars: { совпадение: "True" } },
            { line: 4, note: "Мы возвращаем найденный словарь, уже лежащий в tasks.", vars: { found: '{"id": 2}' } },
          ]}
        />
        <p>
          Сначала предскажите, что произойдёт при двух вызовах <code>done</code> с одним id. Сообщение может повториться, но в <code>stats</code> эта задача учитывается один раз: флаг уже равен <code>True</code>. Найдите строку присваивания в <code>mark_task_done</code>.
        </p>
      </Section>

      <Section number="05" title="Сверяем list, search и stats">
        <Lead>
          <code>list</code> проходит в последний <code>else</code> функции <code>run()</code> и вызывает <code>show_tasks(tasks)</code>. Неизвестную команду раньше отсекает <code>continue</code>, после чего цикл возвращается к меню. <code>show_tasks</code> печатает пустой список или карточки через <code>format_task</code>. Отдельного <code>handle_list</code> нет.
        </Lead>
        <p>
          <code>handle_search</code> отклоняет запрос из пробелов до поиска. <code>search_tasks</code> для непустого запроса сравнивает названия без внешних пробелов и без учёта регистра: <code> ТЕСТ </code> найдёт «Тесты». Изменится ли список?
        </p>
        <BugHunt
          code={'# Фрагмент handle_find: task получен через find_task\nif task is None:\n    print("Задача найдена")\nelse:\n    print("Задача не найдена")'}
          question="Где причина неверного ответа обработчика?"
          options={[
            "Сообщения в двух ветках перепутаны",
            "Проверка task is None лишняя",
            "Для результата нужен второй список",
          ]}
          correctIndex={0}
          explanation="Мы печатаем сообщение об успехе для отсутствующего результата. Сами ветки нужны: find_task возвращает словарь либо None."
          fix={'if task is None:\n    print("Задача не найдена")\nelse:\n    print("Задача найдена")'}
        />
        <p>
          Для <code>stats</code> отдельного обработчика тоже пока нет. Ветка внутри <code>run()</code> получает результат <code>build_statistics(tasks)</code>, рассчитывает процент через <code>completion_percent(statistics)</code> и печатает четыре значения. Для пустого списка процент равен <code>0.0</code>, поэтому деления на ноль не происходит.
        </p>
        <PredictOutput
          code={'tasks = [{"is_done": True}, {"is_done": False}]\ntotal = len(tasks)\ncompleted = 0\nfor task in tasks:\n    if task["is_done"]:\n        completed += 1\nleft = total - completed\nif total == 0:\n    percent = 0.0\nelse:\n    percent = completed / total * 100\nprint(total, completed, left, percent)'}
          output="2 1 1 50.0"
          hint="Сначала предскажите числа. Затем измените второй флаг на True и объясните результат. Это учебная модель, а не копия кода Planner."
        />
        <p>
          <code>total</code> считает задачи, <code>completed</code> считает флаги <code>True</code>, а <code>left</code> хранит число оставшихся; процент показывает долю. При <code>total == 0</code> делить нельзя. В Planner найдите вычисления в <code>build_statistics</code>/<code>completion_percent</code> и печать в <code>run()</code>.
        </p>
      </Section>

      <Section number="06" title="Читаем цепочку и её границы">
        <Lead>
          Чтобы восстановить путь, мы ищем в коде не только совпадающее название команды. Проверяем, кто получает ввод, кто вызывает следующую функцию, кто меняет список, кто возвращает результат и кто его показывает.
        </Lead>
        <p>
          Проверим различие на независимой функции <code>get_status</code>. Она возвращает «готово» для кода 1 и <code>None</code> для остальных значений. Сама функция ничего не печатает: сообщение выбирает вызывающий код, проверяя то, что пришло из <code>return</code>.
        </p>
        <PredictOutput
          code={'def get_status(code):\n    if code == 1:\n        return "готово"\n    else:\n        return None\n\nstatus = get_status(2)\nif status is None:\n    print("нет статуса")\nelse:\n    print(status)'}
          output="нет статуса"
          hint="Посмотрим на ветку return при code=2, а затем на print вне функции. Заменим вызов на get_status(1) и предскажем второй вывод."
        />
        <Callout tone="info">
          При <code>get_status(1)</code> вызывающий код напечатает «готово». Ни при каком из двух входов <code>get_status</code> не выполняет <code>print</code>. Теперь при самостоятельном разборе <code>find</code> ищем, какая функция возвращает <code>None</code>, а какая печатает отказ.
        </Callout>
        <MatchPairs
          prompt="Соединим этап чтения команды с наблюдаемым результатом."
          leftTitle="Действие"
          rightTitle="Что фиксируем"
          pairs={[
            { left: "find_task", right: "Возвращает словарь или None" },
            { left: "format_task", right: "Готовит строку для показа" },
            { left: "mark_task_done", right: "Меняет поле найденной задачи" },
            { left: "handle_find", right: "Печатает сообщение по результату поиска" },
          ]}
          explanation="Мы различаем возвращаемое значение, изменение общего списка и видимый вывод команды."
        />
        <p>
          Для своей трассы отмечайте <code>ввод → ветка → вызовы → return → изменение → print</code> с источником каждого значения. Например, <code>find_task</code> возвращает <code>None</code>, а отказ печатает <code>handle_find</code>. Расхождение ищите на первом неверном переходе.
        </p>
        <p>
          Самостоятельно проследите <code>list</code> или <code>search</code>: найдите вызовы и <code>print</code>, проверьте состояние списка. При ошибке запишите ввод, ожидание и факт; причину подтвердите исходником.
        </p>
      </Section>

      <Section number="07" title="Определяем безопасный следующий шаг">
        <Lead>
          В известной исходной версии уже есть <code>handle_add</code>, <code>handle_find</code>, <code>handle_done</code> и <code>handle_search</code>, а для списка используется <code>show_tasks</code>. Ветка <code>stats</code> пока находится в <code>run()</code>.
        </Lead>
        <p>
          В следующем разборе выделим <code>handle_list(tasks)</code> и <code>handle_stats(tasks)</code>, используя готовые <code>show_tasks</code>, <code>build_statistics</code> и <code>completion_percent</code>. До и после переноса сравним пустой список, две задачи и повторный <code>done</code>.
        </p>
        <MatchPairs
          prompt="Выбираем, какое изменение относится к ближайшей задаче без расширения возможностей Planner."
          leftTitle="Вариант"
          rightTitle="Ожидаемый эффект"
          pairs={[
            { left: "Выделить handle_stats", right: "Тот же расчёт и вывод в отдельном обработчике" },
            { left: "Выделить handle_list", right: "Прежние карточки через show_tasks" },
            { left: "Сохранять список в файл", right: "Новое поведение между запусками; другая задача" },
          ]}
          explanation="В следующем разборе мы сохраним внешнее поведение list/stats, изменяя организацию вызовов. Хранение между запусками требует нового договора и здесь не входит в работу."
        />
        <p>
          Сегодня мы подтверждаем исходное поведение: не переименовываем поля и не переписываем готовую нормализацию. Если обнаружится регресс относительно предыдущей главы, фиксируем вход, ожидание и факт, затем адресно восстанавливаем прежний договор до изменения организации вызовов.
        </p>
        <TrueFalse
          statement={<>Если все проверенные сценарии совпали с исходным договором, для занятия обязательно нужна правка кода.</>}
          isTrue={false}
          explanation="Мы подтверждаем текущую точку A. При совпадении сценариев пустой diff честно показывает, что продуктовое поведение не менялось."
        />
        <p>
          Команда <code>git diff -- main.py</code> показывает незакоммиченные отличия от Git, но не доказывает корректность поведения. Ученик может принести уже изменённый файл, поэтому сначала отмечаем прежние правки. Пустой diff при успешной проверке нормален: для аудита не нужен искусственный коммит. Сохранить наблюдения в заметках достаточно.
        </p>
      </Section>

      <Section number="08" title="Что мы будем делать в практике">
        <Lead>
          В практике используем свой <code>main.py</code> после разбора меню и цикла ввода. До каждого ввода записываем прогноз вывода и изменения задач, а после каждого ввода фиксируем факт и функцию, которая его объясняет. Шесть шагов образуют один проверяемый сценарий.
        </Lead>
        <LinkedNotes
          variant="connected"
          items={[
            {
              title: "Проверим пустое состояние и добавление",
              description: "Предскажем ответы list/stats, создадим две собственные задачи и сверим карточки и id.",
            },
            {
              title: "Пройдём чтение и изменение",
              description: "Найдём задачу, проверим поиск с пробелами, дважды выполним done и проследим изменения статистики.",
            },
            {
              title: "Проверим отказы",
              description: "Определим, где ввод повторяется, а где возвращается меню; после исправленного add появится одна карточка.",
            },
            {
              title: "Проверим следующий запуск",
              description: "Завершим программу через exit и убедимся, что новый процесс начинает работу с пустым списком.",
            },
            {
              title: "Сопоставим сценарии с исходником",
              description: "Сами построим цепочки add/stats и без готовой схемы проверим list или search.",
            },
            {
              title: "Обозначим изменение организации вызовов",
              description: "Найдём места будущих handle_list/handle_stats и просмотрим git diff -- main.py, сохранив прежние правки.",
            },
          ]}
        />
        <p>
          После повторного запуска объясните, почему список снова пуст. Завершите самостоятельными трассами <code>add</code> и <code>stats</code> и планом проверки изменения организации вызовов. Если фактический Planner соответствует прежнему поведению, <code>main.py</code> не меняем.
        </p>
        <PracticeCta text="Перейти к практике в Console Planner" />
      </Section>
    </RichLesson>
  );
}
