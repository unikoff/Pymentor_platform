import { Globe2, Send } from "lucide-react";
import {
  BugHunt,
  Callout,
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
        intro="В занятии 45 мы разобрали method, path и query. Теперь соберём GET в Postman, отправим его серверу Echo и прочитаем ответ. У Planner пока нет HTTP API, поэтому Echo не меняет его задачи."
        tags={[
          { icon: <Send size={14} />, label: "собираем и отправляем GET" },
          { icon: <Globe2 size={14} />, label: "проверяем ответ Echo" },
        ]}
      />

      <Section number="00" title="От договора к настоящему обмену">
        <Lead>
          Вспомним основу. Method говорит, что делает запрос. Path выбирает операцию на сервере. Query передаёт дополнительные значения. Сегодня отправим GET к Echo и проверим его ответ.
        </Lead>
        <p>
          Модель из прошлого занятия описывает запрос, но сама его не отправляет. Теперь добавится новый шаг: Postman передаст GET по сети, а Echo покажет полученные данные. Так мы проверим путь от черновика запроса до ответа.
        </p>
        <LinkedNotes variant="connected" items={[
          { title: "Точка старта", description: "Method и path выбраны, query задаёт параметры чтения." },
          { title: "Новый вопрос", description: "Как отправить GET и увидеть ответ сервера?" },
          { title: "Результат", description: "Сохраним GET в Postman и проверим ответ Echo." },
        ]} />
        <p>
          Сначала разберём роли, затем настроим Postman и отправим запрос. Echo выступает отдельным учебным сервером. Его ответ не меняет задачи Planner. В конце у нас останутся сохранённый GET и Echo environment для занятия 46.1.
        </p>
      </Section>

      <Section number="01" title="Postman отправляет, Echo отвечает">
        <Lead>
          Postman работает как HTTP-клиент: в нём мы заполняем запрос и отправляем его по сети. Echo выступает сервером: он получает запрос и возвращает ответ. Planner в этом обмене не участвует.
        </Lead>
        <p>
          Представим почтовое окно. Мы отдаём письмо и получаем отметку о доставке. Она подтверждает, что письмо дошло до окна, но не доказывает, что другая служба выполнила просьбу. Echo так же показывает, какие данные получил, но не читает задачи и не применяет правила Planner.
        </p>
        <Diagram caption="Запрос к Echo и ответ в Postman">
          <DiagramFlow label="Путь запроса и ответа">
            <DiagramNode title="Postman, отправка" shape="process">
              <p>Собираем GET и query</p>
            </DiagramNode>
            <DiagramArrow label="HTTP request" />
            <DiagramNode title="Echo" shape="process">
              <p>Получает запрос и формирует ответ</p>
            </DiagramNode>
            <DiagramArrow label="HTTP response" />
            <DiagramNode title="Postman, результат" shape="process">
              <p>Показывает status и body</p>
            </DiagramNode>
          </DiagramFlow>
        </Diagram>
        <p>
          На широком экране схема читается слева направо, на узком сверху вниз. Сначала Postman отправляет request в Echo. Затем Echo возвращает response в Postman. Это два момента одного обмена. Planner в нём не участвует.
        </p>
        <MatchPairs
          prompt="Соединим участника с его ролью."
          leftTitle="Участник"
          rightTitle="Роль"
          pairs={[
            { left: "Postman", right: "Собирает и отправляет request" },
            { left: "Echo", right: "Получает request и возвращает response" },
            { left: "Мы", right: "Проверяем ответ" },
          ]}
          explanation="Postman отправляет запрос, Echo отвечает. Чтобы проверить Planner, запрос нужно отправить его собственному API."
        />
        <p>
          API позволяет обращаться к возможностям приложения. Сейчас Postman отправляет запрос в Echo, чтобы проверить его форму. Позже похожий запрос можно будет отправить в собственный API Planner.
        </p>
      </Section>

      <Section number="02" title="До Send мы редактируем запрос">
        <Lead>
          В Postman запрос и ответ показаны в разных областях. Пока мы не нажали Send, сервер ничего не получил. Мы редактируем только черновик.
        </Lead>
        <p>
          В request выберем method и URL. Вкладка Params добавляет query к адресу. Headers содержит заголовки запроса, а Body содержит его данные. В этом GET Body оставляем пустым. После Send в отдельной области response появятся status, заголовки и полученные данные в body.
        </p>
        <p>
          Заголовки есть и у request, и у response. Это заголовки двух разных сообщений. Status относится только к response. Поэтому не ищите его среди полей исходящего GET и не путайте Params запроса с body ответа.
        </p>
        <p>
          Это похоже на бланк до отправки. Пока он у нас, получатель не знает, что в нём написано. После отправки приходит ответ. В Postman request и response тоже остаются разными сообщениями.
        </p>
        <CodeSequence
          title="От черновика к ответу"
          label="ПОСЛЕДОВАТЕЛЬНОСТЬ"
          prompt="Расставим шаги: сначала выберем адрес, затем проверим полученный ответ."
          pieces={[
            { id: "environment", code: "Выбираем Echo и проверяем base_url" },
            { id: "request", code: "Настраиваем GET и Params" },
            { id: "send", code: "Нажимаем Send" },
            { id: "response", code: "Читаем status и body" },
            { id: "conclusion", code: "Сравниваем ответ с ожиданием" },
          ]}
          correctOrder={["environment", "request", "send", "response", "conclusion"]}
          explanation="Сначала выберите Echo и настройте request. После Send прочитайте status и body, затем сравните ответ с ожиданием."
          incorrectExplanation="До Send сервер не видел запрос. Сначала настройте GET, затем нажмите Send и прочитайте response."
        />
        <p>
          Названия вкладок могут немного отличаться в разных версиях Postman. Смотрите, относится ли поле к request или response. Например, Body запроса и body ответа это разные поля.
        </p>
      </Section>

      <Section number="03" title="Адрес ведёт к endpoint Echo">
        <Lead>
          Для первого обращения используем адрес <code>https://postman-echo.com/get</code>. Схема <code>https</code> и host <code>postman-echo.com</code> задают сервер, а path <code>/get</code> указывает его endpoint для получения запроса GET.
        </Lead>
        <p>
          Endpoint означает операцию сервера, которую выбирает пара method и path. GET <code>/get</code> не является локальным файлом или именем Python-функции. Адрес несуществующего Planner API тоже не станет работающим сервером.
        </p>
        <p>
          В environment <code>Echo</code> мы сохраним только базовый адрес <code>https://postman-echo.com</code>. Тогда в запросе останется запись <code>{"{{base_url}}/get"}</code>, а Postman подставит активное значение переменной. Перед отправкой полезно проверить раскрытый URL целиком: так мы убеждаемся, что запрос направлен на Echo, а path не попал внутрь base_url.
        </p>
        <p>
          Схема <code>https</code> задаёт способ обмена, host указывает сервер, а path выбирает операцию. Не добавляйте <code>/get</code> в <code>base_url</code>: иначе он повторится в request.
        </p>
        <QuizCard
          question="В адресе https://postman-echo.com/get что указывает на сервер Echo?"
          options={[
            "Локальный путь /get на компьютере",
            "Схема https и host postman-echo.com, вместе с path endpoint",
            "Имя будущей Python-функции PlannerService",
          ]}
          correctIndex={1}
          explanation="Запрос уходит на host postman-echo.com, а path /get выбирает endpoint этого сервера. Локальный PlannerService здесь не вызывается."
        />
        <p>
          Если адрес не разрешается или соединение не устанавливается, серверный response может не прийти. Это отличается от HTTP-статуса 404: при 404 сервер всё же ответил, а при сбое соединения мы не можем прочитать его status. Сначала выясняем, был ли ответ, и только потом разбираем код.
        </p>
      </Section>

      <Section number="04" title="Params добавляет query к GET">
        <Lead>
          Query передаёт небольшие настройки вместе с URL. Во вкладке Params мы вводим пары имя и значение, а Postman показывает их в адресе после <code>?</code>; несколько пар разделяются знаком <code>&amp;</code>.
        </Lead>
        <p>
          До нашей практики посмотрим на другой набор: <code>city=Kazan</code> и <code>days=2</code>. Адрес GET может передать эти значения как query, а Echo вернёт их в поле <code>args</code>. На URL они выглядят как текст. Ответ не доказывает, что Echo знает, сколько дней длится поездка или что нужно сделать с городом.
        </p>
        <CodeBlock
          caption="Учебный пример: Echo отражает query в args"
          code={'GET https://postman-echo.com/get?city=Kazan&days=2\n\nОжидаемый фрагмент response body:\n{\n  "args": {\n    "city": "Kazan",\n    "days": "2"\n  }\n}'}
        />
        <p>
          В этом примере <code>"2"</code> в ответе является строкой, потому что query передаётся в URL как текст. Имя <code>days</code> само по себе не придаёт значению числовой тип. Позже другой сервер может разобрать строку и проверить её по своим правилам, но Echo лишь показывает полученную пару.
        </p>
        <p>
          В нашем GET мы используем <code>is_done=false</code> и <code>limit=2</code>. Эти названия напоминают будущие настройки списка Planner, но в Echo это просто имена query-параметров. Сервер Planner ещё не получает запрос, поэтому список задач не фильтруется и не ограничивается.
        </p>
        <QuizCard
          question={'Echo вернул в args значения is_done="false" и limit="2". Что мы узнали?'}
          options={[
            "Echo получил и отразил две текстовые query-пары",
            "Planner нашёл открытые задачи и оставил только две",
            "Echo преобразовал значения в bool и int",
          ]}
          correctIndex={0}
          explanation="Поле args показывает, какие текстовые значения Echo получил в query. Оно не говорит о фильтрации данных Planner и не подтверждает преобразование типов."
        />
        <p>
          Поэтому мы сравниваем не только имена параметров, но и их фактическое представление. Если пара отсутствует в args, проверяем Params и адрес; если она есть как строка, делаем только вывод о передаче этой строки.
        </p>
        <p>
          Query передаёт короткие значения для чтения, например фильтр или лимит. В этом занятии мы сохраняем две пары и проверяем их в ответе Echo; создание и изменение данных разберём позже.
        </p>
      </Section>

      <Section number="05" title="Ответ подтверждает только то, что мы проверили">
        <Lead>
          После отправки GET сначала убеждаемся, что HTTP-ответ вообще получен. Затем проверяем status, при необходимости headers, и нужные значения в body. Каждый признак отвечает на свой вопрос.
        </Lead>
        <p>
          Для обычного запроса к Echo ожидаем status <code>200</code> и JSON в body. Поле <code>args</code> должно содержать query, которую мы отправили. Status 200 сообщает, что Echo ответил успешно; наличие нужных пар проверяется отдельно в <code>args</code>. Одного зелёного индикатора недостаточно, если нас интересует конкретное значение.
        </p>
        <p>
          Заголовки ответа могут указать формат содержимого. В нашем примере body читается как JSON, но это не значит, что JSON уже записан в файл Planner. Response принадлежит серверу из URL. Чтобы доказать изменение приложения, нужно обращаться к его собственному API и проверять его результат.
        </p>
        <BugHunt
          code="GET https://postman-echo.invalid/get"
          question="Postman сообщает, что не может разрешить host. Какой вывод здесь точный?"
          options={[
            "Echo вернул HTTP 404, но Postman скрыл body",
            "HTTP response мог не прийти, поэтому status пока нет",
            "Planner отверг query и не сохранил задачу",
          ]}
          correctIndex={1}
          explanation="Ошибка разрешения host возникает до чтения HTTP-ответа. Без response у нас нет серверного status, а Planner в этом обращении не участвовал."
          fix="Проверим написание host, активное окружение и раскрытое значение base_url, затем повторим GET к Echo."
        />
        <p>
          При status 404 сервер ответил, и его body доступно. При ошибке соединения ответа может не быть, поэтому status 404 или 500 указывать нельзя.
        </p>
      </Section>

      <Section number="06" title="Сохраняем запрос и адрес отдельно">
        <Lead>
          Collection хранит сохранённые HTTP-запросы, а environment хранит значения, которые зависят от выбранной цели. Для этого занятия запрос останется в <code>Planner HTTP Lab</code>, а базовый адрес Echo будет в environment <code>Echo</code>.
        </Lead>
        <p>
          Представим папку с карточками рецептов и отдельную наклейку с адресом кухни. В карточке остаётся способ приготовить блюдо, а адресная наклейка помогает выбрать место, куда отправить заказ. В Postman collection сохраняет method, URL-шаблон и Params, а environment задаёт значение <code>base_url</code>. Такая аналогия не означает, что collection хранит задачи или environment запускает сервер.
        </p>
        <p>
          Workspace в Postman содержит collections и environments. Откройте текущий workspace, найдите <code>Planner HTTP Lab</code> и выберите <code>Echo</code>. Откройте GET из collection или создайте его там. <code>Send</code> отправляет текущий запрос, а <code>Save</code> сохраняет его в collection. После добавления Params сохраните GET и снова откройте его из collection, чтобы проверить сохранённую версию.
        </p>
        <p>
          В environment <code>Echo</code> значение <code>base_url</code> равно <code>https://postman-echo.com</code>, без <code>/get</code> и query. Полный request строится как <code>{"{{base_url}}/get"}</code>. Если мы сменим активное environment, Postman может подставить другой адрес, но это не меняет смысл сохранённого GET. Поэтому перед Send сверяем активную цель.
        </p>
        <p>
          Если <code>Planner HTTP Lab</code> и <code>Echo</code> уже существуют, используем их и проверяем настройки. Не создаём второй набор ресурсов и не удаляем сохранённый POST, если он остался после прежней версии занятия. Если ресурсов ещё нет, создаём только недостающие в текущем workspace. Для сохранения может понадобиться доступ к workspace; отправка запроса и сохранение collection являются разными возможностями интерфейса.
        </p>
        <p>
          Экспортировать collection и environment сейчас не требуется. Сначала убедимся, что GET повторяется из сохранённой collection. В следующем подзанятии к той же collection добавим POST с JSON, затем отдельно проверим экспорт и импорт обоих ресурсов.
        </p>
        <Callout tone="info">
          Если Postman просит войти, используем уже доступную учётную запись или отмечаем, что сохранение заблокировано. Новый аккаунт и платные возможности не являются частью этой практики.
        </Callout>
      </Section>

      <Section number="07" title="Что мы будем делать в практике">
        <Lead>
          Теперь мы используем модель запроса как рабочую проверку: адрес и метод уже определены, а результат доказывает только то, что Echo действительно получил.
        </Lead>
        <LinkedNotes variant="connected" items={[
          { title: "Подготовим контекст", description: "Проверим существующие Planner HTTP Lab и Echo, активный base_url и не будем создавать дубликаты." },
          { title: "Отправим GET", description: "Сначала проверим /get без query, затем добавим is_done=false и limit=2 через Params." },
          { title: "Сохраним наблюдение", description: "Откроем GET из collection и сверим status 200 и строковые значения в args." },
        ]} />
        <p>
          Проверим ресурсы Postman и раскрытый URL, отправим GET без query, затем добавим две пары, сохраним запрос и повторим его. Если соединение не установлено, отметим это как сетевой сбой: HTTP status ещё нет.
        </p>
        <p>
          На выходе у нас будет сохранённый GET и выбранный Echo environment. Этот результат станет входом занятия 46.1: мы добавим к тому же набору POST с JSON и проверим восстановление после экспорта и импорта. В занятии 46 мы не отправляем JSON, не экспортируем файлы и не меняем Planner.
        </p>
        <PracticeCta text="Проверим GET к Echo с query, сохраним его в Planner HTTP Lab и сверим фактический ответ." />
      </Section>
    </RichLesson>
  );
}
