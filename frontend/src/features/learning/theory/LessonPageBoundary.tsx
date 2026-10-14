import type { ReactNode } from "react";
import { AsyncBoundary } from "../../../shared/ui/async-boundary/AsyncBoundary";
import { LessonLoading } from "../LessonLoading";

export function LessonPageBoundary({ children }: { children: ReactNode }) {
  return <AsyncBoundary fallback={<LessonLoading />}>{children}</AsyncBoundary>;
}
