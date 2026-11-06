import { useEffect, useRef, useState } from 'react';
import { Maximize, Minimize, Pause, Play, Volume2, VolumeX } from 'lucide-react';

function formatTime(value: number) {
  const seconds = Number.isFinite(value) ? Math.floor(value) : 0;
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

export function PlatformVideo({ src, temporary, active = true }: { src: string; temporary: boolean; active?: boolean }) {
  const video = useRef<HTMLVideoElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const playbackIntent = useRef<boolean | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [volume, setVolume] = useState(1);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => { playbackIntent.current = null; }, [src]);

  useEffect(() => {
    const element = video.current;
    if (!element) return;
    if (!active) { element.pause(); return; }
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let inView = false;
    let disposed = false;
    const syncPlayback = () => {
      if (!inView || document.hidden || !(playbackIntent.current ?? !motion.matches)) {
        element.pause();
        return;
      }
      void element.play().then(() => {
        if (disposed || !inView || document.hidden) element.pause();
      }).catch(() => {});
    };
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      syncPlayback();
    }, { threshold: .15 });
    observer.observe(element);
    document.addEventListener('visibilitychange', syncPlayback);
    motion.addEventListener('change', syncPlayback);
    return () => {
      disposed = true;
      observer.disconnect();
      document.removeEventListener('visibilitychange', syncPlayback);
      motion.removeEventListener('change', syncPlayback);
      element.pause();
    };
  }, [src, active]);

  useEffect(() => {
    const sync = () => setFullscreen(document.fullscreenElement === frame.current);
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, []);

  const togglePlayback = () => {
    const element = video.current;
    if (!element) return;
    playbackIntent.current = element.paused;
    if (element.paused) void element.play().catch(() => setPlaying(false));
    else element.pause();
  };
  const toggleFullscreen = () => {
    const nativeFallback = () => {
      const element = video.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
      if (!element) return;
      if (element.webkitEnterFullscreen) element.webkitEnterFullscreen();
      else { element.controls = true; if (element.requestFullscreen) void element.requestFullscreen().catch(() => {}); }
    };
    if (document.fullscreenElement === frame.current) void document.exitFullscreen().catch(() => {});
    else if (frame.current?.requestFullscreen) void frame.current.requestFullscreen().catch(nativeFallback);
    else nativeFallback();
  };

  return <div className="learning-system__platform-preview" ref={frame}>
    <video ref={video} src={src} aria-label={temporary ? 'Временное видео фонтана' : 'Обзор платформы Pymentor'} muted loop playsInline preload="metadata"
      onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onVolumeChange={event => { setMuted(event.currentTarget.muted); setVolume(event.currentTarget.volume); }}
      onTimeUpdate={event => setTime(event.currentTarget.currentTime)} onDurationChange={event => setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0)}>
      Ваш браузер не поддерживает воспроизведение видео.
    </video>
    {temporary && <span className="platform-player__temporary">Временное видео</span>}
    <div className="platform-player__controls" aria-label="Управление видео">
      <button type="button" onClick={togglePlayback} aria-label={playing ? 'Пауза' : 'Воспроизвести'}>{playing ? <Pause size={20} /> : <Play size={20} />}</button>
      <span className="platform-player__time">{formatTime(time)} / {formatTime(duration)}</span>
      <input aria-label="Перемотка видео" type="range" min="0" max={duration || 0} step="0.01" value={Math.min(time, duration || 0)} disabled={!duration} onChange={event => { if (video.current) { video.current.currentTime = Number(event.currentTarget.value); setTime(video.current.currentTime); } }} />
      <button type="button" onClick={() => { if (video.current) video.current.muted = !video.current.muted; }} aria-label={muted ? 'Включить звук' : 'Выключить звук'}>{muted ? <VolumeX size={20} /> : <Volume2 size={20} />}</button>
      <input className="platform-player__volume" aria-label="Громкость" type="range" min="0" max="1" step="0.05" value={muted ? 0 : volume} onChange={event => { if (video.current) { video.current.volume = Number(event.currentTarget.value); video.current.muted = video.current.volume === 0; } }} />
      <button type="button" onClick={toggleFullscreen} aria-label={fullscreen ? 'Выйти из полноэкранного режима' : 'На весь экран'}>{fullscreen ? <Minimize size={20} /> : <Maximize size={20} />}</button>
    </div>
  </div>;
}
