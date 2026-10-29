import {
  BugHunt,
  Callout,
  CodeBlock,
  CodeSequence,
  CompareSolutions,
  Diagram,
  DiagramExchange,
  DiagramFlow,
  DiagramNode,
  Lead,
  LinkedNotes,
  MatchPairs,
  PracticeCta,
  RichHero,
  RichLesson,
  Section,
  TrueFalse,
} from "../../shared";

export function Lesson46_1({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        chip={module ?? "Глава 3 · Блок 10 · HTTP к Planner"}
        title={"JSON-запросы и коллекция"}
        intro={
          "Планируемая опора из работы с GET к Echo , сохранённый GET к Echo. Сначала проверим её, затем добавим POST с JSON и восстановим оба запроса из экспортов."
        }
      />

      <Section number="00" title={"От сохранённого GET к JSON-запросу"}>
        <Lead>
          {
            "План работы с GET к Echo предполагает GET с query и Echo environment с базовым адресом. Фактическую готовность проверим в начале практики; если запрос или окружение отсутствуют, сначала восстановим их по работе с GET к Echo. Затем добавим POST в ту же collection и проверим оба запроса после импорта."
          }
        </Lead>
        <LinkedNotes
          variant="connected"
          items={[
            {
              title: "Точка старта",
              description:
                "По плану здесь должны быть GET с query и Echo environment; их наличие ещё нужно проверить.",
            },
            {
              title: "Новый вопрос",
              description:
                "Как передать JSON в body и сохранить запрос для повторного запуска?",
            },
            {
              title: "Результат",
              description:
                "GET и POST восстановлены из collection; адрес Echo восстановлен из отдельного environment.",
            },
          ]}
        />
        <p>
          {
            "Планируемая A, навыки работы с HTTP и JSON, а также ресурсы Postman из работы с GET к Echo. План не доказывает, что конкретный ученик уже выполнил эту практику. Перед новым шагом проверим GET и Echo; недостающую опору восстановим по материалу о GET к Echo, не создавая лишних копий."
          }
        </p>
      </Section>

      <Section number="01" title={"Query и body занимают разные места"}>
        <Lead>
          {
            "По плану в GET из работы с GET к Echo параметры is_done и limit передавались в query, то есть в URL. Здесь мы проверим их в сохранённом запросе, а в POST отправим объект в отдельной части запроса , body."
          }
        </Lead>
        <p>
          {
            "Query , пары параметров в URL после знака ?. В GET они задают, например, условия чтения. Body , отдельная часть запроса с его содержимым. Для наших запросов Echo отражает query GET в response.args, а JSON из body POST , в response.json. Это разные части запроса и ответа."
          }
        </p>
        <p>
          {
            "Представим посылку: query похожа на подпись с условиями доставки, а body , на содержимое внутри. Это помогает различить места данных, но их смысл задаёт endpoint. Здесь GET и POST отправляются в Echo: мы проверяем форму сообщения, а не фильтруем Planner и не создаём Task."
          }
        </p>


        <MatchPairs
          prompt={"Сопоставим часть сообщения с тем, что в ней находим."}
          leftTitle={"Место в обмене"}
          rightTitle={"Что оно показывает"}
          pairs={[
            { left: "Params у GET", right: "query-пары исходящего URL" },
            { left: "Body у POST", right: "JSON-объект исходящего request" },
            { left: "response.args", right: "query, полученная Echo" },
            { left: "response.json", right: "JSON, распознанный Echo в body" },
          ]}
          explanation={
            "Сначала называем сообщение и его направление. Тогда вкладка Params не смешивается с body запроса или ответа."
          }
        />
      </Section>

      <Section number="02" title={"POST отправляет JSON в body"}>
        <Lead>
          {
            "Отправим объект на endpoint Echo /post методом POST. Получатель может обработать данные по-разному; название метода само по себе не означает сохранение."
          }
        </Lead>
        <p>
          {
            "В Postman откроем Body → raw и выберем JSON. Raw позволяет ввести тело целиком, JSON задаёт правила записи: фигурные скобки охватывают объект, двоеточие связывает ключ со значением, запятая разделяет пары."
          }
        </p>
        <CodeBlock
          caption={"Пример JSON для независимого опыта"}
          code={'{\n  "topic": "HTTP",\n  "minutes": 20\n}'}
        />
        <p>
          {
            "Здесь topic , строка, minutes , число. Запись \"minutes\": \"20\" остаётся допустимым JSON, но тип меняется на строку. JSON похож на словарь тем, что связывает имена со значениями, однако это формат текста, а не код Python: ключи и строки пишутся в двойных кавычках. Echo может отразить оба типа и не проверяет будущие правила Planner. Перед отправкой сверим синтаксис и тип каждого значения."
          }
        </p>


        <BugHunt
          code={'{\n  "topic": "HTTP",\n  "minutes": "20"\n}'}
          question={
            "В примере минуты передаются числом. Какое отличие нужно заметить в этой записи?"
          }
          options={[
            "JSON всегда запрещает число в кавычках",
            "minutes стало строкой, хотя ожидалось число",
            "POST нельзя отправлять через Echo",
          ]}
          correctIndex={1}
          explanation={
            "Запись является допустимым JSON, но тип minutes отличается от ожидаемого. Echo может отразить строку, поэтому ответ не заменяет проверку договора."
          }
          fix={'"minutes": 20'}
        />
        <p>
          {
            "В практике сами составим другой объект с title-строкой и числовым priority. Echo его отразит, но не проверит правила будущего Planner API."
          }
        </p>
      </Section>

      <Section number="03" title={"Content-Type описывает отправляемое тело"}>
        <Lead>
          {
            "Когда body содержит JSON, заголовок Content-Type сообщает получателю формат отправленного содержимого."
          }
        </Lead>
        <p>
          {
            "Выбор raw задаёт способ ввода, а JSON , формат тела. Этот выбор не исправляет синтаксическую ошибку, поэтому перед Send проверим и объект, и заголовок запроса."
          }
        </p>
        <p>
          {
            "Content-Type: application/json сообщает получателю формат исходящего body. Postman обычно добавляет его при выборе JSON; второй одинаковый заголовок вручную не создаём. Request headers описывают отправленный запрос, response headers , полученный ответ."
          }
        </p>

        <Diagram
          caption={"POST с JSON и отдельный HTTP-ответ"}
          className="lesson46-1-exchange"
        >
          <DiagramFlow label={"Передача POST и возврат ответа Echo"}>
            <DiagramNode title={"Postman"} shape="process">
              <p>POST /post</p>
              <p>Content-Type: application/json</p>
              <p>JSON в body</p>
            </DiagramNode>
            <DiagramExchange
              forward={"Request с JSON отправляется в Echo"}
              reverse={"Response возвращается в Postman"}
            />
            <DiagramNode title={"Postman Echo"}>
              <p>Получает request</p>
              <p>Отражает JSON в response.json</p>
            </DiagramNode>
          </DiagramFlow>
        </Diagram>
        <p>
          {
            "Читаем схему слева направо: Postman отправляет POST с JSON-body, Echo получает сообщение и возвращает отдельный response. Нижняя встречная линия показывает ответный путь, а не продолжение исходящего body. На узком экране участники встанут друг под другом, сохраняя направление обеих линий."
          }
        </p>
        <TrueFalse
          statement={
            <>Content-Type запроса описывает формат body ответа Echo.</>
          }
          isTrue={false}
          explanation={
            "Заголовок исходящего request относится к отправленному body. Формат ответа описывают уже headers ответа."
          }
        />
        <p>
          {
            "В нашей практике проверим, что выбран JSON и в request есть один Content-Type: application/json. Сам статус ответа не объясняет, правильно ли интерпретированы отдельные поля. Заголовок сообщает формат тела, а не перечисляет его значения. Ответ Echo мы читаем отдельно: проверяем status, response headers и поля body, которые относятся к нашему запросу."
          }
        </p>
      </Section>

      <Section number="04" title={"Проверяем то, что вернул Echo"}>
        <Lead>
          {
            "После Send сначала убеждаемся, что получили HTTP-ответ. Затем отдельно сверяем status, headers и нужные поля body."
          }
        </Lead>
        <p>
          {
            "После Send проверим, что получили HTTP-ответ, затем сравним status и нужные поля. У Echo query GET видна в response.args как строки, а JSON POST , в response.json. Это подтверждает получение запроса Echo, но не работу Planner, создание Task или запись файла."
          }
        </p>
        <p>
          {
            "Сверим имя, значение и тип поля с отправленным объектом. Если POST-ответ не совпал, проверим метод, адрес, Body и Content-Type; если параметры GET не появились в args, проверим Params и итоговый URL. При ошибке DNS или соединения HTTP-ответа и status нет. Сначала проверим, раскрывается ли base_url в адрес Echo и выбрано ли нужное окружение. Если соединение установлено, но ответ отличается, вернёмся к параметрам конкретного запроса."
          }
        </p>
        <CompareSolutions
          question={"Какой вывод следует из ответа Echo со status 200?"}
          left={{
            title: "Подтверждено",
            code: "Echo получил POST и вернул response",
            note: "В body видны отражённые поля JSON.",
          }}
          right={{
            title: "Не подтверждено",
            code: "Planner создал и сохранил Task",
            note: "Запрос был отправлен на адрес Echo.",
          }}
          preferred={"left"}
          explanation={
            "Мы связываем вывод с тем host, который получил request. Для проверки Planner понадобится его собственный сервер и маршрут."
          }
        />
        <Callout tone="info">
          <strong>Если ответа нет.</strong>
          {
            " Сообщение о проблеме DNS или соединения не содержит HTTP-status. Сначала проверим сеть и раскрытый base_url. Нельзя записывать status 404 или 500, если сервер не вернул response."
          }
        </Callout>
      </Section>

      <Section number="05" title={"Collection хранит запросы, environment хранит адрес"}>
        <Lead>
          {
            "Новый POST сохраняем в уже созданную Planner HTTP Lab. Echo environment оставляем отдельным местом для базового адреса."
          }
        </Lead>
        <p>
          {
            "Collection хранит запросы и их настройки, а environment , заменяемые значения. Представим папку с рецептами и отдельный лист с адресом лаборатории: первая хранит сценарии, второй , базовый адрес. Он не запускает сервер, а collection не хранит ответы."
          }
        </p>

        <p>
          {
            "Сохраним один POST рядом с GET; готовый запрос сверим и обновим на месте, без дубля. Отдельно экспортируем collection и Echo environment по указанным путям, используя подходящие файлы повторно и не включая секреты."
          }
        </p>

        <CodeSequence
          title={"Порядок проверки переноса"}
          prompt={
            "Соберём маршрут от сохранённого POST к повторной проверке запросов."
          }
          pieces={[
            { id: "save", code: "проверяем или сохраняем один POST рядом с GET" },
            { id: "collection", code: "проверяем или экспортируем collection" },
            { id: "environment", code: "проверяем или экспортируем Echo environment" },
            { id: "import", code: "находим подходящую копию или импортируем файлы" },
            { id: "select", code: "выбираем Echo environment этой копии" },
            { id: "send", code: "повторно отправляем GET и POST" },
          ]}
          correctOrder={[
            "save",
            "collection",
            "environment",
            "import",
            "select",
            "send",
          ]}
          explanation={
            "Сначала сверяем существующие ресурсы, чтобы не создавать дубли. Если подходящей копии в Postman нет, импортируем оба файла как копии. Затем выбираем её Echo environment и запускаем GET и POST."
          }
          incorrectExplanation={
            "Сначала проверим или сохраним POST рядом с GET, затем сверим два экспорта. После этого найдём их копию или импортируем файлы, выберем Echo и повторим оба запроса."
          }
        />
        <p>
          {
            "Collection и environment , разные файлы, потому что сохраняют разные данные. При совпадении имён импортируем как копию с различимым названием, чтобы сохранить исходники. После импорта выберем Echo, проверим раскрытый base_url и только затем отправим оба запроса."
          }
        </p>
        <p>
          {
            "Успешный повторный запуск из импортированных ресурсов подтверждает восстановление сценариев. Одного открытия JSON-файлов недостаточно: GET должен вернуть пары в args, а POST , объект в json."
          }
        </p>
      </Section>

      <Section number="06" title={"Что мы будем делать в практике"}>
        <Lead>
          {
            "Практика повторяет путь из теории: проверим GET, подготовим POST, сверим два файла и повторим оба запроса."
          }
        </Lead>
        <LinkedNotes
          variant="connected"
          items={[
            {
              title: "Проверим GET",
              description:
                "Повторим GET и найдём is_done и limit как строки в response.args.",
            },
            {
              title: "Сохраним POST",
              description:
                "Составим POST body: title , строка, priority , число; проверим Content-Type.",
            },
            {
              title: "Сверим файлы",
              description:
                "Экспортируем collection и Echo environment в два отдельных файла проекта.",
            },
            {
              title: "Повторим оба запроса",
              description:
                "Импортируем копии, выберем Echo и повторим GET и POST с проверкой args и json.",
            },
          ]}
        />
        <p>
          {
            "Сначала используем проверенный GET из работы с GET к Echo, затем собираем и сохраняем POST, экспортируем оба ресурса и проверяем именно импортированные копии. Существующие подходящие файлы и запросы повторно используем."
          }
        </p>
        <p>
          {
            "При создании GET /health мы создадим FastAPI-приложение в том же Planner. Echo останется отдельной учебной целью. Collection Planner API и Local environment появятся при проверке Swagger и запуска, поэтому сейчас не перенаправляем Echo-запросы и не называем их проверкой собственного API."
          }
        </p>
        <PracticeCta
          text={
            "Проверим GET из работы с GET к Echo, сохраним один POST с JSON, сверим два файла и повторим оба запроса в Echo."
          }
        />
      </Section>
    </RichLesson>
  );
}
