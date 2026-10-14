import { lazyNamed } from "../../shared/ui/async-boundary/lazyNamed";

export const AdminScreen = lazyNamed(() => import("./AdminScreen"), "AdminScreen");
