import { useEffect, useState } from "react";
import type { IDockviewPanelProps } from "dockview-react";

// Load on the first actual display, then retain content to preserve edits/results.
export function usePanelOpened(api: IDockviewPanelProps["api"]) {
  // The API starts visible during Dockview initialization, before layout restore.
  const [opened, setOpened] = useState(false);
  useEffect(() => {
    if (api.isVisible) setOpened(true);
    const subscription = api.onDidVisibilityChange(() => { if (api.isVisible) setOpened(true); });
    return () => subscription.dispose();
  }, [api]);
  return opened;
}
