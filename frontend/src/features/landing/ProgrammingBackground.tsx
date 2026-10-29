import { useEffect, useRef } from 'react';

const DESKTOP_COLUMNS = 8;
const DESKTOP_ROWS = 30;
const PANEL_COUNT = DESKTOP_COLUMNS * DESKTOP_ROWS;

type GridMetrics = {
  columns: number;
  rows: number;
  paddingLeft: number;
  paddingTop: number;
  columnStep: number;
  rowStep: number;
  tileWidth: number;
  tileHeight: number;
};

export function ProgrammingBackground() {
  const fieldRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const field = fieldRef.current;
    const root = field?.closest<HTMLElement>('.backend-landing');
    if (!field || !root) return;

    const panels = Array.from(field.children, (child) => child as HTMLElement);
    const panelIndices = new Map<HTMLElement, number>();
    panels.forEach((panel, index) => panelIndices.set(panel, index));
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let activePanel = -1;
    let activeTiles: HTMLElement[] = [];
    let lastPointerX: number | null = null;
    let lastPointerY: number | null = null;
    let metrics: GridMetrics = {
      columns: DESKTOP_COLUMNS,
      rows: DESKTOP_ROWS,
      paddingLeft: 0,
      paddingTop: 0,
      columnStep: 1,
      rowStep: 1,
      tileWidth: 1,
      tileHeight: 1,
    };

    const setActivePanel = (index: number) => {
      if (index === activePanel) return;

      activeTiles.forEach((panel) => {
        panel.classList.remove('is-active', 'is-near', 'is-far');
        panel.style.removeProperty('--panel-rotate-x');
        panel.style.removeProperty('--panel-rotate-y');
        panel.style.removeProperty('--panel-lift');
      });
      activeTiles = [];

      activePanel = index;
      if (index < 0) return;

      const activeRow = Math.floor(index / metrics.columns);
      const activeColumn = index % metrics.columns;
      for (let row = activeRow - 2; row <= activeRow + 2; row += 1) {
        for (let column = activeColumn - 2; column <= activeColumn + 2; column += 1) {
          if (row < 0 || row >= metrics.rows || column < 0 || column >= metrics.columns) continue;
          const panel = panels[row * metrics.columns + column];
          if (!panel) continue;
          const distance = Math.max(Math.abs(row - activeRow), Math.abs(column - activeColumn));
          panel.classList.add(distance === 0 ? 'is-active' : distance === 1 ? 'is-near' : 'is-far');
          activeTiles.push(panel);
        }
      }
    };

    const applyPointerForce = (clientX: number, clientY: number) => {
      const bounds = field.getBoundingClientRect();

      activeTiles.forEach((panel) => {
        const panelIndex = panelIndices.get(panel);
        if (panelIndex === undefined) return;
        const column = panelIndex % metrics.columns;
        const row = Math.floor(panelIndex / metrics.columns);
        const centerX = bounds.left + metrics.paddingLeft + column * metrics.columnStep + metrics.tileWidth / 2;
        const centerY = bounds.top + metrics.paddingTop + row * metrics.rowStep + metrics.tileHeight / 2;
        const offsetX = (clientX - centerX) / metrics.tileWidth;
        const offsetY = (clientY - centerY) / metrics.tileHeight;
        const distance = Math.hypot(offsetX, offsetY);
        const influence = 1 / (1 + distance * 0.75);
        const activeRow = Math.floor(activePanel / metrics.columns);
        const activeColumn = activePanel % metrics.columns;
        const ring = Math.max(Math.abs(row - activeRow), Math.abs(column - activeColumn));
        const rotationScale = ring === 0 ? 2 : ring === 1 ? 1.45 : 0.7;
        const maxRotation = ring === 0 ? 12 : ring === 1 ? 12 : 4;
        const rotationRate = ring === 2 ? 12 : 18;
        const rotateX = Math.max(-maxRotation, Math.min(maxRotation, offsetY * rotationScale * rotationRate * influence));
        const rotateY = Math.max(-maxRotation, Math.min(maxRotation, -offsetX * rotationScale * rotationRate * influence));
        const lift = ring === 0 ? 18 * influence : ring === 1 ? 14 * influence : 1.5 * influence;

        panel.style.setProperty('--panel-rotate-x', `${rotateX.toFixed(2)}deg`);
        panel.style.setProperty('--panel-rotate-y', `${rotateY.toFixed(2)}deg`);
        panel.style.setProperty('--panel-lift', `${lift.toFixed(2)}px`);
      });
    };

    const refreshMetrics = () => {
      const style = window.getComputedStyle(field);
      const columns = Number.parseInt(style.getPropertyValue('--panel-columns'), 10) || DESKTOP_COLUMNS;
      const rows = Number.parseInt(style.getPropertyValue('--panel-rows'), 10) || DESKTOP_ROWS;
      const paddingLeft = Number.parseFloat(style.paddingLeft) || 0;
      const paddingRight = Number.parseFloat(style.paddingRight) || 0;
      const paddingTop = Number.parseFloat(style.paddingTop) || 0;
      const paddingBottom = Number.parseFloat(style.paddingBottom) || 0;
      const columnGap = Number.parseFloat(style.columnGap) || 0;
      const rowGap = Number.parseFloat(style.rowGap) || 0;
      const width = field.clientWidth - paddingLeft - paddingRight;
      const height = field.clientHeight - paddingTop - paddingBottom;

      metrics = {
        columns,
        rows,
        paddingLeft,
        paddingTop,
        columnStep: Math.max(1, (width - columnGap * (columns - 1)) / columns + columnGap),
        rowStep: Math.max(1, (height - rowGap * (rows - 1)) / rows + rowGap),
        tileWidth: Math.max(1, (width - columnGap * (columns - 1)) / columns),
        tileHeight: Math.max(1, (height - rowGap * (rows - 1)) / rows),
      };
      setActivePanel(-1);
    };

    const activateAt = (clientX: number, clientY: number) => {
      const bounds = field.getBoundingClientRect();
      const column = Math.floor((clientX - bounds.left - metrics.paddingLeft) / metrics.columnStep);
      const row = Math.floor((clientY - bounds.top - metrics.paddingTop) / metrics.rowStep);
      if (column < 0 || column >= metrics.columns || row < 0 || row >= metrics.rows) {
        setActivePanel(-1);
        return;
      }

      const index = row * metrics.columns + column;
      setActivePanel(index);
      applyPointerForce(clientX, clientY);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch' || reducedMotion.matches) return;
      lastPointerX = event.clientX;
      lastPointerY = event.clientY;
      activateAt(lastPointerX, lastPointerY);
    };
    const onScroll = () => {
      if (lastPointerX !== null && lastPointerY !== null && !reducedMotion.matches) {
        activateAt(lastPointerX, lastPointerY);
      }
    };
    const onPointerLeave = () => {
      lastPointerX = null;
      lastPointerY = null;
      setActivePanel(-1);
    };
    const onMotionPreferenceChange = () => {
      if (reducedMotion.matches) setActivePanel(-1);
    };
    const resizeObserver = new ResizeObserver(refreshMetrics);

    refreshMetrics();
    resizeObserver.observe(field);
    root.addEventListener('scroll', onScroll, { passive: true });
    root.addEventListener('pointermove', onPointerMove, { passive: true });
    root.addEventListener('pointerleave', onPointerLeave);
    window.addEventListener('resize', refreshMetrics);
    reducedMotion.addEventListener('change', onMotionPreferenceChange);

    return () => {
      resizeObserver.disconnect();
      root.removeEventListener('scroll', onScroll);
      root.removeEventListener('pointermove', onPointerMove);
      root.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('resize', refreshMetrics);
      reducedMotion.removeEventListener('change', onMotionPreferenceChange);
    };
  }, []);

  return (
    <div className="landing-panel-field" aria-hidden="true" ref={fieldRef}>
      {Array.from({ length: PANEL_COUNT }, (_, index) => (
        <span className="landing-panel-field__tile" key={index} />
      ))}
    </div>
  );
}
