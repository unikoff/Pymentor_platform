const counterId = 114225370;
const tagUrl = `https://mc.yandex.ru/metrika/tag.js?id=${counterId}`;
const goal = 'consultation_request_accepted';

type Metrica = ((...args: unknown[]) => void) & { a?: IArguments[]; l?: number };
type MetricaWindow = Window & { ym?: Metrica };
let initialized = false;

export function initLandingAnalytics(): void {
  if (initialized || window.location.hostname !== 'knowi.ru') return;
  try {
    const target = window as MetricaWindow;
    if (!target.ym) {
      const queue: Metrica = function () {
        (queue.a ||= []).push(arguments);
      };
      queue.l = Date.now();
      target.ym = queue;
    }
    if (!Array.from(document.scripts).some((script) => script.src === tagUrl)) {
      const script = document.createElement('script');
      script.async = true;
      script.src = tagUrl;
      document.head.appendChild(script);
    }
    target.ym(counterId, 'init', {
      clickmap: true,
      trackLinks: true,
      accurateTrackBounce: true,
      referrer: document.referrer,
      url: window.location.href,
    });
    initialized = true;
  } catch {
    // Analytics must never prevent the landing page from working.
  }
}

export function trackConsultationAccepted(): void {
  try {
    if (initialized) (window as MetricaWindow).ym?.(counterId, 'reachGoal', goal);
  } catch {
    // A blocked analytics script must not change the form result.
  }
}
