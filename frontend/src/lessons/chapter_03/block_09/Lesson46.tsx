import { Braces, FileText } from "lucide-react";
import { BugHunt, Callout, CodeBlock, Lead, LinkedNotes, MatchPairs, PracticeCta, PredictOutput, QuizCard, RichHero, RichLesson, Section } from "../../shared";
import requestPartsInfographic from "./images/lesson-46-request-parts.svg";
import requestWireFormatInfographic from "./images/lesson-46-http11-message.svg";

// 46. HTTP request: адрес, метод, headers и body
export function Lesson46({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        chip={module ?? "Месяц 3 · Блок 9 · Интернет и HTTP"}
        title={"46. HTTP request: адрес, метод, headers и body"}
        intro={"В прошлом занятии мы разделили роли клиента и сервера. Теперь разберём сообщение, которое клиент передаёт серверу: куда обратиться, что попросить и какие данные приложить."}
        tags={[
          { icon: <Braces size={14} />, label: "части request" },
          { icon: <FileText size={14} />, label: "method · headers · body" },
        ]}
      />

      <Section number="00" title={"От разговора к сообщению"}>
        <Lead>
          {"HTTP (Hypertext Transfer Protocol) задаёт правила обмена сообщениями клиента и сервера. Request является запросом клиента, response является ответом сервера. Сейчас выясним, что именно входит в request."}
        </Lead>
        <p>
          {"Представим бланк заказа: на нём указан адрес отдела, просьба, служебные отметки и сам заказ. HTTP request выполняет похожую роль. В этом занятии мы выделим в учебной модели адрес, method, headers и необязательный body."}
        </p>
        <LinkedNotes variant="connected" items={[
          { title: "Опора", description: "В прошлом занятии разобрали роли клиента и сервера. Request связывает их, но его устройство ещё не рассматривали." },
          { title: "Вопрос", description: "Какие сведения нужны серверу, чтобы понять обращение клиента?" },
          { title: "Результат", description: "Различаем четыре части request и составляем их учебное представление в Python. Настоящую сеть пока не запускаем." },
        ]} />
        <figure className="lesson-infographic">
          <img
            src={requestPartsInfographic}
            alt="Четыре части учебной модели request: method, path, headers и необязательный body."
            width={1672}
            height={836}
            loading="lazy"
            decoding="async"
          />
          <figcaption>Смысловая модель сообщения, а не его полный вид при передаче по сети.</figcaption>
        </figure>
        <QuizCard
          question="Клиент написал «создай задачу». Это уже полноценный HTTP request?"
          options={[
            "Да, сервер сам догадается об адресе и данных",
            "Нет, это намерение, которому нужен согласованный формат обращения",
            "Да, если в Planner уже есть метод add_task",
          ]}
          correctIndex={1}
          explanation="Человеческое намерение нужно выразить в сообщении по внешнему договору. Имя внутреннего Python-метода клиенту не требуется."
        />
      </Section>

      <Section number="01" title={"Сообщение не вызывает функцию напрямую"}>
        <Lead>
          {"В локальном Planner команда CLI вызывает доступный ей код, а JsonStorage работает с файлом. Отдельный браузер не видит объект PlannerService в памяти другой программы."}
        </Lead>
        <p>
          {"Клиент передаёт request. Сервер принимает его, выбирает внутреннюю работу и отправляет response. Поэтому сервер может заменить файловое хранилище на базу данных, не раскрывая клиенту имя нового класса."}
        </p>
        <CodeBlock
          caption={"Фрагмент вызова и схема HTTP-обмена"}
          code={"локальный вызов (фрагмент):\nservice.add_task(...)\n\nHTTP-обмен (схема):\nбраузер → request → сервер → PlannerService → хранилище\nбраузер ← response ← сервер"}
        />
        <Callout tone="info">
          {"Фрагмент вызова и схема показывают разницу между локальной программой и HTTP. Это иллюстрация, а не готовый код для запуска. HTTP-модель описывает будущую границу приложения и не меняет путь уже сделанного локального Persistent Planner."}
        </Callout>
      </Section>

      <Section number="02" title={"Адрес отвечает на вопрос «куда?»"}>
        <Lead>
          {"Полный URL указывает адрес сервиса и путь к ресурсу. Практика получает только path, поэтому важно не спутать адрес сервера с областью внутри API."}
        </Lead>
        <CodeBlock
          caption={"Из чего состоит пример URL"}
          code={"https://api.example.test:8000/tasks/7\nсхема   host и порт            path"}
        />
        <LinkedNotes items={[
          { title: "Схема", description: "https указывает способ обращения." },
          { title: "Host и порт", description: "Выбирают сервер и его сетевой вход, если порт указан." },
          { title: "Path", description: "/tasks/7 указывает конкретную задачу внутри API, но не путь к файлу на диске." },
        ]} />
        <p>
          {"Например, /tasks обозначает коллекцию, а /tasks/7 отдельную задачу. Это внешний адрес ресурса, а не имя метода PlannerService."}
        </p>
        <CodeBlock
          caption={"Path не раскрывает устройство хранения"}
          code={"/tasks/7     ресурс в API\n./data/tasks.json   возможный внутренний файл"}
        />
      </Section>

      <Section number="03" title={"Method отвечает на вопрос «что сделать?»"}>
        <Lead>
          {"Path указывает область, а method добавляет намерение. Поэтому один путь может принимать разные обращения."}
        </Lead>
        <CodeBlock
          caption={"Один path, два намерения"}
          code={"GET  /tasks   прочитать список\nPOST /tasks   передать данные для обработки"}
        />
        <p>
          {"В Planner API POST /tasks будет создавать задачу. Здесь достаточно понять отличие GET и POST. Остальные методы и их правила разберём позже."}
        </p>
        <p>
          {"В настоящем HTTP имена методов чувствительны к регистру и обычно записываются заглавными: GET, а не get. В упражнении исходная короткая запись приходит строчными буквами, поэтому учебная функция должна привести её к верхнему регистру. Это условие функции, а не автоматическое исправление HTTP."}
        </p>
        <QuizCard
          question="Что различает GET /tasks и POST /tasks?"
          options={[
            "GET и POST обозначают разные серверы",
            "Path одинаков, но намерение клиента различается",
            "POST является частью path",
          ]}
          correctIndex={1}
          explanation="Path выбирает область API. Method сообщает, чего клиент хочет от этой области."
        />
      </Section>

      <Section number="04" title={"Headers описывают сообщение, body содержит данные"}>
        <Lead>
          {"Headers, или заголовки, несут служебные сведения. Body содержит данные операции. Один не заменяет другой."}
        </Lead>
        <MatchPairs
          prompt={"Какая часть сообщения отвечает на каждый вопрос?"}
          leftTitle={"Часть"}
          rightTitle={"Смысл"}
          pairs={[
            { left: "Accept", right: "В каком формате клиент хочет получить ответ?" },
            { left: "Content-Type", right: "В каком формате отправлено тело?" },
            { left: "body", right: "Какие данные операции переданы?" },
          ]}
          explanation={"Accept описывает желаемый ответ, Content-Type описывает отправленное тело, а body содержит сами данные."}
        />
        <p>
          {"Если клиент создаёт задачу, запрос может содержать JSON в body. Пустая строка отделяет заголовки от тела."}
        </p>
        <CodeBlock
          caption={"Данные задачи находятся в body"}
          code={'POST /tasks\nAccept: application/json\nContent-Type: application/json\n\n{"title": "Изучить HTTP", "priority": 4}'}
        />
        <p>
          {"application/json обозначает формат тела, но сам заголовок не преобразует Python-словарь в JSON. Перед отправкой это делает клиентская библиотека."}
        </p>
        <p>
          {"В практике есть также Planner-Client-Version со значением версии клиента. Это пользовательский заголовок для упражнения, не стандарт HTTP и не обязательное поле будущего API."}
        </p>
      </Section>

      <Section number="05" title={"None и пустой body означают разное"}>
        <Lead>
          {"None означает, что тела нет. Пустой словарь означает, что тело присутствует, но пока не содержит полей. Условие API может обрабатывать эти случаи по-разному."}
        </Lead>
        <PredictOutput
          code={'for body in (None, {}, {"title": "Изучить HTTP"}):\n    print(body is not None)'}
          output={"False\nTrue\nTrue"}
          hint="Сравнение с None проверяет отсутствие значения. Пустой словарь при этом остаётся существующим объектом."
        />
        <p>
          {"Python считает пустой словарь ложным в условии if. Но «пусто ли значение?» и «передано ли тело?» это разные вопросы."}
        </p>
        <BugHunt
          code={'body = {}\nif body:\n    print("Тело передано")\nelse:\n    print("Тела нет")'}
          question="Почему этот код неверно определяет отсутствие тела?"
          options={[
            "Пустой словарь нельзя хранить в переменной",
            "Условие проверяет истинность словаря, а не то, равен ли он None",
            "В Python нельзя использовать else после if",
          ]}
          correctIndex={1}
          explanation="Пустой словарь считается ложным, хотя body существует. Отсутствие тела надёжно проверяется явным сравнением с None."
          fix={'if body is not None:\n    print("Тело передано")\nelse:\n    print("Тела нет")'}
        />
        <Callout tone="info">
          {"В контракте практики Content-Type добавляется для любого словаря, включая {}, и отсутствует только при body = None. Исходный словарь body функция не изменяет."}
        </Callout>
      </Section>

      <Section number="06" title={"Учебная модель и сообщение HTTP/1.1"}>
        <Lead>
          {"Смысл частей уже понятен. Теперь посмотрим, как похожие сведения располагаются в читаемом сообщении HTTP/1.1."}
        </Lead>
        <figure className="lesson-infographic">
          <img
            src={requestWireFormatInfographic}
            alt="Схема состава HTTP/1.1: строка запроса, заголовки, пустая строка-разделитель и тело JSON."
            width={1672}
            height={836}
            loading="lazy"
            decoding="async"
          />
          <figcaption>Схема частей сообщения, а не полный запрос для передачи по сети. Host выбирает сервер, path указывает ресурс внутри него, пустая строка отделяет заголовки от body.</figcaption>
        </figure>
        <CodeBlock
          caption={"Сокращённый фрагмент HTTP/1.1"}
          code={'POST /tasks HTTP/1.1\nHost: api.example.test\nAccept: application/json\nContent-Type: application/json\n\n{"title": "Изучить HTTP"}'}
        />
        <p>
          {"Первая строка содержит method, path и версию протокола. Затем идут заголовки; пустая строка отделяет их от body. Host выбирает сервер, а /tasks указывает ресурс на этом сервере. Пример сокращён: для тела HTTP/1.1 дополнительно задаёт его границы, например через Content-Length или Transfer-Encoding: chunked. Эти транспортные детали оформляет клиентская библиотека."}
        </p>
        <p>
          {"Клиентская библиотека в реальном приложении сериализует данные в нужный формат и выполняет сетевой обмен. В упражнении этого нет: функция возвращает обычный Python-словарь. Это описание сообщения, а не сериализованный HTTP-текст. Path хранится отдельно, поэтому полного URL и Host в словаре нет."}
        </p>
        <CodeBlock
          caption={"Четыре поля учебного словаря"}
          code={'{\n    "method": "GET",\n    "path": "/tasks",\n    "headers": {"Accept": "application/json"},\n    "body": None,\n}'}
        />
      </Section>

      <Section number="07" title={"Что будем делать в практике"}>
        <Lead>
          {"В редакторе соберём учебное описание request из готовых значений. Функция не добавляет задачу в Planner и не отправляет сетевой запрос."}
        </Lead>
        <p>
          {"В результат войдут четыре поля: method, path, headers и body. Заголовки Accept и Planner-Client-Version присутствуют всегда. Короткая запись method нормализуется, path и body возвращаются без изменения, исходный словарь body не меняется."}
        </p>
        <p>
          {"Автопроверка рассматривает три ситуации: body отсутствует, body равен пустому словарю и body содержит данные. Только в первом случае не нужен Content-Type. Это центральное различие задания."}
        </p>
        <Callout tone="info">
          {"Перед следующим шагом различаем назначение path, method и заголовков, а также объясняем, почему None не заменяется на {}."}
        </Callout>
        <PracticeCta text={"В редакторе создаём учебную модель HTTP request и запускаем её для трёх случаев: без тела, с пустым JSON и с заполненными данными."} />
      </Section>
    </RichLesson>
  );
}
