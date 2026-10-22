import { flushSync } from "react-dom";
import { useCallback, useEffect, useRef } from "react";

type Snapshot = { element: HTMLElement; animation?: Animation; lessonHost?: HTMLElement };

function removeSnapshots(snapshots: Snapshot[]) {
  snapshots.forEach(({ element, animation }) => {
    animation?.cancel();
    element.remove();
  });
}

function captureContent(source: HTMLElement): Snapshot | undefined {
  if (!source.parentElement || !source.getClientRects().length || getComputedStyle(source).visibility !== "visible") return;
  const rect = source.getBoundingClientRect();
  // Dockview can hide the old panel while activating its companion tab.
  const lessonHost = source.matches(".dock-lesson") ? source.closest<HTMLElement>(".dv-shell") ?? undefined : undefined;
  const host = lessonHost ?? source.parentElement;
  const hostRect = host.getBoundingClientRect();
  const snapshot = source.cloneNode(true) as HTMLElement;
  const originals = [source, ...source.querySelectorAll<HTMLElement>("*")];
  const copies = [snapshot, ...snapshot.querySelectorAll<HTMLElement>("*")];
  const scrollPositions = originals.map((element) => ({ top: element.scrollTop, left: element.scrollLeft }));
  const sourceStyle = getComputedStyle(source);
  // A solid local backing prevents transparent content from adding brightness.
  let background = sourceStyle.getPropertyValue("--bg").trim();
  for (let parent: HTMLElement | null = source; parent; parent = parent.parentElement) {
    const color = getComputedStyle(parent).backgroundColor;
    if (color !== "transparent" && color !== "rgba(0, 0, 0, 0)") {
      background = color;
      break;
    }
  }
  snapshot.classList.add("content-switch-snapshot");
  snapshot.setAttribute("aria-hidden", "true");
  snapshot.inert = true;
  Object.assign(snapshot.style, {
    position: "absolute", inset: "auto",
    top: `${lessonHost ? rect.top - hostRect.top + host.scrollTop - host.clientTop : source.offsetTop}px`,
    left: `${lessonHost ? rect.left - hostRect.left + host.scrollLeft - host.clientLeft : source.offsetLeft}px`,
    width: `${rect.width}px`, height: `${rect.height}px`, maxWidth: "none", maxHeight: "none",
    margin: "0", boxSizing: "border-box", zIndex: lessonHost ? "1" : "20", pointerEvents: "none",
    backgroundColor: background,
    overflowX: lessonHost ? sourceStyle.overflowX : "hidden",
    overflowY: lessonHost ? sourceStyle.overflowY : "hidden",
    scrollBehavior: "auto",
  });
  copies.forEach((copy, index) => {
    copy.removeAttribute("id");
    copy.removeAttribute("autofocus");
    const original = originals[index];
    if (original instanceof HTMLTextAreaElement && copy instanceof HTMLTextAreaElement) copy.value = original.value;
    if (original instanceof HTMLInputElement && copy instanceof HTMLInputElement) {
      copy.value = original.value;
      copy.checked = original.checked;
    }
    if (original instanceof HTMLSelectElement && copy instanceof HTMLSelectElement) copy.selectedIndex = original.selectedIndex;
    if (original instanceof HTMLCanvasElement && copy instanceof HTMLCanvasElement && original.width && original.height) {
      copy.getContext("2d")?.drawImage(original, 0, 0);
    }
  });
  host.append(snapshot);
  copies.forEach((copy, index) => {
    const position = scrollPositions[index];
    if (position.top) copy.scrollTop = position.top;
    if (position.left) copy.scrollLeft = position.left;
  });
  snapshot.querySelectorAll(".content-switch-snapshot").forEach((nested) => nested.remove());
  return { element: snapshot, lessonHost };
}

// Fade an inert copy over live content. No document snapshots or additive compositing.
export function useContentSwitch() {
  const transitions = useRef(new Map<string, Snapshot[]>());
  useEffect(() => () => {
    transitions.current.forEach(removeSnapshots);
    transitions.current.clear();
  }, []);

  return useCallback((key: string, targets: HTMLElement | readonly HTMLElement[] | null, commit: () => void) => {
    const previous = transitions.current.get(key);
    if (previous) removeSnapshots(previous);
    transitions.current.delete(key);
    const elements = !targets ? [] : targets instanceof HTMLElement ? [targets] : Array.from(targets);
    if (!elements.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      commit();
      return;
    }

    const snapshots: Snapshot[] = [];
    try {
      elements.forEach((element) => {
        const snapshot = captureContent(element);
        if (snapshot) snapshots.push(snapshot);
        // Retain on this node so removing the overlay cannot restart entry animations.
        element.classList.add("content-switch-target");
      });
      flushSync(commit);
      snapshots.forEach(({ lessonHost }) => lessonHost?.querySelectorAll(".dock-lesson:not(.content-switch-snapshot)")
        .forEach((element) => element.classList.add("content-switch-target")));
    } catch (error) {
      removeSnapshots(snapshots);
      throw error;
    }
    transitions.current.set(key, snapshots);
    snapshots.forEach((snapshot) => {
      snapshot.animation = snapshot.element.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 200, easing: "cubic-bezier(.2, 0, .2, 1)", fill: "forwards",
      });
    });
    const finish = () => {
      removeSnapshots(snapshots);
      if (transitions.current.get(key) === snapshots) transitions.current.delete(key);
    };
    void Promise.all(snapshots.map(({ animation }) => animation!.finished)).then(finish, finish);
  }, []);
}
