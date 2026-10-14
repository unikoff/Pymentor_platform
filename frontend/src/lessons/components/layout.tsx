import React from "react";
import { Check, Lightbulb, ListChecks } from "lucide-react";
import { CodeBlock } from "../../shared/ui/code-editor/CodeEditor";

export function RichLesson({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`rich-lesson${className ? ` ${className}` : ""}`}>{children}</div>;
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
          {tags.map((tag) => (
            <span key={tag.label}>
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
      {items.map(({ title, description }) => (
        <li className={`linked-note${connected ? " linked-note--connected" : ""}`} key={title}>
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
          <code>{row[0]}</code>
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
