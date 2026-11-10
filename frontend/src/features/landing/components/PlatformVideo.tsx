import { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

export function PlatformVideo({ src, temporary, active = true }: { src: string; temporary: boolean; active?: boolean }) {
  const container = useRef<HTMLDivElement>(null);
  const playerRef = useRef<ReturnType<typeof videojs> | null>(null);
  const playbackIntent = useRef<boolean | null>(null);

  useEffect(() => {
    const host = container.current;
    if (!host) return;
    playbackIntent.current = null;
    const element = document.createElement('video-js');
    element.classList.add('video-js');
    host.appendChild(element);

    const player = videojs(element, {
      controls: true,
      muted: true,
      loop: true,
      playsinline: true,
      preload: temporary ? 'auto' : 'metadata',
      inactivityTimeout: 0,
      sources: [{ src }],
      bigPlayButton: false,
      controlBar: {
        children: ['playToggle', 'currentTimeDisplay', 'timeDivider', 'durationDisplay', 'progressControl', 'fullscreenToggle'],
      },
      language: 'ru',
      languages: { ru: { Play: 'Воспроизвести', Pause: 'Пауза', 'Progress Bar': 'Перемотка видео', 'Fullscreen': 'На весь экран', 'Non-Fullscreen': 'Выйти из полноэкранного режима', 'Current Time': 'Текущее время', Duration: 'Длительность' } },
    });
    player.el()?.setAttribute('aria-label', temporary ? 'Временное видео фонтана' : 'Обзор платформы Pymentor');
    playerRef.current = player;
    const rememberIntent = (event: Event) => {
      const target = event.target;
      if (target instanceof Element && (target.closest('.vjs-play-control') || target.classList.contains('vjs-tech'))) {
        playbackIntent.current = player.paused();
      }
    };
    host.addEventListener('click', rememberIntent, true);
    return () => {
      host.removeEventListener('click', rememberIntent, true);
      playerRef.current = null;
      player.dispose();
    };
  }, [src, temporary]);

  useEffect(() => {
    const player = playerRef.current;
    const host = container.current;
    if (!player || !host || !active) return;
    let inView = false;
    let disposed = false;
    const syncPlayback = () => {
      if (!inView || document.hidden || playbackIntent.current === false) {
        player.pause();
        return;
      }
      const play = player.play();
      if (play) void play.then(() => {
        if (!player.isDisposed() && (disposed || !inView || document.hidden)) player.pause();
      }).catch(() => {});
    };
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      syncPlayback();
    }, { threshold: .15 });
    observer.observe(host);
    document.addEventListener('visibilitychange', syncPlayback);
    return () => {
      disposed = true;
      observer.disconnect();
      document.removeEventListener('visibilitychange', syncPlayback);
      if (!player.isDisposed()) player.pause();
    };
  }, [src, temporary, active]);

  return <div className={`learning-system__platform-preview${temporary ? ' learning-system__platform-preview--temporary' : ''}`}>
    <div className="platform-player" ref={container} data-vjs-player />
    {temporary && <span className="platform-player__temporary">Временное видео</span>}
  </div>;
}
