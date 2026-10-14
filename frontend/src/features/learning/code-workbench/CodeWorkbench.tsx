import "./code-workbench.css";
import "./results.css";
import { useEffect, useRef, type ReactNode, type Dispatch, type SetStateAction, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";
import { ChevronDown, Terminal } from "lucide-react";
import { CodeEditor } from "../../../shared/ui/code-editor/CodeEditor";
import { writeStoredValue } from "../../../shared/lib/storage";

const MIN_EDITOR_HEIGHT = 180;
const TERMINAL_SPACE = 194;
const SPLITTER_HEIGHT = 12;

export function CodeWorkbench({ code, onCodeChange, label, height, onHeightChange, heightStorageKey,
  terminalOpen, onToggleTerminal, status, children, className = "" }: {
  code: string; onCodeChange: (code: string) => void; label: string;
  height: number; onHeightChange: Dispatch<SetStateAction<number>>; heightStorageKey: string;
  terminalOpen: boolean; onToggleTerminal: () => void; status: string;
  children: ReactNode; className?: string;
}) {
  const workbenchRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ pointerId: number; startY: number; startHeight: number } | null>(null);
  const getMaxHeight = () => Math.max(MIN_EDITOR_HEIGHT, Math.floor((workbenchRef.current?.clientHeight ?? window.innerHeight * 0.7) - TERMINAL_SPACE));
  const clamp = (value: number) => Math.min(getMaxHeight(), Math.max(MIN_EDITOR_HEIGHT, Math.round(value)));
  const updateHeight = (value: number) => {
    const next = clamp(value);
    onHeightChange(next);
    writeStoredValue(heightStorageKey, next);
  };

  function startDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    event.preventDefault();
    dragRef.current = { pointerId: event.pointerId, startY: event.clientY, startHeight: height };
    event.currentTarget.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const step = event.shiftKey ? 64 : 24;
    if (event.key === "ArrowUp") updateHeight(height - step);
    else if (event.key === "ArrowDown") updateHeight(height + step);
    else if (event.key === "Home") updateHeight(MIN_EDITOR_HEIGHT);
    else if (event.key === "End") updateHeight(getMaxHeight());
    else return;
    event.preventDefault();
  }

  useEffect(() => {
    function move(event: PointerEvent) {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      event.preventDefault();
      onHeightChange(clamp(drag.startHeight + event.clientY - drag.startY));
    }
    function finish(event: PointerEvent) {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      updateHeight(drag.startHeight + event.clientY - drag.startY);
      dragRef.current = null;
    }
    window.addEventListener("pointermove", move, { passive: false });
    window.addEventListener("pointerup", finish);
    window.addEventListener("pointercancel", finish);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", finish);
      window.removeEventListener("pointercancel", finish);
    };
  }, [heightStorageKey, onHeightChange]);

  return <div className={`task-editor-workbench ${className}${terminalOpen ? " is-terminal-open" : ""}`}
    ref={workbenchRef} style={{ gridTemplateRows: terminalOpen
      ? `minmax(${MIN_EDITOR_HEIGHT}px, min(${clamp(height)}px, calc(100% - ${TERMINAL_SPACE}px))) ${SPLITTER_HEIGHT}px minmax(${TERMINAL_SPACE - SPLITTER_HEIGHT}px, 1fr)` : undefined }}>
    <div className="task-editor-pane"><CodeEditor value={code} onChange={onCodeChange} ariaLabel={label} scrollable /></div>
    {terminalOpen && <div className="task-editor-splitter" role="separator" tabIndex={0}
      aria-label="Изменить высоту редактора и терминала" aria-orientation="horizontal"
      aria-valuemin={MIN_EDITOR_HEIGHT} aria-valuemax={getMaxHeight()} aria-valuenow={height}
      aria-valuetext={`${height} пикселей в редакторе`} onPointerDown={startDrag} onKeyDown={handleKeyDown}><span /></div>}
    <section className={`task-terminal${terminalOpen ? " is-open" : ""}`} aria-label="Терминал вывода">
      <button className="task-terminal__toggle" type="button" aria-expanded={terminalOpen} onClick={onToggleTerminal}>
        <span className="task-terminal__label"><Terminal size={15} /> Терминал</span>
        <span className="task-terminal__status">{status}</span><ChevronDown size={16} aria-hidden="true" />
      </button>
      {terminalOpen && <div className="task-terminal__body" aria-live="polite">{children}</div>}
    </section>
  </div>;
}
