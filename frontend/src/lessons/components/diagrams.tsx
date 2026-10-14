import React from "react";

export type DiagramOrientation = "horizontal" | "vertical";
/** Standard flowchart node shapes. Use process by default, decision for a condition, terminator for start/end, input-output for data exchange, database for persistent storage, and subprocess for a named nested process. */
export type DiagramNodeShape = "process" | "terminator" | "decision" | "input-output" | "database" | "subprocess";
export type DiagramArrowDirection = "forward" | "backward" | "both";
export type DiagramArrowStyle = "solid" | "dashed";

/**
 * General purpose flowchart pieces. Compose them in a lesson instead of
 * recreating the shared frame, node shapes, connectors, and labels:
 *
 * <Diagram caption="How a program runs">
 *   <DiagramFlow label="Program execution">
 *     <DiagramNode title="Start" shape="terminator" />
 *     <DiagramArrow label="run" />
 *     <DiagramNode title="Execute code" />
 *   </DiagramFlow>
 * </Diagram>
 */
export function Diagram({ caption, orientation = "horizontal", className = "", children }: { caption: string; orientation?: DiagramOrientation; className?: string; children: React.ReactNode }) {
  return (
    <figure className={`lesson-infographic lesson-diagram${orientation === "vertical" ? " lesson-diagram--vertical" : ""}${className ? ` ${className}` : ""}`}>
      <figcaption className="lesson-diagram-caption">{caption}</figcaption>
      {children}
    </figure>
  );
}

export function DiagramFlow({ label, orientation = "horizontal", className = "", children }: { label: string; orientation?: DiagramOrientation; className?: string; children: React.ReactNode }) {
  return <div className={`lesson-diagram-flow${orientation === "vertical" ? " lesson-diagram-flow--vertical" : ""}${className ? ` ${className}` : ""}`} role="group" aria-label={label}>{children}</div>;
}

/** A titled flowchart node. Put explanatory text, code, or other React content in children. */
export function DiagramNode({ title, children, shape = "process", className = "" }: { title: string; children?: React.ReactNode; shape?: DiagramNodeShape; className?: string }) {
  return <div className={`lesson-diagram-node lesson-diagram-node--${shape} ${className}`}><h3>{title}</h3>{children}</div>;
}

/** A labeled connector. Dashed style can mark an optional or exceptional path. */
export function DiagramArrow({ label, direction = "forward", lineStyle = "solid", className = "" }: { label: string; direction?: DiagramArrowDirection; lineStyle?: DiagramArrowStyle; className?: string }) {
  return (
    <div className={`lesson-diagram-connector${className ? ` ${className}` : ""}`}>
      <span>{label}</span>
      <span className={`lesson-diagram-arrow${direction === "both" ? " lesson-diagram-arrow--both" : direction === "backward" ? " lesson-diagram-arrow--backward" : ""}${lineStyle === "dashed" ? " lesson-diagram-arrow--dashed" : ""}`} aria-hidden="true" />
    </div>
  );
}

/** A titled set of related nodes. */
export function DiagramGroup({ title, className = "", children }: { title: string; className?: string; children: React.ReactNode }) {
  return <section className={`lesson-diagram-group${className ? ` ${className}` : ""}`} aria-label={title}><h3>{title}</h3>{children}</section>;
}

/** A swimlane for a person, system, or other participant. */
export function DiagramLane({ title, className = "", children }: { title: string; className?: string; children: React.ReactNode }) {
  return <section className={`lesson-diagram-lane${className ? ` ${className}` : ""}`} aria-label={title}><h3>{title}</h3>{children}</section>;
}

/** A container for alternative outcomes, commonly placed after a decision node. */
export function DiagramBranches({ label, className = "", children }: { label: string; className?: string; children: React.ReactNode }) {
  return <div className={`lesson-diagram-branches${className ? ` ${className}` : ""}`} role="group" aria-label={label}>{children}</div>;
}

/** One labeled outcome inside DiagramBranches. */
export function DiagramBranch({ label, className = "", children }: { label: string; className?: string; children: React.ReactNode }) {
  return <section className={`lesson-diagram-branch${className ? ` ${className}` : ""}`} aria-label={label}><h4>{label}</h4>{children}</section>;
}

/** A supporting annotation that is visually distinct from the flow. */
export function DiagramNote({ title, children, className = "" }: { title?: string; children: React.ReactNode; className?: string }) {
  return <aside className={`lesson-diagram-note${className ? ` ${className}` : ""}`} role="note">{title && <strong>{title}</strong>}<div>{children}</div></aside>;
}

/** A compact key for colors, symbols, or line styles used in a diagram. */
export function DiagramLegend({ items, className = "" }: { items: { label: string; symbol: React.ReactNode }[]; className?: string }) {
  return <ul className={`lesson-diagram-legend${className ? ` ${className}` : ""}`}>{items.map(({ label, symbol }) => <li key={label}><span aria-hidden="true">{symbol}</span><span>{label}</span></li>)}</ul>;
}

/** Two labeled paths in opposite directions, such as request and response. */
export function DiagramExchange({ forward, reverse }: { forward: string; reverse: string }) {
  return (
    <div className="lesson-diagram-exchange" role="group" aria-label={`${forward}; ${reverse}`}>
      <div className="lesson-diagram-exchange-path"><span>{forward}</span><span className="lesson-diagram-exchange-arrow" aria-hidden="true" /></div>
      <div className="lesson-diagram-exchange-path lesson-diagram-exchange-path--reverse"><span>{reverse}</span><span className="lesson-diagram-exchange-arrow" aria-hidden="true" /></div>
    </div>
  );
}

/** An ordered track, such as states, stages, or revisions; the last item is active by default. */
export function DiagramTrack({ label, items, activeIndex = items.length - 1 }: { label: string; items: string[]; activeIndex?: number }) {
  return (
    <div className="lesson-diagram-track" role="group" aria-label={`${label}: ${items.join(", ")}`}>
      <span>{label}</span><ol>{items.map((item, index) => <li key={`${label}-${item}`} className={index === activeIndex ? "is-active" : ""} aria-current={index === activeIndex ? "step" : undefined}>{item}</li>)}</ol>
    </div>
  );
}

// ---------- Связь темы урока с курсом ----------
