import { BackendLandingPage } from "../features/landing/BackendLandingPage";
import { LandingDetailPage } from "../features/landing/LandingPages";
import { PersonalDataPage } from "../features/landing/PersonalDataPage";

export function BackendLandingRoute() {
  const page = window.location.pathname.replace(/\/+$/, "").split("/").pop();
  if (page === "personal-data") return <PersonalDataPage />;
  if (page === "privacy-policy") return <PersonalDataPage policy />;
  if (page === "reviews" || page === "platform" || page === "pricing") return <LandingDetailPage page={page} />;
  return <BackendLandingPage />;
}
