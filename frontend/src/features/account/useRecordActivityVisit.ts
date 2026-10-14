import { useEffect } from "react";
import { recordActivityVisit } from "./api";
import { getLocalDateKey } from "../../shared/lib/dates";

// Workspace activity is recorded even when the account tab stays closed.
export function useRecordActivityVisit(userId: number | null) {
  useEffect(() => {
    if (userId !== null) void recordActivityVisit(getLocalDateKey()).catch(() => undefined);
  }, [userId]);
}
