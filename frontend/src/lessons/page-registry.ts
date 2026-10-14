import { lazy, type ComponentType } from "react";

type LessonPage = ComponentType<{ module?: string }>;
type LessonModule = Record<string, LessonPage>;
const modules = import.meta.glob<LessonModule>("./chapter_*/block_*/*.tsx");
const loadedPages = new Map<string, LessonPage>();

// Chapter manifests contain only backend source paths and local page paths.
// Vite splits each lesson into its own chunk; aliases share one lazy component.
export function defineLessonPages(chapter: string, entries: Record<string, string>): Record<string, LessonPage> {
  return Object.fromEntries(Object.entries(entries).map(([source, page]) => {
    const path = `./${chapter}/${page}.tsx`;
    const load = modules[path];
    if (!load) throw new Error(`Lesson page is missing: ${path}`);
    let component = loadedPages.get(path);
    if (!component) {
      const name = page.slice(page.lastIndexOf("/") + 1);
      component = lazy(async () => {
        const module = await load();
        if (!module[name]) throw new Error(`Lesson export is missing: ${name}`);
        return { default: module[name] };
      });
      loadedPages.set(path, component);
    }
    return [`${chapter}/${source}`, component];
  }));
}
