import { CheckCircle2, FileText } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, KeyTakeaways, Lead, LinkedNotes, PracticeCta, PredictOutput, RecallCard, RichHero, RichLesson, Section, TrueFalse } from "../../shared";
import responseEnvelopeInfographic from "./images/lesson-47-response-envelope.svg";
import clientResponseFlowInfographic from "./images/lesson-47-client-response-flow.svg";

export function Lesson47({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        chip={module ?? "Месяц 3 · Блок 9 · Интернет и HTTP"}
        title={"47. HTTP response: status, headers, body и Content-Type"}
        intro={"В прошлом занятии мы собрали request. Теперь разберём ответ сервера: как status сообщает исход, headers описывают сообщение, а body передаёт результат или понятную ошибку."}
        tags={[
          { icon: <CheckCircle2 size={14} />, label: "структура response" },
          { icon: <FileText size={14} />, label: "status · headers · body" },
        ]}
      />
      <Section number="00" title={"От request к результату"}>
        <Lead>
          {"В прошлом занятии клиент собрал request и передал его серверу. Теперь проследим обратный путь: сервер обработал просьбу и возвращает отдельный response. По нему клиент узнаёт фактический результат, а не угадывает его по отправленному запросу."}
        </Lead>

        <CodeBlock
          caption={"Два исхода обращения к задаче"}
          code={"GET /tasks/8\nклиент → сервер → поиск задачи\nсервер → 200 OK + данные задачи\n\nGET /tasks/999\nклиент → сервер → поиск задачи\nсервер → 404 Not Found + описание ошибки"}
        />

        <Callout tone="info">
          {"Response похож на квитанцию после заказа: в ней есть краткий итог, служебные отметки и содержимое, если оно нужно. Для программы такой формат заменяет угадывание результата по случайной фразе."}
        </Callout>

      </Section>

      <Section number="01" title={"Response не равен print"}>
        <Lead>
          {"Локальный CLI может напечатать Task created. Человеку этого иногда достаточно. Другому клиенту нужны отдельные данные, чтобы обновить экран, сохранить id или показать ошибку."}
        </Lead>

        <CodeBlock
          caption={"локальный вывод"}
          code={"Task created\nTask not found"}
        />

        <CodeBlock
          caption={"структурированный ответ"}
          code={"status: 201\nbody: созданная задача\n\nstatus: 404\nbody: описание ошибки"}
        />

        <CodeBlock
          caption={"return внутри одной программы"}
          code={'result = calculate_total([10, 5])\n# result доступен вызывающему коду в этом процессе'}
        />

        <p>
          {"Обычный return передаёт значение другому коду в той же программе. HTTP-клиент может работать в отдельном процессе, поэтому он получает сообщение с status, headers и body, а не общую переменную Python."}
        </p>

        <LinkedNotes items={[
          { title: "Status", description: "Числовой код сообщает общий и точный исход операции." },
          { title: "Headers", description: "Служебные поля описывают ответ, например формат его содержимого." },
          { title: "Body", description: "В теле находятся данные результата или подробности ожидаемой ошибки." },
        ]} />

      </Section>

      <Section number="02" title={"Status сообщает исход"}>
        <Lead>
          {"Status code помогает клиенту быстро выбрать ветку поведения. Первая цифра задаёт общую категорию, а всё число уточняет конкретную ситуацию."}
        </Lead>

        <LinkedNotes items={[
          { title: "1xx", description: "Информационный ответ о ходе обмена. Для этой темы достаточно знать класс, отдельные коды запоминать не нужно." },
          { title: "2xx", description: "Успешный исход. Точный код уточняет, что именно произошло." },
          { title: "3xx", description: "Клиенту нужно выполнить дополнительное действие, например перейти по другому адресу." },
          { title: "4xx", description: "Запрос нельзя выполнить в отправленном виде или ресурс недоступен. Это не обязательно означает ошибку пользователя." },
          { title: "5xx", description: "Сервер не смог выполнить корректный на вид запрос из-за внутренней проблемы." },
        ]} />

        <PredictOutput
          code={'status = 302\nif 200 <= status < 300:\n    result = "успех"\nelif 300 <= status < 400:\n    result = "дополнительное действие"\nelse:\n    result = "другая ветка"\nprint(result)'}
          output={"дополнительное действие"}
          hint="302 попадает в диапазон 300–399. Первая цифра показывает класс ответа."
        />

        <Callout tone="info">
          {"Этот пример группирует диапазон кодов. В настоящем клиенте точная реакция зависит от полного status и заголовков ответа."}
        </Callout>

        <CodeBlock
          caption={"клиент выбирает ветку"}
          code={"if response.status == 404:\n    show_not_found()\n\n# не нужно искать\n# русскую фразу в body"}
        />

        <TrueFalse
          statement={<>{"Любой response с JSON body является успешным."}</>}
          isTrue={false}
          explanation={"Ошибка 404 тоже может иметь JSON body. Успех определяется status и договором, а не самим форматом данных."}
        />

      </Section>

      <Section number="03" title={"200, 201 и 204"}>
        <Lead>
          {"Даже успешные операции могут иметь разные результаты. Код помогает клиенту отличить чтение данных, создание ресурса и успешное действие без содержимого."}
        </Lead>

        <LinkedNotes items={[
          { title: "200 OK", description: "Операция успешно выполнена. При чтении сервер обычно возвращает найденные данные в body." },
          { title: "201 Created", description: "Создан новый ресурс. Body может вернуть его представление и назначенный сервером id." },
          { title: "204 No Content", description: "Операция успешна, но ответа с содержимым нет. Клиент не должен ждать JSON-body." },
        ]} />

        <CompareSolutions
          question={"Как точнее ответить после создания новой Task?"}
          left={{
            title: "200 OK",
            code: "200 + Task",
            note: "Сообщает об успехе, но сам status не отмечает создание ресурса.",
          }}
          right={{
            title: "201 Created",
            code: "201 + Task",
            note: "Передаёт и успех, и смысл создания.",
          }}
          preferred={"right"}
          explanation={"201 лучше соответствует операции создания ресурса."}
        />

        <Callout tone="info">
          {"204 не означает ошибку и не означает пустой JSON. По смыслу HTTP этот ответ не содержит содержимого. В нашей учебной модели ему соответствует body=None."}
        </Callout>

        <p>
          {"В упражнении None условно обозначает отсутствие body. При JSON-сериализации Python-значение None превращается в null, а ответ без body вообще не содержит JSON-значения. Здесь функция не сериализует данные, поэтому используется отдельное учебное соглашение."}
        </p>

        <BugHunt
          code={'status: 204\nbody: {"message": "deleted"}'}
          question={"Где противоречие в этом ответе?"}
          options={[
            "204 означает успех без содержимого, но body здесь не пустой",
            "204 является ошибкой сервера",
            "JSON body нельзя использовать в API",
          ]}
          correctIndex={0}
          explanation={"Если нужно отправить клиенту сообщение или JSON, нужно выбрать подходящий ответ с body. Для 204 в упражнении body равен None."}
          fix={'status: 204\nbody отсутствует'}
        />
      </Section>

      <Section number="04" title={"Ошибки 400, 404 и 500"}>
        <Lead>
          {"Ошибка тоже должна быть понятной частью API. Клиенту важно отличать отсутствующий ресурс от неверных данных и от неожиданного дефекта сервера."}
        </Lead>

        <LinkedNotes items={[
          { title: "400 Bad Request", description: "Сервер не может обработать request в отправленном виде, например из-за несоответствия договору." },
          { title: "404 Not Found", description: "Сервер работает, но ресурс по адресу или id не найден." },
          { title: "500 Internal Server Error", description: "Во время обработки произошёл неожиданный внутренний сбой сервера." },
        ]} />

        <p>
          {"400 обозначает общую проблему запроса. Не связываем этот статус с любой ошибкой отдельного поля. Подробную проверку входных данных разберём вместе с валидацией."}
        </p>

        <CodeBlock
          caption={"ожидаемая ошибка Planner"}
          code={"GET /tasks/999\nstatus: 404\nbody: {\"detail\": \"Task 999 not found\"}"}
        />

        <BugHunt
          code={"status: 200\nbody: {\"error\": \"Task not found\"}"}
          question={"Что не так с этим response?"}
          options={[
            "Status сообщает успех, хотя body говорит об ошибке",
            "JSON не может содержать поле error",
            "404 всегда должен быть без body",
          ]}
          correctIndex={0}
          explanation={"Клиент может принять 200 за успех. Ожидаемую ошибку нужно выразить соответствующим 4xx."}
          fix={"status: 404\nbody: {\"detail\": \"Task not found\"}"}
        />

        <Callout tone="info">
          {"Ответ 500 не должен раскрывать путь к файлу, секреты или подробную цепочку действий, приведшую к сбою. Разработчик ищет причину во внутреннем журнале сервера."}
        </Callout>
      </Section>

      <Section number="05" title={"Body ответа представляет результат"}>
        <Lead>
          {"Body содержит внешнее представление результата. Это не обязан быть внутренний объект Python и не обязан быть текстом для человека."}
        </Lead>

        <CodeBlock
          caption={"один ресурс"}
          code={"{\n  \"id\": 7,\n  \"title\": \"Изучить HTTP\",\n  \"priority\": 4,\n  \"is_done\": false\n}"}
        />

        <CodeBlock
          caption={"ошибка"}
          code={"{\n  \"detail\": \"Task 7 not found\"\n}"}
        />

        <LinkedNotes items={[
          { title: "Один ресурс", description: "Отдельная Task представлена объектом с нужными клиенту полями." },
          { title: "Коллекция", description: "Список задач представлен массивом объектов, обычно в одном JSON-массиве." },
          { title: "Ошибка", description: "Ожидаемая проблема тоже может иметь JSON-форму, например стабильное поле detail." },
        ]} />

        <p>
          {"Внутри программы Task может быть полноценным объектом Python. Клиенту передают лишь поля, согласованные для ответа. Поэтому внешний формат не обязан повторять все внутренние детали объекта."}
        </p>

        <CodeBlock
          caption={"коллекция задач в JSON"}
          code={'[\n  {"id": 7, "title": "Изучить HTTP", "priority": 4, "is_done": false},\n  {"id": 8, "title": "Прочитать response", "priority": 2, "is_done": true}\n]'}
        />

        <CompareSolutions
          question={"Что полезнее вернуть после создания Task?"}
          left={{
            title: "Только текст",
            code: "{\"message\": \"created\"}",
            note: "Клиент не знает назначенный id.",
          }}
          right={{
            title: "Представление ресурса",
            code: '{"id": 7, "title": "HTTP", "priority": 4, "is_done": false}',
            note: "Клиент получает данные созданной Task.",
          }}
          preferred={"right"}
          explanation={"Представление ресурса помогает клиенту обновить состояние и использовать id, который назначил сервер."}
        />

      </Section>

      <Section number="06" title={"Headers ответа и Content-Type"}>
        <Lead>
          {"Response headers описывают ответ так же, как request headers описывали обращение клиента. Content-Type сообщает, как читать body."}
        </Lead>

        <p>
          {"Accept находится в request и сообщает, какой формат клиент готов принять. Content-Type находится в response и описывает формат, который сервер действительно отправил."}
        </p>

        <CodeBlock
          caption={"JSON response"}
          code={'status: 200\nContent-Type: application/json\n\n{"id": 7, "title": "HTTP", "priority": 4, "is_done": false}'}
        />

        <CodeBlock
          caption={"текстовый response"}
          code={"status: 200\nContent-Type: text/plain\n\nServer is running"}
        />

        <p>
          {"Accept в request сообщает предпочтительный формат ответа, а Content-Type в response называет формат фактически переданного содержимого. text/plain не становится ошибкой только потому, что текст внешне похож на JSON. Несоответствие возникает, если договор API обещает JSON, а response объявляет text/plain. При body=None разбирать формат нечего, хотя другие заголовки могут остаться."}
        </p>
        <CodeBlock
          caption={"Task ID и Request ID отвечают на разные вопросы"}
          code={"/tasks/7 → выбирает задачу с id 7\nX-Request-ID: req-a91 → обозначает конкретное обращение"}
        />
        <p>
          {"Task ID относится к предметной записи, а request ID помогает найти конкретный обмен в журнале сервиса. В практике request_id уже передан функции: она только добавляет его в заголовок. Генерировать ID и настраивать журнал не нужно."}
        </p>
        <p>
          {"Имена HTTP-заголовков не зависят от регистра, но ключи Python-словаря зависят. Поэтому учебный результат сохраняет написание X-Request-ID точно по условию."}
        </p>

        <BugHunt
          code={'status: 200\nContent-Type: text/plain\n\n{"id": 7, "title": "HTTP", "priority": 4, "is_done": false}'}
          question={"Договор API обещает JSON. Что не так с этим response?"}
          options={[
            "Заголовок объявляет text/plain, хотя по договору клиент должен получить JSON",
            "Status 200 не допускает JSON body",
            "Формат ответа нельзя описать заголовком",
          ]}
          correctIndex={0}
          explanation={"JSON-подобный текст допустим при text/plain, если таков договор. Здесь ошибка именно в несоответствии договору: клиенту обещан JSON, но Content-Type сообщает text/plain."}
          fix={"Content-Type: application/json"}
        />

      </Section>

      <Section number="07" title={"Python-словарь ещё не является HTTP response"}>
        <Lead>
          {"Словарь Python удобен внутри программы, но сам по себе не уходит по сети. Перед передачей клиенту сервер должен представить данные в понятном обеим сторонам формате."}
        </Lead>

        <p>{"Что напечатает Python после сериализации словаря с булевым значением?"}</p>

        <PredictOutput
          code={'import json\ntask = {"available": True}\nprint(json.dumps(task))'}
          output={'{"available": true}'}
          hint="Python использует True, а JSON записывает то же логическое значение как true."
        />

        <p>
          {"Преобразование значения программы в формат передачи данных называют "}
          <strong>сериализацией</strong>
          {". Обратное преобразование полученных данных в значение программы называют разбором. Сериализация превращает объект в текст, который понимают разные языки, а не только Python."}
        </p>

        <p>
          {"При отправке JSON сервер помещает его представление в body response. "}
          <code>Content-Type: application/json</code>
          {" сообщает клиенту формат содержимого. Этот заголовок не выполняет преобразование и не содержит сами данные."}
        </p>

        <figure className="lesson-infographic">
          <img
            src={responseEnvelopeInfographic}
            alt="Сервер отдельно задаёт status и headers, сериализует значение Python в JSON для body и собирает HTTP response, который получает клиент."
            width={1672}
            height={836}
            loading="lazy"
            decoding="async"
          />
          <figcaption>
            {"Status и headers описывают ответ. Только значение для body преобразуется в JSON. Учебный словарь практики моделирует структуру, но не является сообщением в сети."}
          </figcaption>
        </figure>

        <Callout tone="info">
          {"В настоящем сервере сериализацию может выполнять отдельная часть программы, которая связывает Python-код с HTTP-сообщением. Если она настроена на JSON, преобразование может происходить автоматически. В практике мы намеренно возвращаем только учебный словарь и не запускаем сервер."}
        </Callout>

      </Section>

      <Section number="08" title={"Клиент читает response по порядку"}>
        <Lead>
          {"Получив ответ, клиент сначала выясняет исход. Иначе он может попытаться разобрать данные, которых в ответе нет, или принять ошибку за успех."}
        </Lead>

        <p>
          {"Схема показывает два связанных решения: сначала клиент читает status, затем проверяет наличие body. Для ответа без содержимого разбор JSON пропускается; если body есть, его формат помогает выбрать способ чтения."}
        </p>

        <figure className="lesson-infographic">
          <img
            src={clientResponseFlowInfographic}
            alt="Клиент сначала читает status ответа. Если body отсутствует, он завершает обработку без разбора данных; если body есть, читает Content-Type и разбирает содержимое."
            width={1672}
            height={836}
            loading="lazy"
            decoding="async"
          />
          <figcaption>
            {"Status задаёт ветку результата. Content-Type нужен для чтения присутствующего body; при 204 клиент не запускает разбор JSON."}
          </figcaption>
        </figure>

        <CodeSequence
          title={"Порядок обработки ответа"}
          label={"ПОСЛЕДОВАТЕЛЬНОСТЬ"}
          prompt={"Как выстроен путь от получения response до чтения его содержимого?"}
          pieces={[
            { id: "receive", code: "получить response" },
            { id: "status", code: "прочитать status" },
            { id: "reaction", code: "выбрать реакцию на исход" },
            { id: "headers", code: "если body есть, проверить Content-Type" },
            { id: "body", code: "разобрать данные и обновить интерфейс" },
          ]}
          correctOrder={["receive", "status", "reaction", "headers", "body"]}
          explanation={"Status определяет ветку обработки. Если содержимого нет, например при 204, клиент пропускает проверку Content-Type и разбор body."}
          incorrectExplanation={"Правильный порядок начинается с получения response и чтения status, после чего выбирается реакция. Content-Type проверяется только при наличии body; при 204 разбор данных не выполняется."}
        />

        <p>
          {"После проверки status клиент отдельно определяет, присутствует ли body. Если тело есть, Content-Type помогает выбрать подходящий способ чтения."}
        </p>

        <BranchExplorer
          code={'if status == 204:\n    result = "успех без body"\nelif body is None:\n    result = "body отсутствует"\nelif content_type == "application/json":\n    result = "разобрать JSON"\nelse:\n    result = "проверить другой формат"'}
          scenarios={[
            { label: "204, body=None", activeLine: 1, output: "успех без body; JSON разбирать не нужно" },
            { label: "200, body={}", activeLine: 5, output: "body есть; можно разобрать пустой JSON-объект" },
            { label: "200, текстовый body", activeLine: 7, output: "body есть, формат отличается от JSON" },
          ]}
        />

        <Callout tone="info">
          {"Это общий порядок рассуждения, а не обязательная последовательность строк кода. Клиентская библиотека может выполнять часть шагов автоматически."}
        </Callout>
      </Section>

      <Section number="09" title={"Request и response образуют пару"}>
        <Lead>
          {"Response всегда относится к конкретному request. Удобно видеть их как две половины одного сценария: клиент попросил, сервер обработал, клиент получил результат."}
        </Lead>

        <p>
          {"Ресурсом API называют объект, с которым работает программа. В Planner таким ресурсом может быть задача: её можно получить, создать или удалить."}
        </p>

        <CodeBlock
          caption={"успешная пара"}
          code={'REQUEST\nPOST /tasks\nbody: {"title": "HTTP", "priority": 4}\n\nRESPONSE\n201 Created\nbody: {"id": 7, "title": "HTTP", "priority": 4, "is_done": false}'}
        />

        <CodeBlock
          caption={"ошибочная пара"}
          code={"REQUEST\nGET /tasks/999\n\nRESPONSE\n404 Not Found\nbody: {\"detail\": \"Task 999 not found\"}"}
        />

        <CodeBlock
          caption={"без body"}
          code={"REQUEST\nDELETE /tasks/7\n\nRESPONSE\n204 No Content\nbody отсутствует"}
        />

        <p>
          {"Статус и тело зависят от результата конкретной операции. Клиент использует полученный ответ, чтобы показать этот результат человеку."}
        </p>

        <Callout tone="info">
          {"Следом мы свяжем status с method. Это позволит описывать один и тот же Planner API не только по данным, но и по смыслу действий."}
        </Callout>
      </Section>

      <Section number="10" title={"Что мы будем делать в практике"}>
        <Lead>
          {"Практика закрепит функцию без сетевого обмена и изменений хранилища. Она представляет заранее подготовленный результат в учебной модели response."}
        </Lead>

        <p>
          {"Функция получает согласованные status, body и request_id и возвращает их в response-модели. Входные аргументы остаются без изменений. Функция не принимает сетевой запрос, не выбирает результат операции и не меняет задачу в Planner."}
        </p>

        <LinkedNotes items={[
          { title: "Форма", description: "Результат явно разделяет status, headers и body." },
          { title: "Присутствие данных", description: "Пустой объект и отсутствие body имеют разный смысл." },
          { title: "Граница упражнения", description: "Проверяется структура учебной модели, а не отправка HTTP по сети." },
        ]} />

        <RecallCard
          question={"Чем различаются 204 и 200 с пустым JSON-объектом?"}
          answer={<p>{"204 сообщает об успешном результате без содержимого. При 200 с {} body присутствует и содержит пустой JSON-объект. Во втором случае клиент разбирает body по договору API."}</p>}
        />

        <KeyTakeaways
          points={[
            <>{"Response возвращает результат на конкретный request."}</>,
            <>{"Status описывает исход, body содержит данные, headers помогают прочитать ответ."}</>,
            <>{"204 означает успех без содержимого, а {} остаётся существующим body."}</>,
            <>{"Content-Type указывает формат body, но не создаёт и не преобразует его."}</>,
            <>{"Словарь в практике моделирует response, но не отправляет HTTP по сети."}</>,
          ]}
        />

        <PracticeCta text={"Практика проверяет response-модель для успеха с данными, ошибки, ответа без body и пустого JSON-объекта."} />
      </Section>
    </RichLesson>
  );
}
