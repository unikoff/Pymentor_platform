import { Cloud, HardDrive } from "lucide-react";
import { Callout, CodeSequence, CompareSolutions, KeyTakeaways, Lead, MatchPairs, MethodGrid, PracticeCta, QuizCard, RichHero, RichLesson, Section, TerminalDemo, TrueFalse } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 30 · Dockerfile и контейнер приложения";

export function Lesson174({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Ports, environment и файловое состояние container"}
        intro={"Научимся управлять runtime без пересборки image: разведём container port и host port, передадим environment, запустим два экземпляра StudyHub и проверим границу временной файловой системы."}
        tags={[
          { icon: <Cloud size={14} />, label: "host ↔ container port" },
          { icon: <HardDrive size={14} />, label: "runtime state" },
        ]}
      />
      <TheoryBridge link={"Image собирается быстро и предсказуемо. Теперь один и тот же артефакт должен запускаться с разной конфигурацией и не смешивать runtime state с содержимым image."} boundary={"Bind mount полезен для development, но не становится универсальным production-хранилищем. Постоянные данные PostgreSQL будут настроены в Compose-блоке."} />

      <Section number={"01"} title={"Image одинаковый, runtime-конфигурация разная"}>
        <Lead>
          {"Пересобирать image для каждого APP_ENV, port или DATABASE_URL неправильно. Image хранит код, а конкретный запуск получает environment и сетевые mapping."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Build artifact"}</h3>
          <p>{"studyhub-api:dev одинаков для нескольких запусков."}</p>
          <h3>{"Runtime parameters"}</h3>
          <p>{"Имя, environment, published ports и mounts задаются docker run."}</p>
          <h3>{"Проверка"}</h3>
          <p>{"Два containers отвечают на разных host ports, хотя внутри слушают один port 8000."}</p>
        </div>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"image:"}</strong> {" studyhub-api:dev"}
            </li>
            <li>
              <strong>{"run A:"}</strong> {" APP_ENV=demo-a, host 8001"}
            </li>
            <li>
              <strong>{"run B:"}</strong> {" APP_ENV=demo-b, host 8002"}
            </li>
            <li>
              <strong>{"same process contract:"}</strong> {" container port 8000"}
            </li>
          </ol>
        </div>

        <MethodGrid
          rows={[
            [
              <>наблюдать</>,
              "Зафиксируйте наблюдаемый результат раздела «Image одинаковый, runtime-конфигурация разная» до изменения параметров.",
            ],
            [
              <>предсказать</>,
              "Выберите один параметр из шага «Runtime parameters» и сначала запишите ожидаемый эффект.",
            ],
            [
              <>изменить</>,
              "Измените только один вход, команду или runtime-настройку; остальные условия оставьте прежними.",
            ],
            [
              <>диагностировать</>,
              "Если результат не совпал с прогнозом, проверьте факты по logs, state, filesystem или network boundary этого раздела.",
            ],
          ]}
        />

        <Callout tone="info">
          {"Конфигурация окружения — свойство запуска, а не причина создавать новый source branch или новый Dockerfile."}
        </Callout>
      </Section>

      <Section number={"02"} title={"Container port и host port — разные адресные пространства"}>
        <Lead>
          {"Uvicorn слушает 8000 внутри network namespace container. Флаг -p создаёт правило публикации на host; запись читается слева направо как HOST:CONTAINER."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Внутри"}</h3>
          <p>{"Процесс слушает 0.0.0.0:8000 в container."}</p>
          <h3>{"Снаружи"}</h3>
          <p>{"Host может принять запрос на 127.0.0.1:8001."}</p>
          <h3>{"Mapping"}</h3>
          <p>{"-p 127.0.0.1:8001:8000 направляет host traffic во внутренний port."}</p>
        </div>

        <MatchPairs
          prompt={"Соедините адрес и его роль."}
          leftTitle={"Адрес"}
          rightTitle={"Смысл"}
          pairs={[
            { left: "0.0.0.0:8000 внутри", right: "Uvicorn слушает интерфейсы container" },
            { left: "127.0.0.1:8001 host", right: "доступ только с локальной host-машины" },
            { left: "-p 8001:8000", right: "host 8001 направляется в container 8000" },
            { left: "без -p", right: "process работает, но port не опубликован host" },
          ]}
          explanation={"Внутренний listener и внешний published port являются разными уровнями."}
        />

        <MethodGrid
          rows={[
            [
              <>наблюдать</>,
              "Зафиксируйте наблюдаемый результат раздела «Container port и host port — разные адресные пространства» до изменения параметров.",
            ],
            [
              <>предсказать</>,
              "Выберите один параметр из шага «Снаружи» и сначала запишите ожидаемый эффект.",
            ],
            [
              <>изменить</>,
              "Измените только один вход, команду или runtime-настройку; остальные условия оставьте прежними.",
            ],
            [
              <>диагностировать</>,
              "Если результат не совпал с прогнозом, проверьте факты по logs, state, filesystem или network boundary этого раздела.",
            ],
          ]}
        />

        <Callout tone="info">
          {"Публикация без явного host IP часто открывает port на всех host interfaces. Для локальной практики безопаснее использовать 127.0.0.1:HOST:CONTAINER."}
        </Callout>
      </Section>

      <Section number={"03"} title={"EXPOSE документирует, но не публикует"}>
        <Lead>
          {"Dockerfile-инструкция EXPOSE сообщает ожидаемый runtime port image. Она не создаёт firewall rule и не заменяет флаг -p."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Metadata"}</h3>
          <p>{"EXPOSE 8000 помогает инструментам и читателю понять контракт image."}</p>
          <h3>{"Publication"}</h3>
          <p>{"Только docker run -p делает port доступным через host mapping."}</p>
          <h3>{"Прогноз"}</h3>
          <p>{"Container с EXPOSE, но без -p, не отвечает по host:8000."}</p>
        </div>

        <TrueFalse
          statement={<>{"После EXPOSE 8000 приложение автоматически доступно по http://localhost:8000."}</>}
          isTrue={false}
          explanation={"EXPOSE является metadata. Для доступа с host нужен --publish/-p или сетевой доступ другого container."}
        />

        <MethodGrid
          rows={[
            [
              <>наблюдать</>,
              "Зафиксируйте наблюдаемый результат раздела «EXPOSE документирует, но не публикует» до изменения параметров.",
            ],
            [
              <>предсказать</>,
              "Выберите один параметр из шага «Publication» и сначала запишите ожидаемый эффект.",
            ],
            [
              <>изменить</>,
              "Измените только один вход, команду или runtime-настройку; остальные условия оставьте прежними.",
            ],
            [
              <>диагностировать</>,
              "Если результат не совпал с прогнозом, проверьте факты по logs, state, filesystem или network boundary этого раздела.",
            ],
          ]}
        />

        <Callout tone="info">
          {"EXPOSE всё равно полезен: он фиксирует внутренний сетевой контракт рядом с CMD."}
        </Callout>
      </Section>

      <Section number={"04"} title={"Environment через -e и --env-file"}>
        <Lead>
          {"FastAPI settings читает переменные процесса. Docker может передать отдельное значение флагом -e или набор значений из файла при запуске."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"-e NAME=value"}</h3>
          <p>{"Подходит для одной-двух учебных переменных."}</p>
          <h3>{"--env-file"}</h3>
          <p>{"Удобен для локального набора config, но файл с secrets не коммитится."}</p>
          <h3>{"Validation"}</h3>
          <p>{"Отсутствующая обязательная переменная должна приводить к понятной startup error."}</p>
        </div>

        <TerminalDemo
          title={"два runtime окружения"}
          lines={[
            { cmd: "docker run -d --name studyhub-a -p 127.0.0.1:8001:8000 -e APP_ENV=demo-a studyhub-api:dev" },
            { out: "container studyhub-a started" },
            { cmd: "docker run -d --name studyhub-b -p 127.0.0.1:8002:8000 --env-file .env.container studyhub-api:dev" },
            { out: "container studyhub-b started" },
          ]}
        />

        <MethodGrid
          rows={[
            [
              <>наблюдать</>,
              "Зафиксируйте наблюдаемый результат раздела «Environment через -e и --env-file» до изменения параметров.",
            ],
            [
              <>предсказать</>,
              "Выберите один параметр из шага «--env-file» и сначала запишите ожидаемый эффект.",
            ],
            [
              <>изменить</>,
              "Измените только один вход, команду или runtime-настройку; остальные условия оставьте прежними.",
            ],
            [
              <>диагностировать</>,
              "Если результат не совпал с прогнозом, проверьте факты по logs, state, filesystem или network boundary этого раздела.",
            ],
          ]}
        />

        <Callout tone="info">
          {"Не выводите весь environment в logs: там могут находиться passwords и tokens."}
        </Callout>
      </Section>

      <Section number={"05"} title={"Writable layer не является постоянным storage"}>
        <Lead>
          {"Приложение может создать файл внутри /app, но этот файл принадлежит конкретному container. Recreate из того же image начинается с исходного состояния."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Создать"}</h3>
          <p>{"docker exec записывает marker в writable layer."}</p>
          <h3>{"Проверить"}</h3>
          <p>{"Файл виден, пока существует этот container."}</p>
          <h3>{"Пересоздать"}</h3>
          <p>{"После rm новый container не содержит marker."}</p>
        </div>

        <CodeSequence
          title={"Соберите эксперимент с временным файлом"}
          prompt={"Расположите команды так, чтобы доказать потерю writable state."}
          pieces={[
            { id: "run1", code: "docker run -d --name state-lab studyhub-api:dev" },
            { id: "write", code: "docker exec state-lab sh -c \"echo demo > /tmp/marker\"" },
            { id: "read", code: "docker exec state-lab cat /tmp/marker" },
            { id: "remove", code: "docker rm -f state-lab" },
            { id: "run2", code: "docker run -d --name state-lab studyhub-api:dev" },
            { id: "check", code: "docker exec state-lab test -f /tmp/marker" },
          ]}
          correctOrder={["run1", "write", "read", "remove", "run2", "check"]}
          explanation={"Новый container не наследует изменения writable layer удалённого экземпляра."}
        />

        <MethodGrid
          rows={[
            [
              <>наблюдать</>,
              "Зафиксируйте наблюдаемый результат раздела «Writable layer не является постоянным storage» до изменения параметров.",
            ],
            [
              <>предсказать</>,
              "Выберите один параметр из шага «Проверить» и сначала запишите ожидаемый эффект.",
            ],
            [
              <>изменить</>,
              "Измените только один вход, команду или runtime-настройку; остальные условия оставьте прежними.",
            ],
            [
              <>диагностировать</>,
              "Если результат не совпал с прогнозом, проверьте факты по logs, state, filesystem или network boundary этого раздела.",
            ],
          ]}
        />

        <Callout tone="info">
          {"Stateless API-container проще заменять и масштабировать, потому что его важное состояние вынесено во внешние services."}
        </Callout>
      </Section>

      <Section number={"06"} title={"Bind mount как отдельный development-режим"}>
        <Lead>
          {"Bind mount подменяет путь container содержимым host-директории. Это удобно для live-edit source, но делает запуск зависимым от структуры файлов host."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Development"}</h3>
          <p>{"--mount type=bind позволяет container видеть изменения app на host."}</p>
          <h3>{"Shadowing"}</h3>
          <p>{"Mount поверх /app/app скрывает файлы, записанные в image по этому пути."}</p>
          <h3>{"Production boundary"}</h3>
          <p>{"Релизный image должен содержать проверенный source и не зависеть от папки автора."}</p>
        </div>

        <CompareSolutions
          question={"Какой режим подходит для воспроизводимого release?"}
          left={{
            title: "Bind-mounted source",
            code: "docker run --mount type=bind,src=./app,dst=/app/app ...",
            note: "Полезно для разработки, но зависит от host files.",
          }}
          right={{
            title: "Source внутри image",
            code: "docker run studyhub-api:0.1.0",
            note: "Запускается один и тот же проверенный artifact.",
          }}
          preferred="right"
          explanation={"Release должен использовать source из image; bind mount остаётся отдельным dev workflow."}
        />

        <MethodGrid
          rows={[
            [
              <>наблюдать</>,
              "Зафиксируйте наблюдаемый результат раздела «Bind mount как отдельный development-режим» до изменения параметров.",
            ],
            [
              <>предсказать</>,
              "Выберите один параметр из шага «Shadowing» и сначала запишите ожидаемый эффект.",
            ],
            [
              <>изменить</>,
              "Измените только один вход, команду или runtime-настройку; остальные условия оставьте прежними.",
            ],
            [
              <>диагностировать</>,
              "Если результат не совпал с прогнозом, проверьте факты по logs, state, filesystem или network boundary этого раздела.",
            ],
          ]}
        />

        <Callout tone="info">
          {"Mount не копирует файлы внутрь image. Он меняет файловый view конкретного container на время запуска."}
        </Callout>
      </Section>

      <Section number={"07"} title={"Два экземпляра StudyHub из одного image"}>
        <Lead>
          {"Финальный эксперимент объединяет ports и environment: один image запускается дважды, containers получают разные имена и APP_ENV, но сохраняют одинаковый внутренний контракт."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Instance A"}</h3>
          <p>{"127.0.0.1:8001 → container 8000, APP_ENV=blue."}</p>
          <h3>{"Instance B"}</h3>
          <p>{"127.0.0.1:8002 → container 8000, APP_ENV=green."}</p>
          <h3>{"Проверка"}</h3>
          <p>{"/health или служебный config endpoint показывает разные environments без rebuild."}</p>
        </div>

        <TerminalDemo
          title={"one image, two containers"}
          lines={[
            { cmd: "docker run -d --name studyhub-blue -p 127.0.0.1:8001:8000 -e APP_ENV=blue studyhub-api:dev" },
            { cmd: "docker run -d --name studyhub-green -p 127.0.0.1:8002:8000 -e APP_ENV=green studyhub-api:dev" },
            { cmd: "docker ps --format \"table {{.Names}}\\t{{.Ports}}\"" },
            { out: "studyhub-blue    127.0.0.1:8001->8000/tcp" },
            { out: "studyhub-green   127.0.0.1:8002->8000/tcp" },
          ]}
        />

        <MethodGrid
          rows={[
            [
              <>наблюдать</>,
              "Зафиксируйте наблюдаемый результат раздела «Два экземпляра StudyHub из одного image» до изменения параметров.",
            ],
            [
              <>предсказать</>,
              "Выберите один параметр из шага «Instance B» и сначала запишите ожидаемый эффект.",
            ],
            [
              <>изменить</>,
              "Измените только один вход, команду или runtime-настройку; остальные условия оставьте прежними.",
            ],
            [
              <>диагностировать</>,
              "Если результат не совпал с прогнозом, проверьте факты по logs, state, filesystem или network boundary этого раздела.",
            ],
          ]}
        />

        <Callout tone="info">
          {"Одинаковый host port нельзя одновременно привязать к двум running containers. Меняется левая часть mapping, а внутренний port может совпадать."}
        </Callout>
      </Section>

      <Section number="08" title="Контрольная точка и проектная практика">
        <Lead>
          {"Соберите модель занятия, проверьте четыре принципиальных различия и примените результат к текущему Docker-артефакту StudyHub."}
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Как читается -p 8001:8000?"}
            options={["host 8001 → container 8000", "container 8001 → host 8000", "два host ports"]}
            correctIndex={0}
            explanation={"Слева host, справа container."}
          />
          <QuizCard
            question={"Что делает EXPOSE?"}
            options={["Документирует внутренний port", "Автоматически публикует port", "Запускает Uvicorn"]}
            correctIndex={0}
            explanation={"Публикация выполняется флагом -p."}
          />
          <QuizCard
            question={"Где передавать APP_ENV?"}
            options={["При docker run", "Зашить отдельным source branch", "В имени image layer"]}
            correctIndex={0}
            explanation={"Runtime configuration не требует rebuild."}
          />
          <QuizCard
            question={"Что происходит с writable layer после rm?"}
            options={["Он удаляется вместе с container", "Он добавляется в image", "Он становится volume"]}
            correctIndex={0}
            explanation={"Для persistence нужен mount или внешний storage."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Container port и host port принадлежат разным сетевым пространствам."}</>,
            <>{"-p читается как HOST:CONTAINER."}</>,
            <>{"EXPOSE документирует port, но не публикует его."}</>,
            <>{"Runtime environment передаётся без пересборки image."}</>,
            <>{"Writable layer удаляется вместе с container."}</>,
            <>{"Bind mount полезен в development, но release использует source из image."}</>,
          ]}
        />

        <PracticeCta text={"Запустите studyhub-api:dev дважды на host ports 8001 и 8002 с разными APP_ENV. Проверьте оба /health, создайте marker-файл в одном container, пересоздайте его и зафиксируйте исчезновение файла. Опишите границы image, runtime config и persistence в README."} />
      </Section>
    </RichLesson>
  );
}
