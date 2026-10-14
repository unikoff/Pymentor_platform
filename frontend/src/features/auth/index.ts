export { getCurrentUser, logoutUser } from "./api";
import { lazyNamed } from "../../shared/ui/async-boundary/lazyNamed";

export const AuthScreen = lazyNamed(() => import("./AuthScreen"), "AuthScreen");
