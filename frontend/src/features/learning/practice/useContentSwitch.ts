export { useContentSwitch } from "../../../shared/ui/motion/useContentSwitch";

export function focusTaskNavigation(card: HTMLElement | null | undefined, direction: "next" | "previous") {
  if (!card?.getClientRects().length) return;
  const selector = direction === "next"
    ? ".practice-task-navigation__button--next:not(:disabled)"
    : ".practice-task-navigation__button:not(.practice-task-navigation__button--next):not(:disabled)";
  const button = card.querySelector<HTMLButtonElement>(selector)
    ?? card.querySelector<HTMLButtonElement>(".practice-task-navigation__button:not(:disabled)");
  button?.focus({ preventScroll: true });
}
