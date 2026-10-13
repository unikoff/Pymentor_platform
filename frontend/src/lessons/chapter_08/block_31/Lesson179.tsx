import { Database, HardDrive } from "lucide-react";
import { BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, FillBlank, KeyTakeaways, Lead, MethodGrid, PracticeCta, QuizCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TrueFalse } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 31 · Docker Compose: API, PostgreSQL и Redis";

export function Lesson179({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Volumes и постоянные данные PostgreSQL"}
        intro={
          "Разделим жизненный цикл PostgreSQL-container и его данных: подключим named volume, проверим сохранность после пересоздания и составим безопасную процедуру полного reset без иллюзии резервного копирования."
        }
        tags={[
          { icon: <HardDrive size={14} />, label: "named volume" },
          {
            icon: <Database size={14} />,
            label: "данные переживают container",
          },
        ]}
      />
      <TheoryBridge link={"PostgreSQL уже доступен API, но без отдельного storage его состояние связано с runtime-container. Теперь данные получают собственный жизненный цикл."} boundary={"Volume повышает устойчивость local environment, но не является backup. Ошибка приложения, повреждение или команда down -v могут удалить либо испортить единственную копию."} />

      <Section number={"01"} title={"Два жизненных цикла вместо одного"}>
        <Lead>
          {
            "Container должен быть заменяемым: новый image или конфигурация создают новый runtime. Database data, напротив, должны переживать пересоздание. Named volume отделяет filesystem с PostgreSQL cluster от конкретного container."
          }
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>Подключить:</strong> смонтировать named volume в data
              directory PostgreSQL
            </li>
            <li>
              <strong>Проверить:</strong> создать запись и пересоздать db
              container
            </li>
            <li>
              <strong>Различить:</strong> понять эффект restart, down и down -v
            </li>
            <li>
              <strong>Защитить:</strong> описать backup перед разрушительным
              reset
            </li>
          </ol>
          <p>
            Результат — воспроизводимый эксперимент, доказывающий сохранность и
            контролируемое удаление local data.
          </p>
        </div>

        <Callout tone={"info"}>
          {
            "Container можно удалить без потери данных только тогда, когда важное состояние вынесено из его writable layer."
          }
        </Callout>
      </Section>

      <Section number={"02"} title={"Named volume и точка монтирования"}>
        <Lead>
          {
            "Compose объявляет volume на верхнем уровне и подключает его к service db. PostgreSQL image хранит cluster в /var/lib/postgresql/data, поэтому именно эта директория должна смотреть на volume."
          }
        </Lead>

        <CodeBlock
          caption={"named volume PostgreSQL"}
          code={`services:
          db:
            image: postgres:16-alpine
            volumes:
              - postgres_data:/var/lib/postgresql/data
        
        volumes:
          postgres_data:`}
        />

        <FillBlank
          prompt={"Завершите стандартную точку монтирования данных PostgreSQL."}
          before={"postgres_data:"}
          after={""}
          options={["/var/lib/postgresql/data", "/app", "/tmp/postgres"]}
          answer={"/var/lib/postgresql/data"}
          explanation={
            "Официальный image хранит database cluster в этой директории."
          }
        />
      </Section>

      <Section
        number={"03"}
        title={"Что происходит при restart, down и down -v"}
      >
        <Lead>
          {
            "Команды похожи по названию, но затрагивают разные ресурсы. Restart перезапускает существующий container. Down удаляет containers и project network, сохраняя named volumes. Down -v дополнительно удаляет volumes проекта."
          }
        </Lead>

        <MethodGrid
          rows={[
            [
              "docker compose restart db",
              "process перезапускается, container и volume сохраняются",
            ],
            [
              "docker compose up -d --force-recreate db",
              "container заменяется, volume подключается снова",
            ],
            [
              "docker compose down",
              "containers и network удаляются, named volume остаётся",
            ],
            ["docker compose down -v", "удаляются также named volumes проекта"],
            ["docker volume ls", "показывает существующие volumes"],
          ]}
        />

        <TrueFalse
          statement={
            <>
              {
                "Обычный docker compose down удаляет named volume postgres_data."
              }
            </>
          }
          isTrue={false}
          explanation={
            "Volume сохраняется, пока не добавлен флаг -v или не выполнено отдельное удаление."
          }
        />
      </Section>

      <Section
        number={"04"}
        title={"Эксперимент persistence и две линии жизни"}
      >
        <Lead>
          {
            "Сохранность нужно проверять наблюдаемым сценарием: создать уникальную запись, запомнить её id, пересоздать containers и снова запросить ту же запись через API."
          }
        </Lead>

        <CodeSequence
          title={"Соберите эксперимент persistence"}
          prompt={
            "Расположите действия так, чтобы результат однозначно доказал роль volume."
          }
          pieces={[
            { id: "up", code: "docker compose up -d" },
            { id: "create", code: "POST /tasks → id=501" },
            { id: "down", code: "docker compose down" },
            { id: "up2", code: "docker compose up -d" },
            { id: "get", code: "GET /tasks/501 → 200" },
            {
              id: "wrong",
              code: "docker compose down -v",
              note: "это разрушит проверяемые данные",
            },
          ]}
          correctOrder={["up", "create", "down", "up2", "get"]}
          explanation={
            "Запись после нового container подтверждает, что data находятся в volume."
          }
        />

        <Lead>
          {
            "Полезно мыслить двумя параллельными линиями: containers создаются из images и могут часто заменяться, volume существует отдельно и подключается к новому db container."
          }
        </Lead>

        <StepThrough
          code={`image postgres:16
        create db container
        mount postgres_data
        write task 501
        remove db container
        create new db container
        mount same postgres_data
        read task 501`}
          steps={[
            {
              line: 0,
              note: "Image содержит программу PostgreSQL, но не данные StudyHub.",
              vars: { image: "immutable template" },
            },
            {
              line: 1,
              note: "Создаётся runtime-container.",
              vars: { container: "db-1" },
            },
            {
              line: 2,
              note: "Volume подключается к data directory.",
              vars: { volume: "postgres_data" },
            },
            {
              line: 3,
              note: "Новая строка записывается в volume.",
              vars: { task: "501" },
            },
            {
              line: 4,
              note: "Старый container удаляется.",
              vars: { container: "removed" },
            },
            {
              line: 5,
              note: "Создаётся новый runtime.",
              vars: { container: "db-2" },
            },
            {
              line: 6,
              note: "Подключается прежний volume.",
              vars: { volume: "same data" },
            },
            {
              line: 7,
              note: "Строка остаётся доступной.",
              vars: { GET: "200" },
            },
          ]}
        />
      </Section>

      <Section number={"05"} title={"Volume не равен backup"}>
        <Lead>
          {
            "Volume хранит рабочие данные рядом с local Docker environment. Если приложение удалит строки, они исчезнут и в volume. Backup является отдельной копией, которую можно восстановить после удаления или повреждения основного storage."
          }
        </Lead>

        <CompareSolutions
          question={"Что защищает от случайного DELETE?"}
          left={{
            title: "Только volume",
            code: `postgres_data:/var/lib/postgresql/data`,
            note: "DELETE изменит данные внутри единственной рабочей копии.",
          }}
          right={{
            title: "Отдельный dump",
            code: `pg_dump -U studyhub -d studyhub > backup.sql`,
            note: "Снимок можно хранить отдельно и использовать для восстановления.",
          }}
          preferred={"right"}
          explanation={
            "Volume решает persistence между containers, а backup решает восстановление отдельной копии."
          }
        />

        <Callout>
          {
            "На учебном проекте достаточно понять границу и сделать простой pg_dump перед разрушительным reset."
          }
        </Callout>
      </Section>

      <Section number={"06"} title={"Контролируемый reset local database"}>
        <Lead>
          {
            "Полный reset полезен, когда нужно проверить migrations на чистой базе. Он должен быть осознанной процедурой: остановить stack, при необходимости сделать dump, удалить volume, поднять db и применить schema заново."
          }
        </Lead>

        <TerminalDemo
          title={"reset development environment"}
          lines={[
            {
              cmd: `docker compose exec db pg_dump -U studyhub -d studyhub > backup-before-reset.sql`,
            },
            { cmd: `docker compose down -v` },
            { out: `Volume studyhub_postgres_data  Removed` },
            { cmd: `docker compose up -d db` },
            { cmd: `docker compose ps db` },
            { out: `studyhub-db-1   Up` },
          ]}
        />

        <Callout>
          {
            "Не добавляйте down -v в обычную команду остановки проекта. Разрушительное действие должно выделяться названием и документацией."
          }
        </Callout>
      </Section>

      <Section number={"07"} title={"Инспекция volume и типичные ошибки"}>
        <Lead>
          {
            "Когда данные неожиданно исчезли, проверьте имя project, список volumes и фактические mounts container. Новый Compose project name может создать новый пустой volume вместо подключения прежнего."
          }
        </Lead>

        <BugHunt
          code={`volumes:
          pg_data:
        
        services:
          db:
            image: postgres:16-alpine
            volumes:
              - postgres_data:/var/lib/postgresql/data`}
          question={"Почему Compose не может найти volume?"}
          options={[
            "Объявлено имя pg_data, а подключено postgres_data",
            "PostgreSQL запрещает named volumes",
            "Volume можно подключать только к API",
          ]}
          correctIndex={0}
          explanation={
            "Имена в верхнем разделе volumes и service mount должны совпадать."
          }
          fix={`volumes:
          postgres_data:
        
        services:
          db:
            volumes:
              - postgres_data:/var/lib/postgresql/data`}
        />
      </Section>

      <Section number={"08"} title={"Контрольная точка: persistence и reset"}>
        <Lead>
          {
            "Закрепите не команды сами по себе, а причинную модель: какой service запускается, какую dependency ожидает, где находится состояние и каким наблюдаемым сигналом подтверждается готовность."
          }
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что переживает docker compose down?"}
            options={["Named volume", "Container", "Project network"]}
            correctIndex={0}
            explanation={"Без -v Compose сохраняет named volumes."}
          />
          <QuizCard
            question={"Что делает down -v?"}
            options={[
              "Удаляет также volumes проекта",
              "Только перезапускает API",
              "Создаёт backup",
            ]}
            correctIndex={0}
            explanation={
              "Флаг -v делает операцию разрушительной для local data."
            }
          />
          <QuizCard
            question={"Почему volume не является backup?"}
            options={[
              "Изменения и удаления сразу попадают в него",
              "Он всегда read-only",
              "PostgreSQL его не использует",
            ]}
            correctIndex={0}
            explanation={
              "Это основное рабочее storage, а не независимая копия."
            }
          />
          <QuizCard
            question={"Куда монтируется PostgreSQL volume?"}
            options={[
              "/var/lib/postgresql/data",
              "/app/data",
              "/var/log/postgresql",
            ]}
            correctIndex={0}
            explanation={"Это стандартная data directory официального image."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Container lifecycle и data lifecycle нужно разделять."}</>,
            <>
              {
                "Named volume хранит PostgreSQL cluster вне writable layer container."
              }
            </>,
            <>{"Down сохраняет volume, а down -v удаляет его."}</>,
            <>
              {"Persistence проверяется через запись до и после пересоздания."}
            </>,
            <>
              {
                "Volume не защищает от логического удаления и не заменяет backup."
              }
            </>,
            <>{"Reset выполняется отдельной документированной процедурой."}</>,
            <>
              {
                "Имя project и имя volume влияют на то, какие данные подключены."
              }
            </>,
          ]}
        />

        <PracticeCta
          text={
            "Подключите postgres_data, создайте контрольную задачу, выполните down/up и подтвердите её сохранность. Затем сделайте pg_dump, выполните контролируемый down -v, поднимите чистую database и запишите процедуру восстановления в docs/runbook-compose.md."
          }
        />
      </Section>
    </RichLesson>
  );
}
