import { lazyNamed } from "../../shared/ui/async-boundary/lazyNamed";

export const AccountPanel = lazyNamed(() => import("./AccountPanel"), "AccountPanel");
export const AccountWorkspace = lazyNamed(() => import("./AccountWorkspace"), "AccountWorkspace");
export { useAccountSchedule } from "./useAccountSchedule";
export { useRecordActivityVisit } from "./useRecordActivityVisit";
