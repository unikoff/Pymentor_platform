import React from "react";
import { Check, Lightbulb, ListChecks } from "lucide-react";
import { CodeBlock } from "../../shared/ui/code-editor/CodeEditor";

function renderInlineCode(value: React.ReactNode, keyPrefix: string): React.ReactNode {
  if (typeof value === "string") {
    const parts = value.split(/(`[^`]+`)/g);
    if (parts.length === 1) return value;
    return parts.map((part, index) =>
      part.startsWith("`") && part.endsWith("`")
        ? <code key={`${keyPrefix}-${index}`}>{part.slice(1, -1)}</code>
        : part,
    );
  }

  if (Array.isArray(value)) {
    return value.map((item, index) => {
      const rendered = renderInlineCode(item, `${keyPrefix}-${index}`);
      return React.isValidElement(rendered) && rendered.key == null
        ? React.cloneElement(rendered, { key: `${keyPrefix}-${index}` })
        : rendered;
    });
  }

  if (!React.isValidElement<Record<string, unknown>>(value)) {
    if (value && typeof value === "object") {
      const prototype = Object.getPrototypeOf(value);
      if (prototype === Object.prototype || prototype === null) {
        return Object.fromEntries(
          Object.entries(value).map(([name, propValue]) => [
            name,
            /^(?:code|fix|solution|initialCode|starterCode)$/i.test(name)
              ? propValue
              : renderInlineCode(propValue as React.ReactNode, `${keyPrefix}-${name}`),
          ]),
        ) as unknown as React.ReactNode;
      }
    }
    return value;
  }
  if (value.type === "code" || value.type === "pre") return value;

  const props = { ...value.props };
  for (const [name, propValue] of Object.entries(props)) {
    if (/^(?:code|fix|solution|initialCode|starterCode)$/i.test(name)) continue;
    props[name] = renderInlineCode(propValue as React.ReactNode, `${keyPrefix}-${name}`);
  }
  return React.cloneElement(value, props);
}

export function RichLesson({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`rich-lesson${className ? ` ${className}` : ""}`}>{renderInlineCode(children, "rich-inline-code")}</div>;
}

export function RichHero({
  chip,
  title,
  intro,
  tags,
  variant,
}: {
  chip: string;
  title: string;
  intro: React.ReactNode;
  tags?: { icon: React.ReactNode; label: string }[];
  variant?: "bool" | "project";
}) {
  return (
    <header className={`rich-hero ${variant ? `rich-hero--${variant}` : ""}`}>
      <span className="rich-hero-chip">{chip}</span>
      <h1>{title}</h1>
      <p>{intro}</p>
      {tags && tags.length > 0 && (
        <div className="rich-hero-tags">
          {tags.map((tag, index) => (
            <span key={index}>
              {tag.icon} {tag.label}
            </span>
          ))}
        </div>
      )}
    </header>
  );
}

export function Section({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <section className="rich-section">
      <div className="rich-section-title">
        <span>{number}</span>
        <h2>{title}</h2>
      </div>
      {children}
    </section>
  );
}

export function Lead({ children }: { children: React.ReactNode }) {
  return <p className="rich-lead">{children}</p>;
}

export function LinkedNotes({
  items,
  variant = "cards",
}: {
  items: { title: string; description: string }[];
  variant?: "cards" | "connected";
}) {
  const connected = variant === "connected";

  return (
    <ul className={`linked-notes${connected ? " linked-notes--connected" : ""}`}>
      {items.map(({ title, description }, index) => (
        <li className={`linked-note${connected ? " linked-note--connected" : ""}`} key={index}>
          <h3>{title}</h3>
          <p>{description}</p>
        </li>
      ))}
    </ul>
  );
}

export function Callout({ children, tone }: { children: React.ReactNode; tone?: "warn" | "info" }) {
  return (
    <aside className={`lesson-callout ${tone === "info" ? "lesson-callout--info" : ""}`}>
      <Lightbulb size={18} />
      <p>{children}</p>
    </aside>
  );
}

export function TypeCards({ children }: { children: React.ReactNode }) {
  return <div className="type-cards">{children}</div>;
}

export function TypeCard({
  badge,
  badgeTone,
  title,
  children,
  code,
}: {
  badge: string;
  badgeTone?: "float" | "str";
  title: string;
  children: React.ReactNode;
  code?: string;
}) {
  return (
    <article className="type-card">
      <span className={`type-card-badge ${badgeTone ? `type-card-badge--${badgeTone}` : ""}`}>{badge}</span>
      <h3>{title}</h3>
      <p>{children}</p>
      {code && <CodeBlock code={code} />}
    </article>
  );
}

export function MethodGrid({ rows }: { rows: [React.ReactNode, React.ReactNode][] }) {
  return (
    <div className="method-grid">
      {rows.map((row, index) => (
        <div className="method-row" key={index}>
          <span className="method-label">{row[0]}</span>
          <span>{row[1]}</span>
        </div>
      ))}
    </div>
  );
}

export function PracticeCta({ text }: { text?: string }) {
  void text;
  return null;
}

// ---------- Интерактив: собрать код (Parsons-подобное задание) ----------
export function KeyTakeaways({ points }: { points: React.ReactNode[] }) {
  return (
    <aside className="takeaways">
      <div className="takeaways-head">
        <ListChecks size={17} />
        <strong>Главное из урока</strong>
      </div>
      <ul>
        {points.map((point, index) => (
          <li key={index}>
            <Check size={15} />
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

// ---------- Схемы уроков ----------
export function TheoryBridge({ link, boundary }: { link?: string; boundary?: string; lesson?: number }) {
  if (!link || !boundary) return null;
  return <Callout tone="info"><strong>Связь с курсом.</strong> {link}{" "}<strong>Важно не перепутать:</strong> {boundary}</Callout>;
}
