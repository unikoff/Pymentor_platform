import { Globe2, Send } from "lucide-react";
import {
  BugHunt,
  CodeBlock,
  CodeSequence,
  Diagram,
  DiagramArrow,
  DiagramFlow,
  DiagramNode,
  Lead,
  LinkedNotes,
  MatchPairs,
  PracticeCta,
  QuizCard,
  RichHero,
  RichLesson,
  Section,
} from "../../shared";

export function Lesson46({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        chip={module ?? "Глава 3 · Блок 10 · HTTP к Planner"}
        title="Первый запрос в Postman"
        intro="Соберём GET в Postman, отправим его учебному серверу Echo и проверим по ответу, какие query-пары дошли. Echo не обращается к задачам Planner."
        tags={[
          { icon: <Send size={14} />, label: "отправляем GET" },
          { icon: <Globe2 size={14} />, label: "проверяем ответ Echo" },
        ]}
      />

      <Section number="00" title="От схемы запроса к настоящему обмену">
        <Lead>
          Перед стартом разберём новый пример: в <code>GET /books?limit=3</code> method: <code>GET</code>, path: <code>/books</code>, query: <code>limit=3</code>; request body здесь не задан. До отправки нельзя знать status и body ответа.
        </Lead>
        <p>
          Теперь добавится реальный обмен по сети. Postman: HTTP-клиент: в нём мы собираем и отправляем запрос. Echo: отдельный учебный сервер, который получает запрос и возвращает ответ с информацией о нём. Схема проста: Postman отправляет request → Echo формирует response → Postman показывает его нам. Planner в этой цепочке не участвует.
        </p>
        <p>
          Поэтому ответ Echo подтверждает только то, что получил Echo. Даже если query называется <code>is_done</code> или <code>limit</code>, Echo не фильтрует задачи и не ограничивает список. Позже похожие параметры можно будет отправить собственному API Planner, но сегодня мы проверяем саму передачу запроса.
        </p>
        <Diagram caption="Два направления одного HTTP-обмена">
          <DiagramFlow label="Request и response">
            <DiagramNode title="Postman" shape="process"><p>Собирает и отправляет request</p></DiagramNode>
            <DiagramArrow label="HTTP request" />
            <DiagramNode title="Echo" shape="process"><p>Получает запрос и готовит response</p></DiagramNode>
            <DiagramArrow label="HTTP response" />
            <DiagramNode title="Postman" shape="process"><p>Показывает status и body</p></DiagramNode>
          </DiagramFlow>
        </Diagram>
        <MatchPairs
          prompt="Соединим участника с его ролью."
          leftTitle="Участник"
          rightTitle="Роль"
          pairs={[
            { left: "Postman", right: "Собирает и отправляет request" },
            { left: "Echo", right: "Получает request и возвращает response" },
            { left: "Мы", right: "Сверяем ответ с ожиданием" },
          ]}
          explanation="Нажатие Send начинает сетевой обмен. До него мы меняем только черновик запроса."
        />
      </Section>

      <Section number="01" title="Подготовим адрес Echo">
        <Lead>
          В Postman сначала выберем сервер, которому отправим запрос. Environment хранит значения для адреса, а не запускает сервер.
        </Lead>
        <p>
          Создадим или найдём environment <code>Echo</code> и зададим переменную <code>base_url</code> со значением <code>https://postman-echo.com</code>. Затем выберем Echo активным. В запросе укажем <code>{"{{base_url}}/get"}</code>: Postman подставит значение переменной, и полный адрес станет <code>https://postman-echo.com/get</code>.
        </p>
        <p>
          Проверьте именно раскрытый URL. Если выбрано другое окружение, переменная пуста или в <code>base_url</code> уже добавлен <code>/get</code>, запрос уйдёт не туда или получит неверный адрес. Имя Echo само по себе ничего не гарантирует: важны активное окружение и его значение. Если подходящее окружение уже настроено, используйте его, не создавая дубликат.
        </p>
        <CodeBlock
          caption="Как Postman подставляет base_url"
          code={'Echo.base_url = https://postman-echo.com\nRequest URL = {{base_url}}/get\nИтоговый URL = https://postman-echo.com/get'}
        />
        <p>
          В адресе схема <code>https</code> задаёт защищённый способ обмена, host <code>postman-echo.com</code> указывает сервер, а path <code>/get</code> выбирает его endpoint. Endpoint: доступная операция сервера; это не локальный файл и не имя функции Python. Для сравнения, в <code>https://example.org/catalog</code> сервер задаёт host, а <code>/catalog</code>: path.
        </p>
        <QuizCard
          question="Что нужно проверить, если в URL остался текст {{base_url}}?"
          options={["Активное окружение и значение переменной", "Тело ответа Planner", "Настройки локального Python"]}
          correctIndex={0}
          explanation="Postman подставляет переменную из выбранного environment. Пока она не разрешилась, адрес не готов к отправке."
        />
      </Section>

      <Section number="02" title="Соберём и отправим первый GET">
        <Lead>
          До Send мы редактируем request; после Send читаем отдельный response. Поля с одинаковыми названиями могут относиться к разным сообщениям.
        </Lead>
        <p>
          Выберите method <code>GET</code> и URL <code>{"{{base_url}}/get"}</code>. Во вкладке Params пока ничего не добавляйте. Вкладки Headers и Body относятся к исходящему request; в этом GET body оставляем пустым. После отправки Postman покажет ответ отдельно: status, response headers и response body. Пустое тело запроса не мешает серверу вернуть непустое тело ответа.
        </p>
        <p>
          Сначала предскажите, что будет в <code>args</code>, если query отсутствует, затем нажмите Send. При доступном Echo обычно приходит status <code>200</code>, а <code>args</code> пуст. Прочитайте фактический status и body, не подменяйте наблюдение ожиданием: успешная отправка определяется ответом, который вы действительно получили.
        </p>
        <CodeSequence
          title="От черновика к проверенному ответу"
          label="ПОСЛЕДОВАТЕЛЬНОСТЬ"
          prompt="Расставим действия в порядке выполнения."
          pieces={[
            { id: "env", code: "Выбираем Echo и проверяем base_url" },
            { id: "request", code: "Настраиваем GET и Params" },
            { id: "send", code: "Нажимаем Send" },
            { id: "response", code: "Читаем status и body" },
            { id: "check", code: "Сверяем результат с прогнозом" },
          ]}
          correctOrder={["env", "request", "send", "response", "check"]}
          explanation="Адрес и запрос нужно подготовить до отправки; ответ появляется только после сетевого обмена."
          incorrectExplanation="Сначала проверьте цель и запрос. До Send сервер не получил ваш черновик."
        />
        <p>
          Если видите HTTP <code>404</code>, сервер ответил, но сообщил, что выбранный ресурс не найден. Если Postman сообщает о DNS или connection error, HTTP-ответ мог не прийти вообще. В таком случае status неизвестен: проверьте активное окружение, раскрытый URL и соединение. Не называйте сетевой сбой ответом 404.
        </p>
      </Section>

      <Section number="03" title="Добавим query и прочитаем args">
        <Lead>
          Query: пары имени и значения в URL. Postman строит их во вкладке Params: после первой пары ставится <code>?</code>, следующие отделяются <code>&amp;</code>.
        </Lead>
        <p>
          Для отдельного примера представьте <code>size=4&amp;color=red</code>. До отправки предскажите две записи в ответе Echo. В URL значения query передаются как текст, поэтому Echo отразит <code>"4"</code>, а не число <code>4</code>. Само имя <code>size</code> не задаёт тип и не объясняет серверу, как использовать значение.
        </p>
        <CodeBlock
          caption="Echo отражает query в args"
          code={'GET https://postman-echo.com/get?size=4&color=red\n\nresponse body:\n{\n  "args": {\n    "size": "4",\n    "color": "red"\n  }\n}'}
        />
        <p>
          Теперь в Params добавьте две строки: <code>is_done</code> = <code>false</code> и <code>limit</code> = <code>2</code>. До Send проверьте, что обе строки включены, и предскажите значения в <code>args</code>. После отправки найдите их именно в response body. Ожидаются строки <code>"false"</code> и <code>"2"</code>: Echo отражает текст запроса, а не преобразует его в boolean и integer.
        </p>
        <p>
          Status <code>200</code> без нужного <code>args.limit</code> не подтверждает цель упражнения. Сверьте итоговый URL, таблицу Params и ответ. Если обе пары на месте, вы доказали, что они дошли до Echo; это всё ещё ничего не говорит о списке задач Planner.
        </p>
        <QuizCard
          question={'Echo вернул args: { is_done: "false", limit: "2" }. Какой вывод точен?'}
          options={[
            "Echo получил и отразил две текстовые query-пары",
            "Planner отобрал две незавершённые задачи",
            "Echo преобразовал значения в bool и int",
          ]}
          correctIndex={0}
          explanation="Ответ подтверждает передачу строк Echo. Фильтрация и преобразование типов относятся к логике другого сервера."
        />
      </Section>

      <Section number="04" title="Проверим ошибочный маршрут">
        <Lead>
          Проверка состоит из отдельных вопросов: пришёл ли HTTP-ответ, какой у него status и содержит ли body ожидаемые query.
        </Lead>
        <p>
          При ошибке соединения HTTP-status может отсутствовать. При <code>404</code> response есть, но результат неуспешен. При <code>200</code> сервер ответил успешно, однако нужные параметры всё равно надо найти в <code>args</code>. Эти наблюдения нельзя заменять одним зелёным индикатором.
        </p>
        <BugHunt
          code="GET https://postman-echo.invalid/get"
          question="Postman не может разрешить host. Что можно заключить?"
          options={[
            "Echo вернул HTTP 404",
            "HTTP response мог не прийти, поэтому status пока неизвестен",
            "Planner отклонил query",
          ]}
          correctIndex={1}
          explanation="Ошибка разрешения имени возникает до чтения HTTP-ответа. В этом запросе Planner не участвовал."
          fix="Проверьте активное окружение, значение base_url и итоговый адрес перед повторной отправкой."
        />
        <p>
          Если ответ получен, но одна пара отсутствует, вернитесь к Params и проверьте включённость строки и итоговый URL. Если ответа нет, сначала проверьте адрес и соединение. Так причина ошибки ведёт к конкретному месту проверки, а не к случайному изменению запроса.
        </p>
      </Section>

      <Section number="05" title="Перенесём способ проверки и сохраним GET">
        <Lead>
          Изменим одно значение, заранее предскажем ответ и проверим его. Такой перенос показывает, что мы понимаем связь между Params и args.
        </Lead>
        <p>
          В том же GET замените только <code>limit=2</code> на <code>limit=5</code>. Не отправляя запрос, скажите, что должно измениться в Echo. Затем нажмите Send и проверьте: <code>args.is_done</code> остаётся строкой <code>"false"</code>, а <code>args.limit</code> становится строкой <code>"5"</code>. Верните <code>limit=2</code>, отправьте ещё раз и убедитесь, что исходный результат восстановился.
        </p>
        <p>
          Если ответ всё ещё показывает <code>"2"</code>, проверьте, изменили ли Params и отправили ли текущую версию запроса. Один только отредактированный черновик не меняет уже полученный response. Когда workspace доступен, сохраните рабочий GET в collection <code>Planner HTTP Lab</code> и проверьте повторное открытие. Подробное сохранение, экспорт и импорт относятся к настройке коллекции и экспорту Postman.
        </p>
        <LinkedNotes variant="connected" items={[
          { title: "Подготовить цель", description: "Выбрать Echo, проверить base_url и итоговый URL." },
          { title: "Отправить и сверить", description: "Добавить две query-пары и найти их строками в args." },
          { title: "Проверить перенос", description: "Предсказать limit=5, отправить, затем вернуть limit=2." },
        ]} />
        <p>
          Результат занятия: отправленный GET к Echo и проверенные значения ответа. Мы не отправляли JSON-body или POST, не запускали FastAPI и не меняли файлы или задачи Planner. Echo environment и, если удалось сохранить, GET можно использовать как исходную точку следующего занятия.
        </p>
        <PracticeCta text="Отправьте GET к Echo, проверьте обе query-пары и самостоятельно перенесите проверку на limit=5." />
      </Section>
    </RichLesson>
  );
}
