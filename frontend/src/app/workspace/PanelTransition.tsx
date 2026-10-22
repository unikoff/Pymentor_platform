import { useLayoutEffect, useRef, type ComponentType, type ReactNode } from "react";
import type { IDockviewPanelProps } from "dockview-react";

function PanelTransition({ api, children }: { api: IDockviewPanelProps["api"]; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let animation: Animation | undefined;
    const cancel = () => { window.cancelAnimationFrame(frame); animation?.cancel(); };
    const reveal = () => {
      cancel();
      if (!api.isVisible || reducedMotion.matches) return;
      frame = window.requestAnimationFrame(() => {
        const content = root.current?.firstElementChild;
        if (!(content instanceof HTMLElement) || !api.isVisible || reducedMotion.matches) return;
        if (content.matches(".dock-lesson, .lesson-loading")) return;
        const style = getComputedStyle(content);
        // Animate the existing panel: drafts, scroll and editor selection stay intact.
        animation = content.animate([
          { opacity: .45 },
          { opacity: 1 },
        ], {
          duration: parseFloat(style.getPropertyValue("--motion-normal")) || 240,
          easing: style.getPropertyValue("--motion-ease").trim() || "ease-out",
        });
      });
    };
    const visibility = api.onDidVisibilityChange(reveal);
    const onPreferenceChange = () => { if (reducedMotion.matches) cancel(); };
    reducedMotion.addEventListener("change", onPreferenceChange);
    reveal();
    return () => {
      cancel();
      visibility.dispose();
      reducedMotion.removeEventListener("change", onPreferenceChange);
    };
  }, [api]);
  return <div className="panel-transition" ref={root}>{children}</div>;
}

export function withPanelTransition(Panel: ComponentType<IDockviewPanelProps>) {
  return function AnimatedPanel(props: IDockviewPanelProps) {
    return <PanelTransition api={props.api}><Panel {...props} /></PanelTransition>;
  };
}
