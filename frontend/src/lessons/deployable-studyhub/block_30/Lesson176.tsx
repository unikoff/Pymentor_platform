import { CheckCircle2, Wrench } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, KeyTakeaways, Lead, MatchPairs, MethodGrid, PracticeCta, QuizCard, RichHero, RichLesson, Section, TerminalDemo, TypeCard, TypeCards } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 30 · Dockerfile и контейнер приложения";

export function Lesson176({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Диагностика container и релизный Dockerfile"}
        intro={"Соберём итоговый Dockerfile и научимся расследовать четыре класса сбоев: ошибка build, немедленный exit, неверный network contract и failing healthcheck."}
        tags={[
          { icon: <Wrench size={14} />, label: "build · run · health" },
          { icon: <CheckCircle2 size={14} />, label: "release runbook" },
        ]}
      />
      <TheoryBridge link={"Image уже чистый, cache-предсказуемый и non-root. Финальный шаг — перестать воспринимать успешный docker run как единственную проверку и построить диагностический маршрут."} boundary={"Registry, Compose, CI/CD и deployment ещё не входят в блок. Здесь создаётся локальный release artifact и воспроизводимый runbook."} />

      <Section number={"01"} title={"Диагностика начинается с определения фазы сбоя"}>
        <Lead>
          {"Одинаковая фраза «Docker не работает» скрывает разные причины. Сначала определяем, сломался build, container creation, process runtime, network access или application health."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Build"}</h3>
          <p>{"Image не создан; ищем failing instruction и input context."}</p>
          <h3>{"Run"}</h3>
          <p>{"Container создан, но process завершился; читаем exit code и logs."}</p>
          <h3>{"Health/network"}</h3>
          <p>{"Process жив, но request не проходит или healthcheck сообщает unhealthy."}</p>
        </div>

        <TypeCards>
          <TypeCard badge={"build"} title={"Ошибка сборки"} code={"docker build --progress=plain ..."}>
            {"Dockerfile instruction или dependency install не завершились."}
          </TypeCard>
          <TypeCard badge={"runtime"} badgeTone="float" title={"Container exited"} code={"docker ps -a && docker logs"}>
            {"Главный process завершился с exit code."}
          </TypeCard>
          <TypeCard badge={"health"} badgeTone="str" title={"Process жив, API не готов"} code={"docker inspect && curl"}>
            {"Проверяем port mapping, listener и /health."}
          </TypeCard>
        </TypeCards>

        <MethodGrid
          rows={[
            [
              <>наблюдать</>,
              "Зафиксируйте наблюдаемый результат раздела «Диагностика начинается с определения фазы сбоя» до изменения параметров.",
            ],
            [
              <>предсказать</>,
              "Выберите один параметр из шага «Run» и сначала запишите ожидаемый эффект.",
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
          {"Не начинайте с docker exec, если container уже stopped: сначала logs и inspect state."}
        </Callout>
      </Section>

      <Section number={"02"} title={"Build error: читаем первую реально упавшую instruction"}>
        <Lead>
          {"Build log показывает последовательность steps. Полезная причина обычно находится в первом step со статусом ERROR, а не в последних итоговых строках builder-а."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Missing file"}</h3>
          <p>{"COPY requirements.txt . падает, если файл вне context или переименован."}</p>
          <h3>{"Dependency failure"}</h3>
          <p>{"RUN pip install показывает package и системную причину."}</p>
          <h3>{"Reproduce"}</h3>
          <p>{"--progress=plain раскрывает подробный вывод команды."}</p>
        </div>

        <BugHunt
          code={"#6 COPY requirements.txt .\n#6 ERROR: failed to calculate checksum: \"/requirements.txt\": not found"}
          question={"Что проверить первым?"}
          options={["Наличие requirements.txt внутри build context и .dockerignore", "Host port 8000", "Health endpoint"]}
          correctIndex={0}
          explanation={"Ошибка возникла на build stage до создания image и не связана с network runtime."}
          fix={"Проверьте путь context: docker build -f Dockerfile .\nУбедитесь, что requirements.txt не исключён .dockerignore."}
        />

        <MethodGrid
          rows={[
            [
              <>наблюдать</>,
              "Зафиксируйте наблюдаемый результат раздела «Build error: читаем первую реально упавшую instruction» до изменения параметров.",
            ],
            [
              <>предсказать</>,
              "Выберите один параметр из шага «Dependency failure» и сначала запишите ожидаемый эффект.",
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
          {"Не очищайте весь cache как первое действие. Сначала установите изменившийся input или failing command."}
        </Callout>
      </Section>

      <Section number={"03"} title={"Exited container: ps -a, logs и exit code"}>
        <Lead>
          {"Если docker run в detached mode вернул id, это ещё не означает, что server продолжает работать. docker ps -a показывает stopped экземпляры, logs — stderr/stdout, inspect — exit code."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"docker ps -a"}</h3>
          <p>{"Находим статус Exited и имя container."}</p>
          <h3>{"docker logs"}</h3>
          <p>{"Читаем traceback, import error или config validation error."}</p>
          <h3>{"docker inspect"}</h3>
          <p>{"Проверяем State.ExitCode и Error без догадок."}</p>
        </div>

        <TerminalDemo
          title={"runtime investigation"}
          lines={[
            { cmd: "docker ps -a --filter name=studyhub-api" },
            { out: "studyhub-api   Exited (1) 5 seconds ago" },
            { cmd: "docker logs studyhub-api" },
            { out: "Error loading ASGI app. Could not import module \"app.main\"." },
            { cmd: "docker inspect --format \"{{.State.ExitCode}}\" studyhub-api" },
            { out: "1" },
          ]}
        />

        <MethodGrid
          rows={[
            [
              <>наблюдать</>,
              "Зафиксируйте наблюдаемый результат раздела «Exited container: ps -a, logs и exit code» до изменения параметров.",
            ],
            [
              <>предсказать</>,
              "Выберите один параметр из шага «docker logs» и сначала запишите ожидаемый эффект.",
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
          {"Сохраняйте failed container до чтения logs и inspect. Флаг --rm неудобен для первого расследования runtime error."}
        </Callout>
      </Section>

      <Section number={"04"} title={"Running, но request не проходит"}>
        <Lead>
          {"Живой process может слушать неверный interface, другой container port или не иметь опубликованного host mapping. Диагностика идёт от процесса наружу."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Listener"}</h3>
          <p>{"CMD должен запускать Uvicorn на 0.0.0.0:8000."}</p>
          <h3>{"Metadata/runtime"}</h3>
          <p>{"Inspect показывает Config.ExposedPorts и HostConfig.PortBindings."}</p>
          <h3>{"Request"}</h3>
          <p>{"Host обращается к левой части mapping, например 127.0.0.1:8001."}</p>
        </div>

        <BranchExplorer
          code={"process listener\n→ container port\n→ published mapping\n→ host request"}
          scenarios={[
            { label: "127.0.0.1 inside", activeLine: 0, output: "traffic через container interface не принимается" },
            { label: "no -p", activeLine: 2, output: "host mapping отсутствует" },
            { label: "-p 8001:8000", activeLine: 3, output: "request идёт на host 8001" },
          ]}
        />

        <MethodGrid
          rows={[
            [
              <>наблюдать</>,
              "Зафиксируйте наблюдаемый результат раздела «Running, но request не проходит» до изменения параметров.",
            ],
            [
              <>предсказать</>,
              "Выберите один параметр из шага «Metadata/runtime» и сначала запишите ожидаемый эффект.",
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
          {"EXPOSE не исправляет неверный listener и не создаёт mapping. Проверяются все три границы отдельно."}
        </Callout>
      </Section>

      <Section number={"05"} title={"HEALTHCHECK проверяет приложение внутри container"}>
        <Lead>
          {"Running сообщает только о живом главном процессе. HEALTHCHECK периодически запускает отдельную команду и переводит container в starting, healthy или unhealthy."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Endpoint"}</h3>
          <p>{"/health должен быть быстрым и не выполнять тяжёлый business flow."}</p>
          <h3>{"Инструмент"}</h3>
          <p>{"Slim image не обязан содержать curl, поэтому используем Python standard library."}</p>
          <h3>{"Параметры"}</h3>
          <p>{"start-period даёт приложению время на startup, retries защищает от единичного сбоя."}</p>
        </div>

        <CodeBlock
          caption={"healthcheck без curl"}
          code={"HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \\\n  CMD python -c \"import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/health', timeout=2)\""}
        />

        <MethodGrid
          rows={[
            [
              <>наблюдать</>,
              "Зафиксируйте наблюдаемый результат раздела «HEALTHCHECK проверяет приложение внутри container» до изменения параметров.",
            ],
            [
              <>предсказать</>,
              "Выберите один параметр из шага «Инструмент» и сначала запишите ожидаемый эффект.",
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
          {"Healthcheck обращается к container-local port 8000 и не зависит от опубликованного host port."}
        </Callout>
      </Section>

      <Section number={"06"} title={"docker exec и inspect применяются после базовой локализации"}>
        <Lead>
          {"В running container можно проверить environment, пользователя, файлы и imports. Inspect показывает immutable configuration и runtime bindings без изменения системы."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"exec"}</h3>
          <p>{"Выполняет диагностическую команду внутри уже running container."}</p>
          <h3>{"inspect"}</h3>
          <p>{"Показывает image, user, env, ports, state и health history."}</p>
          <h3>{"Ограничение"}</h3>
          <p>{"Ручная правка файла через exec не исправляет Dockerfile и исчезнет после recreate."}</p>
        </div>

        <MatchPairs
          prompt={"Выберите инструмент для каждого вопроса."}
          leftTitle={"Вопрос"}
          rightTitle={"Команда"}
          pairs={[
            { left: "Какой exit code?", right: "docker inspect" },
            { left: "Что написал Uvicorn?", right: "docker logs" },
            { left: "Какой uid у process?", right: "docker exec ... id" },
            { left: "Какие containers stopped?", right: "docker ps -a" },
            { left: "Как настроен port binding?", right: "docker inspect" },
          ]}
          explanation={"Инструмент выбирается по фазе и типу факта, который нужно получить."}
        />

        <MethodGrid
          rows={[
            [
              <>наблюдать</>,
              "Зафиксируйте наблюдаемый результат раздела «docker exec и inspect применяются после базовой локализации» до изменения параметров.",
            ],
            [
              <>предсказать</>,
              "Выберите один параметр из шага «inspect» и сначала запишите ожидаемый эффект.",
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
          {"Исправление делается в source, Dockerfile или run command, затем image/container пересоздаются. Не лечите release ручными изменениями внутри экземпляра."}
        </Callout>
      </Section>

      <Section number={"07"} title={"Финальный Dockerfile и локальный release runbook"}>
        <Lead>
          {"Итоговый artifact объединяет cache boundary, clean context, non-root runtime, явный port contract, healthcheck и exec-form CMD. Runbook доказывает воспроизводимость для другого разработчика."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Build"}</h3>
          <p>{"Создать versioned tag studyhub-api:0.1.0."}</p>
          <h3>{"Run"}</h3>
          <p>{"Передать env-file, имя и localhost port mapping."}</p>
          <h3>{"Verify"}</h3>
          <p>{"Проверить ps, health status, logs и HTTP smoke request."}</p>
        </div>

        <CodeBlock
          caption={"релизный Dockerfile блока"}
          code={"FROM python:3.12-slim\n\nENV PYTHONDONTWRITEBYTECODE=1 \\\n    PYTHONUNBUFFERED=1\n\nWORKDIR /app\n\nRUN groupadd --system app \\\n    && useradd --system --gid app --home-dir /app app \\\n    && chown app:app /app\n\nCOPY requirements.txt .\nRUN pip install --no-cache-dir -r requirements.txt\n\nCOPY --chown=app:app app ./app\nCOPY --chown=app:app migrations ./migrations\nCOPY --chown=app:app alembic.ini .\n\nUSER app\nEXPOSE 8000\n\nHEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \\\n  CMD python -c \"import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/health', timeout=2)\"\n\nCMD [\"uvicorn\", \"app.main:app\", \"--host\", \"0.0.0.0\", \"--port\", \"8000\"]"}
        />

        <MethodGrid
          rows={[
            [
              <>наблюдать</>,
              "Зафиксируйте наблюдаемый результат раздела «Финальный Dockerfile и локальный release runbook» до изменения параметров.",
            ],
            [
              <>предсказать</>,
              "Выберите один параметр из шага «Run» и сначала запишите ожидаемый эффект.",
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
          {"Versioned local tag — начало release discipline. Push в registry и автоматическая сборка будут добавлены только в блоке 32."}
        </Callout>
      </Section>

      <Section number="08" title="Контрольная точка и проектная практика">
        <Lead>
          {"Соберите модель занятия, проверьте четыре принципиальных различия и примените результат к текущему Docker-артефакту StudyHub."}
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"С чего начинать при Exited (1)?"}
            options={["docker logs и inspect state", "docker exec bash", "изменить host port"]}
            correctIndex={0}
            explanation={"Stopped container сначала исследуется снаружи."}
          />
          <QuizCard
            question={"Что показывает running?"}
            options={["Главный process жив", "Health endpoint обязательно работает", "Database migration завершена"]}
            correctIndex={0}
            explanation={"Health требует отдельной проверки."}
          />
          <QuizCard
            question={"Где выполняется HEALTHCHECK?"}
            options={["Внутри container", "Только в browser", "В Git repository"]}
            correctIndex={0}
            explanation={"Команда использует container-local network."}
          />
          <QuizCard
            question={"Зачем exec-form CMD?"}
            options={["Главный process получает сигналы напрямую", "Увеличить число layers", "Сохранить database"]}
            correctIndex={0}
            explanation={"Лишний shell не становится PID 1."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Сначала определяется фаза сбоя: build, runtime, network или health."}</>,
            <>{"docker ps -a показывает stopped containers."}</>,
            <>{"docker logs и inspect state объясняют exit."}</>,
            <>{"Listener, container port и host mapping проверяются отдельно."}</>,
            <>{"HEALTHCHECK дополняет, но не заменяет application diagnostics."}</>,
            <>{"Release Dockerfile запускает non-root process и имеет versioned runbook."}</>,
          ]}
        />

        <PracticeCta text={"Соберите studyhub-api:0.1.0 и проведите четыре расследования: неверный module path, отсутствующая обязательная environment variable, неправильный port mapping и failing /health. Для каждого зафиксируйте симптом, команду диагностики, найденную причину и исправление. Завершите локальным release runbook."} />
      </Section>
    </RichLesson>
  );
}
